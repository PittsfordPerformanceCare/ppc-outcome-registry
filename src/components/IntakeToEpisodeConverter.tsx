import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { createEpisode, saveOutcomeScore } from "@/lib/dbOperations";
import { PPC_CONFIG, IndexType } from "@/lib/ppcConfig";
import { getOutcomeToolRecommendations, getPrimaryOutcomeTool } from "@/lib/outcomeToolRecommendations";
import { OutcomeToolRecommendations } from "@/components/OutcomeToolRecommendations";
import { PatientHistoryDialog } from "@/components/PatientHistoryDialog";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [showHistory, setShowHistory] = useState(false);

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
      setSelectedRegion(region);
      setSelectedDiagnosis("");
      setHasDuplicate(false);
      setPreview({
        region,
        diagnosis: intakeForm.chief_complaint,
        indices: getIndicesForRegion(region),
        functionalLimitations: extractFunctionalLimitations(),
        priorTreatments: extractPriorTreatments()
      });

      // Check for duplicate patients
      checkForDuplicates();
    } else {
      // Reset state when dialog closes
      setPreview(null);
      setSelectedRegion("");
      setSelectedDiagnosis("");
      setHasDuplicate(false);
    }
  }, [open]);

  const checkForDuplicates = async () => {
    try {
      const { data: episodes, error } = await supabase
        .from("episodes")
        .select("id")
        .ilike("patient_name", intakeForm.patient_name)
        .eq("date_of_birth", intakeForm.date_of_birth)
        .limit(1);

      if (error) throw error;
      
      if (episodes && episodes.length > 0) {
        setHasDuplicate(true);
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
        injury_mechanism: intakeForm.injury_mechanism || "",
        referring_physician: intakeForm.referring_physician || "",
        insurance: intakeForm.insurance_provider || "",
        emergency_contact: intakeForm.emergency_contact_name || "",
        emergency_phone: intakeForm.emergency_contact_phone || "",
        medications: intakeForm.current_medications || "",
        medical_history: intakeForm.medical_history || "",
        functional_limitations: preview?.functionalLimitations || [],
        prior_treatments: preview?.priorTreatments || [],
        pain_level: intakeForm.pain_level?.toString() || "",
        user_id: user.id,
        clinic_id: profile?.clinic_id || null
      };

      const createdEpisode = await createEpisode(newEpisodeData);
      const episodeId = createdEpisode.id;

      // Save baseline pain score as outcome if available  
      if (intakeForm.pain_level && preview?.indices) {
        // Pain is tracked separately in episodes, not as an outcome score
        // Outcome scores are for NDI, ODI, QuickDASH, LEFS only
      }

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

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Episode created successfully!</span>
        </div>
      );

      onSuccess();
      onClose();

      // Navigate to the new episode
      setTimeout(() => {
        navigate(`/episode-summary?id=${episodeId}`);
      }, 500);
    } catch (error: any) {
      console.error("Conversion error:", error);
      toast.error(`Failed to create episode: ${error.message}`);
    } finally {
      setConverting(false);
    }
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
                  <AlertDescription className="flex items-center justify-between">
                    <span className="font-semibold">
                      Warning: This patient may already have episodes in the system
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowHistory(true)}
                      className="ml-4"
                    >
                      View History
                    </Button>
                  </AlertDescription>
                </Alert>
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
              <Label htmlFor="region">Body Region *</Label>
              <Select value={selectedRegion} onValueChange={(value) => {
                setSelectedRegion(value);
                if (preview) {
                  setPreview({
                    ...preview,
                    region: value,
                    indices: getIndicesForRegion(value)
                  });
                }
              }}>
                <SelectTrigger id="region">
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
              <div className="space-y-2">
                <OutcomeToolRecommendations 
                  recommendations={getOutcomeToolRecommendations(
                    selectedRegion,
                    selectedDiagnosis || intakeForm.chief_complaint
                  )}
                  selectedTools={preview?.indices || []}
                />
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
          <Button onClick={handleConvert} disabled={converting || !selectedRegion}>
            {converting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Create Episode
              </>
            )}
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
