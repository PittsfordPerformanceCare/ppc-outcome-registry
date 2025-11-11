import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, TrendingUp, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface WebhookHealth {
  id: string;
  name: string;
  url: string;
  status: 'operational' | 'degraded' | 'down';
  uptime24h: number;
  uptime7d: number;
  uptime30d: number;
  successRate: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  totalCalls24h: number;
  lastCallAt: string | null;
  enabled: boolean;
}

export function WebhookHealthDashboard() {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<WebhookHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallUptime, setOverallUptime] = useState(0);

  const loadHealthMetrics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch webhook configs
      const { data: configs, error: configError } = await supabase
        .from('zapier_webhook_config')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (configError) throw configError;

      if (!configs || configs.length === 0) {
        setWebhooks([]);
        return;
      }

      // Fetch activity logs for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: logs, error: logsError } = await supabase
        .from('webhook_activity_log')
        .select('*')
        .eq('user_id', user.id)
        .gte('triggered_at', thirtyDaysAgo.toISOString())
        .order('triggered_at', { ascending: false });

      if (logsError) throw logsError;

      // Calculate metrics for each webhook
      const healthMetrics = configs.map(config => {
        const webhookLogs = logs?.filter(log => log.webhook_config_id === config.id) || [];
        
        // Calculate time windows
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30d = thirtyDaysAgo;

        const logs24h = webhookLogs.filter(log => new Date(log.triggered_at) >= last24h);
        const logs7d = webhookLogs.filter(log => new Date(log.triggered_at) >= last7d);
        const logs30d = webhookLogs;

        // Calculate uptime percentages
        const calcUptime = (logs: any[]) => {
          if (logs.length === 0) return 100;
          const successful = logs.filter(log => log.status === 'success').length;
          return (successful / logs.length) * 100;
        };

        const uptime24h = calcUptime(logs24h);
        const uptime7d = calcUptime(logs7d);
        const uptime30d = calcUptime(logs30d);

        // Calculate response time percentiles
        const responseTimes = logs24h
          .filter(log => log.duration_ms !== null)
          .map(log => log.duration_ms)
          .sort((a, b) => a - b);

        const avgResponseTime = responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          : 0;

        const p95ResponseTime = responseTimes.length > 0
          ? responseTimes[Math.floor(responseTimes.length * 0.95)]
          : 0;

        const p99ResponseTime = responseTimes.length > 0
          ? responseTimes[Math.floor(responseTimes.length * 0.99)]
          : 0;

        // Determine status
        let status: 'operational' | 'degraded' | 'down' = 'operational';
        if (uptime24h < 95) status = 'down';
        else if (uptime24h < 99) status = 'degraded';

        if (!config.enabled) status = 'down';

        return {
          id: config.id,
          name: config.name,
          url: config.webhook_url,
          status,
          uptime24h,
          uptime7d,
          uptime30d,
          successRate: uptime24h,
          avgResponseTime,
          p95ResponseTime,
          p99ResponseTime,
          totalCalls24h: logs24h.length,
          lastCallAt: logs24h[0]?.triggered_at || null,
          enabled: config.enabled,
        };
      });

      setWebhooks(healthMetrics);

      // Calculate overall uptime
      if (healthMetrics.length > 0) {
        const avgUptime = healthMetrics.reduce((sum, w) => sum + w.uptime24h, 0) / healthMetrics.length;
        setOverallUptime(avgUptime);
      } else {
        setOverallUptime(100);
      }
    } catch (error) {
      console.error('Error loading health metrics:', error);
      toast.error('Failed to load webhook health metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealthMetrics();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Operational</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500"><AlertCircle className="w-3 h-3 mr-1" /> Degraded</Badge>;
      case 'down':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Down</Badge>;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatUptime = (uptime: number) => uptime.toFixed(2) + '%';
  const formatResponseTime = (ms: number) => ms.toFixed(0) + 'ms';

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Health Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Overall System Health</CardTitle>
            <CardDescription>Aggregated metrics across all webhooks</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadHealthMetrics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Overall Uptime (24h)</p>
              <p className="text-3xl font-bold">{formatUptime(overallUptime)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Webhooks</p>
              <p className="text-3xl font-bold">{webhooks.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Operational</p>
              <p className="text-3xl font-bold text-green-500">
                {webhooks.filter(w => w.status === 'operational').length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Issues</p>
              <p className="text-3xl font-bold text-red-500">
                {webhooks.filter(w => w.status !== 'operational').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Webhook Health */}
      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No webhooks configured yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map(webhook => (
            <Card key={webhook.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(webhook.status)} animate-pulse`} />
                      <CardTitle className="text-lg">{webhook.name}</CardTitle>
                      {getStatusBadge(webhook.status)}
                      {!webhook.enabled && <Badge variant="outline">Disabled</Badge>}
                    </div>
                    <CardDescription className="font-mono text-xs">{webhook.url}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Uptime Metrics */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Uptime SLA
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Last 24 Hours</p>
                        <p className="text-2xl font-bold">{formatUptime(webhook.uptime24h)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Last 7 Days</p>
                        <p className="text-2xl font-bold">{formatUptime(webhook.uptime7d)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Last 30 Days</p>
                        <p className="text-2xl font-bold">{formatUptime(webhook.uptime30d)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Response Time (24h)
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Average</p>
                        <p className="text-2xl font-bold">{formatResponseTime(webhook.avgResponseTime)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">P95</p>
                        <p className="text-2xl font-bold">{formatResponseTime(webhook.p95ResponseTime)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">P99</p>
                        <p className="text-2xl font-bold">{formatResponseTime(webhook.p99ResponseTime)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Activity Metrics */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Activity (24h)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Total Calls</p>
                        <p className="text-2xl font-bold">{webhook.totalCalls24h}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Last Call</p>
                        <p className="text-sm">
                          {webhook.lastCallAt
                            ? new Date(webhook.lastCallAt).toLocaleString()
                            : 'No recent calls'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
