import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { createEpisode, saveOutcomeScore } from "@/lib/dbOperations";
import { PPC_CONFIG, IndexType } from "@/lib/ppcConfig";
import { getOutcomeToolRecommendations, getPrimaryOutcomeTool } from "@/lib/outcomeToolRecommendations";
import { OutcomeToolRecommendations } from "@/components/OutcomeToolRecommendations";
import { PatientHistoryDialog } from "@/components/PatientHistoryDialog";
import { DataTransferSummary } from "@/components/DataTransferSummary";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp, Calendar, Activity } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { NDIForm } from "@/components/forms/NDIForm";
import { ODIForm } from "@/components/forms/ODIForm";
import { QuickDASHForm } from "@/components/forms/QuickDASHForm";
import { LEFSForm } from "@/components/forms/LEFSForm";
import { RPQForm } from "@/components/forms/RPQForm";

interface IntakeForm {
  id: string;
  access_code: string;
  patient_name: string;
  date_of_birth: string;
  phone?: string;
  email?: string;
  insurance_provider?: string;
  insurance_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  primary_care_physician?: string;
  referring_physician?: string;
  current_medications?: string;
  allergies?: string;
  medical_history?: string;
  surgery_history?: string;
  hospitalization_history?: string;
  specialist_seen?: string;
  chief_complaint: string;
  injury_date?: string;
  injury_mechanism?: string;
  pain_level?: number;
  symptoms?: string;
  complaints?: any[];
  review_of_systems?: any[];
}

interface ConversionPreview {
  region: string;
  diagnosis: string;
  indices: IndexType[];
  functionalLimitations: string[];
  priorTreatments: any[];
}

interface IntakeToEpisodeConverterProps {
  intakeForm: IntakeForm;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function IntakeToEpisodeConverter({ intakeForm, open, onClose, onSuccess }: IntakeToEpisodeConverterProps) {
  const navigate = useNavigate();
  const [converting, setConverting] = useState(false);
  const [preview, setPreview] = useState<ConversionPreview | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>("");
  const [hasDuplicate, setHasDuplicate] = useState(false);
  const [duplicateEpisodes, setDuplicateEpisodes] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);
  const [showDuplicateDetails, setShowDuplicateDetails] = useState(false);
  const [showDataSummary, setShowDataSummary] = useState(false);
  const [showBaselineAssessment, setShowBaselineAssessment] = useState(false);
  const [createdEpisodeId, setCreatedEpisodeId] = useState<string>("");
  const [baselineScores, setBaselineScores] = useState<Record<string, number>>({});
  const [selectedIndices, setSelectedIndices] = useState<IndexType[]>([]);

  // Extract region from complaints
  const inferRegionFromComplaints = (): string => {
    if (!intakeForm.complaints || intakeForm.complaints.length === 0) {
      return "";
    }

    const primaryComplaint = intakeForm.complaints.find((c: any) => c.isPrimary);
    const complaint = primaryComplaint || intakeForm.complaints[0];

    // Map complaint categories to regions
    const categoryToRegion: Record<string, string> = {
      "Neck/Cervical": "Cervical",
      "Upper Back/Thoracic": "Thoracic",
      "Lower Back/Lumbar": "Lumbar",
      "Shoulder": "Shoulder",
      "Elbow": "Elbow",
      "Wrist/Hand": "Wrist/Hand",
      "Hip": "Hip",
      "Knee": "Knee",
      "Ankle/Foot": "Ankle/Foot"
    };

    return categoryToRegion[complaint.category] || "";
  };

  // Determine appropriate outcome indices based on region
  const getIndicesForRegion = (region: string): IndexType[] => {
    const indices = PPC_CONFIG.regionToIndices(region);
    return indices as IndexType[];
  };

  // Extract functional limitations from complaints
  const extractFunctionalLimitations = (): string[] => {
    if (!intakeForm.complaints || intakeForm.complaints.length === 0) {
      return [];
    }

    const limitations: string[] = [];
    intakeForm.complaints.forEach((complaint: any) => {
      if (complaint.activities && Array.isArray(complaint.activities)) {
        limitations.push(...complaint.activities);
      }
    });

    return [...new Set(limitations)]; // Remove duplicates
  };

  // Extract prior treatments from complaints
  const extractPriorTreatments = (): any[] => {
    if (!intakeForm.complaints || intakeForm.complaints.length === 0) {
      return [];
    }

    const treatments: any[] = [];
    intakeForm.complaints.forEach((complaint: any) => {
      if (complaint.treatments && Array.isArray(complaint.treatments)) {
        complaint.treatments.forEach((treatment: string) => {
          treatments.push({
            type: treatment,
            effective: null // Unknown from intake
          });
        });
      }
    });

    return treatments;
  };

  // Initialize preview and check for duplicates when dialog opens
  useEffect(() => {
    if (open) {
      const region = inferRegionFromComplaints();
      const indices = getIndicesForRegion(region);
      setSelectedRegion(region);
      setSelectedIndices(indices);
      setSelectedDiagnosis("");
      setHasDuplicate(false);
      setPreview({
        region,
        diagnosis: intakeForm.chief_complaint,
        indices,
        functionalLimitations: extractFunctionalLimitations(),
        priorTreatments: extractPriorTreatments()
      });

      // Check for duplicate patients
      checkForDuplicates();
    } else {
      // Reset state when dialog closes
      setPreview(null);
      setSelectedRegion("");
      setSelectedIndices([]);
      setSelectedDiagnosis("");
      setHasDuplicate(false);
      setDuplicateEpisodes([]);
      setConfirmDuplicate(false);
      setShowDuplicateDetails(false);
      setShowDataSummary(false);
    }
  }, [open]);

  // Keyboard shortcuts for episode navigation
  useEffect(() => {
    if (!open || !showDuplicateDetails || duplicateEpisodes.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd + number (1-9)
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        
        if (index < duplicateEpisodes.length) {
          const episode = duplicateEpisodes[index];
          window.open(`/episode-summary?id=${episode.id}`, '_blank');
          toast.success(`Opening episode ${episode.id} in new tab`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, showDuplicateDetails, duplicateEpisodes]);

  const checkForDuplicates = async () => {
    try {
      const { data: episodes, error } = await supabase
        .from("episodes")
        .select("id, region, diagnosis, date_of_service, discharge_date, clinician")
        .ilike("patient_name", intakeForm.patient_name)
        .eq("date_of_birth", intakeForm.date_of_birth);

      if (error) throw error;
      
      if (episodes && episodes.length > 0) {
        setHasDuplicate(true);
        setDuplicateEpisodes(episodes);
        
        // Check if there are any active (non-discharged) episodes
        const activeEpisodes = episodes.filter(ep => !ep.discharge_date);
        if (activeEpisodes.length > 0) {
          toast.warning(
            `Warning: ${activeEpisodes.length} active episode${activeEpisodes.length > 1 ? 's' : ''} found for this patient`,
            { duration: 5000 }
          );
        }
      }
    } catch (error) {
      console.error("Error checking for duplicates:", error);
    }
  };

  const handleConvert = async () => {
    if (!selectedRegion) {
      toast.error("Please select a body region");
      return;
    }

    // Check for duplicate episodes with same date of service
    if (hasDuplicate && !confirmDuplicate) {
      const todayDate = new Date().toISOString().split('T')[0];
      const duplicateToday = duplicateEpisodes.some(
        ep => ep.date_of_service === todayDate && !ep.discharge_date
      );
      
      if (duplicateToday) {
        toast.error(
          "An episode already exists for this patient with today's date. Please review existing episodes before creating a new one.",
          { duration: 6000 }
        );
        return;
      }

      // Check for any active episodes
      const activeEpisodes = duplicateEpisodes.filter(ep => !ep.discharge_date);
      if (activeEpisodes.length > 0) {
        toast.warning(
          `This patient has ${activeEpisodes.length} active episode${activeEpisodes.length > 1 ? 's' : ''}. Please confirm you want to create a new episode.`,
          { duration: 5000 }
        );
        setConfirmDuplicate(true);
        return;
      }
    }

    // Navigate to NewEpisode page with intake data pre-filled
    // This ensures the clinician completes the full episode form
    const intakeDataForNewEpisode = {
      intake_form_id: intakeForm.id,
      patient_name: intakeForm.patient_name,
      date_of_birth: intakeForm.date_of_birth,
      phone: intakeForm.phone,
      email: intakeForm.email,
      insurance_provider: intakeForm.insurance_provider,
      insurance_id: intakeForm.insurance_id,
      emergency_contact_name: intakeForm.emergency_contact_name,
      emergency_contact_phone: intakeForm.emergency_contact_phone,
      primary_care_physician: intakeForm.primary_care_physician,
      referring_physician: intakeForm.referring_physician,
      current_medications: intakeForm.current_medications,
      allergies: intakeForm.allergies,
      medical_history: intakeForm.medical_history,
      surgery_history: intakeForm.surgery_history,
      hospitalization_history: intakeForm.hospitalization_history,
      specialist_seen: intakeForm.specialist_seen,
      chief_complaint: intakeForm.chief_complaint,
      injury_date: intakeForm.injury_date,
      injury_mechanism: intakeForm.injury_mechanism,
      pain_level: intakeForm.pain_level,
      symptoms: intakeForm.symptoms,
      complaints: intakeForm.complaints,
      review_of_systems: intakeForm.review_of_systems,
      // Pre-selected region from the dialog
      selected_region: selectedRegion,
      selected_diagnosis: selectedDiagnosis,
      selected_indices: selectedIndices,
      functional_limitations: preview?.functionalLimitations || [],
      prior_treatments: preview?.priorTreatments || [],
    };

    // Store intake data for NewEpisode to pick up
    sessionStorage.setItem("intakeData", JSON.stringify(intakeDataForNewEpisode));

    toast.success("Opening episode form with intake data...");
    onClose();
    
    // Navigate to NewEpisode page
    navigate("/new-episode");
  };

  const handleConvertDirect = async () => {
    // This is the original direct conversion for backward compatibility or quick conversion
    setConverting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get user's clinic_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id, clinician_name, full_name, npi")
        .eq("id", user.id)
        .single();

      // Build comprehensive medical history from intake form
      const medicalHistoryParts: string[] = [];
      
      if (intakeForm.medical_history) {
        medicalHistoryParts.push(`**Medical History:** ${intakeForm.medical_history}`);
      }
      if (intakeForm.allergies) {
        medicalHistoryParts.push(`**Allergies:** ${intakeForm.allergies}`);
      }
      if (intakeForm.surgery_history) {
        medicalHistoryParts.push(`**Surgery History:** ${intakeForm.surgery_history}`);
      }
      if (intakeForm.hospitalization_history) {
        medicalHistoryParts.push(`**Hospitalization History:** ${intakeForm.hospitalization_history}`);
      }
      if (intakeForm.specialist_seen) {
        medicalHistoryParts.push(`**Specialists Seen:** ${intakeForm.specialist_seen}`);
      }
      if (intakeForm.primary_care_physician) {
        medicalHistoryParts.push(`**Primary Care Physician:** ${intakeForm.primary_care_physician}`);
      }
      
      const comprehensiveMedicalHistory = medicalHistoryParts.length > 0 
        ? medicalHistoryParts.join('\n\n') 
        : "";

      // Build comprehensive injury mechanism including symptoms
      const injuryDetails: string[] = [];
      if (intakeForm.injury_mechanism) {
        injuryDetails.push(intakeForm.injury_mechanism);
      }
      if (intakeForm.symptoms) {
        injuryDetails.push(`Symptoms: ${intakeForm.symptoms}`);
      }
      const comprehensiveInjuryMechanism = injuryDetails.length > 0 
        ? injuryDetails.join(' | ') 
        : "";

      // Create episode
      const newEpisodeData = {
        patient_name: intakeForm.patient_name,
        date_of_birth: intakeForm.date_of_birth,
        region: selectedRegion,
        diagnosis: selectedDiagnosis || intakeForm.chief_complaint,
        date_of_service: new Date().toISOString().split('T')[0],
        clinician: profile?.clinician_name || profile?.full_name || "",
        npi: profile?.npi || "",
        injury_date: intakeForm.injury_date || null,
        injury_mechanism: comprehensiveInjuryMechanism,
        referring_physician: intakeForm.referring_physician || "",
        insurance: intakeForm.insurance_provider || "",
        emergency_contact: intakeForm.emergency_contact_name || "",
        emergency_phone: intakeForm.emergency_contact_phone || "",
        medications: intakeForm.current_medications || "",
        medical_history: comprehensiveMedicalHistory,
        functional_limitations: preview?.functionalLimitations || [],
        prior_treatments: preview?.priorTreatments || [],
        pain_level: intakeForm.pain_level?.toString() || "",
        user_id: user.id,
        clinic_id: profile?.clinic_id || null,
        complaint_priority: 1, // This is for the primary complaint
        source_intake_form_id: intakeForm.id
      };

      const createdEpisode = await createEpisode(newEpisodeData);
      const episodeId = createdEpisode.id;

      // Store episode ID for baseline assessment
      setCreatedEpisodeId(episodeId);

      // Update intake form with episode link
      const { error: updateError } = await supabase
        .from("intake_forms")
        .update({
          status: "converted",
          reviewed_at: new Date().toISOString(),
          converted_to_episode_id: episodeId,
          reviewed_by: user.id
        })
        .eq("id", intakeForm.id);

      if (updateError) throw updateError;

      // Create pending episodes for remaining complaints (if any)
      if (intakeForm.complaints && Array.isArray(intakeForm.complaints)) {
        const sortedComplaints = [...intakeForm.complaints]
          .filter(c => c.priority && c.priority > 1) // Get complaints after the primary
          .sort((a, b) => (a.priority || 999) - (b.priority || 999));

        if (sortedComplaints.length > 0) {
          console.log(`Creating ${sortedComplaints.length} pending episodes for remaining complaints`);
          
          for (const complaint of sortedComplaints) {
            try {
              const { error: pendingError } = await supabase
                .from('pending_episodes')
                .insert({
                  intake_form_id: intakeForm.id,
                  complaint_priority: complaint.priority,
                  complaint_category: complaint.category,
                  complaint_text: complaint.text,
                  patient_name: intakeForm.patient_name,
                  date_of_birth: intakeForm.date_of_birth,
                  status: 'pending',
                  previous_episode_id: episodeId,
                  user_id: user.id,
                  clinic_id: profile?.clinic_id || null
                });

              if (pendingError) {
                console.error('Error creating pending episode:', pendingError);
              }
            } catch (err) {
              console.error('Failed to create pending episode:', err);
            }
          }

          toast.success(
            `Episode created! ${sortedComplaints.length} additional complaint${sortedComplaints.length > 1 ? 's' : ''} queued for future treatment.`,
            { duration: 5000 }
          );
        }
      }

      // Send notification to patient with episode confirmation
      try {
        // Calculate next business day for suggested first appointment
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Skip weekends
        while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
          tomorrow.setDate(tomorrow.getDate() + 1);
        }
        
        const appointmentDate = tomorrow.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        await supabase.functions.invoke('send-intake-notification', {
          body: {
            episodeId,
            patientName: intakeForm.patient_name,
            patientEmail: intakeForm.email,
            patientPhone: intakeForm.phone,
            clinicianName: profile?.clinician_name || profile?.full_name || "Your Clinician",
            appointmentDate: appointmentDate,
            appointmentTime: "Please call to schedule",
            userId: user.id,
            clinicId: profile?.clinic_id || null,
          }
        });
        console.log('Episode confirmation notification sent to patient');
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // Don't fail the whole conversion if notification fails
      }

      // Prompt for baseline assessment instead of immediately closing
      setConverting(false);
      setShowBaselineAssessment(true);
      toast.success("Episode created! Please complete baseline outcome assessments.");
    } catch (error: any) {
      console.error("Conversion error:", error);
      toast.error(`Failed to create episode: ${error.message}`);
      setConverting(false);
    }
  };

  const handleBaselineScoreChange = (index: string, score: number) => {
    setBaselineScores(prev => ({ ...prev, [index]: score }));
  };

  const handleSaveBaseline = async () => {
    try {
      // Validate all required scores are entered
      const requiredIndices = preview?.indices || [];
      const missingScores = requiredIndices.filter(idx => baselineScores[idx] === undefined);
      
      if (missingScores.length > 0) {
        toast.error(`Please complete all baseline assessments: ${missingScores.join(", ")}`);
        return;
      }

      setConverting(true);

      // Save baseline scores to database
      for (const [indexType, score] of Object.entries(baselineScores)) {
        await saveOutcomeScore(createdEpisodeId, indexType, "baseline", score);
      }

      toast.success("Baseline assessments saved successfully!");
      
      onSuccess();
      onClose();

      // Navigate to the new episode
      setTimeout(() => {
        navigate(`/episode-summary?id=${createdEpisodeId}`);
      }, 500);
    } catch (error: any) {
      console.error("Failed to save baseline scores:", error);
      toast.error(`Failed to save baseline assessments: ${error.message}`);
    } finally {
      setConverting(false);
    }
  };

  const handleSkipBaseline = () => {
    toast.info("You can add baseline assessments later from the episode summary page");
    onSuccess();
    onClose();
    
    setTimeout(() => {
      navigate(`/episode-summary?id=${createdEpisodeId}`);
    }, 500);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Convert to Episode</DialogTitle>
            <DialogDescription>
              Review and confirm the episode details extracted from the intake form
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
            <div className="space-y-4 py-4">
              {/* Duplicate Patient Alert */}
              {hasDuplicate && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="font-semibold block mb-1">
                            Warning: This patient has {duplicateEpisodes.length} existing episode{duplicateEpisodes.length > 1 ? 's' : ''}
                          </span>
                          <span className="text-sm">
                            {duplicateEpisodes.filter(ep => !ep.discharge_date).length > 0 && (
                              <>
                                {duplicateEpisodes.filter(ep => !ep.discharge_date).length} active episode{duplicateEpisodes.filter(ep => !ep.discharge_date).length > 1 ? 's' : ''} found.
                                {confirmDuplicate && (
                                  <span className="block mt-1 text-amber-200 font-medium">
                                    Click "Create Episode" again to confirm creation of a new episode.
                                  </span>
                                )}
                              </>
                            )}
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowHistory(true)}
                          className="ml-4 shrink-0"
                        >
                          View Full History
                        </Button>
                      </div>

                      {/* Expandable Episode Details */}
                      <Collapsible
                        open={showDuplicateDetails}
                        onOpenChange={setShowDuplicateDetails}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between text-sm h-8 hover:bg-destructive/20"
                          >
                            <span>{showDuplicateDetails ? 'Hide' : 'Show'} Episode Details {duplicateEpisodes.length > 0 && duplicateEpisodes.length <= 9 && '(Ctrl/Cmd + 1-9 to navigate)'}</span>
                            {showDuplicateDetails ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="space-y-2 max-h-48 overflow-y-auto rounded-md bg-destructive/10 p-3">
                            {duplicateEpisodes.map((episode, idx) => (
                              <div
                                key={episode.id}
                                onClick={() => {
                                  // Open episode in new window to avoid losing conversion dialog
                                  window.open(`/episode-summary?id=${episode.id}`, '_blank');
                                }}
                                className="rounded-md bg-background/80 p-3 text-foreground space-y-1.5 cursor-pointer hover:bg-background hover:ring-2 hover:ring-primary/50 transition-all relative"
                              >
                                {/* Keyboard Shortcut Badge */}
                                {idx < 9 && (
                                  <div className="absolute top-2 right-2">
                                    <Badge variant="outline" className="text-xs bg-background/90 font-mono">
                                      {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + {idx + 1}
                                    </Badge>
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between pr-16">
                                  <span className="font-medium text-sm hover:text-primary transition-colors">
                                    {episode.id}
                                  </span>
                                  {!episode.discharge_date ? (
                                    <Badge variant="default" className="text-xs">Active</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">Discharged</Badge>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>DOS: {episode.date_of_service ? format(new Date(episode.date_of_service), 'MMM d, yyyy') : 'N/A'}</span>
                                  </div>
                                  {episode.discharge_date && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>D/C: {format(new Date(episode.discharge_date), 'MMM d, yyyy')}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs space-y-0.5">
                                  {episode.region && (
                                    <div><span className="text-muted-foreground">Region:</span> {episode.region}</div>
                                  )}
                                  {episode.diagnosis && (
                                    <div><span className="text-muted-foreground">Diagnosis:</span> {episode.diagnosis}</div>
                                  )}
                                  {episode.clinician && (
                                    <div><span className="text-muted-foreground">Clinician:</span> {episode.clinician}</div>
                                  )}
                                </div>
                                <div className="text-xs text-primary/80 font-medium pt-1 flex items-center gap-1">
                                  <Activity className="h-3 w-3" />
                                  Click to view episode details
                                </div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Data Transfer Summary Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">View Data Transfer Details</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDataSummary(!showDataSummary)}
                >
                  {showDataSummary ? "Hide" : "Show"} Summary
                </Button>
              </div>

              {/* Data Transfer Summary */}
              {showDataSummary && (
                <DataTransferSummary
                  intakeData={intakeForm}
                  episodeData={preview}
                />
              )}

              {/* Patient Info */}
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-semibold mb-2">Patient Information</h3>
                <div className="space-y-1 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> {intakeForm.patient_name}</div>
                  <div><span className="text-muted-foreground">DOB:</span> {new Date(intakeForm.date_of_birth).toLocaleDateString()}</div>
                </div>
              </div>

            {/* Region Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="region">Body Region *</Label>
                {selectedRegion && preview && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Auto-selected from complaint
                  </Badge>
                )}
              </div>
              <Select value={selectedRegion} onValueChange={(value) => {
                setSelectedRegion(value);
                const indices = getIndicesForRegion(value);
                setSelectedIndices(indices);
                if (preview) {
                  setPreview({
                    ...preview,
                    region: value,
                    indices
                  });
                }
              }}>
                <SelectTrigger id="region" className={selectedRegion ? "border-success/50 bg-success/5" : ""}>
                  <SelectValue placeholder="Select body region" />
                </SelectTrigger>
                <SelectContent>
                  {PPC_CONFIG.regionEnum.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRegion && intakeForm.complaints && intakeForm.complaints.length > 0 && (
                <p className="text-xs text-success flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Based on primary complaint: {(intakeForm.complaints.find((c: any) => c.isPrimary) || intakeForm.complaints[0]).category}
                </p>
              )}
              {!selectedRegion && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Please select a body region to continue
                </p>
              )}
            </div>

            {/* Diagnosis */}
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis / Chief Complaint</Label>
              <div className="rounded-lg bg-muted p-3 text-sm">
                {intakeForm.chief_complaint}
              </div>
            </div>

            {/* Smart Outcome Measure Recommendations */}
            {selectedRegion && (
              <div className="space-y-3">
                <OutcomeToolRecommendations 
                  recommendations={getOutcomeToolRecommendations(
                    selectedRegion,
                    selectedDiagnosis || intakeForm.chief_complaint
                  )}
                  selectedTools={selectedIndices}
                />
                
                {/* Selectable Outcome Measures */}
                <div className="space-y-2 rounded-lg border p-4 bg-muted/30">
                  <Label className="text-sm font-medium">Select Outcome Measures</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Uncheck any measures you don't want to use for this episode
                  </p>
                  <div className="space-y-2">
                    {preview?.indices.map((index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`index-${index}`}
                          checked={selectedIndices.includes(index)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedIndices([...selectedIndices, index]);
                            } else {
                              setSelectedIndices(selectedIndices.filter(i => i !== index));
                            }
                          }}
                        />
                        <label
                          htmlFor={`index-${index}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {index === "NDI" && "Neck Disability Index (NDI)"}
                          {index === "ODI" && "Oswestry Disability Index (ODI)"}
                          {index === "QuickDASH" && "QuickDASH (Upper Extremity)"}
                          {index === "LEFS" && "Lower Extremity Functional Scale (LEFS)"}
                          {index === "RPQ" && "Rivermead Post-Concussion Questionnaire (RPQ)"}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}


          {/* Functional Limitations */}
          {preview && preview.functionalLimitations.length > 0 && (
            <div className="space-y-2">
              <Label>Functional Limitations</Label>
              <div className="flex flex-wrap gap-2">
                {preview.functionalLimitations.map((limitation, idx) => (
                  <Badge key={idx} variant="outline">{limitation}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Prior Treatments */}
          {preview && preview.priorTreatments.length > 0 && (
            <div className="space-y-2">
              <Label>Prior Treatments</Label>
              <div className="flex flex-wrap gap-2">
                {preview.priorTreatments.map((treatment, idx) => (
                  <Badge key={idx} variant="outline">{treatment.type}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Pain Level */}
          {intakeForm.pain_level && (
            <div className="space-y-2">
              <Label>Baseline Pain Level</Label>
              <div className="rounded-lg bg-muted p-3 text-sm">
                {intakeForm.pain_level}/10
              </div>
            </div>
          )}
        </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={converting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConvert} 
            disabled={converting || !selectedRegion}
            variant={confirmDuplicate ? "destructive" : "default"}
          >
            {converting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {confirmDuplicate ? "Confirm & Create Episode" : "Create Episode"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Baseline Assessment Dialog */}
    <Dialog open={showBaselineAssessment} onOpenChange={(open) => !converting && setShowBaselineAssessment(open)}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Baseline Outcome Assessments</DialogTitle>
          <DialogDescription>
            Complete the following outcome measures to establish baseline scores for {intakeForm.patient_name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="space-y-6 py-4">
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                These baseline assessments are critical for measuring patient progress and calculating improvement at discharge.
                All selected outcome measures must be completed before proceeding.
              </AlertDescription>
            </Alert>

            {preview?.indices.includes("NDI") && (
              <NDIForm 
                onScoreChange={(score) => handleBaselineScoreChange("NDI", score)}
                initialScore={baselineScores["NDI"]}
              />
            )}

            {preview?.indices.includes("ODI") && (
              <ODIForm 
                onScoreChange={(score) => handleBaselineScoreChange("ODI", score)}
                initialScore={baselineScores["ODI"]}
              />
            )}

            {preview?.indices.includes("QuickDASH") && (
              <QuickDASHForm 
                onScoreChange={(score) => handleBaselineScoreChange("QuickDASH", score)}
                initialScore={baselineScores["QuickDASH"]}
              />
            )}

            {preview?.indices.includes("LEFS") && (
              <LEFSForm 
                onScoreChange={(score) => handleBaselineScoreChange("LEFS", score)}
                initialScore={baselineScores["LEFS"]}
              />
            )}

            {preview?.indices.includes("RPQ") && (
              <RPQForm 
                onScoreChange={(score) => handleBaselineScoreChange("RPQ", score)}
                initialScore={baselineScores["RPQ"]}
              />
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSkipBaseline}
            disabled={converting}
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleSaveBaseline}
            disabled={converting}
            className="gap-2"
          >
            {converting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Patient History Dialog */}
    <PatientHistoryDialog
      open={showHistory}
      onClose={() => setShowHistory(false)}
      patientName={intakeForm.patient_name}
      dateOfBirth={intakeForm.date_of_birth}
    />
    </>
  );
}
