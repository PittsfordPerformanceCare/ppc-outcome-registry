import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle2, 
  Clock, 
  User, 
  RefreshCw,
  Calendar,
  Mail,
  PlayCircle,
  ArrowRight
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { BookNPVisitDialog } from "./BookNPVisitDialog";
import { SendIntakeFormsDialog } from "./SendIntakeFormsDialog";
import { useNavigate } from "react-router-dom";

// The 6 journey stages per UX spec
type JourneyStage = "lead" | "approved" | "scheduled" | "forms_sent" | "forms_received" | "episode_active";

// What action Jennifer needs to take at each stage
type JenniferAction = "approve" | "schedule" | "send_forms" | "convert" | "waiting" | "done";

interface ProspectJourney {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  primaryConcern: string | null;
  createdAt: string;
  currentStage: JourneyStage;
  jenniferAction: JenniferAction;
  patientCompleted: boolean; // Patient did their part (forms received)
  daysInPipeline: number;
  appointmentDate?: string;
  leadId?: string;
  careRequestData?: {
    id: string;
    intake_payload: Record<string, unknown>;
    primary_complaint: string | null;
    assigned_clinician_id: string | null;
  };
}

interface ProspectJourneyTrackerProps {
  className?: string;
}

// Stage labels for display
const STAGE_LABELS: Record<JourneyStage, string> = {
  lead: "New Lead",
  approved: "Approved",
  scheduled: "Visit Scheduled",
  forms_sent: "Forms Sent",
  forms_received: "Forms Received",
  episode_active: "Episode Active",
};

// Action button config - what Jennifer sees
const ACTION_CONFIG: Record<JenniferAction, { label: string; icon: typeof Calendar; variant: "default" | "secondary" | "outline" }> = {
  approve: { label: "Approve", icon: CheckCircle2, variant: "default" },
  schedule: { label: "Schedule Visit", icon: Calendar, variant: "default" },
  send_forms: { label: "Send Forms", icon: Mail, variant: "default" },
  convert: { label: "Convert to Episode", icon: PlayCircle, variant: "default" },
  waiting: { label: "Waiting", icon: Clock, variant: "outline" },
  done: { label: "Complete", icon: CheckCircle2, variant: "secondary" },
};

export function ProspectJourneyTracker({ className }: ProspectJourneyTrackerProps) {
  const navigate = useNavigate();
  const [prospects, setProspects] = useState<ProspectJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [bookVisitOpen, setBookVisitOpen] = useState(false);
  const [sendFormsOpen, setSendFormsOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<ProspectJourney | null>(null);

  const loadProspects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get care requests (main pipeline)
      const { data: careRequests, error: crError } = await supabase
        .from("care_requests")
        .select("*")
        .not("status", "in", '("archived","declined","ARCHIVED","DECLINED","CONVERTED")')
        .is("episode_id", null)
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
        .select("*");

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
          (email && f.email?.toLowerCase() === email.toLowerCase())
        );

        const statusUpper = cr.status?.toUpperCase() || "";
        
        // Determine stage completion
        const isApproved = ["APPROVED", "SCHEDULED", "SUBMITTED", "IN_REVIEW", "ASSIGNED"].includes(statusUpper) || !!cr.approved_at;
        const isScheduled = !!pendingEp?.scheduled_date || statusUpper === "SCHEDULED";
        const formsSent = !!intakeForm || isScheduled;
        const formsReceived = intakeForm?.status === "submitted" || !!intakeForm?.submitted_at || statusUpper === "SUBMITTED";
        const episodeActive = !!cr.episode_id;

        // Determine current stage
        let currentStage: JourneyStage = "lead";
        if (episodeActive) currentStage = "episode_active";
        else if (formsReceived) currentStage = "forms_received";
        else if (formsSent) currentStage = "forms_sent";
        else if (isScheduled) currentStage = "scheduled";
        else if (isApproved) currentStage = "approved";

        // Determine Jennifer's action - the KEY UX decision
        let jenniferAction: JenniferAction = "approve";
        let patientCompleted = false;

        if (currentStage === "lead") {
          jenniferAction = "approve";
        } else if (currentStage === "approved") {
          jenniferAction = "schedule";
        } else if (currentStage === "scheduled") {
          jenniferAction = "send_forms";
        } else if (currentStage === "forms_sent") {
          jenniferAction = "waiting"; // Waiting on patient
        } else if (currentStage === "forms_received") {
          jenniferAction = "convert";
          patientCompleted = true;
        } else if (currentStage === "episode_active") {
          jenniferAction = "done";
          patientCompleted = true;
        }

        // Calculate days in pipeline
        const createdDate = new Date(cr.created_at);
        const daysInPipeline = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

        journeys.push({
          id: cr.id,
          name: patientName,
          email,
          phone,
          primaryConcern,
          createdAt: cr.created_at,
          currentStage,
          jenniferAction,
          patientCompleted,
          daysInPipeline,
          appointmentDate: pendingEp?.scheduled_date,
          careRequestData: {
            id: cr.id,
            intake_payload: payload,
            primary_complaint: cr.primary_complaint,
            assigned_clinician_id: cr.assigned_clinician_id,
          },
        });
      }

      // Sort: action required first (not "waiting" or "done"), then by days in pipeline
      journeys.sort((a, b) => {
        const aActionRequired = !["waiting", "done"].includes(a.jenniferAction);
        const bActionRequired = !["waiting", "done"].includes(b.jenniferAction);
        
        if (aActionRequired && !bActionRequired) return -1;
        if (!aActionRequired && bActionRequired) return 1;
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

  // Handle action button click
  const handleAction = async (prospect: ProspectJourney) => {
    setSelectedProspect(prospect);

    switch (prospect.jenniferAction) {
      case "approve":
        // Quick approve - update status
        try {
          await supabase
            .from("care_requests")
            .update({ 
              status: "APPROVED",
              approved_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq("id", prospect.id);
          loadProspects();
        } catch (err) {
          console.error("Error approving:", err);
        }
        break;
      case "schedule":
        setBookVisitOpen(true);
        break;
      case "send_forms":
        setSendFormsOpen(true);
        break;
      case "convert":
        // Navigate to episode creation
        navigate(`/new-episode?care_request=${prospect.id}`);
        break;
      default:
        break;
    }
  };

  const activeProspects = prospects.filter(p => p.currentStage !== "episode_active");
  const actionRequiredCount = activeProspects.filter(p => !["waiting", "done"].includes(p.jenniferAction)).length;
  const waitingOnPatientCount = activeProspects.filter(p => p.jenniferAction === "waiting").length;

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Prospect Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Prospect Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                Prospect Journey
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {activeProspects.length === 0 
                  ? "No active prospects" 
                  : `${activeProspects.length} prospect${activeProspects.length !== 1 ? 's' : ''} in pipeline`
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              {actionRequiredCount > 0 && (
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-3 py-1">
                  {actionRequiredCount} action{actionRequiredCount !== 1 ? 's' : ''} needed
                </Badge>
              )}
              {waitingOnPatientCount > 0 && (
                <Badge variant="secondary" className="font-normal">
                  {waitingOnPatientCount} waiting on patient
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={loadProspects} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-2">
          {activeProspects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm mt-1">No prospects in the pipeline</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeProspects.map((prospect) => {
                const actionConfig = ACTION_CONFIG[prospect.jenniferAction];
                const ActionIcon = actionConfig.icon;
                const isActionRequired = !["waiting", "done"].includes(prospect.jenniferAction);

                return (
                  <div
                    key={prospect.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isActionRequired 
                        ? 'border-orange-300 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20' 
                        : prospect.patientCompleted
                          ? 'border-green-200 bg-green-50/30 dark:border-green-900 dark:bg-green-950/20'
                          : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: Patient Info + Stage */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-base truncate">{prospect.name}</h4>
                          {prospect.patientCompleted && (
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground/80">
                            {STAGE_LABELS[prospect.currentStage]}
                          </span>
                          <span className="text-muted-foreground/60">•</span>
                          <span>{formatDistanceToNow(new Date(prospect.createdAt), { addSuffix: true })}</span>
                          {prospect.appointmentDate && (
                            <>
                              <span className="text-muted-foreground/60">•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(prospect.appointmentDate), "MMM d")}
                              </span>
                            </>
                          )}
                        </div>
                        {prospect.primaryConcern && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {prospect.primaryConcern}
                          </p>
                        )}
                      </div>

                      {/* Right: Action Button */}
                      <div className="flex-shrink-0">
                        {isActionRequired ? (
                          <Button
                            size="sm"
                            className="gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                            onClick={() => handleAction(prospect)}
                          >
                            <ActionIcon className="h-4 w-4" />
                            {actionConfig.label}
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        ) : prospect.jenniferAction === "waiting" ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-2 rounded-md bg-muted/50">
                            <Clock className="h-4 w-4" />
                            <span>Waiting on patient</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary Footer */}
          {activeProspects.length > 0 && (
            <div className="pt-4 mt-4 border-t flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-muted-foreground">Action needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span className="text-muted-foreground">Patient completed</span>
                </div>
              </div>
              <div className="text-muted-foreground">
                {prospects.filter(p => p.currentStage === "forms_received").length} ready to convert
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedProspect?.careRequestData && (
        <>
          <BookNPVisitDialog
            open={bookVisitOpen}
            onOpenChange={setBookVisitOpen}
            onSuccess={loadProspects}
            careRequest={{
              id: selectedProspect.careRequestData.id,
              intake_payload: selectedProspect.careRequestData.intake_payload as {
                patient_name?: string;
                name?: string;
                email?: string;
                phone?: string;
                primary_concern?: string;
              },
              primary_complaint: selectedProspect.careRequestData.primary_complaint,
              assigned_clinician_id: selectedProspect.careRequestData.assigned_clinician_id,
            }}
          />
          <SendIntakeFormsDialog
            open={sendFormsOpen}
            onOpenChange={setSendFormsOpen}
            onSuccess={loadProspects}
            patientName={selectedProspect.name}
            patientEmail={selectedProspect.email}
            careRequestId={selectedProspect.id}
          />
        </>
      )}
    </>
  );
}
