import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CalendarClock, Trash2, Edit, Mail, Clock } from "lucide-react";
import { format } from "date-fns";

interface EngagementSchedule {
  id: string;
  name: string;
  recipient_emails: string[];
  frequency: "weekly" | "monthly";
  send_day: string;
  send_time: string;
  enabled: boolean;
  min_engagement_filter: string;
  last_sent_at: string | null;
  next_send_at: string;
  created_at: string;
}

export function EngagementReportScheduler() {
  const [schedules, setSchedules] = useState<EngagementSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<EngagementSchedule | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form states
  const [name, setName] = useState("");
  const [recipientEmails, setRecipientEmails] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("weekly");
  const [sendDay, setSendDay] = useState("monday");
  const [sendTime, setSendTime] = useState("09:00");
  const [engagementFilter, setEngagementFilter] = useState("all");

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("recipient_engagement_schedules")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading schedules",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSchedules((data as any) || []);
    }
    setLoading(false);
  };

  const calculateNextSendAt = (freq: "weekly" | "monthly", day: string, time: string): string => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    if (freq === 'weekly') {
      const dayMap: Record<string, number> = {
        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
        'thursday': 4, 'friday': 5, 'saturday': 6
      };
      
      const targetDay = dayMap[day.toLowerCase()];
      const currentDay = now.getDay();
      const daysUntilNext = (targetDay - currentDay + 7) % 7 || 7;
      
      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + daysUntilNext);
      nextDate.setHours(hours, minutes, 0, 0);
      
      return nextDate.toISOString();
    } else {
      const targetDate = parseInt(day);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, targetDate, hours, minutes, 0, 0);
      return nextMonth.toISOString();
    }
  };

  const handleSaveSchedule = async () => {
    if (!user) return;
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a schedule name",
        variant: "destructive",
      });
      return;
    }

    const emails = recipientEmails
      .split(",")
      .map(e => e.trim())
      .filter(e => e.length > 0);

    if (emails.length === 0) {
      toast({
        title: "Recipients required",
        description: "Please enter at least one recipient email",
        variant: "destructive",
      });
      return;
    }

    const scheduleData = {
      user_id: user.id,
      name: name.trim(),
      recipient_emails: emails,
      frequency,
      send_day: sendDay,
      send_time: sendTime,
      min_engagement_filter: engagementFilter,
      next_send_at: calculateNextSendAt(frequency, sendDay, sendTime),
    };

    if (editingSchedule) {
      const { error } = await supabase
        .from("recipient_engagement_schedules")
        .update(scheduleData)
        .eq("id", editingSchedule.id);

      if (error) {
        toast({
          title: "Error updating schedule",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Schedule updated",
          description: "Engagement report schedule has been updated",
        });
        resetForm();
        loadSchedules();
      }
    } else {
      const { error } = await supabase
        .from("recipient_engagement_schedules")
        .insert(scheduleData);

      if (error) {
        toast({
          title: "Error creating schedule",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Schedule created",
          description: "Engagement report schedule has been created",
        });
        resetForm();
        loadSchedules();
      }
    }
  };

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    const { error } = await supabase
      .from("recipient_engagement_schedules")
      .update({ enabled })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error updating schedule",
        description: error.message,
        variant: "destructive",
      });
    } else {
      loadSchedules();
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    const { error } = await supabase
      .from("recipient_engagement_schedules")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error deleting schedule",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Schedule deleted",
        description: "Engagement report schedule has been removed",
      });
      loadSchedules();
    }
  };

  const handleEditSchedule = (schedule: EngagementSchedule) => {
    setEditingSchedule(schedule);
    setName(schedule.name);
    setRecipientEmails(schedule.recipient_emails.join(", "));
    setFrequency(schedule.frequency);
    setSendDay(schedule.send_day);
    setSendTime(schedule.send_time);
    setEngagementFilter(schedule.min_engagement_filter || "all");
    setDialogOpen(true);
  };

  const resetForm = () => {
    setDialogOpen(false);
    setEditingSchedule(null);
    setName("");
    setRecipientEmails("");
    setFrequency("weekly");
    setSendDay("monday");
    setSendTime("09:00");
    setEngagementFilter("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Scheduled Engagement Reports</h3>
          <p className="text-sm text-muted-foreground">
            Automatically send recipient engagement analytics to admins
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSchedule(null)} className="gap-2">
              <CalendarClock className="h-4 w-4" />
              Schedule Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? "Edit Report Schedule" : "Schedule Engagement Report"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="schedule-name">Schedule Name *</Label>
                <Input
                  id="schedule-name"
                  placeholder="e.g., Weekly Admin Engagement Report"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="schedule-recipients">Recipient Emails *</Label>
                <Textarea
                  id="schedule-recipients"
                  placeholder="admin1@example.com, admin2@example.com"
                  value={recipientEmails}
                  onChange={(e) => setRecipientEmails(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comma-separated email addresses
                </p>
              </div>

              <div>
                <Label htmlFor="engagement-filter">Engagement Filter</Label>
                <Select value={engagementFilter} onValueChange={setEngagementFilter}>
                  <SelectTrigger id="engagement-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Recipients</SelectItem>
                    <SelectItem value="high">High Engagement Only</SelectItem>
                    <SelectItem value="medium">Medium+ Engagement</SelectItem>
                    <SelectItem value="low">Low+ Engagement</SelectItem>
                    <SelectItem value="very_low">All (including Very Low)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Filter recipients by engagement level
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="schedule-frequency">Frequency</Label>
                  <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                    <SelectTrigger id="schedule-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="schedule-day">
                    {frequency === "weekly" ? "Day of Week" : "Day of Month"}
                  </Label>
                  {frequency === "weekly" ? (
                    <Select value={sendDay} onValueChange={setSendDay}>
                      <SelectTrigger id="schedule-day">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select value={sendDay} onValueChange={setSendDay}>
                      <SelectTrigger id="schedule-day">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div>
                  <Label htmlFor="schedule-time">Time (24h)</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={sendTime}
                    onChange={(e) => setSendTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSchedule}>
                  {editingSchedule ? "Update Schedule" : "Create Schedule"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading schedules...</p>
      ) : schedules.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            No scheduled reports yet. Create one to automate engagement analytics.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{schedule.name}</h4>
                    <Badge variant={schedule.frequency === "weekly" ? "default" : "secondary"}>
                      {schedule.frequency}
                    </Badge>
                    {schedule.min_engagement_filter && schedule.min_engagement_filter !== 'all' && (
                      <Badge variant="outline">
                        {schedule.min_engagement_filter} filter
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {schedule.recipient_emails.length} recipient(s)
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Sends {schedule.frequency === "weekly" ? "every" : "on day"} {schedule.send_day} at {schedule.send_time}
                    </p>
                    <p className="text-xs">
                      Next send: {format(new Date(schedule.next_send_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    {schedule.last_sent_at && (
                      <p className="text-xs">
                        Last sent: {format(new Date(schedule.last_sent_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Switch
                    checked={schedule.enabled}
                    onCheckedChange={(checked) => handleToggleEnabled(schedule.id, checked)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditSchedule(schedule)}
                    title="Edit schedule"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    title="Delete schedule"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
