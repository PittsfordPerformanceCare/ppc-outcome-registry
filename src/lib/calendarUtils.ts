import { format } from "date-fns";

interface CalendarEventProps {
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  clinicName: string;
  clinicPhone?: string;
  clinicWebsite?: string;
  reminderMinutes?: number;
}

export const generateICSFile = ({
  title,
  description,
  location,
  startDate,
  endDate,
  clinicName,
  clinicPhone,
  clinicWebsite,
  reminderMinutes = 60,
}: CalendarEventProps): string => {
  // Format dates for ICS (YYYYMMDDTHHMMSS)
  const formatICSDate = (date: Date): string => {
    return format(date, "yyyyMMdd'T'HHmmss");
  };

  // Build the description with clinic branding
  let fullDescription = description;
  if (clinicName) {
    fullDescription += `\n\n📍 ${clinicName}`;
  }
  if (clinicPhone) {
    fullDescription += `\n📞 ${clinicPhone}`;
  }
  if (clinicWebsite) {
    fullDescription += `\n🌐 ${clinicWebsite}`;
  }

  // Escape special characters for ICS format
  const escapeICSText = (text: string): string => {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  };

  // Generate unique UID
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@ppc-registry`;

  // Build ICS content
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PPC Outcome Registry//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${escapeICSText(title)}`,
    `DESCRIPTION:${escapeICSText(fullDescription)}`,
    location ? `LOCATION:${escapeICSText(location)}` : null,
    `ORGANIZER;CN=${escapeICSText(clinicName)}:noreply@ppc-registry.app`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT" + reminderMinutes + "M",
    "DESCRIPTION:Reminder",
    "ACTION:DISPLAY",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return icsContent;
};

export const downloadICSFile = (icsContent: string, filename: string = "appointment.ics") => {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const addToCalendar = (props: CalendarEventProps) => {
  const icsContent = generateICSFile(props);
  const filename = `${props.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`;
  downloadICSFile(icsContent, filename);
};

// Generate Google Calendar URL (alternative method)
export const getGoogleCalendarUrl = ({
  title,
  description,
  location,
  startDate,
  endDate,
}: Omit<CalendarEventProps, "clinicName" | "clinicPhone" | "clinicWebsite" | "reminderMinutes">): string => {
  const formatGoogleDate = (date: Date): string => {
    return format(date, "yyyyMMdd'T'HHmmss");
  };

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: description,
    ...(location && { location }),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};