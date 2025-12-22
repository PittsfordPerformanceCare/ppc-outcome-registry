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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2,
  Heart,
  Send,
  XCircle,
  Eye,
  Check,
} from "lucide-react";
import { usePatientDischargeLetter } from "@/hooks/usePatientDischargeLetter";

interface PatientDischargeLetterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episodeId: string;
  onSent?: () => void;
}

export function PatientDischargeLetterDialog({
  open,
  onOpenChange,
  episodeId,
  onSent,
}: PatientDischargeLetterDialogProps) {
  const {
    loading,
    draftLetter,
    careTargets,
    alreadySent,
    confirmed,
    errorCode,
    errorMessage,
    generateDraft,
    confirmLetter,
    sendLetter,
  } = usePatientDischargeLetter();

  const [showFullPreview, setShowFullPreview] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open && episodeId) {
      generateDraft(episodeId);
    }
  }, [open, episodeId, generateDraft]);

  const handleConfirm = async () => {
    setConfirming(true);
    await confirmLetter(episodeId);
    setConfirming(false);
  };

  const handleSend = async () => {
    setSending(true);
    const success = await sendLetter(episodeId);
    setSending(false);
    
    if (success) {
      onSent?.();
      onOpenChange(false);
    }
  };

  const renderLetterPreview = () => {
    if (!draftLetter?.letterContent) return null;
    const { letterContent } = draftLetter;

    return (
      <div className="space-y-6 text-sm bg-card border rounded-lg p-6">
        <div className="whitespace-pre-wrap">{letterContent.opening}</div>
        
        <Separator />
        
        <div>
          <h4 className="font-semibold text-primary mb-2">What We Focused On Together</h4>
          <div className="whitespace-pre-wrap">{letterContent.whatWeFocusedOn}</div>
        </div>
        
        <div>
          <h4 className="font-semibold text-primary mb-2">How Things Progressed</h4>
          <div className="whitespace-pre-wrap">{letterContent.howThingsProgressed}</div>
        </div>
        
        <div>
          <h4 className="font-semibold text-primary mb-2">Where You Are Now</h4>
          <div className="whitespace-pre-wrap">{letterContent.whereYouAreNow}</div>
        </div>
        
        <div>
          <h4 className="font-semibold text-primary mb-2">What to Expect Going Forward</h4>
          <div className="whitespace-pre-wrap">{letterContent.whatToExpect}</div>
        </div>
        
        <div>
          <h4 className="font-semibold text-primary mb-2">When to Reach Out</h4>
          <div className="whitespace-pre-wrap">{letterContent.whenToReachOut}</div>
        </div>
        
        <Separator />
        
        <div className="whitespace-pre-wrap">{letterContent.closing}</div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Patient Discharge Letter
          </DialogTitle>
          <DialogDescription>
            Review and confirm the patient-facing discharge letter before sending
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Generating letter...</span>
          </div>
        ) : errorCode ? (
          <div className="py-8">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Cannot Generate Letter</AlertTitle>
              <AlertDescription>
                {errorCode === "EPISODE_NOT_CLOSED" && (
                  <p>This episode must be closed before a patient discharge letter can be generated. Please close the episode first.</p>
                )}
                {errorCode === "EPISODE_NOT_FOUND" && (
                  <p>The episode could not be found. Please try again.</p>
                )}
                {errorMessage && <p className="mt-2 text-sm">{errorMessage}</p>}
              </AlertDescription>
            </Alert>
          </div>
        ) : draftLetter ? (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 pr-4">
              {/* Status Alerts */}
              {alreadySent && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800 dark:text-red-200">
                    Letter Already Sent
                  </AlertTitle>
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    A patient discharge letter has already been sent for this episode. Duplicate sending is not permitted.
                  </AlertDescription>
                </Alert>
              )}

              {confirmed && !alreadySent && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800 dark:text-green-200">
                    Letter Confirmed
                  </AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    This letter has been confirmed and is ready to send.
                  </AlertDescription>
                </Alert>
              )}

              {/* Care Targets Summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Care Targets Addressed</h3>
                </div>
                
                <div className="grid gap-2">
                  {careTargets.map((target, idx) => (
                    <div
                      key={idx}
                      className="p-3 border rounded-lg bg-card"
                    >
                      <p className="font-medium">{target.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {target.plainLanguageSummary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Letter Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Letter Preview</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFullPreview(!showFullPreview)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showFullPreview ? "Hide Full Letter" : "Show Full Letter"}
                  </Button>
                </div>

                {showFullPreview ? (
                  renderLetterPreview()
                ) : (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Opening:</strong> "{draftLetter.letterContent.opening.slice(0, 100)}..."
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Click "Show Full Letter" to preview the complete letter content.
                    </p>
                  </div>
                )}
              </div>

              {/* Tone Reminder */}
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                <Heart className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800 dark:text-blue-200">
                  Tone Check
                </AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  This letter uses warm, reassuring language to help the patient feel confident about their transition. It avoids clinical jargon and emphasizes continuity of support.
                </AlertDescription>
              </Alert>
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Failed to generate letter. Please try again.
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          
          {!confirmed && !alreadySent && draftLetter && (
            <Button
              onClick={handleConfirm}
              disabled={confirming || loading}
              variant="secondary"
              className="gap-2"
            >
              {confirming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Confirm Letter
            </Button>
          )}
          
          <Button
            onClick={handleSend}
            disabled={
              !draftLetter || 
              sending || 
              loading ||
              alreadySent ||
              !confirmed
            }
            className="gap-2"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {alreadySent 
              ? "Already Sent" 
              : !confirmed 
                ? "Confirm First" 
                : "Send to Patient"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
