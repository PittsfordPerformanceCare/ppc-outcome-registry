import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  User, 
  Calendar, 
  FileText, 
  Activity,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type JourneyStage = "lead" | "approved" | "scheduled" | "forms_sent" | "forms_received" | "episode_active";

interface ProspectJourney {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  primaryConcern: string | null;
  createdAt: string;
  currentStage: JourneyStage;
  stages: {
    lead: { complete: boolean; date?: string };
    approved: { complete: boolean; date?: string };
    scheduled: { complete: boolean; date?: string; appointmentDate?: string };
    forms_sent: { complete: boolean; date?: string };
    forms_received: { complete: boolean; date?: string };
    episode_active: { complete: boolean; date?: string; episodeId?: string };
  };
  daysInPipeline: number;
  needsAttention: boolean;
  attentionReason?: string;
}

interface ProspectJourneyTrackerProps {
  className?: string;
}

const STAGE_CONFIG = {
  lead: { label: "Lead Submitted", icon: User, color: "text-blue-500" },
  approved: { label: "Approved for Care", icon: CheckCircle2, color: "text-green-500" },
  scheduled: { label: "NP Visit Scheduled", icon: Calendar, color: "text-purple-500" },
  forms_sent: { label: "Legal Forms Sent", icon: FileText, color: "text-orange-500" },
  forms_received: { label: "Forms Received", icon: FileText, color: "text-emerald-500" },
  episode_active: { label: "Episode Active", icon: Activity, color: "text-primary" },
};

export function ProspectJourneyTracker({ className }: ProspectJourneyTrackerProps) {
  const [prospects, setProspects] = useState<ProspectJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProspects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get care requests (main source of prospects in the pipeline)
      // Get care requests - include all active statuses (case insensitive matching)
      const { data: careRequests, error: crError } = await supabase
        .from("care_requests")
        .select("*")
        .not("status", "in", '("archived","declined","ARCHIVED","DECLINED")')
        .is("episode_id", null) // Only prospects not yet converted to episodes
        .order("created_at", { ascending: false });

      if (crError) throw crError;

      // Get pending episodes (for scheduled visits)
      const { data: pendingEpisodes, error: peError } = await supabase
        .from("pending_episodes")
        .select("*")
        .in("status", ["pending", "scheduled", "ready_for_conversion"]);

      if (peError) throw peError;

      // Get intake forms
      const { data: intakeForms, error: ifError } = await supabase
        .from("intake_forms")
        .select("*")
        .eq("status", "pending");

      if (ifError) throw ifError;

      // Build prospect journeys
      const journeys: ProspectJourney[] = [];

      for (const cr of careRequests || []) {
        const payload = cr.intake_payload as Record<string, unknown> || {};
        const patientName = (payload.name as string) || (payload.patient_name as string) || "Unknown";
        const email = (payload.email as string) || "";
        const phone = (payload.phone as string) || null;
        const primaryConcern = cr.primary_complaint || (payload.chief_complaint as string) || null;

        // Find matching pending episode
        const pendingEp = pendingEpisodes?.find(pe => 
          pe.patient_name?.toLowerCase() === patientName.toLowerCase()
        );

        // Find matching intake form
        const intakeForm = intakeForms?.find(f => 
          f.patient_name?.toLowerCase() === patientName.toLowerCase() ||
          f.email?.toLowerCase() === email.toLowerCase()
        );

        const statusUpper = cr.status?.toUpperCase() || "";
        const isApproved = !["PENDING", "NEW"].includes(statusUpper) && (!!cr.approved_at || statusUpper === "APPROVED");
        const isScheduled = !!pendingEp?.scheduled_date || ["SCHEDULED", "SUBMITTED"].includes(statusUpper);
        const formsSent = !!intakeForm || isScheduled; // Forms are sent when visit is scheduled
        // Forms received if: intake_form is submitted OR care_request status is SUBMITTED
        const formsReceived = intakeForm?.status === "submitted" || !!intakeForm?.submitted_at || statusUpper === "SUBMITTED";
        const episodeActive = !!cr.episode_id;

        // Determine current stage
        let currentStage: JourneyStage = "lead";
        if (episodeActive) currentStage = "episode_active";
        else if (formsReceived) currentStage = "forms_received";
        else if (formsSent) currentStage = "forms_sent";
        else if (isScheduled) currentStage = "scheduled";
        else if (isApproved) currentStage = "approved";

        // Calculate days in pipeline
        const createdDate = new Date(cr.created_at);
        const daysInPipeline = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

        // Determine if needs attention
        let needsAttention = false;
        let attentionReason: string | undefined;

        if (currentStage === "lead" && daysInPipeline > 1) {
          needsAttention = true;
          attentionReason = "Awaiting review for " + daysInPipeline + " days";
        } else if (currentStage === "approved" && daysInPipeline > 2) {
          needsAttention = true;
          attentionReason = "Approved but not scheduled";
        } else if (currentStage === "forms_sent" && daysInPipeline > 3) {
          needsAttention = true;
          attentionReason = "Forms sent, awaiting completion";
        }

        journeys.push({
          id: cr.id,
          name: patientName,
          email,
          phone,
          primaryConcern,
          createdAt: cr.created_at,
          currentStage,
          stages: {
            lead: { complete: true, date: cr.created_at },
            approved: { complete: isApproved, date: cr.approved_at || undefined },
            scheduled: { 
              complete: isScheduled, 
              date: pendingEp?.created_at,
              appointmentDate: pendingEp?.scheduled_date 
            },
            forms_sent: { complete: formsSent, date: intakeForm?.created_at },
            forms_received: { complete: !!formsReceived, date: intakeForm?.submitted_at || undefined },
            episode_active: { complete: episodeActive, episodeId: cr.episode_id || undefined },
          },
          daysInPipeline,
          needsAttention,
          attentionReason,
        });
      }

      // Sort: needs attention first, then by days in pipeline
      journeys.sort((a, b) => {
        if (a.needsAttention && !b.needsAttention) return -1;
        if (!a.needsAttention && b.needsAttention) return 1;
        return b.daysInPipeline - a.daysInPipeline;
      });

      setProspects(journeys);
    } catch (err) {
      console.error("Error loading prospects:", err);
      setError("Failed to load prospect data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProspects();
  }, []);

  const getStageIcon = (stage: JourneyStage, complete: boolean) => {
    const config = STAGE_CONFIG[stage];
    const Icon = config.icon;
    
    if (complete) {
      return <CheckCircle2 className={`h-4 w-4 ${config.color}`} />;
    }
    return <Circle className="h-4 w-4 text-muted-foreground/40" />;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Prospective Patient Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Prospective Patient Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const activeProspects = prospects.filter(p => p.currentStage !== "episode_active");
  const needsAttentionCount = activeProspects.filter(p => p.needsAttention).length;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Prospective Patient Journey
          </CardTitle>
          <div className="flex items-center gap-2">
            {needsAttentionCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {needsAttentionCount} need attention
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={loadProspects}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Track each prospect from lead to active episode
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stage Legend */}
        <div className="flex flex-wrap gap-2 pb-3 border-b">
          {Object.entries(STAGE_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1 text-xs text-muted-foreground">
              <config.icon className={`h-3 w-3 ${config.color}`} />
              <span>{config.label}</span>
            </div>
          ))}
        </div>

        {activeProspects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active prospects in pipeline</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {activeProspects.map((prospect) => (
              <div
                key={prospect.id}
                className={`p-3 rounded-lg border transition-colors ${
                  prospect.needsAttention 
                    ? 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20' 
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                {/* Patient Info Row */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">{prospect.name}</h4>
                      {prospect.needsAttention && (
                        <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    {prospect.primaryConcern && (
                      <p className="text-xs text-muted-foreground truncate">
                        {prospect.primaryConcern}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge 
                      variant={prospect.needsAttention ? "outline" : "secondary"}
                      className={`text-xs ${prospect.needsAttention ? 'border-amber-500 text-amber-700 dark:text-amber-400' : ''}`}
                    >
                      {STAGE_CONFIG[prospect.currentStage].label}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(prospect.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Stage Progress Bar */}
                <div className="flex items-center gap-1">
                  {(Object.keys(STAGE_CONFIG) as JourneyStage[]).map((stage, index) => (
                    <div key={stage} className="flex items-center">
                      {getStageIcon(stage, prospect.stages[stage].complete)}
                      {index < Object.keys(STAGE_CONFIG).length - 1 && (
                        <ChevronRight className={`h-3 w-3 mx-0.5 ${
                          prospect.stages[stage].complete 
                            ? 'text-muted-foreground' 
                            : 'text-muted-foreground/30'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Attention Message */}
                {prospect.needsAttention && prospect.attentionReason && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {prospect.attentionReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="pt-3 border-t grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-2xl font-bold">{activeProspects.length}</p>
            <p className="text-xs text-muted-foreground">In Pipeline</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-500">{needsAttentionCount}</p>
            <p className="text-xs text-muted-foreground">Need Attention</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">
              {prospects.filter(p => p.currentStage === "forms_received").length}
            </p>
            <p className="text-xs text-muted-foreground">Forms Complete</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
