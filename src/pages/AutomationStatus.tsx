import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Mail, 
  FileText, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  Activity
} from "lucide-react";
import { format } from "date-fns";

interface DeliveryHistory {
  id: string;
  sent_at: string;
  status: string;
  recipient_emails: string[];
  error_message?: string;
}

export default function AutomationStatus() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [comparisonHistory, setComparisonHistory] = useState<DeliveryHistory[]>([]);
  const [referralHistory, setReferralHistory] = useState<DeliveryHistory[]>([]);
  const [outcomeHistory, setOutcomeHistory] = useState<DeliveryHistory[]>([]);
  const [exportHistory, setExportHistory] = useState<any[]>([]);

  useEffect(() => {
    loadDeliveryHistory();
  }, []);

  const loadDeliveryHistory = async () => {
    try {
      // Load comparison report deliveries
      const { data: compData } = await supabase
        .from("comparison_report_deliveries")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(10);

      // Load referral report deliveries (we'll need to check if this table exists)
      const { data: refData } = await supabase
        .from("comparison_report_deliveries")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(10);

      // Load outcome reminder deliveries
      const { data: outData } = await supabase
        .from("outcome_reminder_report_deliveries")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(10);

      // Load export history
      const { data: expData } = await supabase
        .from("export_history")
        .select("*")
        .order("executed_at", { ascending: false })
        .limit(10);

      setComparisonHistory(compData || []);
      setReferralHistory(refData || []);
      setOutcomeHistory(outData || []);
      setExportHistory(expData || []);
    } catch (error: any) {
      toast({
        title: "Failed to Load History",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const schedules = [
    {
      name: "Comparison Reports",
      schedule: "Daily at 9:00 AM",
      icon: TrendingUp,
      color: "text-blue-500",
      lastRun: comparisonHistory[0]?.sent_at,
      status: comparisonHistory[0]?.status,
    },
    {
      name: "Referral Reports",
      schedule: "Daily at 9:15 AM",
      icon: Mail,
      color: "text-purple-500",
      lastRun: referralHistory[0]?.sent_at,
      status: referralHistory[0]?.status,
    },
    {
      name: "Outcome Reminders",
      schedule: "Daily at 8:00 AM",
      icon: Calendar,
      color: "text-green-500",
      lastRun: outcomeHistory[0]?.sent_at,
      status: outcomeHistory[0]?.status,
    },
    {
      name: "Scheduled Exports",
      schedule: "Every hour",
      icon: FileText,
      color: "text-orange-500",
      lastRun: exportHistory[0]?.executed_at,
      status: exportHistory[0]?.status,
    },
    {
      name: "Engagement Reports",
      schedule: "Weekly (Mondays at 9:30 AM)",
      icon: Activity,
      color: "text-pink-500",
      lastRun: null,
      status: "pending",
    },
  ];

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="secondary">Pending</Badge>;
    if (status === "success") return <Badge className="bg-success/15 text-success border-success/30">Success</Badge>;
    if (status === "failed") return <Badge variant="destructive">Failed</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Automation Status</h1>
          <p className="text-muted-foreground mt-2">
            Monitor automated report deliveries and scheduled tasks
          </p>
        </div>

        {/* Active Schedules Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule) => {
            const Icon = schedule.icon;
            return (
              <Card key={schedule.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Icon className={`h-5 w-5 ${schedule.color}`} />
                    {getStatusBadge(schedule.status)}
                  </div>
                  <CardTitle className="text-lg mt-2">{schedule.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {schedule.schedule}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {schedule.lastRun ? (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Last run:</p>
                      <p className="font-medium">
                        {format(new Date(schedule.lastRun), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Waiting for first execution
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed History */}
        <Tabs defaultValue="comparison" className="space-y-4">
          <TabsList>
            <TabsTrigger value="comparison">Comparison Reports</TabsTrigger>
            <TabsTrigger value="referral">Referral Reports</TabsTrigger>
            <TabsTrigger value="outcome">Outcome Reminders</TabsTrigger>
            <TabsTrigger value="exports">Exports</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle>Comparison Report Delivery History</CardTitle>
                <CardDescription>Recent comparison report deliveries</CardDescription>
              </CardHeader>
              <CardContent>
                {comparisonHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No deliveries yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {comparisonHistory.map((delivery) => (
                      <div
                        key={delivery.id}
                        className="flex items-start justify-between p-3 rounded-lg border"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {delivery.status === "success" ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                            <p className="font-medium">
                              {format(new Date(delivery.sent_at), "MMM dd, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Sent to: {delivery.recipient_emails.join(", ")}
                          </p>
                          {delivery.error_message && (
                            <p className="text-sm text-destructive mt-1">
                              Error: {delivery.error_message}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(delivery.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referral">
            <Card>
              <CardHeader>
                <CardTitle>Referral Report Delivery History</CardTitle>
                <CardDescription>Recent referral report deliveries</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Referral report history will appear here once the first automated report runs
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outcome">
            <Card>
              <CardHeader>
                <CardTitle>Outcome Reminder Delivery History</CardTitle>
                <CardDescription>Recent outcome reminder deliveries</CardDescription>
              </CardHeader>
              <CardContent>
                {outcomeHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No deliveries yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {outcomeHistory.map((delivery) => (
                      <div
                        key={delivery.id}
                        className="flex items-start justify-between p-3 rounded-lg border"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {delivery.status === "success" ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                            <p className="font-medium">
                              {format(new Date(delivery.sent_at), "MMM dd, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Sent to: {delivery.recipient_emails.join(", ")}
                          </p>
                        </div>
                        {getStatusBadge(delivery.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exports">
            <Card>
              <CardHeader>
                <CardTitle>Export Execution History</CardTitle>
                <CardDescription>Recent scheduled export executions</CardDescription>
              </CardHeader>
              <CardContent>
                {exportHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No executions yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {exportHistory.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex items-start justify-between p-3 rounded-lg border"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {exp.status === "success" ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                            <p className="font-medium">{exp.export_name}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(exp.executed_at), "MMM dd, yyyy 'at' h:mm a")} • {exp.record_count} records
                          </p>
                        </div>
                        {getStatusBadge(exp.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}