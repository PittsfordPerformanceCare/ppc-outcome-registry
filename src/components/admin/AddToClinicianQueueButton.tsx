import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ListPlus } from "lucide-react";
import { AddTaskDialog } from "@/components/clinician/AddTaskDialog";

interface AddToClinicianQueueButtonProps {
  patientName?: string;
  patientId?: string;
  episodeId?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function AddToClinicianQueueButton({
  patientName,
  patientId,
  episodeId,
  variant = "outline",
  size = "sm",
}: AddToClinicianQueueButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setDialogOpen(true)}
        title="Add to Clinician Queue"
      >
        <ListPlus className="h-4 w-4 mr-1" />
        Queue
      </Button>
      <AddTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        source="ADMIN"
        prefillPatientName={patientName}
        prefillPatientId={patientId}
        prefillEpisodeId={episodeId}
      />
    </>
  );
}
