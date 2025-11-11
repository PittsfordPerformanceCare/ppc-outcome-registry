import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Send } from "lucide-react";

export function ReferralReportScheduler() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newScheduleName, setNewScheduleName] = useState("");
  const [newRecipients, setNewRecipients] = useState("");
  const [sendDay, setSendDay] = useState(1);
  const [sendTime, setSendTime] = useState("09:00");

  // Fetch schedules
  const { data: schedules } = useQuery({
    queryKey: ["referral-report-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_report_schedules")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch delivery history
  const { data: deliveries } = useQuery({
    queryKey: ["referral-report-deliveries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_report_deliveries")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  // Create schedule mutation
  const createSchedule = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      const recipientList = newRecipients.split(",").map(e => e.trim()).filter(Boolean);
      if (recipientList.length === 0) throw new Error("At least one recipient required");

      // Calculate next send date
      const nextSend = new Date();
      nextSend.setMonth(nextSend.getMonth() + 1);
      nextSend.setDate(sendDay);
      const [hours, minutes] = sendTime.split(":");
      nextSend.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const { error } = await supabase.from("referral_report_schedules").insert({
        user_id: user.id,
        clinic_id: profile?.clinic_id,
        name: newScheduleName || "Monthly Referral Report",
        recipient_emails: recipientList,
        send_day: sendDay,
        send_time: sendTime,
        next_send_at: nextSend.toISOString(),
        enabled: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Report schedule created successfully" });
      queryClient.invalidateQueries({ queryKey: ["referral-report-schedules"] });
      setNewScheduleName("");
      setNewRecipients("");
    },
    onError: (error: Error) => {
      toast({ title: "Error creating schedule", description: error.message, variant: "destructive" });
    },
  });

  // Toggle schedule mutation
  const toggleSchedule = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("referral_report_schedules")
        .update({ enabled })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-report-schedules"] });
    },
  });

  // Delete schedule mutation
  const deleteSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("referral_report_schedules")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Schedule deleted" });
      queryClient.invalidateQueries({ queryKey: ["referral-report-schedules"] });
    },
  });

  // Send test report
  const sendTestReport = useMutation({
    mutationFn: async (scheduleId: string) => {
      const { error } = await supabase.functions.invoke("send-referral-report", {
        body: { scheduleId },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Test report sent successfully" });
      queryClient.invalidateQueries({ queryKey: ["referral-report-deliveries"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error sending test report", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Monthly Report Schedule</CardTitle>
          <CardDescription>
            Automatically send referral performance reports to clinic administrators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="schedule-name">Schedule Name</Label>
              <Input
                id="schedule-name"
                placeholder="Monthly Referral Report"
                value={newScheduleName}
                onChange={(e) => setNewScheduleName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
              <Input
                id="recipients"
                placeholder="admin@clinic.com, manager@clinic.com"
                value={newRecipients}
                onChange={(e) => setNewRecipients(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="send-day">Day of Month (1-28)</Label>
              <Input
                id="send-day"
                type="number"
                min="1"
                max="28"
                value={sendDay}
                onChange={(e) => setSendDay(parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="send-time">Send Time</Label>
              <Input
                id="send-time"
                type="time"
                value={sendTime}
                onChange={(e) => setSendTime(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={() => createSchedule.mutate()} disabled={createSchedule.isPending}>
            <Plus className="mr-2 h-4 w-4" />
            Create Schedule
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Schedules</CardTitle>
          <CardDescription>Manage your automated report schedules</CardDescription>
        </CardHeader>
        <CardContent>
          {schedules && schedules.length > 0 ? (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{schedule.name}</h4>
                      {schedule.enabled ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sends on day {schedule.send_day} at {schedule.send_time} to{" "}
                      {schedule.recipient_emails.length} recipient(s)
                    </p>
                    {schedule.last_sent_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last sent: {new Date(schedule.last_sent_at).toLocaleString()}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Next scheduled: {new Date(schedule.next_send_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={(enabled) =>
                        toggleSchedule.mutate({ id: schedule.id, enabled })
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendTestReport.mutate(schedule.id)}
                      disabled={sendTestReport.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteSchedule.mutate(schedule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No schedules created yet. Create one above to get started.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardDescription>View the last 10 report deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          {deliveries && deliveries.length > 0 ? (
            <div className="space-y-2">
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(delivery.sent_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sent to {delivery.recipient_emails.length} recipient(s)
                    </p>
                    {delivery.report_data && typeof delivery.report_data === 'object' && 'totalReferrals' in delivery.report_data && (
                      <p className="text-xs text-muted-foreground">
                        {(delivery.report_data as any).totalReferrals} referrals, {(delivery.report_data as any).conversionRate}% conversion
                      </p>
                    )}
                  </div>
                  {delivery.status === "sent" ? (
                    <Badge variant="default">Sent</Badge>
                  ) : (
                    <Badge variant="destructive">Failed</Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No reports have been sent yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
