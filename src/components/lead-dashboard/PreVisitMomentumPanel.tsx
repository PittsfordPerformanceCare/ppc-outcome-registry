import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar, FileText, Send, CheckCircle, Clock, AlertTriangle, MessageSquare, Loader2 } from "lucide-react";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpcomingVisit {
  id: string;
  patient_name: string;
  scheduled_date: string;
  scheduled_time: string;
  intake_form_id: string | null;
  intake_status: 'complete' | 'pending' | 'overdue' | null;
  source?: string;
  patient_email?: string;
}

interface PreVisitMomentumPanelProps {
  visits: UpcomingVisit[];
  loading: boolean;
}

function getStatusBadge(status: 'complete' | 'pending' | 'overdue' | null) {
  switch (status) {
    case 'complete':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1">
          <CheckCircle className="h-3 w-3" />
          Complete
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case 'overdue':
      return (
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 gap-1">
          <AlertTriangle className="h-3 w-3" />
          Overdue
        </Badge>
      );
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
}

function formatVisitDate(dateStr: string, timeStr: string): string {
  const date = parseISO(dateStr);
  
  let dayLabel = format(date, "EEEE, MMM d");
  if (isToday(date)) dayLabel = "Today";
  else if (isTomorrow(date)) dayLabel = "Tomorrow";
  
  if (timeStr) {
    // Parse time string (HH:mm or HH:mm:ss)
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${dayLabel} at ${hour12}:${minutes} ${ampm}`;
  }
  
  return dayLabel;
}

interface VisitRowProps {
  visit: UpcomingVisit;
}

function VisitRow({ visit }: VisitRowProps) {
  const [resending, setResending] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const handleResendForms = async () => {
    if (!visit.intake_form_id) {
      toast.error("No intake form found to resend");
      return;
    }

    setResending(true);
    try {
      const { error } = await supabase.functions.invoke("send-intake-scheduling-reminder", {
        body: {
          intakeId: visit.intake_form_id,
          patientName: visit.patient_name,
          patientEmail: visit.patient_email,
          reminderNumber: 1
        }
      });

      if (error) throw error;
      toast.success(`Forms resent to ${visit.patient_name}`);
    } catch (error) {
      console.error("Failed to resend forms:", error);
      toast.error("Failed to resend forms");
    } finally {
      setResending(false);
    }
  };

  const handleSaveNote = async () => {
    if (!note.trim()) return;

    setSavingNote(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from("lifecycle_events").insert({
        entity_type: "INTAKE_APPOINTMENT",
        entity_id: visit.id,
        event_type: "ADMIN_NOTE_ADDED",
        actor_type: "admin",
        actor_id: user?.id,
        metadata: { note: note.trim(), patient_name: visit.patient_name }
      });

      toast.success("Note saved");
      setNote("");
      setNoteOpen(false);
    } catch (error) {
      console.error("Failed to save note:", error);
      toast.error("Failed to save note");
    } finally {
      setSavingNote(false);
    }
  };

  const showResend = visit.intake_status === 'pending' || visit.intake_status === 'overdue';

  return (
    <div 
      className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors"
    >
      <div className="space-y-1">
        <p className="font-medium">{visit.patient_name}</p>
        <p className="text-sm text-muted-foreground">
          {formatVisitDate(visit.scheduled_date, visit.scheduled_time)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">New Patient Forms</p>
          {getStatusBadge(visit.intake_status)}
        </div>
        
        {showResend && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1.5"
            onClick={handleResendForms}
            disabled={resending}
          >
            {resending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Resend
          </Button>
        )}

        <Popover open={noteOpen} onOpenChange={setNoteOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72">
            <div className="space-y-3">
              <p className="text-sm font-medium">Add Admin Note</p>
              <Textarea
                placeholder="Note about this visit..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setNoteOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSaveNote}
                  disabled={savingNote || !note.trim()}
                >
                  {savingNote && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                  Save
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export function PreVisitMomentumPanel({ visits, loading }: PreVisitMomentumPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Upcoming First Visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visits.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Upcoming First Visits
            <span className="text-sm font-normal text-muted-foreground">(Next 72 Hours)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Calendar className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">No first visits scheduled in the next 72 hours</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Upcoming First Visits
            <span className="text-sm font-normal text-muted-foreground">(Next 72 Hours)</span>
          </CardTitle>
          <Badge variant="secondary">{visits.length} scheduled</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {visits.slice(0, 5).map((visit) => (
            <VisitRow key={visit.id} visit={visit} />
          ))}
        </div>
        {visits.length > 5 && (
          <div className="px-6 py-3 border-t">
            <Link 
              to="/admin-shell/registry" 
              className="text-sm text-primary hover:underline"
            >
              View all {visits.length} upcoming visits →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
