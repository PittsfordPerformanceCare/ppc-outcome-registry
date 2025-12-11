import { useState } from "react";
import { useCommunicationTasks, useClinicians, TaskType, TaskSource, TaskPriority } from "@/hooks/useCommunicationTasks";
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

const TYPE_OPTIONS: { value: TaskType; label: string }[] = [
  { value: "CALL_BACK", label: "Call Back" },
  { value: "EMAIL_REPLY", label: "Email Reply" },
  { value: "IMAGING_REPORT", label: "Imaging Report" },
  { value: "LETTER", label: "Letter" },
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

  const [type, setType] = useState<TaskType>("CALL_BACK");
  const [description, setDescription] = useState("");
  const [patientName, setPatientName] = useState(prefillPatientName || "");
  const [episodeId, setEpisodeId] = useState(prefillEpisodeId || "");
  const [assignedClinicianId, setAssignedClinicianId] = useState(user?.id || "");
  const [priority, setPriority] = useState<TaskPriority>("NORMAL");
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [dueTime, setDueTime] = useState("09:00");
  const [letterSubtype, setLetterSubtype] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim() || !assignedClinicianId) return;

    setIsSubmitting(true);
    try {
      await createTask.mutateAsync({
        patient_id: prefillPatientId || null,
        patient_name: patientName || null,
        episode_id: episodeId || null,
        assigned_clinician_id: assignedClinicianId,
        type,
        source,
        description: description.trim(),
        priority,
        due_at: `${dueDate}T${dueTime}:00`,
        letter_subtype: type === "LETTER" ? letterSubtype : null,
      });

      // Reset form
      setType("CALL_BACK");
      setDescription("");
      setPatientName(prefillPatientName || "");
      setEpisodeId(prefillEpisodeId || "");
      setPriority("NORMAL");
      setDueDate(format(addDays(new Date(), 1), "yyyy-MM-dd"));
      setDueTime("09:00");
      setLetterSubtype("");
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
            Create a new task for the clinician action queue.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Assigned Clinician (Admin only) */}
          {isAdmin && source === "ADMIN" && (
            <div className="grid gap-2">
              <Label htmlFor="clinician">Assigned Clinician *</Label>
              <Select value={assignedClinicianId} onValueChange={setAssignedClinicianId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select clinician" />
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
                {TYPE_OPTIONS.map((opt) => (
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
