import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuickCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const PRIMARY_CONCERNS = [
  { value: "neuro", label: "Neurologic" },
  { value: "msk", label: "MSK (Musculoskeletal)" },
  { value: "pediatric", label: "Pediatric" },
  { value: "other", label: "Other" },
];

export function QuickCaptureDialog({ open, onOpenChange, onSuccess }: QuickCaptureDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [primaryConcern, setPrimaryConcern] = useState("");
  const [notes, setNotes] = useState("");
  const [sendOnboarding, setSendOnboarding] = useState(false);
  const [templateType, setTemplateType] = useState<"neuro" | "msk">("neuro");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setPrimaryConcern("");
    setNotes("");
    setSendOnboarding(false);
    setTemplateType("neuro");
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

    if (sendOnboarding && !email.trim()) {
      toast.error("Email is required to send onboarding forms");
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
          primary_concern: primaryConcern || null,
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

      // Send onboarding email if requested
      if (sendOnboarding && email.trim()) {
        const { error: emailError } = await supabase.functions.invoke("send-onboarding-email", {
          body: {
            email: email.trim(),
            patientName: name.trim(),
            leadId: lead.id,
            templateType,
          },
        });

        if (emailError) {
          console.error("Failed to send onboarding email:", emailError);
          toast.warning("Lead created, but onboarding email failed to send");
        } else {
          toast.success("Lead created and onboarding email sent");
        }
      } else {
        toast.success("Lead created successfully");
      }

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
            <Label htmlFor="primaryConcern">Primary Concern</Label>
            <Select value={primaryConcern} onValueChange={setPrimaryConcern}>
              <SelectTrigger>
                <SelectValue placeholder="Select concern type" />
              </SelectTrigger>
              <SelectContent>
                {PRIMARY_CONCERNS.map((concern) => (
                  <SelectItem key={concern.value} value={concern.value}>
                    {concern.label}
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

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendOnboarding"
                checked={sendOnboarding}
                onCheckedChange={(checked) => setSendOnboarding(checked === true)}
                disabled={!email.trim()}
              />
              <Label htmlFor="sendOnboarding" className="text-sm font-normal cursor-pointer">
                <Mail className="h-4 w-4 inline mr-1" />
                Send onboarding email with intake forms now
              </Label>
            </div>

            {sendOnboarding && (
              <div className="pl-6 space-y-2">
                <Label className="text-sm text-muted-foreground">Select intake type:</Label>
                <Select value={templateType} onValueChange={(v) => setTemplateType(v as "neuro" | "msk")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neuro">Neurologic Evaluation</SelectItem>
                    <SelectItem value="msk">MSK Evaluation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {!email.trim() && (
              <p className="text-xs text-muted-foreground pl-6">
                Enter an email address to enable onboarding email
              </p>
            )}
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
