import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertTriangle, TrendingUp, Mail, MessageSquare } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

interface AlertHistory {
  id: string;
  triggered_at: string;
  failure_rate: number;
  total_notifications: number;
  failed_notifications: number;
  alert_sent_to: string[];
  alert_details: any;
}

export default function AlertHistory() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<AlertHistory[]>([]);
  const [dateRange, setDateRange] = useState<string>("30");

  useEffect(() => {
    if (user) {
      loadAlertHistory();
    }
  }, [user, dateRange]);

  const loadAlertHistory = async () => {
    setLoading(true);
    try {
      const daysAgo = parseInt(dateRange);
      const startDate = startOfDay(subDays(new Date(), daysAgo));

      const { data, error } = await supabase
        .from("notification_alert_history")
        .select("*")
        .gte("triggered_at", startDate.toISOString())
        .order("triggered_at", { ascending: false });

      if (error) throw error;

      setAlerts((data || []) as AlertHistory[]);
    } catch (error: any) {
      console.error("Error loading alert history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (failureRate: number) => {
    if (failureRate >= 50) return "text-red-600 bg-red-50";
    if (failureRate >= 30) return "text-orange-600 bg-orange-50";
    return "text-yellow-600 bg-yellow-50";
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alert History</h1>
          <p className="text-muted-foreground mt-2">
            View notification failure alerts and their details
          </p>
        </div>
        
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="14">Last 14 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="60">Last 60 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Triggered in selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Failure Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.length > 0
                ? (alerts.reduce((sum, a) => sum + a.failure_rate, 0) / alerts.length).toFixed(1)
                : '0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Failures</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alerts.reduce((sum, a) => sum + a.failed_notifications, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Failed notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recipients Notified</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(alerts.flatMap(a => a.alert_sent_to)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique email addresses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Details</CardTitle>
          <CardDescription>
            Showing {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Triggered At</TableHead>
                  <TableHead>Failure Rate</TableHead>
                  <TableHead>Total / Failed</TableHead>
                  <TableHead>Email Stats</TableHead>
                  <TableHead>SMS Stats</TableHead>
                  <TableHead>Recipients</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No alerts triggered in the selected period
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {format(new Date(alert.triggered_at), "MMM dd, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(alert.triggered_at), "h:mm a")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {alert.alert_details?.window_hours}h window
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(alert.failure_rate)}>
                          {alert.failure_rate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-semibold">{alert.total_notifications}</span> total
                        </div>
                        <div className="text-sm text-red-600">
                          <span className="font-semibold">{alert.failed_notifications}</span> failed
                        </div>
                      </TableCell>
                      <TableCell>
                        {alert.alert_details ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-blue-500" />
                              <span className="font-medium">
                                {alert.alert_details.email_failure_rate}%
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {alert.alert_details.email_failures} / {alert.alert_details.email_total}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {alert.alert_details ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <MessageSquare className="h-3 w-3 text-purple-500" />
                              <span className="font-medium">
                                {alert.alert_details.sms_failure_rate}%
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {alert.alert_details.sms_failures} / {alert.alert_details.sms_total}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {alert.alert_sent_to.map((email) => (
                            <Badge key={email} variant="outline" className="text-xs">
                              {email}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
