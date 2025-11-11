import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2, Copy, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PatientInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episodeId: string;
  patientName: string;
  patientEmail?: string;
}

export function PatientInvitationDialog({
  open,
  onOpenChange,
  episodeId,
  patientName,
  patientEmail: initialEmail,
}: PatientInvitationDialogProps) {
  const [email, setEmail] = useState(initialEmail || "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleSendInvitation = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter a patient email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-patient-invitation", {
        body: {
          episodeId,
          patientEmail: email,
          patientPhone: phone || undefined,
          patientName,
        },
      });

      if (error) throw error;

      setInvitationCode(data.invitationCode);
      
      toast({
        title: "Invitation Sent!",
        description: `An invitation email has been sent to ${email}`,
      });
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Failed to Send Invitation",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (invitationCode) {
      navigator.clipboard.writeText(invitationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Code Copied",
        description: "Invitation code copied to clipboard",
      });
    }
  };

  const handleClose = () => {
    setEmail(initialEmail || "");
    setPhone("");
    setInvitationCode(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Patient Invitation</DialogTitle>
          <DialogDescription>
            Send an invitation to {patientName} to access their episode records through the patient portal.
          </DialogDescription>
        </DialogHeader>

        {!invitationCode ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Patient Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="patient@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                SMS notifications coming soon
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Invitation sent successfully! The patient will receive an email with their access code.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Access Code</Label>
              <div className="flex gap-2">
                <Input
                  value={invitationCode}
                  readOnly
                  className="font-mono text-lg font-bold text-center tracking-wider"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this code with the patient if they didn't receive the email.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {!invitationCode ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSendInvitation} disabled={loading || !email}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
