import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Mail, MousePointerClick, Eye, TrendingUp, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TemplateStats {
  template_id: string;
  template_name: string;
  template_type: "predefined" | "custom";
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  open_rate: number;
  click_rate: number;
  last_used: string;
}

export function EmailTemplateAnalytics() {
  const [stats, setStats] = useState<TemplateStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90" | "all">("30");
  const { user } = useAuth();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      if (!profile?.clinic_id) {
        setLoading(false);
        return;
      }

      // Calculate date filter
      let dateFilter = "";
      if (timeRange !== "all") {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
        dateFilter = daysAgo.toISOString();
      }

      // Fetch template usage with engagement data
      let query = supabase
        .from("email_template_usage")
        .select(`
          template_id,
          template_name,
          template_type,
          sent_at,
          notification_id
        `)
        .eq("clinic_id", profile.clinic_id);

      if (dateFilter) {
        query = query.gte("sent_at", dateFilter);
      }

      const { data: usageData, error: usageError } = await query;

      if (usageError) throw usageError;

      if (!usageData || usageData.length === 0) {
        setStats([]);
        setLoading(false);
        return;
      }

      // Get notification IDs to fetch engagement metrics
      const notificationIds = usageData
        .map(u => u.notification_id)
        .filter(Boolean);

      // Fetch engagement metrics
      const { data: notifications } = await supabase
        .from("notifications_history")
        .select("id, open_count, click_count")
        .in("id", notificationIds);

      // Create a map of notification metrics
      const notificationMetrics = new Map(
        notifications?.map(n => [n.id, { opens: n.open_count || 0, clicks: n.click_count || 0 }]) || []
      );

      // Aggregate stats by template
      const templateMap = new Map<string, TemplateStats>();

      usageData.forEach(usage => {
        const key = usage.template_id;
        const metrics = usage.notification_id ? notificationMetrics.get(usage.notification_id) : null;

        if (!templateMap.has(key)) {
          templateMap.set(key, {
            template_id: usage.template_id,
            template_name: usage.template_name,
            template_type: usage.template_type as "predefined" | "custom",
            total_sent: 0,
            total_opened: 0,
            total_clicked: 0,
            open_rate: 0,
            click_rate: 0,
            last_used: usage.sent_at,
          });
        }

        const stat = templateMap.get(key)!;
        stat.total_sent++;
        if (metrics) {
          stat.total_opened += metrics.opens > 0 ? 1 : 0;
          stat.total_clicked += metrics.clicks > 0 ? 1 : 0;
        }
        if (new Date(usage.sent_at) > new Date(stat.last_used)) {
          stat.last_used = usage.sent_at;
        }
      });

      // Calculate rates
      const finalStats = Array.from(templateMap.values()).map(stat => ({
        ...stat,
        open_rate: stat.total_sent > 0 ? (stat.total_opened / stat.total_sent) * 100 : 0,
        click_rate: stat.total_sent > 0 ? (stat.total_clicked / stat.total_sent) * 100 : 0,
      }));

      // Sort by total sent
      finalStats.sort((a, b) => b.total_sent - a.total_sent);

      setStats(finalStats);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 50) return "text-green-600 dark:text-green-400";
    if (rate >= 30) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Email Template Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Email Template Analytics
          </CardTitle>
          <CardDescription>
            Track performance metrics for your email templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No template usage data yet. Start sending emails to see analytics.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const totals = stats.reduce(
    (acc, stat) => ({
      sent: acc.sent + stat.total_sent,
      opened: acc.opened + stat.total_opened,
      clicked: acc.clicked + stat.total_clicked,
    }),
    { sent: 0, opened: 0, clicked: 0 }
  );

  const avgOpenRate = totals.sent > 0 ? (totals.opened / totals.sent) * 100 : 0;
  const avgClickRate = totals.sent > 0 ? (totals.clicked / totals.sent) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Email Template Analytics
            </CardTitle>
            <CardDescription>
              Track performance metrics for your email templates
            </CardDescription>
          </div>
          <Tabs value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <TabsList>
              <TabsTrigger value="7">7d</TabsTrigger>
              <TabsTrigger value="30">30d</TabsTrigger>
              <TabsTrigger value="90">90d</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Mail className="h-4 w-4" />
                <span className="text-sm">Total Sent</span>
              </div>
              <p className="text-3xl font-bold">{totals.sent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Eye className="h-4 w-4" />
                <span className="text-sm">Avg Open Rate</span>
              </div>
              <p className={`text-3xl font-bold ${getEngagementColor(avgOpenRate)}`}>
                {avgOpenRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MousePointerClick className="h-4 w-4" />
                <span className="text-sm">Avg Click Rate</span>
              </div>
              <p className={`text-3xl font-bold ${getEngagementColor(avgClickRate)}`}>
                {avgClickRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Templates</span>
              </div>
              <p className="text-3xl font-bold">{stats.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Template Performance Table */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Template Performance</h3>
          <ScrollArea className="h-[500px] rounded-md border">
            <div className="p-4 space-y-3">
              {stats.map((stat) => (
                <Card key={stat.template_id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{stat.template_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={stat.template_type === "custom" ? "default" : "secondary"}>
                            {stat.template_type === "custom" ? "Custom" : "Predefined"}
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Last used: {formatDate(stat.last_used)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Sent</p>
                        <p className="text-2xl font-bold">{stat.total_sent}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Opened</p>
                        <p className="text-2xl font-bold">{stat.total_opened}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Open Rate</p>
                        <p className={`text-2xl font-bold ${getEngagementColor(stat.open_rate)}`}>
                          {stat.open_rate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Click Rate</p>
                        <p className={`text-2xl font-bold ${getEngagementColor(stat.click_rate)}`}>
                          {stat.click_rate.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Progress bars */}
                    <div className="mt-4 space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Open Rate</span>
                          <span>{stat.open_rate.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${Math.min(stat.open_rate, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Click Rate</span>
                          <span>{stat.click_rate.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all"
                            style={{ width: `${Math.min(stat.click_rate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
