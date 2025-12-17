import { useState } from "react";
import { useCommunicationTasks, useClinicians, TaskType, TaskSource, TaskPriority, TaskCategory, TaskOwnerType } from "@/hooks/useCommunicationTasks";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays } from "date-fns";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: TaskSource;
  prefillPatientId?: string;
  prefillPatientName?: string;
  prefillEpisodeId?: string;
}

const CLINICIAN_TYPE_OPTIONS: { value: TaskType; label: string }[] = [
  { value: "CALL_BACK", label: "Call Back" },
  { value: "EMAIL_REPLY", label: "Email Reply" },
  { value: "IMAGING_REPORT", label: "Imaging Report" },
  { value: "LETTER", label: "Letter" },
  { value: "OTHER_ACTION", label: "Other" },
];

const ADMIN_TYPE_OPTIONS: { value: TaskType; label: string }[] = [
  { value: "PATIENT_CALLBACK", label: "Patient Call Back" },
  { value: "PATIENT_EMAIL_RESPONSE", label: "Email Response" },
  { value: "PORTAL_MESSAGE_RESPONSE", label: "Portal Message Response" },
  { value: "RESEND_INTAKE_FORMS", label: "Resend Intake Forms" },
  { value: "FOLLOWUP_INCOMPLETE_FORMS", label: "Follow Up on Incomplete Forms" },
  { value: "SEND_RECEIPT", label: "Send Receipt to Patient" },
  { value: "ORDER_IMAGING", label: "Order Imaging (Clinician-Requested)" },
  { value: "SCHEDULE_APPOINTMENT", label: "Schedule / Reschedule Appointment" },
  { value: "CONFIRM_APPOINTMENT", label: "Confirm Appointment" },
  { value: "REQUEST_OUTSIDE_RECORDS", label: "Request Outside Records" },
  { value: "SEND_RECORDS_TO_PATIENT", label: "Send Records to Patient" },
  { value: "UPDATE_PATIENT_CONTACT", label: "Update Patient Contact Info" },
  { value: "DOCUMENT_PATIENT_REQUEST", label: "Document Patient Request" },
  { value: "OTHER_ACTION", label: "Other" },
];

const LETTER_SUBTYPES = [
  "PCP Letter",
  "School Note",
  "Return-to-Play",
  "Referral Letter",
  "Work Note",
  "Other",
];

const CATEGORY_OPTIONS: { value: TaskCategory; label: string }[] = [
  { value: "CLINICAL_EXECUTION", label: "Clinical Execution" },
  { value: "ADMIN_EXECUTION", label: "Admin Execution" },
  { value: "COORDINATION", label: "Coordination" },
];

const OWNER_TYPE_OPTIONS: { value: TaskOwnerType; label: string }[] = [
  { value: "ADMIN", label: "Admin Task" },
  { value: "CLINICIAN", label: "Clinician Task" },
];

export function AddTaskDialog({
  open,
  onOpenChange,
  source,
  prefillPatientId,
  prefillPatientName,
  prefillEpisodeId,
}: AddTaskDialogProps) {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { createTask } = useCommunicationTasks();
  const { data: clinicians = [] } = useClinicians();

  const [ownerType, setOwnerType] = useState<TaskOwnerType>(source === "ADMIN" ? "ADMIN" : "CLINICIAN");
  const [type, setType] = useState<TaskType>(ownerType === "ADMIN" ? "PATIENT_CALLBACK" : "CALL_BACK");
  const [description, setDescription] = useState("");
  const [patientName, setPatientName] = useState(prefillPatientName || "");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [episodeId, setEpisodeId] = useState(prefillEpisodeId || "");
  const [assignedClinicianId, setAssignedClinicianId] = useState(user?.id || "");
  const [priority, setPriority] = useState<TaskPriority>("NORMAL");
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [dueTime, setDueTime] = useState("09:00");
  const [letterSubtype, setLetterSubtype] = useState("");
  const [category, setCategory] = useState<TaskCategory>("CLINICAL_EXECUTION");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typeOptions = ownerType === "ADMIN" ? ADMIN_TYPE_OPTIONS : CLINICIAN_TYPE_OPTIONS;

  const handleOwnerTypeChange = (newOwnerType: TaskOwnerType) => {
    setOwnerType(newOwnerType);
    // Reset type to first option of new owner type
    if (newOwnerType === "ADMIN") {
      setType("PATIENT_CALLBACK");
    } else {
      setType("CALL_BACK");
    }
  };

  const handleSubmit = async () => {
    if (!description.trim() || !assignedClinicianId) return;

    setIsSubmitting(true);
    try {
      await createTask.mutateAsync({
        patient_id: prefillPatientId || null,
        patient_name: patientName || null,
        patient_email: patientEmail || null,
        patient_phone: patientPhone || null,
        guardian_phone: guardianPhone || null,
        episode_id: episodeId || null,
        assigned_clinician_id: assignedClinicianId,
        type,
        source,
        description: description.trim(),
        priority,
        due_at: `${dueDate}T${dueTime}:00`,
        letter_subtype: type === "LETTER" ? letterSubtype : null,
        category,
        owner_type: ownerType,
      });

      // Reset form
      setOwnerType(source === "ADMIN" ? "ADMIN" : "CLINICIAN");
      setType(source === "ADMIN" ? "PATIENT_CALLBACK" : "CALL_BACK");
      setDescription("");
      setPatientName(prefillPatientName || "");
      setPatientEmail("");
      setPatientPhone("");
      setGuardianPhone("");
      setEpisodeId(prefillEpisodeId || "");
      setPriority("NORMAL");
      setDueDate(format(addDays(new Date(), 1), "yyyy-MM-dd"));
      setDueTime("09:00");
      setLetterSubtype("");
      setCategory("CLINICAL_EXECUTION");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Action Item</DialogTitle>
          <DialogDescription>
            Create a new task for the action queue.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Owner Type (Admin only) */}
          {isAdmin && source === "ADMIN" && (
            <div className="grid gap-2">
              <Label htmlFor="owner-type">Task Owner Type *</Label>
              <Select value={ownerType} onValueChange={(v) => handleOwnerTypeChange(v as TaskOwnerType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OWNER_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Assigned Clinician (Admin only) */}
          {isAdmin && source === "ADMIN" && (
            <div className="grid gap-2">
              <Label htmlFor="clinician">Assigned To *</Label>
              <Select value={assignedClinicianId} onValueChange={setAssignedClinicianId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {clinicians.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name || c.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Patient Name */}
          <div className="grid gap-2">
            <Label htmlFor="patient-name">Patient Name</Label>
            <Input
              id="patient-name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name"
            />
          </div>

          {/* Patient Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="patient-phone">Patient Phone</Label>
              <Input
                id="patient-phone"
                type="tel"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patient-email">Patient Email</Label>
              <Input
                id="patient-email"
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="patient@email.com"
              />
            </div>
          </div>

          {/* Guardian Phone (for minors) */}
          <div className="grid gap-2">
            <Label htmlFor="guardian-phone">Parent/Guardian Phone (if minor)</Label>
            <Input
              id="guardian-phone"
              type="tel"
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>

          {/* Episode ID (optional) */}
          <div className="grid gap-2">
            <Label htmlFor="episode-id">Episode ID (optional)</Label>
            <Input
              id="episode-id"
              value={episodeId}
              onChange={(e) => setEpisodeId(e.target.value)}
              placeholder="e.g., EP-12345"
            />
          </div>

          {/* Task Type */}
          <div className="grid gap-2">
            <Label htmlFor="type">Action Type *</Label>
            <Select value={type} onValueChange={(v) => setType(v as TaskType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Letter Subtype (only if type is LETTER) */}
          {type === "LETTER" && (
            <div className="grid gap-2">
              <Label htmlFor="letter-subtype">Letter Type</Label>
              <Select value={letterSubtype} onValueChange={setLetterSubtype}>
                <SelectTrigger>
                  <SelectValue placeholder="Select letter type" />
                </SelectTrigger>
                <SelectContent>
                  {LETTER_SUBTYPES.map((subtype) => (
                    <SelectItem key={subtype} value={subtype}>
                      {subtype}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task..."
              rows={3}
            />
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="due-date">Due Date *</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="due-time">Due Time</Label>
              <Input
                id="due-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          {/* Category (Admin only) */}
          {isAdmin && source === "ADMIN" && (
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Priority */}
          <div className="grid gap-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !description.trim() || !assignedClinicianId}
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
