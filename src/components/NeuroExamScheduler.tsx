import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Activity, Send } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface NeuroExamSchedulerProps {
  episodeId: string;
  patientName: string;
  patientEmail?: string;
  clinicianName?: string;
  onScheduled?: () => void;
}

export function NeuroExamScheduler({
  episodeId,
  patientName,
  patientEmail,
  clinicianName,
  onScheduled
}: NeuroExamSchedulerProps) {
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("");
  const [examType, setExamType] = useState<"baseline" | "followup" | "final">("followup");
  const [sending, setSending] = useState(false);

  const handleScheduleExam = async () => {
    if (!examDate) {
      toast.error("Please select an exam date");
      return;
    }

    if (!examTime) {
      toast.error("Please select an exam time");
      return;
    }

    setSending(true);
    try {
      // Send notification email if patient email is available
      if (patientEmail) {
        const { error: emailError } = await supabase.functions.invoke("send-neuro-exam-notification", {
          body: {
            episodeId,
            patientName,
            patientEmail,
            clinicianName,
            examDate,
            examTime,
            examType,
          },
        });

        if (emailError) {
          console.error("Error sending email:", emailError);
          toast.error("Failed to send notification email");
          return;
        }
      }

      toast.success(`Neurologic examination scheduled for ${format(new Date(examDate), "PPP")} at ${examTime}`);
      
      // Reset form
      setExamDate("");
      setExamTime("");
      setExamType("followup");
      
      if (onScheduled) {
        onScheduled();
      }
    } catch (error) {
      console.error("Error scheduling exam:", error);
      toast.error("Failed to schedule examination");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle>Schedule Neurologic Examination</CardTitle>
        </div>
        <CardDescription>
          Schedule and notify patient about their upcoming neurologic examination
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="examType">Examination Type</Label>
          <Select value={examType} onValueChange={(value: any) => setExamType(value)}>
            <SelectTrigger id="examType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baseline">Baseline Assessment</SelectItem>
              <SelectItem value="followup">Follow-up Assessment</SelectItem>
              <SelectItem value="final">Final Assessment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="examDate">Exam Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="examTime">Exam Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="examTime"
                type="time"
                value={examTime}
                onChange={(e) => setExamTime(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg text-sm">
          <p className="font-medium mb-1">Patient Information:</p>
          <p className="text-muted-foreground">
            {patientName}
            {patientEmail && ` • ${patientEmail}`}
          </p>
        </div>

        {!patientEmail && (
          <div className="bg-warning/10 border border-warning/20 p-3 rounded-lg text-sm text-warning-foreground">
            ⚠️ No email on file - notification email will not be sent
          </div>
        )}

        <Button 
          onClick={handleScheduleExam} 
          disabled={sending || !examDate || !examTime}
          className="w-full gap-2"
        >
          <Send className="h-4 w-4" />
          {sending ? "Scheduling..." : patientEmail ? "Schedule & Send Notification" : "Schedule Exam"}
        </Button>
      </CardContent>
    </Card>
  );
}
