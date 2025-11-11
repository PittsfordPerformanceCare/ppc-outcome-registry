import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, CalendarPlus, Download } from "lucide-react";
import { addToCalendar, getGoogleCalendarUrl } from "@/lib/calendarUtils";
import { useToast } from "@/hooks/use-toast";
import { addHours, parseISO } from "date-fns";

interface AddToCalendarButtonProps {
  appointmentDate: string;
  appointmentTime?: string;
  clinicianName?: string;
  patientName: string;
  treatmentArea: string;
  clinicName: string;
  clinicAddress?: string;
  clinicPhone?: string;
  clinicWebsite?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function AddToCalendarButton({
  appointmentDate,
  appointmentTime = "09:00",
  clinicianName,
  patientName,
  treatmentArea,
  clinicName,
  clinicAddress,
  clinicPhone,
  clinicWebsite,
  variant = "default",
  size = "default",
}: AddToCalendarButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Parse the date and time
  const getStartDateTime = (): Date => {
    const [hours, minutes] = appointmentTime.split(":").map(Number);
    const date = parseISO(appointmentDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const startDate = getStartDateTime();
  const endDate = addHours(startDate, 1); // Default 1-hour appointment

  const eventTitle = `Physical Therapy - ${treatmentArea}`;
  const eventDescription = `Physical therapy appointment with ${clinicName}${
    clinicianName ? `\n\nYour clinician: ${clinicianName}` : ""
  }\n\nPatient: ${patientName}\nTreatment Area: ${treatmentArea}\n\nPlease arrive 10 minutes early for check-in.`;

  const handleDownloadICS = () => {
    try {
      addToCalendar({
        title: eventTitle,
        description: eventDescription,
        location: clinicAddress,
        startDate,
        endDate,
        clinicName,
        clinicPhone,
        clinicWebsite,
        reminderMinutes: 60,
      });

      toast({
        title: "Calendar Event Created!",
        description: "The appointment has been added to your calendar",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Failed to Create Event",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleGoogleCalendar = () => {
    try {
      const url = getGoogleCalendarUrl({
        title: eventTitle,
        description: eventDescription,
        location: clinicAddress,
        startDate,
        endDate,
      });

      window.open(url, "_blank");
      toast({
        title: "Opening Google Calendar",
        description: "Add the event in the new tab",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Failed to Open Calendar",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          {size !== "icon" && "Add to Calendar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleDownloadICS} className="gap-2 cursor-pointer">
          <Download className="h-4 w-4" />
          <div className="flex flex-col">
            <span className="font-medium">Download .ics</span>
            <span className="text-xs text-muted-foreground">
              Works with Apple, Outlook, etc.
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleGoogleCalendar} className="gap-2 cursor-pointer">
          <Calendar className="h-4 w-4" />
          <div className="flex flex-col">
            <span className="font-medium">Google Calendar</span>
            <span className="text-xs text-muted-foreground">
              Open in Google Calendar
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}