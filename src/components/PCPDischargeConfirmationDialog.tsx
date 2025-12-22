import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2,
  Shield,
  Target,
  Activity,
  Send,
  XCircle,
  User,
} from "lucide-react";
import { usePCPDischargeSummary } from "@/hooks/usePCPDischargeSummary";
import { PCPDischargeSummary } from "./PCPDischargeSummary";
import { supabase } from "@/integrations/supabase/client";

interface PCPDischargeConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episodeId: string;
  taskId?: string;
  onConfirmed?: () => void;
}

export function PCPDischargeConfirmationDialog({
  open,
  onOpenChange,
  episodeId,
  taskId,
  onConfirmed,
}: PCPDischargeConfirmationDialogProps) {
  const {
    loading,
    draftSummary,
    outcomeIntegrityPassed,
    outcomeIntegrityIssues,
    pcpMissing,
    alreadySent,
    sendBlocked,
    sendBlockedReasons,
    errorCode,
    errorMessage,
    generateDraft,
    confirmAndSend,
    overrideOutcomeIntegrity,
  } = usePCPDischargeSummary();

  const [clinicSettings, setClinicSettings] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (open && episodeId) {
      generateDraft(episodeId);
      loadClinicSettings();
    }
  }, [open, episodeId, generateDraft]);

  const loadClinicSettings = async () => {
    const { data } = await supabase
      .from("clinic_settings")
      .select("*")
      .single();
    setClinicSettings(data);
  };

  const handleConfirm = async () => {
    if (!taskId || !draftSummary) return;
    
    setConfirming(true);
    const success = await confirmAndSend(episodeId, taskId);
    setConfirming(false);
    
    if (success) {
      onConfirmed?.();
      onOpenChange(false);
    }
  };

  const handleOverride = async () => {
    if (!taskId || !overrideReason.trim()) return;
    
    const success = await overrideOutcomeIntegrity(episodeId, taskId, overrideReason);
    if (success) {
      setShowOverrideForm(false);
      setOverrideReason("");
    }
  };

  const getCareTargetStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "improved":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "stable":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "referred":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Confirm Episode Discharge Summary
          </DialogTitle>
          <DialogDescription>
            Review and confirm the PCP discharge summary before delivery
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Generating summary...</span>
          </div>
        ) : errorCode ? (
          <div className="py-8">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Cannot Generate Summary</AlertTitle>
              <AlertDescription>
                {errorCode === "EPISODE_NOT_CLOSED" && (
                  <p>This episode must be closed before a PCP discharge summary can be generated. Please close the episode first.</p>
                )}
                {errorCode === "EPISODE_NOT_FOUND" && (
                  <p>The episode could not be found. Please try again.</p>
                )}
                {errorMessage && <p className="mt-2 text-sm">{errorMessage}</p>}
              </AlertDescription>
            </Alert>
          </div>
        ) : draftSummary ? (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 pr-4">
              {/* Outcome Integrity Status */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Outcome Integrity Check</h3>
                </div>
                
                {outcomeIntegrityPassed ? (
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800 dark:text-green-200">
                      Integrity Check Passed
                    </AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      All care targets have baseline and discharge outcomes recorded.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive" className="border-amber-200 bg-amber-50 dark:bg-amber-950">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800 dark:text-amber-200">
                      Outcome Integrity Issues Detected
                    </AlertTitle>
                    <AlertDescription className="text-amber-700 dark:text-amber-300">
                      <ul className="list-disc pl-4 mt-2 space-y-1">
                        {outcomeIntegrityIssues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                      {!showOverrideForm && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => setShowOverrideForm(true)}
                        >
                          Override with Reason
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {showOverrideForm && (
                  <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
                    <Label htmlFor="overrideReason">Override Reason (Required)</Label>
                    <Textarea
                      id="overrideReason"
                      placeholder="Explain why outcome data is incomplete and why summary should proceed..."
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleOverride}
                        disabled={!overrideReason.trim()}
                      >
                        Confirm Override
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowOverrideForm(false);
                          setOverrideReason("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Send Blocked Alerts (Rule 2 & Rule 6) */}
              {sendBlocked && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    {pcpMissing && (
                      <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950">
                        <User className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-red-800 dark:text-red-200">
                          PCP/Referring Physician Required
                        </AlertTitle>
                        <AlertDescription className="text-red-700 dark:text-red-300">
                          No referring physician is on file for this episode. Add a PCP to the episode before sending the discharge summary.
                        </AlertDescription>
                      </Alert>
                    )}
                    {alreadySent && (
                      <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-red-800 dark:text-red-200">
                          Summary Already Sent
                        </AlertTitle>
                        <AlertDescription className="text-red-700 dark:text-red-300">
                          A PCP discharge summary has already been sent for this episode. Duplicate sending is not permitted.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </>
              )}

              <Separator />

              {/* Care Targets Summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Care Targets Addressed</h3>
                </div>
                
                <div className="grid gap-2">
                  {draftSummary.careTargets.map((target, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg bg-card"
                    >
                      <div>
                        <p className="font-medium">{target.name}</p>
                        {target.outcomeMeasure && (
                          <p className="text-sm text-muted-foreground">
                            {target.outcomeMeasure}: {target.baselineScore ?? "—"} → {target.dischargeScore ?? "—"}
                          </p>
                        )}
                      </div>
                      <Badge className={getCareTargetStatusColor(target.status)}>
                        {target.status.charAt(0).toUpperCase() + target.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Clinical Course Preview */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Clinical Course Summary</h3>
                </div>
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                  {draftSummary.clinicalCourseSummary}
                </p>
              </div>

              <Separator />

              {/* Recommendations Preview */}
              <div className="space-y-3">
                <h3 className="font-semibold">Recommendations</h3>
                <ul className="text-sm space-y-1">
                  {draftSummary.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full Preview Toggle */}
              {showPreview && clinicSettings && (
                <>
                  <Separator />
                  <div className="border rounded-lg p-4">
                    <PCPDischargeSummary
                      patientName={draftSummary.patientName}
                      dateOfBirth={draftSummary.dateOfBirth}
                      episodeId={draftSummary.episodeId}
                      referringPhysician={draftSummary.referringPhysician}
                      reasonForReferral={draftSummary.reasonForReferral}
                      careTargets={draftSummary.careTargets}
                      startDate={draftSummary.startDate}
                      dischargeDate={draftSummary.dischargeDate}
                      totalVisits={draftSummary.totalVisits}
                      clinicalCourseSummary={draftSummary.clinicalCourseSummary}
                      dischargeStatus={draftSummary.dischargeStatus}
                      dischargeOutcome={draftSummary.dischargeOutcome}
                      recommendations={draftSummary.recommendations}
                      followUpGuidance={draftSummary.followUpGuidance}
                      clinicianName={draftSummary.clinicianName}
                      clinicianCredentials={draftSummary.clinicianCredentials}
                      clinicianNPI={draftSummary.clinicianNPI}
                      clinicName={clinicSettings.clinic_name}
                      clinicTagline={clinicSettings.tagline}
                      clinicPhone={clinicSettings.phone}
                      clinicEmail={clinicSettings.email}
                      clinicAddress={clinicSettings.address}
                      clinicLogoUrl={clinicSettings.logo_url}
                    />
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Failed to generate summary. Please try again.
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            disabled={!draftSummary}
          >
            {showPreview ? "Hide Full Preview" : "Show Full Preview"}
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              !draftSummary || 
              confirming || 
              sendBlocked ||
              (!outcomeIntegrityPassed && !showOverrideForm)
            }
            className="gap-2"
          >
            {confirming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {sendBlocked 
              ? (alreadySent ? "Already Sent" : "Missing PCP") 
              : "Confirm & Mark Ready"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}