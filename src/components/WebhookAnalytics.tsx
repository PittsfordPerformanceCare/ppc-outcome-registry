import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, TrendingUp, TrendingDown, Activity, Clock, CheckCircle2, XCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface WebhookStats {
  webhook_name: string;
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  timeout_calls: number;
  success_rate: number;
  avg_duration: number;
  last_called: string;
}

interface TimeSeriesData {
  date: string;
  success: number;
  failed: number;
  timeout: number;
  success_rate: number;
}

export function WebhookAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7");
  const [overallStats, setOverallStats] = useState({
    total_calls: 0,
    success_rate: 0,
    avg_response_time: 0,
    total_webhooks: 0,
  });
  const [webhookStats, setWebhookStats] = useState<WebhookStats[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const daysAgo = parseInt(timeRange);
      const startDate = startOfDay(subDays(new Date(), daysAgo));

      // Get all activity logs for the time range
      const { data: logs, error } = await supabase
        .from('webhook_activity_log')
        .select('*')
        .gte('triggered_at', startDate.toISOString())
        .order('triggered_at', { ascending: true });

      if (error) throw error;

      if (!logs || logs.length === 0) {
        setOverallStats({
          total_calls: 0,
          success_rate: 0,
          avg_response_time: 0,
          total_webhooks: 0,
        });
        setWebhookStats([]);
        setTimeSeriesData([]);
        setLoading(false);
        return;
      }

      // Calculate overall stats
      const totalCalls = logs.length;
      const successfulCalls = logs.filter(l => l.status === 'success').length;
      const successRate = (successfulCalls / totalCalls) * 100;
      const avgResponseTime = logs.reduce((sum, l) => sum + (l.duration_ms || 0), 0) / totalCalls;
      const uniqueWebhooks = new Set(logs.map(l => l.webhook_name)).size;

      setOverallStats({
        total_calls: totalCalls,
        success_rate: Math.round(successRate * 10) / 10,
        avg_response_time: Math.round(avgResponseTime),
        total_webhooks: uniqueWebhooks,
      });

      // Calculate per-webhook stats
      const webhookMap = new Map<string, any>();
      logs.forEach(log => {
        const existing = webhookMap.get(log.webhook_name) || {
          webhook_name: log.webhook_name,
          total_calls: 0,
          successful_calls: 0,
          failed_calls: 0,
          timeout_calls: 0,
          total_duration: 0,
          last_called: log.triggered_at,
        };

        existing.total_calls++;
        if (log.status === 'success') existing.successful_calls++;
        if (log.status === 'failed') existing.failed_calls++;
        if (log.status === 'timeout') existing.timeout_calls++;
        existing.total_duration += log.duration_ms || 0;
        if (new Date(log.triggered_at) > new Date(existing.last_called)) {
          existing.last_called = log.triggered_at;
        }

        webhookMap.set(log.webhook_name, existing);
      });

      const webhookStatsArray: WebhookStats[] = Array.from(webhookMap.values()).map(w => ({
        webhook_name: w.webhook_name,
        total_calls: w.total_calls,
        successful_calls: w.successful_calls,
        failed_calls: w.failed_calls,
        timeout_calls: w.timeout_calls,
        success_rate: (w.successful_calls / w.total_calls) * 100,
        avg_duration: Math.round(w.total_duration / w.total_calls),
        last_called: w.last_called,
      }));

      // Sort by success rate descending
      webhookStatsArray.sort((a, b) => b.success_rate - a.success_rate);
      setWebhookStats(webhookStatsArray);

      // Calculate time series data (group by day)
      const dailyMap = new Map<string, any>();
      logs.forEach(log => {
        const dateKey = format(new Date(log.triggered_at), 'MMM dd');
        const existing = dailyMap.get(dateKey) || {
          date: dateKey,
          success: 0,
          failed: 0,
          timeout: 0,
          total: 0,
        };

        existing.total++;
        if (log.status === 'success') existing.success++;
        if (log.status === 'failed') existing.failed++;
        if (log.status === 'timeout') existing.timeout++;

        dailyMap.set(dateKey, existing);
      });

      const timeSeriesArray: TimeSeriesData[] = Array.from(dailyMap.values()).map(d => ({
        date: d.date,
        success: d.success,
        failed: d.failed,
        timeout: d.timeout,
        success_rate: Math.round((d.success / d.total) * 100),
      }));

      setTimeSeriesData(timeSeriesArray);

    } catch (error: any) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load webhook analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [user, timeRange]);

  const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  const pieData = [
    { name: 'Success', value: webhookStats.reduce((sum, w) => sum + w.successful_calls, 0), color: '#10b981' },
    { name: 'Failed', value: webhookStats.reduce((sum, w) => sum + w.failed_calls, 0), color: '#ef4444' },
    { name: 'Timeout', value: webhookStats.reduce((sum, w) => sum + w.timeout_calls, 0), color: '#f59e0b' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Webhook Analytics</h2>
          <p className="text-muted-foreground">Performance metrics and trends</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3" />
          Loading analytics...
        </div>
      ) : overallStats.total_calls === 0 ? (
        <Card className="p-12 text-center">
          <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No webhook activity in the selected time range</p>
        </Card>
      ) : (
        <>
          {/* Overall Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallStats.total_calls.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Across {overallStats.total_webhooks} webhook{overallStats.total_webhooks !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                {overallStats.success_rate >= 90 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallStats.success_rate}%</div>
                <p className="text-xs text-muted-foreground">
                  {overallStats.success_rate >= 95 ? 'Excellent' : overallStats.success_rate >= 80 ? 'Good' : 'Needs attention'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallStats.avg_response_time}ms</div>
                <p className="text-xs text-muted-foreground">
                  {overallStats.avg_response_time < 1000 ? 'Fast' : overallStats.avg_response_time < 3000 ? 'Normal' : 'Slow'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 text-sm">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    {Math.round(overallStats.success_rate)}%
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-red-600" />
                    {Math.round(100 - overallStats.success_rate)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Success Rate Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Success Rate Trend</CardTitle>
                <CardDescription>Daily success rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="success_rate" stroke="#10b981" strokeWidth={2} name="Success Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Call Volume Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Call Volume Trend</CardTitle>
                <CardDescription>Daily webhook calls by status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="success" fill="#10b981" name="Success" stackId="a" />
                    <Bar dataKey="failed" fill="#ef4444" name="Failed" stackId="a" />
                    <Bar dataKey="timeout" fill="#f59e0b" name="Timeout" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Webhook Performance Comparison */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Most Reliable Webhooks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Most Reliable Webhooks
                </CardTitle>
                <CardDescription>Highest success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {webhookStats.slice(0, 5).map((webhook, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{webhook.webhook_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {webhook.total_calls} calls • {webhook.avg_duration}ms avg
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <div className="text-lg font-bold text-green-600">{Math.round(webhook.success_rate)}%</div>
                        <div className="text-xs text-muted-foreground">success</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Problematic Webhooks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Needs Attention
                </CardTitle>
                <CardDescription>Webhooks with lower success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {webhookStats.slice().reverse().slice(0, 5).map((webhook, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{webhook.webhook_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {webhook.failed_calls + webhook.timeout_calls} failures • {webhook.total_calls} total
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <div className="text-lg font-bold text-red-600">{Math.round(webhook.success_rate)}%</div>
                        <div className="text-xs text-muted-foreground">success</div>
                      </div>
                    </div>
                  ))}
                  {webhookStats.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      All webhooks performing well!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Response Time Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Average Response Times</CardTitle>
              <CardDescription>Performance comparison across all webhooks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={webhookStats} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: 'Response Time (ms)', position: 'bottom' }} />
                  <YAxis type="category" dataKey="webhook_name" width={150} />
                  <Tooltip />
                  <Bar dataKey="avg_duration" fill="#3b82f6" name="Avg Response Time (ms)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
