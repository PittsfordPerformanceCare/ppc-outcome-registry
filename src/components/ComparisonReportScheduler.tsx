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
import { CalendarClock, Trash2, Edit, Mail, Clock, History } from "lucide-react";
import { format } from "date-fns";
import { ComparisonReportDeliveryHistory } from "./ComparisonReportDeliveryHistory";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ComparisonReportSchedule {
  id: string;
  name: string;
  export_ids: string[];
  recipient_emails: string[];
  frequency: "weekly" | "monthly";
  send_day: string;
  send_time: string;
  enabled: boolean;
  last_sent_at: string | null;
  next_send_at: string;
  created_at: string;
}

interface ScheduledExport {
  id: string;
  name: string;
}

interface ComparisonReportSchedulerProps {
  availableExports: ScheduledExport[];
  selectedExportIds?: string[];
}

export function ComparisonReportScheduler({ 
  availableExports,
  selectedExportIds = []
}: ComparisonReportSchedulerProps) {
  const [schedules, setSchedules] = useState<ComparisonReportSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ComparisonReportSchedule | null>(null);
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  // Form states
  const [name, setName] = useState("");
  const [selectedExports, setSelectedExports] = useState<string[]>(selectedExportIds);
  const [recipientEmails, setRecipientEmails] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("weekly");
  const [sendDay, setSendDay] = useState("monday");
  const [sendTime, setSendTime] = useState("09:00");

  useEffect(() => {
    loadSchedules();
  }, []);

  useEffect(() => {
    if (selectedExportIds.length > 0) {
      setSelectedExports(selectedExportIds);
    }
  }, [selectedExportIds]);

  const loadSchedules = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("comparison_report_schedules")
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

    if (selectedExports.length < 2) {
      toast({
        title: "Select at least 2 exports",
        description: "Comparison reports require at least 2 exports",
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
      export_ids: selectedExports,
      recipient_emails: emails,
      frequency,
      send_day: sendDay,
      send_time: sendTime,
      next_send_at: calculateNextSendAt(frequency, sendDay, sendTime),
    };

    if (editingSchedule) {
      const { error } = await supabase
        .from("comparison_report_schedules")
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
          description: "Comparison report schedule has been updated",
        });
        resetForm();
        loadSchedules();
      }
    } else {
      const { error } = await supabase
        .from("comparison_report_schedules")
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
          description: "Comparison report schedule has been created",
        });
        resetForm();
        loadSchedules();
      }
    }
  };

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    const { error } = await supabase
      .from("comparison_report_schedules")
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
      .from("comparison_report_schedules")
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
        description: "Comparison report schedule has been removed",
      });
      loadSchedules();
    }
  };

  const handleEditSchedule = (schedule: ComparisonReportSchedule) => {
    setEditingSchedule(schedule);
    setName(schedule.name);
    setSelectedExports(schedule.export_ids);
    setRecipientEmails(schedule.recipient_emails.join(", "));
    setFrequency(schedule.frequency);
    setSendDay(schedule.send_day);
    setSendTime(schedule.send_time);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setDialogOpen(false);
    setEditingSchedule(null);
    setName("");
    setSelectedExports(selectedExportIds);
    setRecipientEmails("");
    setFrequency("weekly");
    setSendDay("monday");
    setSendTime("09:00");
  };

  const getExportNames = (exportIds: string[]) => {
    return exportIds
      .map(id => availableExports.find(exp => exp.id === id)?.name || "Unknown")
      .join(", ");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Scheduled Comparison Reports</h3>
          <p className="text-sm text-muted-foreground">
            Automatically send comparison reports to stakeholders
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
                {editingSchedule ? "Edit Report Schedule" : "Schedule Comparison Report"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="schedule-name">Schedule Name *</Label>
                <Input
                  id="schedule-name"
                  placeholder="e.g., Weekly Export Performance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label>Selected Exports ({selectedExports.length})</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  {selectedExports.length === 0 
                    ? "No exports selected. Go to comparison mode to select exports."
                    : getExportNames(selectedExports)}
                </p>
              </div>

              <div>
                <Label htmlFor="schedule-recipients">Recipient Emails *</Label>
                <Textarea
                  id="schedule-recipients"
                  placeholder="email1@example.com, email2@example.com"
                  value={recipientEmails}
                  onChange={(e) => setRecipientEmails(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comma-separated email addresses
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
            No scheduled reports yet. Create one to automate your comparison reports.
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
                  <p className="text-xs text-muted-foreground">
                    Comparing: {getExportNames(schedule.export_ids)}
                  </p>
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

              <Collapsible
                open={expandedHistory[schedule.id]}
                onOpenChange={(open) => 
                  setExpandedHistory(prev => ({ ...prev, [schedule.id]: open }))
                }
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full mt-3">
                    <History className="h-4 w-4 mr-2" />
                    {expandedHistory[schedule.id] ? 'Hide' : 'Show'} Delivery History
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <ComparisonReportDeliveryHistory scheduleId={schedule.id} />
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
