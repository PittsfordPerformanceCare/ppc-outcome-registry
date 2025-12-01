import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Clock, Send, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReminderHistory {
  id: string;
  intake_form_id: string;
  reminder_type: string;
  sent_at: string;
  status: string;
  error_message: string | null;
  intake_forms: {
    patient_name: string;
    email: string;
  };
}

export const IntakeSchedulingMonitor = () => {
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [history, setHistory] = useState<ReminderHistory[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    reminder1: 0,
    reminder2: 0,
    adminAlerts: 0,
    failed: 0,
  });
  const { toast } = useToast();

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('intake_scheduling_reminders')
        .select(`
          *,
          intake_forms (
            patient_name,
            email
          )
        `)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setHistory(data || []);

      // Calculate stats
      const total = data?.length || 0;
      const reminder1 = data?.filter(r => r.reminder_type === 'reminder_1').length || 0;
      const reminder2 = data?.filter(r => r.reminder_type === 'reminder_2').length || 0;
      const adminAlerts = data?.filter(r => r.reminder_type === 'admin_alert').length || 0;
      const failed = data?.filter(r => r.status === 'failed').length || 0;

      setStats({ total, reminder1, reminder2, adminAlerts, failed });
    } catch (error: any) {
      console.error('Error fetching history:', error);
      toast({
        title: "Error",
        description: "Failed to load reminder history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleManualCheck = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-intake-scheduling');

      if (error) throw error;

      toast({
        title: "Check Complete",
        description: `Sent ${data.reminders1Sent} reminder(s), ${data.reminders2Sent} second reminder(s), and ${data.adminAlertsSent} admin alert(s)`,
      });

      // Refresh history
      fetchHistory();
    } catch (error: any) {
      console.error('Error running check:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to run scheduling check",
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  const getReminderLabel = (type: string) => {
    switch (type) {
      case 'reminder_1':
        return 'Reminder #1 (24h)';
      case 'reminder_2':
        return 'Reminder #2 (48h)';
      case 'admin_alert':
        return 'Admin Alert (72h)';
      default:
        return type;
    }
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'reminder_1':
        return <Send className="h-4 w-4" />;
      case 'reminder_2':
        return <Clock className="h-4 w-4" />;
      case 'admin_alert':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'sent' ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Intake Scheduling Automation</CardTitle>
              <CardDescription>
                Automatic reminders for patients who haven't scheduled appointments
              </CardDescription>
            </div>
            <Button onClick={handleManualCheck} disabled={checking}>
              {checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Run Check Now'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Sent</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.reminder1}</div>
              <div className="text-sm text-muted-foreground">Reminder #1</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.reminder2}</div>
              <div className="text-sm text-muted-foreground">Reminder #2</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{stats.adminAlerts}</div>
              <div className="text-sm text-muted-foreground">Admin Alerts</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-medium">How it works:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>24 hours:</strong> First reminder sent to patient - "You're ready to schedule"</li>
              <li>• <strong>48 hours:</strong> Second reminder sent - "We've held space for you"</li>
              <li>• <strong>72 hours:</strong> Admin alert sent - "Please call this patient"</li>
              <li>• Checks run automatically every hour</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reminder History</CardTitle>
          <CardDescription>Last 50 reminders and alerts sent</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reminders sent yet
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      {getReminderIcon(item.reminder_type)}
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {item.intake_forms?.patient_name || 'Unknown Patient'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.intake_forms?.email || 'No email'}
                      </div>
                      {item.error_message && (
                        <div className="text-xs text-red-600 mt-1">
                          Error: {item.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={item.status === 'sent' ? 'default' : 'destructive'}>
                      {getReminderLabel(item.reminder_type)}
                    </Badge>
                    <div className="text-sm text-muted-foreground text-right">
                      {new Date(item.sent_at).toLocaleDateString()}
                      <br />
                      {new Date(item.sent_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};