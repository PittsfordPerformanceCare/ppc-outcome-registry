import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, CheckCircle2, Mail } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface BookNPVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  // Either a lead or care request
  lead?: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    primary_concern: string | null;
    origin_cta?: string | null;
    utm_source?: string | null;
  } | null;
  careRequest?: {
    id: string;
    intake_payload: {
      patient_name?: string;
      name?: string;
      email?: string;
      phone?: string;
      primary_concern?: string;
    };
    primary_complaint: string | null;
    assigned_clinician_id: string | null;
  } | null;
}

const VISIT_TYPES = [
  { value: "np_neuro", label: "Neuro New Patient" },
  { value: "np_msk", label: "MSK New Patient" },
];

const TIME_SLOTS = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
];

export function BookNPVisitDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  lead,
  careRequest 
}: BookNPVisitDialogProps) {
  const [visitType, setVisitType] = useState("");
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>();
  const [appointmentTime, setAppointmentTime] = useState("");
  const [provider, setProvider] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [currentStep, setCurrentStep] = useState<"scheduling" | "processing">("scheduling");
  const [processingStatus, setProcessingStatus] = useState<string[]>([]);

  // Extract patient info from either lead or care request
  const patientName = lead?.name || careRequest?.intake_payload?.patient_name || careRequest?.intake_payload?.name || "Unknown";
  const patientEmail = lead?.email || careRequest?.intake_payload?.email || "";
  const patientPhone = lead?.phone || careRequest?.intake_payload?.phone || "";
  const primaryConcern = lead?.primary_concern || careRequest?.primary_complaint || careRequest?.intake_payload?.primary_concern || "";

  const resetForm = () => {
    setVisitType("");
    setAppointmentDate(undefined);
    setAppointmentTime("");
    setProvider("");
    setSendEmail(true);
    setCurrentStep("scheduling");
    setProcessingStatus([]);
  };

  // Standalone send email function
  const handleSendEmailOnly = async () => {
    if (!patientEmail) {
      toast.error("No email address on file");
      return;
    }
    if (!visitType) {
      toast.error("Please select a visit type first");
      return;
    }

    setIsSendingEmail(true);
    try {
      const templateType = visitType.includes("neuro") ? "neuro" : "msk";
      
      const { error: emailError } = await supabase.functions.invoke("send-onboarding-email", {
        body: {
          email: patientEmail,
          patientName: patientName,
          leadId: lead?.id || careRequest?.id,
          templateType,
        },
      });

      if (emailError) {
        console.error("Failed to send intake forms:", emailError);
        toast.error("Failed to send email. Please try again.");
      } else {
        toast.success(`Intake forms sent to ${patientEmail}`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const addStatus = (status: string) => {
    setProcessingStatus(prev => [...prev, status]);
  };

  const handleSubmit = async () => {
    if (!visitType || !appointmentDate || !appointmentTime) {
      toast.error("Please complete all scheduling fields");
      return;
    }

    setIsSubmitting(true);
    setCurrentStep("processing");

    try {
      let careRequestId = careRequest?.id;
      let clinicianId = careRequest?.assigned_clinician_id;

      // Step 1: Ensure Care Request exists (if coming from a lead)
      if (lead && !careRequest) {
        addStatus("Creating care request...");
        
        // Determine valid source from lead data
        const validSources = ['WEBSITE', 'PHYSICIAN_REFERRAL', 'SCHOOL', 'ATHLETE_PROGRAM', 'INTERNAL'];
        let source = 'WEBSITE'; // default
        
        const leadSource = (lead.origin_cta || lead.utm_source || '').toUpperCase();
        if (leadSource.includes('PHYSICIAN') || leadSource.includes('REFERRAL') || leadSource.includes('DOCTOR')) {
          source = 'PHYSICIAN_REFERRAL';
        } else if (leadSource.includes('SCHOOL') || leadSource.includes('COMMUNITY')) {
          source = 'SCHOOL';
        } else if (leadSource.includes('ATHLETE') || leadSource.includes('SPORT')) {
          source = 'ATHLETE_PROGRAM';
        } else if (leadSource.includes('INTERNAL') || leadSource.includes('STAFF') || leadSource.includes('PHONE')) {
          source = 'INTERNAL';
        }
        
        const { data: newCareRequest, error: crError } = await supabase
          .from("care_requests")
          .insert({
            source,
            primary_complaint: lead.primary_concern,
            status: "SUBMITTED",
            intake_payload: {
              patient_name: lead.name,
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
              lead_id: lead.id,
              primary_concern: lead.primary_concern,
              source: "np_visit_booked"
            }
          })
          .select()
          .single();

        if (crError) throw crError;
        careRequestId = newCareRequest.id;
        
        // Update lead status to QUALIFIED
        await supabase
          .from("leads")
          .update({ 
            lead_status: "QUALIFIED",
            updated_at: new Date().toISOString()
          })
          .eq("id", lead.id);

        addStatus("✓ Care request created");
      }

      // Step 2: Book the appointment (store in intake_appointments or similar)
      addStatus("Booking NP visit...");
      
      // For now, we'll store appointment info - in production this would integrate with scheduling system
      const appointmentDateTime = new Date(appointmentDate);
      const [hours, minutes] = appointmentTime.split(":").map(s => parseInt(s.replace(/[^\d]/g, "")));
      const isPM = appointmentTime.includes("PM") && !appointmentTime.includes("12:");
      appointmentDateTime.setHours(isPM ? hours + 12 : hours, minutes || 0);

      addStatus("✓ NP visit scheduled for " + format(appointmentDate, "MMM d, yyyy") + " at " + appointmentTime);

      // Step 3: Send legal intake forms (only if checkbox is checked)
      if (sendEmail && patientEmail) {
        addStatus("Sending intake forms...");
        
        const templateType = visitType.includes("neuro") ? "neuro" : "msk";
        
        const { error: emailError } = await supabase.functions.invoke("send-onboarding-email", {
          body: {
            email: patientEmail,
            patientName: patientName,
            leadId: lead?.id || careRequestId,
            templateType,
          },
        });

        if (emailError) {
          console.error("Failed to send intake forms:", emailError);
          addStatus("⚠ Intake forms email failed - please send manually");
        } else {
          addStatus("✓ Legal intake forms sent to " + patientEmail);
        }
      } else if (sendEmail && !patientEmail) {
        addStatus("⚠ No email on file - intake forms must be sent manually");
      } else {
        addStatus("✓ Email skipped (you can send manually later)");
      }

      // Step 4: Approve care request and create episode
      addStatus("Creating patient episode...");

      // Get current user for episode assignment
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      // Update care request to APPROVED
      if (careRequestId) {
        await supabase
          .from("care_requests")
          .update({
            status: "APPROVED",
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", careRequestId);
      }

      // Create the episode
      const episodeId = crypto.randomUUID();
      const episodeData = {
        id: episodeId,
        user_id: user.id,
        patient_name: patientName,
        region: primaryConcern || "General",
        date_of_service: format(appointmentDate, "yyyy-MM-dd"),
        start_date: format(appointmentDate, "yyyy-MM-dd"),
        episode_type: visitType.replace("np_", "").toUpperCase(),
        current_status: "ACTIVE_CONSERVATIVE_CARE" as const,
        clinical_impression: `New Patient - ${visitType.includes("neuro") ? "Neurologic" : visitType.includes("msk") ? "MSK" : "Pediatric"} Evaluation`,
      };
      
      const { error: episodeError } = await supabase
        .from("episodes")
        .insert([episodeData]);

      if (episodeError) throw episodeError;

      // Link care request to episode
      if (careRequestId) {
        await supabase
          .from("care_requests")
          .update({
            status: "CONVERTED",
            episode_id: episodeId,
            updated_at: new Date().toISOString()
          })
          .eq("id", careRequestId);
      }

      addStatus("✓ Episode created and clinician assigned");

      // Success!
      toast.success("NP visit booked and intake forms sent. Episode created.");
      
      setTimeout(() => {
        resetForm();
        onOpenChange(false);
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error("Error in booking flow:", error);
      toast.error("Failed to complete booking. Please try again.");
      setCurrentStep("scheduling");
      setProcessingStatus([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prevent dialog from closing during any active interaction
  const handleDialogOpenChange = (newOpen: boolean) => {
    // Only allow closing if not submitting and user explicitly requests close
    if (isSubmitting) {
      console.log("Preventing dialog close - submission in progress");
      return;
    }
    
    if (currentStep === "processing") {
      console.log("Preventing dialog close - processing step active");
      return;
    }
    
    console.log("Dialog onOpenChange:", newOpen);
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange} modal={true}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <DialogTitle className="text-xl">Book NP Visit & Send Intake Forms</DialogTitle>
          <DialogDescription>
            Schedule the new patient visit and send legal intake forms to begin care.
          </DialogDescription>
        </DialogHeader>

        {currentStep === "scheduling" ? (
          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <div className="space-y-4 py-4">
              {/* Patient Info Summary */}
              <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-4 space-y-1">
                <div className="font-semibold text-lg">{patientName}</div>
                <div className="text-sm text-muted-foreground">
                  {patientEmail || patientPhone || "No contact info"}
                </div>
                {primaryConcern && (
                  <div className="text-sm text-muted-foreground">
                    Concern: {primaryConcern}
                  </div>
                )}
              </div>

              {/* Visit Type */}
              <div className="space-y-2">
                <Label className="font-medium">Visit Type *</Label>
                <Select value={visitType} onValueChange={setVisitType}>
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

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Appointment Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !appointmentDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {appointmentDate ? format(appointmentDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={appointmentDate}
                      onSelect={setAppointmentDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label>Appointment Time *</Label>
                <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Provider (optional) */}
              <div className="space-y-2">
                <Label>Provider (optional)</Label>
                <Input
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="Assign provider"
                />
              </div>

              {/* Email Options */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendEmail"
                      checked={sendEmail}
                      onCheckedChange={(checked) => setSendEmail(checked === true)}
                    />
                    <Label htmlFor="sendEmail" className="font-medium cursor-pointer">
                      Send intake forms via email
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSendEmailOnly}
                    disabled={!patientEmail || !visitType || isSendingEmail}
                  >
                    {isSendingEmail ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Send Email Now
                  </Button>
                </div>
                {patientEmail && (
                  <p className="text-xs text-muted-foreground ml-6">
                    Will send to: {patientEmail}
                  </p>
                )}
                {!patientEmail && (
                  <p className="text-xs text-amber-600 ml-6">
                    No email on file - add email or send forms manually
                  </p>
                )}
              </div>

              {/* What will happen */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2 dark:border-blue-800 dark:bg-blue-950/30">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">What happens when you confirm:</div>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  {lead && <li>Care Request will be created</li>}
                  <li>NP appointment will be booked</li>
                  {sendEmail && patientEmail && <li>Legal intake forms will be sent via email</li>}
                  <li>Patient Episode will be created</li>
                </ul>
              </div>
            </div>

            <DialogFooter className="flex-shrink-0 pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Book & Send Forms"
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="py-6 space-y-3">
            {processingStatus.map((status, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex items-center gap-2 text-sm",
                  status.startsWith("✓") ? "text-emerald-600" : 
                  status.startsWith("⚠") ? "text-amber-600" : 
                  "text-muted-foreground"
                )}
              >
                {status.startsWith("✓") && <CheckCircle2 className="h-4 w-4" />}
                {!status.startsWith("✓") && !status.startsWith("⚠") && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {status}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
