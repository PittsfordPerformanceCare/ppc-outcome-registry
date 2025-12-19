import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuickCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const VISIT_TYPES = [
  { value: "neuro", label: "Neuro New Patient" },
  { value: "msk", label: "MSK New Patient" },
];

export function QuickCaptureDialog({ open, onOpenChange, onSuccess }: QuickCaptureDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [visitType, setVisitType] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setVisitType("");
    setNotes("");
    setEmailSent(false);
  };

  const handleSendEmail = async () => {
    if (!email.trim()) {
      toast.error("Email is required to send intake forms");
      return;
    }
    if (!visitType) {
      toast.error("Please select a visit type first");
      return;
    }

    setIsSendingEmail(true);
    try {
      const { error: emailError } = await supabase.functions.invoke("send-onboarding-email", {
        body: {
          email: email.trim(),
          patientName: name.trim() || "Patient",
          templateType: visitType,
        },
      });

      if (emailError) {
        console.error("Failed to send intake forms:", emailError);
        toast.error("Failed to send email. Please try again.");
      } else {
        setEmailSent(true);
        toast.success(`Intake forms sent to ${email.trim()}`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!phone.trim()) {
      toast.error("Phone is required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the lead
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .insert({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          primary_concern: visitType || null,
          notes: notes.trim() || null,
          lead_status: "NEW",
          origin_cta: "Phone Intake",
          origin_page: "Admin Dashboard",
          utm_source: "phone",
          utm_medium: "direct",
        })
        .select()
        .single();

      if (leadError) throw leadError;

      toast.success("Lead created successfully");
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating lead:", error);
      toast.error("Failed to create lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Quick Capture — Phone Lead
          </DialogTitle>
          <DialogDescription>
            Capture a new lead from a phone inquiry. This creates a lead record for follow-up.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Patient or caller name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visitType">Visit Type *</Label>
            <Select value={visitType} onValueChange={setVisitType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Neuro or MSK" />
              </SelectTrigger>
              <SelectContent>
                {VISIT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Brief notes about the call..."
              rows={3}
            />
          </div>

          {/* Send Email Section */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Send Intake Forms</Label>
                {email.trim() ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Send to: {email.trim()}
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 mt-1">
                    Enter email above to enable
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant={emailSent ? "outline" : "secondary"}
                size="sm"
                onClick={handleSendEmail}
                disabled={!email.trim() || !visitType || isSendingEmail}
              >
                {isSendingEmail ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : emailSent ? (
                  <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                {emailSent ? "Email Sent" : "Send Email"}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Lead"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
