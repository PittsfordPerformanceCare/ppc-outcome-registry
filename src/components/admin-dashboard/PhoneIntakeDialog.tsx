import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Phone, Loader2 } from "lucide-react";

interface PhoneIntakeDialogProps {
  onSuccess?: () => void;
}

export function PhoneIntakeDialog({ onSuccess }: PhoneIntakeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [notes, setNotes] = useState("");
  const [source, setSource] = useState("PHONE_CALL");

  const resetForm = () => {
    setPatientName("");
    setPhone("");
    setEmail("");
    setDateOfBirth("");
    setChiefComplaint("");
    setNotes("");
    setSource("PHONE_CALL");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientName.trim() || !chiefComplaint.trim()) {
      toast.error("Patient name and chief complaint are required");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const intakePayload = {
        patient_name: patientName.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        date_of_birth: dateOfBirth || null,
        chief_complaint: chiefComplaint.trim(),
        admin_notes: notes.trim() || null,
        intake_method: "phone_call",
        collected_by: user?.id,
        collected_at: new Date().toISOString(),
      };

      const { data: careRequest, error } = await supabase
        .from("care_requests")
        .insert({
          source,
          status: "SUBMITTED",
          primary_complaint: chiefComplaint.trim(),
          intake_payload: intakePayload,
          admin_owner_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Log lifecycle event
      await supabase.from("lifecycle_events").insert({
        entity_type: "CARE_REQUEST",
        entity_id: careRequest.id,
        event_type: "CREATED_FROM_PHONE_CALL",
        actor_type: "admin",
        actor_id: user?.id,
        metadata: { source, patient_name: patientName }
      });

      toast.success("Care request created successfully");
      resetForm();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create care request:", error);
      toast.error("Failed to create care request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Care Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Phone Intake
          </DialogTitle>
          <DialogDescription>
            Capture patient information from a phone call. This creates a new care request.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Patient Name - Required */}
          <div className="space-y-2">
            <Label htmlFor="patientName">
              Patient Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Full name"
              required
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(585) 555-1234"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@email.com"
              />
            </div>
          </div>

          {/* DOB */}
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>

          {/* Chief Complaint - Required */}
          <div className="space-y-2">
            <Label htmlFor="complaint">
              Chief Complaint <span className="text-destructive">*</span>
            </Label>
            <Input
              id="complaint"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g., Neck pain, concussion symptoms, knee injury"
              required
            />
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label htmlFor="source">Referral Source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PHONE_CALL">Phone Call</SelectItem>
                <SelectItem value="PHYSICIAN_REFERRAL">Physician Referral</SelectItem>
                <SelectItem value="SELF_REFERRAL">Self-Referral</SelectItem>
                <SelectItem value="ATHLETE_PROGRAM">Athlete Program</SelectItem>
                <SelectItem value="SCHOOL">School/Community</SelectItem>
                <SelectItem value="INTERNAL">Internal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Admin Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context from the call..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Care Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
