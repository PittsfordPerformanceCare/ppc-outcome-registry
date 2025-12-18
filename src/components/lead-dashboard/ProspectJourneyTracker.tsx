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
  ArrowRight,
  HelpCircle
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow, format } from "date-fns";
import { BookNPVisitDialog } from "./BookNPVisitDialog";
import { SendIntakeFormsDialog } from "./SendIntakeFormsDialog";
import { useNavigate } from "react-router-dom";

// The 6 journey stages per UX spec - FIXED, never add more
type JourneyStage = 
  | "lead_submitted" 
  | "approved_for_care" 
  | "visit_scheduled" 
  | "forms_sent" 
  | "forms_received" 
  | "episode_active";

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
  patientCompleted: boolean;
  daysInPipeline: number;
  isStalled: boolean; // Time-based urgency
  appointmentDate?: string;
  sourceType: "lead" | "care_request";
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

// Stage labels - exact terminology per spec
const STAGE_LABELS: Record<JourneyStage, string> = {
  lead_submitted: "Lead Submitted",
  approved_for_care: "Approved for Care",
  visit_scheduled: "NP Visit Scheduled",
  forms_sent: "Legal Forms Sent",
  forms_received: "Forms Received",
  episode_active: "Episode Active",
};

// Stall thresholds per stage (in days)
const STALL_THRESHOLDS: Partial<Record<JourneyStage, number>> = {
  lead_submitted: 2,
  approved_for_care: 3,
  visit_scheduled: 1,
  forms_sent: 5,
  forms_received: 1,
};

// Action button config - verb-first labels per spec
const ACTION_CONFIG: Record<JenniferAction, { label: string; icon: typeof Calendar }> = {
  approve: { label: "Approve", icon: CheckCircle2 },
  schedule: { label: "Schedule Visit", icon: Calendar },
  send_forms: { label: "Send Forms", icon: Mail },
  convert: { label: "Convert to Episode", icon: PlayCircle },
  waiting: { label: "Waiting", icon: Clock },
  done: { label: "Complete", icon: CheckCircle2 },
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
      // Fetch all data in parallel for efficiency
      const [leadsResult, careRequestsResult, pendingEpisodesResult, intakeFormsResult] = await Promise.all([
        // Get leads that haven't been converted to care requests
        supabase
          .from("leads")
          .select("*")
          .not("funnel_stage", "in", '("converted","closed_lost")')
          .order("created_at", { ascending: false }),
        // Get care requests (main pipeline)
        supabase
          .from("care_requests")
          .select("*")
          .not("status", "in", '("archived","declined","ARCHIVED","DECLINED","CONVERTED")')
          .is("episode_id", null)
          .order("created_at", { ascending: false }),
        // Get pending episodes (for scheduled visits)
        supabase
          .from("pending_episodes")
          .select("*")
          .in("status", ["pending", "scheduled", "ready_for_conversion"]),
        // Get intake forms
        supabase
          .from("intake_forms")
          .select("*"),
      ]);

      if (leadsResult.error) throw leadsResult.error;
      if (careRequestsResult.error) throw careRequestsResult.error;
      if (pendingEpisodesResult.error) throw pendingEpisodesResult.error;
      if (intakeFormsResult.error) throw intakeFormsResult.error;

      const leads = leadsResult.data || [];
      const careRequests = careRequestsResult.data || [];
      const pendingEpisodes = pendingEpisodesResult.data || [];
      const intakeForms = intakeFormsResult.data || [];

      console.log("[ProspectJourney] Fetched data:", {
        leads: leads.length,
        careRequests: careRequests.length,
        careRequestStatuses: careRequests.map(cr => ({ name: (cr.intake_payload as any)?.name, status: cr.status })),
        pendingEpisodes: pendingEpisodes.length,
        intakeForms: intakeForms.length
      });

      const journeys: ProspectJourney[] = [];

      // Helper to calculate stall status
      const isStalled = (stage: JourneyStage, daysInStage: number): boolean => {
        const threshold = STALL_THRESHOLDS[stage];
        return threshold !== undefined && daysInStage >= threshold;
      };

      // Process leads that don't have a care request yet
      // Match by both name AND email to avoid filtering out different people with same email
      const careRequestPatients = new Set(
        careRequests.map(cr => {
          const payload = cr.intake_payload as Record<string, unknown>;
          const name = ((payload?.name as string) || (payload?.patient_name as string) || "").toLowerCase().trim();
          const email = ((payload?.email as string) || "").toLowerCase().trim();
          return `${name}::${email}`;
        }).filter(key => key !== "::")
      );

      for (const lead of leads) {
        // Skip leads that already have a care request (match on name + email)
        const leadKey = `${(lead.name || "").toLowerCase().trim()}::${(lead.email || "").toLowerCase().trim()}`;
        if (careRequestPatients.has(leadKey)) continue;
        if (lead.funnel_stage === "qualified") continue; // Already converted

        const createdDate = new Date(lead.created_at);
        const daysInPipeline = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

        journeys.push({
          id: lead.id,
          name: lead.name || "Unknown",
          email: lead.email || "",
          phone: lead.phone || null,
          primaryConcern: lead.primary_concern || lead.symptom_summary || null,
          createdAt: lead.created_at,
          currentStage: "lead_submitted",
          jenniferAction: "approve",
          patientCompleted: false,
          daysInPipeline,
          isStalled: isStalled("lead_submitted", daysInPipeline),
          sourceType: "lead",
          leadId: lead.id,
        });
      }

      // Process care requests
      for (const cr of careRequests) {
        const payload = cr.intake_payload as Record<string, unknown> || {};
        const patientName = (payload.name as string) || (payload.patient_name as string) || "Unknown";
        const email = (payload.email as string) || "";
        const phone = (payload.phone as string) || null;
        const primaryConcern = cr.primary_complaint || (payload.chief_complaint as string) || null;

        // Find matching pending episode
        const pendingEp = pendingEpisodes.find(pe => 
          pe.patient_name?.toLowerCase() === patientName.toLowerCase()
        );

        // Find matching intake form
        const intakeForm = intakeForms.find(f => 
          f.patient_name?.toLowerCase() === patientName.toLowerCase() ||
          (email && f.email?.toLowerCase() === email.toLowerCase())
        );

        const statusUpper = cr.status?.toUpperCase() || "";
        
        // Determine stage completion
        const isApproved = ["APPROVED", "APPROVED_FOR_CARE", "SCHEDULED", "IN_REVIEW", "ASSIGNED"].includes(statusUpper) || !!cr.approved_at;
        const isScheduled = !!pendingEp?.scheduled_date || statusUpper === "SCHEDULED";
        // Only check intake forms created AFTER this care request (part of this journey)
        const matchedIntakeForm = intakeForms.find(f => 
          f.patient_name?.toLowerCase().trim() === patientName.toLowerCase().trim() &&
          new Date(f.created_at || 0) >= new Date(cr.created_at) &&
          !f.converted_to_episode_id // Not already converted to an episode
        );
        const formsSent = !!matchedIntakeForm && isScheduled;
        const formsReceived = matchedIntakeForm?.status === "submitted" || (!!matchedIntakeForm?.submitted_at && matchedIntakeForm?.status !== "pending");
        const episodeActive = !!cr.episode_id;

        // Determine current stage
        let currentStage: JourneyStage = "lead_submitted";
        if (episodeActive) currentStage = "episode_active";
        else if (formsReceived) currentStage = "forms_received";
        else if (formsSent) currentStage = "forms_sent";
        else if (isScheduled) currentStage = "visit_scheduled";
        else if (isApproved) currentStage = "approved_for_care";

        // Determine Jennifer's action - the KEY UX decision
        let jenniferAction: JenniferAction = "approve";
        let patientCompleted = false;

        if (currentStage === "lead_submitted") {
          jenniferAction = "approve";
        } else if (currentStage === "approved_for_care") {
          jenniferAction = "schedule";
        } else if (currentStage === "visit_scheduled") {
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

        console.log(`[ProspectJourney] ${patientName}: status=${statusUpper}, isApproved=${isApproved}, currentStage=${currentStage}, jenniferAction=${jenniferAction}`);

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
          isStalled: isStalled(currentStage, daysInPipeline),
          appointmentDate: pendingEp?.scheduled_date,
          sourceType: "care_request",
          careRequestData: {
            id: cr.id,
            intake_payload: payload,
            primary_complaint: cr.primary_complaint,
            assigned_clinician_id: cr.assigned_clinician_id,
          },
        });
      }

      // Sort: stalled first, then action required, then by days in pipeline
      journeys.sort((a, b) => {
        // Stalled items with action required come first
        const aUrgent = a.isStalled && !["waiting", "done"].includes(a.jenniferAction);
        const bUrgent = b.isStalled && !["waiting", "done"].includes(b.jenniferAction);
        if (aUrgent && !bUrgent) return -1;
        if (!aUrgent && bUrgent) return 1;

        // Then action required
        const aActionRequired = !["waiting", "done"].includes(a.jenniferAction);
        const bActionRequired = !["waiting", "done"].includes(b.jenniferAction);
        if (aActionRequired && !bActionRequired) return -1;
        if (!aActionRequired && bActionRequired) return 1;

        // Then by days
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
        try {
          if (prospect.sourceType === "lead") {
            // For leads: Create a care request and mark lead as qualified
            const { error: crError } = await supabase
              .from("care_requests")
              .insert({
                intake_payload: {
                  name: prospect.name,
                  email: prospect.email,
                  phone: prospect.phone,
                  primary_concern: prospect.primaryConcern,
                  lead_id: prospect.leadId,
                },
                primary_complaint: prospect.primaryConcern,
                source: "WEBSITE",
                status: "APPROVED_FOR_CARE",
                approved_at: new Date().toISOString(),
              });
            
            if (crError) throw crError;

            // Update lead funnel stage
            await supabase
              .from("leads")
              .update({ 
                funnel_stage: "qualified",
                updated_at: new Date().toISOString()
              })
              .eq("id", prospect.id);
          } else {
            // For care requests: Just approve
            await supabase
              .from("care_requests")
              .update({ 
                status: "APPROVED_FOR_CARE",
                approved_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq("id", prospect.id);
          }
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
        navigate(`/new-episode?care_request=${prospect.careRequestData?.id || prospect.id}`);
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
            <div className="flex items-center gap-2">
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
              {/* Help tooltip with checklist */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0" align="start">
                  <div className="p-4 border-b bg-muted/30">
                    <h4 className="font-semibold text-sm">Lead → Episode Checklist</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Your step-by-step guide</p>
                  </div>
                  <div className="p-3 space-y-2 text-sm">
                    <div className="flex gap-3 items-start p-2 rounded-md bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                      <span className="font-mono text-xs bg-orange-500 text-white rounded px-1.5 py-0.5">1</span>
                      <div>
                        <p className="font-medium">Lead Submitted</p>
                        <p className="text-xs text-muted-foreground">Click <strong>Approve</strong> to confirm valid patient</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start p-2 rounded-md bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                      <span className="font-mono text-xs bg-orange-500 text-white rounded px-1.5 py-0.5">2</span>
                      <div>
                        <p className="font-medium">Approved for Care</p>
                        <p className="text-xs text-muted-foreground">Click <strong>Schedule Visit</strong> → book NP appointment</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start p-2 rounded-md bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                      <span className="font-mono text-xs bg-orange-500 text-white rounded px-1.5 py-0.5">3</span>
                      <div>
                        <p className="font-medium">NP Visit Scheduled</p>
                        <p className="text-xs text-muted-foreground">Click <strong>Send Forms</strong> → triggers intake email</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start p-2 rounded-md border">
                      <span className="font-mono text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">4</span>
                      <div>
                        <p className="font-medium">Legal Forms Sent</p>
                        <p className="text-xs text-muted-foreground">Wait for patient — ✓ appears when done</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start p-2 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                      <span className="font-mono text-xs bg-green-600 text-white rounded px-1.5 py-0.5">5</span>
                      <div>
                        <p className="font-medium">Forms Received ✓</p>
                        <p className="text-xs text-muted-foreground">Click <strong>Convert to Episode</strong> → create episode</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start p-2 rounded-md border bg-muted/30">
                      <span className="font-mono text-xs bg-muted-foreground text-white rounded px-1.5 py-0.5">6</span>
                      <div>
                        <p className="font-medium">Episode Active</p>
                        <p className="text-xs text-muted-foreground">Done! Card disappears — patient in care</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t bg-muted/20 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span>Orange = your action needed</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span>Checkmark = patient completed</span>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
                const showUrgency = prospect.isStalled && isActionRequired;

                return (
                  <div
                    key={prospect.id}
                    className={`p-4 rounded-lg border transition-all ${
                      showUrgency
                        ? 'border-orange-400 bg-orange-100/60 dark:border-orange-700 dark:bg-orange-950/30 ring-1 ring-orange-400/30'
                        : isActionRequired 
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
                          {showUrgency && (
                            <Badge variant="outline" className="text-orange-600 border-orange-400 text-xs px-1.5 py-0">
                              {prospect.daysInPipeline}d
                            </Badge>
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
