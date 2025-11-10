import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { createEpisode } from "@/lib/dbOperations";
import { PPC_CONFIG } from "@/lib/ppcConfig";
import { ValidatedIntake, IntakeBulkValidationResult } from "@/lib/bulkIntakeValidation";
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
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

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
    
    const validIntakes = validationResult.validatedIntakes.filter(v => v.canConvert);
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
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">Ready</span>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {validationResult.validForConversion}
                </div>
              </div>

              <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Needs Review</span>
                </div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {validationResult.requiresReview}
                </div>
              </div>

              <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-900 dark:text-red-100">Cannot Convert</span>
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {validationResult.totalSelected - validationResult.validForConversion}
                </div>
              </div>
            </div>

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

            {/* Individual Intake Validation Results */}
            <div className="space-y-3">
              <h3 className="font-semibold">Validation Details</h3>
              {validationResult.validatedIntakes.map((validated) => (
                <div 
                  key={validated.id} 
                  className={`rounded-lg border p-4 ${
                    validated.canConvert 
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950' 
                      : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{validated.patient_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {validated.access_code}
                        </Badge>
                      </div>
                    </div>
                    {validated.canConvert ? (
                      <Badge className="bg-green-600 dark:bg-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Ready
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Cannot Convert
                      </Badge>
                    )}
                  </div>

                  {validated.issues.length > 0 && (
                    <div className="space-y-1 mt-3">
                      {validated.issues.map((issue, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1 flex items-center justify-between">
                            <span className={
                              issue.severity === "error" 
                                ? "text-red-700 dark:text-red-300" 
                                : issue.severity === "warning"
                                ? "text-amber-700 dark:text-amber-300"
                                : "text-blue-700 dark:text-blue-300"
                            }>
                              {issue.message}
                            </span>
                            {validated.hasExistingEpisode && issue.field === "duplicate" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={() => {
                                  const intake = intakes.find(i => i.id === validated.id);
                                  if (intake) {
                                    setSelectedPatient({
                                      name: intake.patient_name,
                                      dob: intake.date_of_birth
                                    });
                                    setShowHistory(true);
                                  }
                                }}
                              >
                                View History
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={converting}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkConvert} 
            disabled={converting || validationResult.validForConversion === 0}
          >
            {converting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Convert {validationResult.validForConversion} Intake{validationResult.validForConversion !== 1 ? 's' : ''}
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
