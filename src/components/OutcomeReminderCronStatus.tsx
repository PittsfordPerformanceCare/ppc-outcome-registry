import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, Clock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface CronStatus {
  lastRunTime: Date | null;
  reminderCount: number;
  status: 'active' | 'inactive' | 'error';
  nextRunTime: string;
}

export function OutcomeReminderCronStatus() {
  const [loading, setLoading] = useState(true);
  const [cronStatus, setCronStatus] = useState<CronStatus>({
    lastRunTime: null,
    reminderCount: 0,
    status: 'inactive',
    nextRunTime: 'Daily at 9:00 AM',
  });
  const [triggering, setTriggering] = useState(false);

  const fetchCronStatus = async () => {
    setLoading(true);
    try {
      // Get the most recent outcome reminder notifications
      const { data: recentReminders, error } = await supabase
        .from('notifications_history')
        .select('sent_at, status')
        .in('notification_type', ['outcome_reminder', 'outcome_reminder_sms'])
        .order('sent_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (recentReminders && recentReminders.length > 0) {
        // Find the last batch (notifications sent within 5 minutes of each other)
        const latestTime = new Date(recentReminders[0].sent_at);
        const batchCutoff = new Date(latestTime.getTime() - 5 * 60 * 1000); // 5 minutes before latest

        const lastBatch = recentReminders.filter(
          r => new Date(r.sent_at) >= batchCutoff
        );

        const successCount = lastBatch.filter(r => r.status === 'sent').length;
        const hasErrors = lastBatch.some(r => r.status === 'failed');

        setCronStatus({
          lastRunTime: latestTime,
          reminderCount: lastBatch.length,
          status: hasErrors ? 'error' : 'active',
          nextRunTime: 'Daily at 9:00 AM',
        });
      } else {
        setCronStatus({
          lastRunTime: null,
          reminderCount: 0,
          status: 'inactive',
          nextRunTime: 'Daily at 9:00 AM',
        });
      }
    } catch (error) {
      console.error('Error fetching cron status:', error);
      toast.error('Failed to fetch cron job status');
    } finally {
      setLoading(false);
    }
  };

  const handleManualTrigger = async () => {
    setTriggering(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-outcome-measure-reminders');

      if (error) throw error;

      const result = data as { success: boolean; processed: number; message: string };
      
      if (result.success) {
        toast.success(result.message || `Processed ${result.processed} outcome reminders`);
        // Refresh status after a moment
        setTimeout(fetchCronStatus, 2000);
      } else {
        toast.warning('No patients due for outcome reminders at this time');
      }
    } catch (error: any) {
      console.error('Error triggering outcome reminders:', error);
      toast.error(`Failed to trigger reminders: ${error.message}`);
    } finally {
      setTriggering(false);
    }
  };

  useEffect(() => {
    fetchCronStatus();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchCronStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    switch (cronStatus.status) {
      case 'active':
        return 'bg-green-500';
      case 'error':
        return 'bg-amber-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (cronStatus.status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-500" />
            <CardTitle>Outcome Reminder Automation</CardTitle>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            {cronStatus.status === 'active' ? 'Active' : cronStatus.status === 'error' ? 'Warning' : 'Inactive'}
          </Badge>
        </div>
        <CardDescription>
          Automated daily checks for patients due for outcome assessments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Last Run */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last Run
            </div>
            <div className="text-lg font-semibold">
              {cronStatus.lastRunTime ? (
                <div className="space-y-1">
                  <div>{formatDistanceToNow(cronStatus.lastRunTime, { addSuffix: true })}</div>
                  <div className="text-xs text-muted-foreground">
                    {cronStatus.lastRunTime.toLocaleString()}
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground">Never</span>
              )}
            </div>
          </div>

          {/* Reminders Sent */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getStatusIcon()}
              Reminders Sent
            </div>
            <div className="text-lg font-semibold">
              {cronStatus.reminderCount > 0 ? (
                <span className="text-green-600">{cronStatus.reminderCount}</span>
              ) : (
                <span className="text-muted-foreground">0</span>
              )}
              <span className="text-sm text-muted-foreground ml-1">
                {cronStatus.lastRunTime ? 'in last run' : ''}
              </span>
            </div>
          </div>

          {/* Next Run */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Next Run
            </div>
            <div className="text-lg font-semibold">
              {cronStatus.nextRunTime}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCronStatus}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleManualTrigger}
            disabled={triggering}
          >
            {triggering ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Run Now
              </>
            )}
          </Button>
        </div>

        {cronStatus.status === 'error' && (
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Some reminders failed in the last run. Check notification history for details.
            </p>
          </div>
        )}

        {!cronStatus.lastRunTime && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              No outcome reminders have been sent yet. The cron job runs daily at 9:00 AM, or click "Run Now" to test.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
