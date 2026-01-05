import { useState, useEffect, useRef } from "react";
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
  HelpCircle,
  Brain,
  Activity,
  Trash2,
  MoreVertical,
  FileText,
  Printer
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { BookNPVisitDialog } from "./BookNPVisitDialog";
import { SendIntakeFormsDialog } from "./SendIntakeFormsDialog";
import { LeadDetailsDialog } from "./LeadDetailsDialog";
import { IntakeFormSummaryDialog } from "./IntakeFormSummaryDialog";
import { IntakeSummaryPrintable } from "@/components/intake/IntakeSummaryPrintable";
import { useNavigate } from "react-router-dom";
import { getSuggestedEpisodeType, getRoutingBadgeConfig, type EpisodeTypeRoute } from "@/lib/routingSuggestion";

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
  systemCategory: string | null;
  suggestedRoute: EpisodeTypeRoute;
  createdAt: string;
  currentStage: JourneyStage;
  jenniferAction: JenniferAction;
  patientCompleted: boolean;
  daysInPipeline: number;
  isStalled: boolean; // Time-based urgency
  appointmentDate?: string;
  sourceType: "lead" | "care_request";
  leadId?: string;
  // Extended lead details for the popup
  notes?: string;
  symptomSummary?: string;
  whoIsThisFor?: string;
  preferredContactMethod?: string;
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
  const { toast } = useToast();
  const [prospects, setProspects] = useState<ProspectJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [bookVisitOpen, setBookVisitOpen] = useState(false);
  const [sendFormsOpen, setSendFormsOpen] = useState(false);
  const [leadDetailsOpen, setLeadDetailsOpen] = useState(false);
  const [intakeFormSummaryOpen, setIntakeFormSummaryOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<ProspectJourney | null>(null);
  const [selectedIntakeForm, setSelectedIntakeForm] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prospectToDelete, setProspectToDelete] = useState<ProspectJourney | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Auto-print state for newly received intake forms
  const [autoPrintData, setAutoPrintData] = useState<any>(null);
  const printTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadProspects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel for efficiency
      const [leadsResult, careRequestsResult, pendingEpisodesResult, intakeFormsResult, intakesResult] = await Promise.all([
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
        // Get intake forms (legacy)
        supabase
          .from("intake_forms")
          .select("*"),
        // Get intakes (neurologic intake forms with legal docs)
        supabase
          .from("intakes")
          .select("*")
          .in("status", ["completed", "approved"]),
      ]);

      if (leadsResult.error) throw leadsResult.error;
      if (careRequestsResult.error) throw careRequestsResult.error;
      if (pendingEpisodesResult.error) throw pendingEpisodesResult.error;
      if (intakeFormsResult.error) throw intakeFormsResult.error;
      if (intakesResult.error) throw intakesResult.error;

      const leads = leadsResult.data || [];
      const careRequests = careRequestsResult.data || [];
      const pendingEpisodes = pendingEpisodesResult.data || [];
      const intakeForms = intakeFormsResult.data || [];
      const intakes = intakesResult.data || [];

      console.log("[ProspectJourney] Fetched data:", {
        leads: leads.length,
        careRequests: careRequests.length,
        careRequestStatuses: careRequests.map(cr => ({ name: (cr.intake_payload as any)?.name, status: cr.status })),
        pendingEpisodes: pendingEpisodes.length,
        intakeForms: intakeForms.length,
        intakes: intakes.length,
        intakesData: intakes.map(i => ({ name: i.patient_name, status: i.status }))
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

        const systemCategory = lead.system_category || null;
        const suggestedRoute = getSuggestedEpisodeType(systemCategory, lead.primary_concern);

        journeys.push({
          id: lead.id,
          name: lead.name || "Unknown",
          email: lead.email || "",
          phone: lead.phone || null,
          primaryConcern: lead.primary_concern || lead.symptom_summary || null,
          systemCategory,
          suggestedRoute,
          createdAt: lead.created_at,
          currentStage: "lead_submitted",
          jenniferAction: "approve",
          patientCompleted: false,
          daysInPipeline,
          isStalled: isStalled("lead_submitted", daysInPipeline),
          sourceType: "lead",
          leadId: lead.id,
          // Extended fields for popup
          notes: lead.notes || undefined,
          symptomSummary: lead.symptom_summary || undefined,
          whoIsThisFor: lead.who_is_this_for || undefined,
          preferredContactMethod: lead.preferred_contact_method || undefined,
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
        
        // Check intake_forms table - match by name or email
        // For front desk QR workflow, intake forms may exist independently of care requests
        const normalizedPatientName = patientName.toLowerCase().replace(/\s+/g, ' ').trim();
        const matchedIntakeForm = intakeForms.find(f => {
          const normalizedFormName = (f.patient_name || '').toLowerCase().replace(/\s+/g, ' ').trim();
          return (
            (normalizedFormName === normalizedPatientName) ||
            (email && f.email?.toLowerCase().trim() === email.toLowerCase().trim())
          ) && !f.converted_to_episode_id; // Not already converted to an episode
        });
        
        // Check intakes table (neurologic intake with legal docs) - match by lead_id, name, or email
        const leadId = (payload.lead_id as string) || null;
        const matchedIntake = intakes.find(i => {
          const normalizedIntakeName = (i.patient_name || '').toLowerCase().replace(/\s+/g, ' ').trim();
          return (
            (leadId && i.lead_id === leadId) || // Match by lead_id first (most reliable)
            (normalizedIntakeName === normalizedPatientName) || // Match by normalized name
            (email && i.patient_email?.toLowerCase().trim() === email.toLowerCase().trim()) // Match by email
          );
        });
        
        // Forms sent if either intake system has a record and visit is scheduled
        const formsSent = (!!matchedIntakeForm || !!matchedIntake) && isScheduled;
        
        // Check if this care request came from Front Desk QR (forms submitted first, auto-created care request)
        const isFromFrontDeskQR = cr.source === "FRONT_DESK_QR";
        
        // Forms received if either system shows completed/submitted status
        // Also check for "pending" with submitted_at for front desk QR submissions
        // FRONT_DESK_QR source means the intake form created this care request - forms ARE received
        const intakeFormsReceived = matchedIntakeForm?.status === "submitted" || 
          matchedIntakeForm?.status === "completed" ||
          matchedIntakeForm?.status === "pending" || // Front desk QR forms come in as pending
          (!!matchedIntakeForm?.submitted_at && matchedIntakeForm?.status !== "draft");
        const neurologicIntakeReceived = matchedIntake?.status === "completed" || matchedIntake?.status === "approved";
        const formsReceived = intakeFormsReceived || neurologicIntakeReceived || isFromFrontDeskQR;
        
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

        console.log(`[ProspectJourney] ${patientName}: status=${statusUpper}, source=${cr.source}, isApproved=${isApproved}, formsReceived=${formsReceived}, isFromFrontDeskQR=${isFromFrontDeskQR}, currentStage=${currentStage}, jenniferAction=${jenniferAction}`);

        // Get system category from payload
        const systemCategory = (payload.system_category as string) || null;
        const suggestedRoute = getSuggestedEpisodeType(systemCategory, primaryConcern);

        journeys.push({
          id: cr.id,
          name: patientName,
          email,
          phone,
          primaryConcern,
          systemCategory,
          suggestedRoute,
          createdAt: cr.created_at,
          currentStage,
          jenniferAction,
          patientCompleted,
          daysInPipeline,
          isStalled: isStalled(currentStage, daysInPipeline),
          appointmentDate: pendingEp?.scheduled_date,
          sourceType: "care_request",
          // Extended fields from payload (if came from lead)
          notes: (payload.notes as string) || undefined,
          symptomSummary: (payload.symptom_summary as string) || (payload.chief_complaint as string) || undefined,
          whoIsThisFor: (payload.who_is_this_for as string) || undefined,
          preferredContactMethod: (payload.preferred_contact_method as string) || undefined,
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
    
    // Subscribe to real-time updates for intake_forms and intakes tables
    // This enables instant notification when a patient submits legal forms
    const intakeFormsChannel = supabase
      .channel('prospect-journey-intake-forms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'intake_forms'
        },
        (payload) => {
          console.log('[ProspectJourney] Intake form change detected:', payload);
          // Reload prospects to update the journey state
          loadProspects();
          
          // Show toast for new submissions and trigger auto-print
          if (payload.eventType === 'INSERT' && (payload.new as any)?.status === 'submitted') {
            const formData = payload.new as any;
            toast({
              title: "📋 Legal Forms Received!",
              description: `${formData?.patient_name || 'A patient'} has submitted their intake forms.`,
              duration: 8000,
              action: (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setAutoPrintData(formData);
                    // Clear after print
                    if (printTimeoutRef.current) clearTimeout(printTimeoutRef.current);
                    printTimeoutRef.current = setTimeout(() => setAutoPrintData(null), 3000);
                  }}
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
              ),
            });
            
            // Auto-trigger print dialog
            setAutoPrintData(formData);
            // Clear after print completes
            if (printTimeoutRef.current) clearTimeout(printTimeoutRef.current);
            printTimeoutRef.current = setTimeout(() => setAutoPrintData(null), 3000);
          }
        }
      )
      .subscribe();

    const intakesChannel = supabase
      .channel('prospect-journey-intakes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'intakes'
        },
        (payload) => {
          console.log('[ProspectJourney] Intakes change detected:', payload);
          // Reload prospects to update the journey state
          loadProspects();
          
          // Show toast for completed intakes
          if (payload.eventType === 'UPDATE' && (payload.new as any)?.status === 'completed') {
            toast({
              title: "📋 Legal Forms Received!",
              description: `${(payload.new as any)?.patient_name || 'A patient'} has completed their intake forms.`,
              duration: 8000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(intakeFormsChannel);
      supabase.removeChannel(intakesChannel);
      if (printTimeoutRef.current) clearTimeout(printTimeoutRef.current);
    };
  }, [toast]);

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

  // Handle deleting a prospect (patient cancelled)
  const handleDeleteProspect = async () => {
    if (!prospectToDelete) return;
    
    setDeleting(true);
    try {
      if (prospectToDelete.sourceType === "lead") {
        // Delete from leads table
        const { error } = await supabase
          .from("leads")
          .delete()
          .eq("id", prospectToDelete.id);
        
        if (error) throw error;
      } else {
        // Archive the care request instead of deleting
        const { error } = await supabase
          .from("care_requests")
          .update({ 
            status: "ARCHIVED",
            archive_reason: "Patient cancelled",
            updated_at: new Date().toISOString()
          })
          .eq("id", prospectToDelete.id);
        
        if (error) throw error;
      }
      
      toast({
        title: "Prospect removed",
        description: `${prospectToDelete.name} has been removed from the journey.`,
      });
      
      loadProspects();
    } catch (err) {
      console.error("Error deleting prospect:", err);
      toast({
        title: "Error",
        description: "Failed to remove prospect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setProspectToDelete(null);
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
                          <h4 
                            className="font-semibold text-base truncate cursor-pointer hover:text-primary hover:underline transition-colors"
                            onClick={async () => {
                              setSelectedProspect(prospect);
                              // If at forms_received or episode_active stage, show intake form summary
                              if (prospect.currentStage === "forms_received" || prospect.currentStage === "episode_active") {
                                // Fetch intake form data
                                const { data: intakeForm } = await supabase
                                  .from("intake_forms")
                                  .select("*")
                                  .or(`patient_name.ilike.${prospect.name},email.ilike.${prospect.email || ''}`)
                                  .order("created_at", { ascending: false })
                                  .limit(1)
                                  .maybeSingle();
                                
                                if (intakeForm) {
                                  setSelectedIntakeForm(intakeForm);
                                  setIntakeFormSummaryOpen(true);
                                } else {
                                  // Fallback to lead details if no intake form found
                                  setLeadDetailsOpen(true);
                                }
                              } else {
                                setLeadDetailsOpen(true);
                              }
                            }}
                          >
                            {prospect.name}
                          </h4>
                          {/* Routing suggestion badge */}
                          {prospect.suggestedRoute !== "UNKNOWN" && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs px-1.5 py-0 flex items-center gap-1 ${getRoutingBadgeConfig(prospect.suggestedRoute).className}`}
                            >
                              {prospect.suggestedRoute === "NEURO" ? (
                                <Brain className="h-3 w-3" />
                              ) : (
                                <Activity className="h-3 w-3" />
                              )}
                              {getRoutingBadgeConfig(prospect.suggestedRoute).label}
                            </Badge>
                          )}
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

                      {/* Right: Action Button + Delete */}
                      <div className="flex items-center gap-2 flex-shrink-0">
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
                        
                        {/* More actions dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProspect(prospect);
                                setSendFormsOpen(true);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Send Intake Forms Only
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setProspectToDelete(prospect);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Prospect
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* Lead Details Dialog - works for any prospect */}
      <LeadDetailsDialog
        open={leadDetailsOpen}
        onOpenChange={setLeadDetailsOpen}
        lead={selectedProspect ? {
          name: selectedProspect.name,
          email: selectedProspect.email,
          phone: selectedProspect.phone,
          primaryConcern: selectedProspect.primaryConcern,
          systemCategory: selectedProspect.systemCategory,
          createdAt: selectedProspect.createdAt,
          notes: selectedProspect.notes,
          symptomSummary: selectedProspect.symptomSummary,
          whoIsThisFor: selectedProspect.whoIsThisFor,
          preferredContactMethod: selectedProspect.preferredContactMethod,
        } : null}
      />

      {/* Intake Form Summary Dialog - for forms_received stage */}
      <IntakeFormSummaryDialog
        open={intakeFormSummaryOpen}
        onOpenChange={setIntakeFormSummaryOpen}
        intakeForm={selectedIntakeForm}
      />
      {/* Dialogs - render for both leads and care requests */}
      {selectedProspect && (
        <>
          <BookNPVisitDialog
            open={bookVisitOpen}
            onOpenChange={setBookVisitOpen}
            onSuccess={loadProspects}
            lead={selectedProspect.sourceType === "lead" ? {
              id: selectedProspect.id,
              name: selectedProspect.name,
              email: selectedProspect.email,
              phone: selectedProspect.phone,
              primary_concern: selectedProspect.primaryConcern,
            } : null}
            careRequest={selectedProspect.careRequestData ? {
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
            } : null}
          />
          <SendIntakeFormsDialog
            open={sendFormsOpen}
            onOpenChange={setSendFormsOpen}
            onSuccess={loadProspects}
            patientName={selectedProspect.name}
            patientEmail={selectedProspect.email}
            careRequestId={selectedProspect.careRequestData?.id || selectedProspect.id}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove prospect?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{prospectToDelete?.name}</strong> from the prospect journey.
              {prospectToDelete?.sourceType === "care_request" 
                ? " The care request will be archived."
                : " This action cannot be undone."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProspect}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Auto-print component for newly received intake forms */}
      {autoPrintData && (
        <IntakeSummaryPrintable 
          data={autoPrintData}
          autoPrint={true}
          onPrintComplete={() => setAutoPrintData(null)}
        />
      )}
    </>
  );
}
