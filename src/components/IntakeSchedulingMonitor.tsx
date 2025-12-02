import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, RefreshCw, AlertTriangle, Link2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function IntakeSchedulingMonitor() {
  const [checking, setChecking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [reminderHistory, setReminderHistory] = useState<any[]>([]);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [calendarConnection, setCalendarConnection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // Fetch reminder history
      const { data: reminders, error: remindersError } = await supabase
        .from("intake_scheduling_reminders")
        .select(`
          *,
          intake_forms (
            patient_name,
            submitted_at
          )
        `)
        .order("sent_at", { ascending: false })
        .limit(10);

      if (remindersError) throw remindersError;
      setReminderHistory(reminders || []);

      // Fetch calendar connection
      const { data: connection, error: connectionError } = await supabase
        .from("google_calendar_connections")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (connectionError) console.error("Error fetching connection:", connectionError);
      setCalendarConnection(connection);

      // Fetch sync history
      const { data: syncs, error: syncsError } = await supabase
        .from("calendar_sync_history")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(5);

      if (syncsError) console.error("Error fetching sync history:", syncsError);
      setSyncHistory(syncs || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerCheck = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-intake-scheduling");

      if (error) throw error;

      toast({
        title: "Check completed",
        description: `Sent ${data.remindersSent || 0} reminders`,
      });

      await fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  const triggerSync = async () => {
    setSyncing(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke("sync-calendar-appointments", {
        body: {
          syncType: "manual",
          triggeredBy: user.user?.id,
        },
      });

      if (error) throw error;

      toast({
        title: "Sync completed",
        description: `Found ${data.appointmentsFound} appointments out of ${data.appointmentsChecked} intakes checked`,
      });

      await fetchData();
    } catch (error: any) {
      toast({
        title: "Sync error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!calendarConnection && (
        <Alert>
          <Link2 className="h-4 w-4" />
          <AlertDescription>
            Google Calendar is not connected. Go to <strong>Clinic Settings</strong> to connect your calendar for automatic appointment detection.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Intake Scheduling Monitor</CardTitle>
          <CardDescription>
            {calendarConnection 
              ? `Connected to: ${calendarConnection.calendar_name}`
              : "Automatically checks for submitted intakes without scheduled appointments"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={triggerCheck} disabled={checking}>
              <RefreshCw className={`mr-2 h-4 w-4 ${checking ? "animate-spin" : ""}`} />
              {checking ? "Checking..." : "Check Now"}
            </Button>
            {calendarConnection && (
              <Button onClick={triggerSync} disabled={syncing} variant="outline">
                <Calendar className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Sync Calendar"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {syncHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Calendar Sync History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {syncHistory.map((sync) => (
                <div
                  key={sync.id}
                  className="flex items-start justify-between border-b pb-3 last:border-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className={`h-4 w-4 ${sync.status === 'completed' ? 'text-green-500' : sync.status === 'failed' ? 'text-red-500' : 'text-yellow-500'}`} />
                      <span className="font-medium capitalize">{sync.sync_type} Sync</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Found {sync.appointments_found} of {sync.appointments_checked} appointments
                    </p>
                    {sync.error_message && (
                      <p className="text-sm text-red-500">{sync.error_message}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(sync.started_at), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Reminder Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : reminderHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reminders sent yet</p>
          ) : (
            <div className="space-y-4">
              {reminderHistory.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-start justify-between border-b pb-3 last:border-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {reminder.status === "success" ? (
                        <Clock className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">
                        {reminder.intake_forms?.patient_name}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reminder.reminder_type} - {reminder.status}
                    </p>
                    {reminder.error_message && (
                      <p className="text-sm text-red-500">{reminder.error_message}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(reminder.sent_at), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}