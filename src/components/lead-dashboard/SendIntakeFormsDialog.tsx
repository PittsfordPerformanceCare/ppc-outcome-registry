import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendIntakeFormsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  patientName: string;
  patientEmail: string | null;
  leadId?: string;
  careRequestId?: string;
}

export function SendIntakeFormsDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  patientName,
  patientEmail: initialEmail,
  leadId,
  careRequestId
}: SendIntakeFormsDialogProps) {
  const [email, setEmail] = useState(initialEmail || "");
  const [templateType, setTemplateType] = useState<"neuro" | "msk">("neuro");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error("Email is required to send intake forms");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-onboarding-email", {
        body: {
          email: email.trim(),
          patientName,
          leadId: leadId || careRequestId,
          templateType,
        },
      });

      // Check for function invocation error
      if (error) throw error;
      
      // Check for error returned in the response body
      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success("Intake forms sent successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error sending intake forms:", error);
      toast.error("Failed to send intake forms");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Intake Forms Only
          </DialogTitle>
          <DialogDescription>
            Send legal intake forms to {patientName}. This does not schedule an appointment or create an episode.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Intake Form Type</Label>
            <Select value={templateType} onValueChange={(v) => setTemplateType(v as "neuro" | "msk")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="neuro">Neurologic Evaluation</SelectItem>
                <SelectItem value="msk">MSK Evaluation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex gap-2 dark:border-amber-800 dark:bg-amber-950/30">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              This only sends intake forms. No appointment will be scheduled and no episode will be created.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !email.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Forms
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
