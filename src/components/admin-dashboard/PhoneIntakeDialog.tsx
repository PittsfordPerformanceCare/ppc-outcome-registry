import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Plus, Phone, Loader2, CheckCircle, Calendar, Mail, ArrowRight } from "lucide-react";

interface PhoneIntakeDialogProps {
  onSuccess?: () => void;
}

const VISIT_TYPES = [
  { value: "neuro_new_patient", label: "Neuro New Patient" },
  { value: "msk_new_patient", label: "MSK New Patient" },
];

export function PhoneIntakeDialog({ onSuccess }: PhoneIntakeDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);
  const [createdPatientName, setCreatedPatientName] = useState("");
  const [createdEmail, setCreatedEmail] = useState("");
  
  // Form state
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [visitType, setVisitType] = useState("");
  const [notes, setNotes] = useState("");
  const [source, setSource] = useState("WEBSITE");
  
  // Email state
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const resetForm = () => {
    setPatientName("");
    setPhone("");
    setEmail("");
    setDateOfBirth("");
    setVisitType("");
    setNotes("");
    setSource("WEBSITE");
    setCreatedRequestId(null);
    setCreatedPatientName("");
    setCreatedEmail("");
    setEmailSent(false);
  };

  const handleSendEmail = async () => {
    if (!createdEmail) {
      toast.error("No email address available");
      return;
    }

    setIsSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke("send-onboarding-email", {
        body: {
          email: createdEmail,
          patientName: createdPatientName,
        },
      });

      if (error) throw error;

      toast.success("Intake forms email sent successfully");
      setEmailSent(true);
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Failed to send intake forms email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientName.trim() || !visitType) {
      toast.error("Patient name and visit type are required");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const visitTypeLabel = VISIT_TYPES.find(v => v.value === visitType)?.label || visitType;
      
      const intakePayload = {
        patient_name: patientName.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        date_of_birth: dateOfBirth || null,
        visit_type: visitType,
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
          primary_complaint: visitTypeLabel,
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

      // Show success state with next steps
      setCreatedRequestId(careRequest.id);
      setCreatedPatientName(patientName.trim());
      setCreatedEmail(email.trim());
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create care request:", error);
      toast.error("Failed to create care request");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToReview = () => {
    setOpen(false);
    navigate(`/intake-review?selected=${createdRequestId}`);
    resetForm();
  };

  const handleCreateAnother = () => {
    resetForm();
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  // Success state after creation
  if (createdRequestId) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Care Request
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[450px]">
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Care Request Created</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {createdPatientName} has been added to the queue.
            </p>

            <div className="w-full space-y-3">
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <h4 className="font-medium text-sm mb-2">Next Steps:</h4>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">1</span>
                    <span>Assign a clinician & approve for care</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">2</span>
                    <span>Schedule the New Patient Exam (NPE)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">3</span>
                    <span>Send intake forms via email</span>
                  </li>
                </ol>
              </div>

              {createdEmail && (
                <Button 
                  onClick={handleSendEmail} 
                  variant={emailSent ? "outline" : "default"}
                  className="w-full gap-2"
                  disabled={isSendingEmail || emailSent}
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : emailSent ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Email Sent
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Send Email
                    </>
                  )}
                </Button>
              )}

              <Button onClick={handleGoToReview} variant={createdEmail ? "outline" : "default"} className="w-full gap-2">
                <Calendar className="h-4 w-4" />
                Review & Schedule NPE
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" onClick={handleCreateAnother} className="w-full">
                Create Another Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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

          {/* Visit Type - Required */}
          <div className="space-y-2">
            <Label htmlFor="visitType">
              Visit Type <span className="text-destructive">*</span>
            </Label>
            <Select value={visitType} onValueChange={setVisitType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select visit type" />
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

          {/* Source */}
          <div className="space-y-2">
            <Label htmlFor="source">Referral Source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEBSITE">Website/Phone Call</SelectItem>
                <SelectItem value="PHYSICIAN_REFERRAL">Physician Referral</SelectItem>
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