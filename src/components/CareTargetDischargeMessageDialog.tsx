import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  FileText, 
  Loader2,
  XCircle,
  Target,
  ArrowRight
} from 'lucide-react';
import { useCareTargetDischargeMessage } from '@/hooks/useCareTargetDischargeMessage';

interface CareTargetDischargeMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episodeId: string;
  careTargetId: string;
  careTargetName?: string;
  onSent?: () => void;
}

export function CareTargetDischargeMessageDialog({
  open,
  onOpenChange,
  episodeId,
  careTargetId,
  careTargetName,
  onSent
}: CareTargetDischargeMessageDialogProps) {
  const {
    isLoading,
    isGenerating,
    isConfirming,
    isSending,
    task,
    careTarget,
    remainingActiveTargets,
    alreadySent,
    confirmed,
    errorCode,
    errorMessage,
    generateDraft,
    confirmMessage,
    sendMessage,
    reset
  } = useCareTargetDischargeMessage();

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (open && episodeId && careTargetId) {
      reset();
      generateDraft(episodeId, careTargetId);
    }
  }, [open, episodeId, careTargetId, generateDraft, reset]);

  const handleConfirm = async () => {
    const success = await confirmMessage(episodeId, careTargetId);
    if (success) {
      setShowPreview(true);
    }
  };

  const handleSend = async () => {
    const success = await sendMessage(episodeId, careTargetId);
    if (success) {
      onSent?.();
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    }
  };

  const renderMessagePreview = () => {
    if (!task?.draft_message) return null;

    return (
      <div className="bg-muted/30 rounded-lg p-4 border">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Message Preview</span>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="whitespace-pre-wrap text-sm leading-relaxed pr-4">
            {task.draft_message}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const displayName = careTarget?.name || careTargetName || 'Care Target';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Care Target Transition Message
          </DialogTitle>
          <DialogDescription>
            Send a patient communication about transitioning this care concern out of active in-clinic care.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4 py-4">
          {/* Loading State */}
          {isLoading && !task && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Generating message draft...</span>
            </div>
          )}

          {/* Error State - Episode Closed */}
          {errorCode === 'EPISODE_CLOSED' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Episode Closed</AlertTitle>
              <AlertDescription>
                This episode has been closed. Care target messages cannot be sent after episode closure.
                Use the Episode Discharge Letter instead.
              </AlertDescription>
            </Alert>
          )}

          {/* Error State - Other Errors */}
          {errorCode && errorCode !== 'EPISODE_CLOSED' && errorCode !== 'ALREADY_SENT' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Already Sent Alert */}
          {alreadySent && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Message Already Sent</AlertTitle>
              <AlertDescription>
                A transition message has already been sent for this care target.
                Only one message per care target per episode is permitted.
              </AlertDescription>
            </Alert>
          )}

          {/* Confirmed Alert */}
          {confirmed && !alreadySent && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Message Confirmed</AlertTitle>
              <AlertDescription>
                This message has been confirmed by a clinician and is ready to send.
              </AlertDescription>
            </Alert>
          )}

          {/* Care Target Info */}
          {task && !errorCode && (
            <div className="space-y-4">
              {/* Target Being Transitioned */}
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="font-medium">Transitioning Out of Active Care</span>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {displayName}
                </Badge>
              </div>

              {/* Remaining Active Targets */}
              {remainingActiveTargets.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Continuing Active Care</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {remainingActiveTargets.map((target) => (
                      <Badge key={target.id} variant="outline" className="text-xs">
                        {target.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {remainingActiveTargets.length === 0 && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle>No Other Active Concerns</AlertTitle>
                  <AlertDescription>
                    This is the last active care target. The message will note that no other 
                    concerns require in-clinic care, while clarifying that the episode remains open.
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              {/* Message Preview */}
              {renderMessagePreview()}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming || isSending}
          >
            Cancel
          </Button>

          {!confirmed && !alreadySent && task && !errorCode && (
            <Button
              onClick={handleConfirm}
              disabled={isConfirming || !task}
            >
              {isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Message
                </>
              )}
            </Button>
          )}

          {confirmed && !alreadySent && (
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send to Patient
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
