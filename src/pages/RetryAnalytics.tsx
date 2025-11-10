import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCw, TrendingUp, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay, differenceInMinutes } from "date-fns";

interface RetryNotification {
  id: string;
  notification_type: string;
  status: string;
  sent_at: string;
  retry_count: number;
  max_retries: number;
  last_retry_at: string | null;
  error_message: string | null;
  patient_email: string | null;
  patient_phone: string | null;
}

interface DailyRetryStats {
  date: string;
  totalRetries: number;
  successfulRetries: number;
  failedRetries: number;
  avgRetryTime: number;
}

interface RetryAttemptStats {
  attempt: string;
  successful: number;
  failed: number;
  successRate: number;
}

export default function RetryAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>("30");
  const [notifications, setNotifications] = useState<RetryNotification[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyRetryStats[]>([]);
  const [retryAttemptStats, setRetryAttemptStats] = useState<RetryAttemptStats[]>([]);

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

      // Get all notifications that have been retried (retry_count > 0)
      const { data, error } = await supabase
        .from("notifications_history")
        .select("id, notification_type, status, sent_at, retry_count, max_retries, last_retry_at, error_message, patient_email, patient_phone")
        .gte("sent_at", startDate.toISOString())
        .gt("retry_count", 0)
        .order("sent_at", { ascending: true });

      if (error) throw error;

      const notificationData = (data || []) as RetryNotification[];
      setNotifications(notificationData);
      calculateDailyStats(notificationData);
      calculateRetryAttemptStats(notificationData);
    } catch (error: any) {
      console.error("Error loading retry analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDailyStats = (data: RetryNotification[]) => {
    const statsMap = new Map<string, DailyRetryStats>();

    data.forEach((notification) => {
      const date = format(new Date(notification.sent_at), "MMM dd");

      if (!statsMap.has(date)) {
        statsMap.set(date, {
          date,
          totalRetries: 0,
          successfulRetries: 0,
          failedRetries: 0,
          avgRetryTime: 0,
        });
      }

      const stats = statsMap.get(date)!;
      stats.totalRetries += notification.retry_count;

      if (notification.status === "sent" && notification.last_retry_at) {
        stats.successfulRetries++;
        
        // Calculate time to successful retry
        const timeToRetry = differenceInMinutes(
          new Date(notification.last_retry_at),
          new Date(notification.sent_at)
        );
        stats.avgRetryTime = (stats.avgRetryTime * (stats.successfulRetries - 1) + timeToRetry) / stats.successfulRetries;
      } else if (notification.status === "failed") {
        stats.failedRetries++;
      }
    });

    setDailyStats(Array.from(statsMap.values()));
  };

  const calculateRetryAttemptStats = (data: RetryNotification[]) => {
    const attemptStats = new Map<number, { successful: number; failed: number }>();

    data.forEach((notification) => {
      for (let attempt = 1; attempt <= notification.retry_count; attempt++) {
        if (!attemptStats.has(attempt)) {
          attemptStats.set(attempt, { successful: 0, failed: 0 });
        }

        const stats = attemptStats.get(attempt)!;
        
        // If this was the last attempt and it succeeded
        if (attempt === notification.retry_count && notification.status === "sent") {
          stats.successful++;
        } else if (attempt === notification.retry_count && notification.status === "failed") {
          stats.failed++;
        }
      }
    });

    const statsArray: RetryAttemptStats[] = Array.from(attemptStats.entries()).map(([attempt, stats]) => {
      const total = stats.successful + stats.failed;
      const successRate = total > 0 ? (stats.successful / total) * 100 : 0;
      
      return {
        attempt: `Attempt ${attempt}`,
        successful: stats.successful,
        failed: stats.failed,
        successRate: Math.round(successRate),
      };
    });

    setRetryAttemptStats(statsArray);
  };

  const calculateMetrics = () => {
    const totalWithRetries = notifications.length;
    const successfulRetries = notifications.filter((n) => n.status === "sent").length;
    const failedRetries = notifications.filter((n) => n.status === "failed").length;
    const totalRetryAttempts = notifications.reduce((sum, n) => sum + n.retry_count, 0);
    
    // Calculate average time to successful retry
    const successfulWithTime = notifications.filter((n) => n.status === "sent" && n.last_retry_at);
    const avgRetryTime = successfulWithTime.length > 0
      ? successfulWithTime.reduce((sum, n) => {
          const minutes = differenceInMinutes(
            new Date(n.last_retry_at!),
            new Date(n.sent_at)
          );
          return sum + minutes;
        }, 0) / successfulWithTime.length
      : 0;

    // Retry success rate
    const retrySuccessRate = totalWithRetries > 0 
      ? ((successfulRetries / totalWithRetries) * 100).toFixed(1)
      : "0.0";

    // Failed notifications by type
    const emailRetries = notifications.filter((n) => n.patient_email).length;
    const smsRetries = notifications.filter((n) => n.patient_phone && !n.patient_email).length;
    const emailSuccess = notifications.filter((n) => n.patient_email && n.status === "sent").length;
    const smsSuccess = notifications.filter((n) => n.patient_phone && !n.patient_email && n.status === "sent").length;

    const emailRetryRate = emailRetries > 0 ? ((emailSuccess / emailRetries) * 100).toFixed(1) : "0.0";
    const smsRetryRate = smsRetries > 0 ? ((smsSuccess / smsRetries) * 100).toFixed(1) : "0.0";

    // Most common failure reasons
    const errorMap = new Map<string, number>();
    notifications.filter(n => n.status === "failed" && n.error_message).forEach(n => {
      const error = n.error_message || "Unknown error";
      errorMap.set(error, (errorMap.get(error) || 0) + 1);
    });

    const topErrors = Array.from(errorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }));

    return {
      totalWithRetries,
      successfulRetries,
      failedRetries,
      totalRetryAttempts,
      avgRetryTime: Math.round(avgRetryTime),
      retrySuccessRate,
      emailRetries,
      smsRetries,
      emailSuccess,
      smsSuccess,
      emailRetryRate,
      smsRetryRate,
      topErrors,
    };
  };

  const metrics = calculateMetrics();

  const failureReasonData = metrics.topErrors.map((item, index) => ({
    name: item.error.substring(0, 30) + (item.error.length > 30 ? "..." : ""),
    value: item.count,
    color: ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16"][index],
  }));

  const typeRetryData = [
    { name: "Email Retries", success: metrics.emailSuccess, failed: metrics.emailRetries - metrics.emailSuccess, rate: parseFloat(metrics.emailRetryRate) },
    { name: "SMS Retries", success: metrics.smsSuccess, failed: metrics.smsRetries - metrics.smsSuccess, rate: parseFloat(metrics.smsRetryRate) },
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
          <h1 className="text-3xl font-bold">Retry Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track retry success rates, patterns, and performance metrics
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
        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Retry Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.retrySuccessRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.successfulRetries} of {metrics.totalWithRetries} succeeded
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Retry Attempts</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.totalRetryAttempts}</div>
            <p className="text-xs text-muted-foreground">
              Across {metrics.totalWithRetries} notifications
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Time to Success</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.avgRetryTime} min</div>
            <p className="text-xs text-muted-foreground">
              Average retry resolution time
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed After Retries</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.failedRetries}</div>
            <p className="text-xs text-muted-foreground">
              Exhausted all retry attempts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Retry Performance by Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Email Retry Success</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.emailRetryRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.emailSuccess} of {metrics.emailRetries} email retries succeeded
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SMS Retry Success</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.smsRetryRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.smsSuccess} of {metrics.smsRetries} SMS retries succeeded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Retry Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-orange-500" />
              Daily Retry Activity
            </CardTitle>
            <CardDescription>
              Successful vs failed retries over time
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
                <Line 
                  type="monotone" 
                  dataKey="successfulRetries" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  name="Successful" 
                />
                <Line 
                  type="monotone" 
                  dataKey="failedRetries" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  name="Failed" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Retry Time Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              Average Time to Success
            </CardTitle>
            <CardDescription>
              Resolution time in minutes by day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgRetryTime" fill="#10b981" name="Avg Time (min)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retry Attempt Success Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Success Rate by Retry Attempt
            </CardTitle>
            <CardDescription>
              Which retry attempts are most effective
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={retryAttemptStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="attempt" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="successful" fill="#10b981" name="Successful" stackId="a" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Failure Reasons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Top Failure Reasons
            </CardTitle>
            <CardDescription>
              Most common errors after retry exhaustion
            </CardDescription>
          </CardHeader>
          <CardContent>
            {failureReasonData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={failureReasonData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {failureReasonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No failure data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Retry Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Retry Performance by Channel
          </CardTitle>
          <CardDescription>
            Email vs SMS retry effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeRetryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="success" fill="#10b981" name="Successful" />
              <Bar dataKey="failed" fill="#ef4444" name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Error Details Table */}
      {metrics.topErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Error Messages</CardTitle>
            <CardDescription>
              Most frequent failure reasons after retries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.topErrors.map((error, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{error.error}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-red-600">{error.count}</span>
                    <span className="text-xs text-muted-foreground">occurrences</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
