import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, Mail, MessageSquare, CheckCircle, XCircle, BarChart3, Activity } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface NotificationRecord {
  id: string;
  notification_type: 'email' | 'sms';
  status: 'sent' | 'failed' | 'pending';
  sent_at: string;
  opened_at: string | null;
  open_count: number | null;
}

interface DailyStats {
  date: string;
  total: number;
  sent: number;
  failed: number;
  email: number;
  sms: number;
}

export default function NotificationAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>("30");
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const daysAgo = parseInt(dateRange);
      const startDate = startOfDay(subDays(new Date(), daysAgo));

      const { data, error } = await supabase
        .from("notifications_history")
        .select("id, notification_type, status, sent_at, opened_at, open_count")
        .gte("sent_at", startDate.toISOString())
        .order("sent_at", { ascending: true });

      if (error) throw error;

      setNotifications((data || []) as NotificationRecord[]);
      calculateDailyStats((data || []) as NotificationRecord[]);
    } catch (error: any) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDailyStats = (data: NotificationRecord[]) => {
    const statsMap = new Map<string, DailyStats>();
    
    data.forEach((notification) => {
      const date = format(new Date(notification.sent_at), "MMM dd");
      
      if (!statsMap.has(date)) {
        statsMap.set(date, {
          date,
          total: 0,
          sent: 0,
          failed: 0,
          email: 0,
          sms: 0,
        });
      }
      
      const stats = statsMap.get(date)!;
      stats.total++;
      
      if (notification.status === "sent") stats.sent++;
      if (notification.status === "failed") stats.failed++;
      if (notification.notification_type === "email") stats.email++;
      if (notification.notification_type === "sms") stats.sms++;
    });

    setDailyStats(Array.from(statsMap.values()));
  };

  const calculateMetrics = () => {
    const total = notifications.length;
    const sent = notifications.filter((n) => n.status === "sent").length;
    const failed = notifications.filter((n) => n.status === "failed").length;
    const emails = notifications.filter((n) => n.notification_type === "email").length;
    const sms = notifications.filter((n) => n.notification_type === "sms").length;
    const emailsSent = notifications.filter((n) => n.notification_type === "email" && n.status === "sent").length;
    const smsSent = notifications.filter((n) => n.notification_type === "sms" && n.status === "sent").length;
    
    // Calculate email open rate
    const emailsOpened = notifications.filter((n) => n.notification_type === "email" && n.opened_at).length;
    const emailOpenRate = emailsSent > 0 ? ((emailsOpened / emailsSent) * 100).toFixed(1) : "0.0";

    const deliveryRate = total > 0 ? ((sent / total) * 100).toFixed(1) : "0.0";
    const emailDeliveryRate = emails > 0 ? ((emailsSent / emails) * 100).toFixed(1) : "0.0";
    const smsDeliveryRate = sms > 0 ? ((smsSent / sms) * 100).toFixed(1) : "0.0";

    return {
      total,
      sent,
      failed,
      emails,
      sms,
      emailsSent,
      smsSent,
      emailsOpened,
      deliveryRate,
      emailDeliveryRate,
      smsDeliveryRate,
      emailOpenRate,
    };
  };

  const metrics = calculateMetrics();

  const statusData = [
    { name: "Sent", value: metrics.sent, color: "#10b981" },
    { name: "Failed", value: metrics.failed, color: "#ef4444" },
  ];

  const typeData = [
    { name: "Email", value: metrics.emails, color: "#3b82f6" },
    { name: "SMS", value: metrics.sms, color: "#8b5cf6" },
  ];

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
          <h1 className="text-3xl font-bold">Notification Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track delivery rates, trends, and performance metrics
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.emails} emails, {metrics.sms} SMS
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.deliveryRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.sent} successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Email Success</CardTitle>
            <Mail className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.emailDeliveryRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.emailsSent} of {metrics.emails} delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SMS Success</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.smsDeliveryRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.smsSent} of {metrics.sms} delivered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Email Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Email Open Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.emailOpenRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.emailsOpened} of {metrics.emailsSent} emails opened
            </p>
            <p className="text-xs text-blue-600 mt-2 font-medium">
              Tracked via pixel analytics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Email Deliveries</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.emailsSent}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered emails
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SMS Deliveries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.smsSent}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered SMS
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Volume Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Daily Volume
            </CardTitle>
            <CardDescription>
              Number of notifications sent each day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} name="Total" />
                <Line type="monotone" dataKey="sent" stroke="#10b981" strokeWidth={2} name="Sent" />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Failed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Email vs SMS Volume
            </CardTitle>
            <CardDescription>
              Daily breakdown by notification type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="email" fill="#3b82f6" name="Email" />
                <Bar dataKey="sms" fill="#8b5cf6" name="SMS" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Delivery Status
            </CardTitle>
            <CardDescription>
              Overall success vs failure rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Type Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Notification Type Distribution
            </CardTitle>
            <CardDescription>
              Email vs SMS breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>
            Detailed breakdown of notification performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Notifications</p>
                <p className="text-2xl font-bold">{metrics.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Successfully Sent</p>
                <p className="text-2xl font-bold text-green-600">{metrics.sent}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{metrics.failed}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.deliveryRate}%</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">By Type</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Email</span>
                  </div>
                  <div className="pl-6 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">{metrics.emails}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivered:</span>
                      <span className="font-medium text-green-600">{metrics.emailsSent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Success Rate:</span>
                      <span className="font-medium text-blue-600">{metrics.emailDeliveryRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">SMS</span>
                  </div>
                  <div className="pl-6 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">{metrics.sms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivered:</span>
                      <span className="font-medium text-green-600">{metrics.smsSent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Success Rate:</span>
                      <span className="font-medium text-purple-600">{metrics.smsDeliveryRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
