import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { createEpisode } from "@/lib/dbOperations";
import { PPC_CONFIG } from "@/lib/ppcConfig";
import { ValidatedIntake, IntakeBulkValidationResult } from "@/lib/bulkIntakeValidation";
import { PatientHistoryDialog } from "@/components/PatientHistoryDialog";
import { ValidationSummaryPanel } from "@/components/ValidationSummaryPanel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface BulkIntakeConverterProps {
  intakes: any[];
  validationResult: IntakeBulkValidationResult;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkIntakeConverter({ 
  intakes, 
  validationResult, 
  open, 
  onClose, 
  onSuccess 
}: BulkIntakeConverterProps) {
  const navigate = useNavigate();
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProcessing, setCurrentProcessing] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{name: string; dob: string} | null>(null);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleToggleExclude = (intakeId: string) => {
    setExcludedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(intakeId)) {
        newSet.delete(intakeId);
      } else {
        newSet.add(intakeId);
      }
      return newSet;
    });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const inferRegionFromComplaints = (intake: any): string => {
    if (!intake.complaints || intake.complaints.length === 0) {
      return "Lumbar"; // Default fallback
    }

    const primaryComplaint = intake.complaints.find((c: any) => c.isPrimary);
    const complaint = primaryComplaint || intake.complaints[0];

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

    return categoryToRegion[complaint.category] || "Lumbar";
  };

  const extractFunctionalLimitations = (intake: any): string[] => {
    if (!intake.complaints || intake.complaints.length === 0) {
      return [];
    }

    const limitations: string[] = [];
    intake.complaints.forEach((complaint: any) => {
      if (complaint.activities && Array.isArray(complaint.activities)) {
        limitations.push(...complaint.activities);
      }
    });

    return [...new Set(limitations)];
  };

  const extractPriorTreatments = (intake: any): any[] => {
    if (!intake.complaints || intake.complaints.length === 0) {
      return [];
    }

    const treatments: any[] = [];
    intake.complaints.forEach((complaint: any) => {
      if (complaint.treatments && Array.isArray(complaint.treatments)) {
        complaint.treatments.forEach((treatment: string) => {
          treatments.push({
            type: treatment,
            effective: null
          });
        });
      }
    });

    return treatments;
  };

  const handleBulkConvert = async () => {
    setConverting(true);
    setProgress(0);
    
    const validIntakes = validationResult.validatedIntakes.filter(
      v => v.canConvert && !excludedIds.has(v.id)
    );
    const intakesToConvert = intakes.filter(intake => 
      validIntakes.some(v => v.id === intake.id)
    );

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id, clinician_name, full_name, npi")
        .eq("id", user.id)
        .single();

      for (let i = 0; i < intakesToConvert.length; i++) {
        const intake = intakesToConvert[i];
        setCurrentProcessing(intake.patient_name);
        
        try {
          const region = inferRegionFromComplaints(intake);
          
          const newEpisodeData = {
            patient_name: intake.patient_name,
            date_of_birth: intake.date_of_birth,
            region,
            diagnosis: intake.chief_complaint,
            date_of_service: new Date().toISOString().split('T')[0],
            clinician: profile?.clinician_name || profile?.full_name || "",
            npi: profile?.npi || "",
            injury_date: intake.injury_date || null,
            injury_mechanism: intake.injury_mechanism || "",
            referring_physician: intake.referring_physician || "",
            insurance: intake.insurance_provider || "",
            emergency_contact: intake.emergency_contact_name || "",
            emergency_phone: intake.emergency_contact_phone || "",
            medications: intake.current_medications || "",
            medical_history: intake.medical_history || "",
            functional_limitations: extractFunctionalLimitations(intake),
            prior_treatments: extractPriorTreatments(intake),
            pain_level: intake.pain_level?.toString() || "",
            user_id: user.id,
            clinic_id: profile?.clinic_id || null
          };

          const createdEpisode = await createEpisode(newEpisodeData);

          // Update intake form status
          const { error: updateError } = await supabase
            .from("intake_forms")
            .update({
              status: "converted",
              reviewed_at: new Date().toISOString(),
              converted_to_episode_id: createdEpisode.id,
              reviewed_by: user.id
            })
            .eq("id", intake.id);

          if (updateError) throw updateError;

          // Send notification to patient
          try {
            await supabase.functions.invoke('send-intake-notification', {
              body: {
                episodeId: createdEpisode.id,
                patientName: intake.patient_name,
                patientEmail: intake.email,
                patientPhone: intake.phone,
                clinicianName: profile?.clinician_name || profile?.full_name || "Your Clinician",
                userId: user.id,
                clinicId: profile?.clinic_id || null,
              }
            });
          } catch (notifError) {
            console.error('Failed to send notification:', notifError);
            // Don't fail the conversion if notification fails
          }

          successCount++;
        } catch (error: any) {
          failedCount++;
          errors.push(`${intake.patient_name}: ${error.message}`);
          console.error(`Failed to convert intake ${intake.id}:`, error);
        }

        setProgress(((i + 1) / intakesToConvert.length) * 100);
      }

      setResults({ success: successCount, failed: failedCount, errors });

      if (successCount > 0) {
        toast.success(
          `Successfully converted ${successCount} intake${successCount !== 1 ? 's' : ''} to episodes`
        );
      }

      if (failedCount > 0) {
        toast.error(
          `Failed to convert ${failedCount} intake${failedCount !== 1 ? 's' : ''}`
        );
      }

      onSuccess();
      
      // Close dialog after showing results briefly
      if (failedCount === 0) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error: any) {
      toast.error(`Bulk conversion failed: ${error.message}`);
    } finally {
      setConverting(false);
      setCurrentProcessing("");
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Bulk Intake Conversion</DialogTitle>
          <DialogDescription>
            Review validation results before converting {validationResult.totalSelected} intake form{validationResult.totalSelected !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-4 py-4">
            {/* Show ValidationSummaryPanel before conversion starts */}
            {!converting && !results && (
              <ValidationSummaryPanel 
                validationResult={validationResult}
                excludedIds={excludedIds}
                onToggleExclude={handleToggleExclude}
              />
            )}

            {/* Conversion Progress */}
            {converting && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Converting intakes...</span>
                  <span className="text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                {currentProcessing && (
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Processing: {currentProcessing}
                  </div>
                )}
              </div>
            )}

            {/* Results Summary */}
            {results && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <h3 className="font-semibold">Conversion Results</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{results.success} successfully converted</span>
                  </div>
                  {results.failed > 0 && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <XCircle className="h-4 w-4" />
                      <span>{results.failed} failed</span>
                    </div>
                  )}
                </div>
                {results.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium">Errors:</p>
                    {results.errors.map((error, idx) => (
                      <p key={idx} className="text-xs text-destructive">{error}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Show ValidationSummaryPanel after conversion completes with results */}
            {results && (
              <ValidationSummaryPanel 
                validationResult={validationResult}
                excludedIds={excludedIds}
              />
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={converting}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkConvert} 
            disabled={converting || validationResult.validForConversion === 0 || excludedIds.size >= validationResult.validForConversion}
          >
            {converting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Convert {validationResult.validForConversion - excludedIds.size} Intake{(validationResult.validForConversion - excludedIds.size) !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Patient History Dialog */}
    {selectedPatient && (
      <PatientHistoryDialog
        open={showHistory}
        onClose={() => {
          setShowHistory(false);
          setSelectedPatient(null);
        }}
        patientName={selectedPatient.name}
        dateOfBirth={selectedPatient.dob}
      />
    )}
    </>
  );
}
