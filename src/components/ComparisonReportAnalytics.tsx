import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { TrendingUp, Mail, MousePointerClick, Eye, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EngagementMetrics {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

interface OverallMetrics {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  avgOpenRate: number;
  avgClickRate: number;
}

export function ComparisonReportAnalytics() {
  const [metrics, setMetrics] = useState<EngagementMetrics[]>([]);
  const [overall, setOverall] = useState<OverallMetrics>({
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const days = parseInt(timeRange);
      const startDate = startOfDay(subDays(new Date(), days));
      const endDate = endOfDay(new Date());

      const { data, error } = await supabase
        .from('comparison_report_deliveries')
        .select('*')
        .gte('sent_at', startDate.toISOString())
        .lte('sent_at', endDate.toISOString())
        .eq('status', 'success')
        .order('sent_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const dailyMetrics = new Map<string, { sent: number; opened: number; clicked: number }>();
      
      (data || []).forEach((delivery: any) => {
        const date = format(new Date(delivery.sent_at), 'MMM dd');
        const existing = dailyMetrics.get(date) || { sent: 0, opened: 0, clicked: 0 };
        
        existing.sent += 1;
        if (delivery.open_count > 0) existing.opened += 1;
        if (delivery.click_count > 0) existing.clicked += 1;
        
        dailyMetrics.set(date, existing);
      });

      // Convert to array and calculate rates
      const metricsArray: EngagementMetrics[] = Array.from(dailyMetrics.entries()).map(([date, stats]) => ({
        date,
        sent: stats.sent,
        opened: stats.opened,
        clicked: stats.clicked,
        openRate: stats.sent > 0 ? Math.round((stats.opened / stats.sent) * 100) : 0,
        clickRate: stats.sent > 0 ? Math.round((stats.clicked / stats.sent) * 100) : 0,
      }));

      setMetrics(metricsArray);

      // Calculate overall metrics
      const totalSent = data?.length || 0;
      const totalOpened = data?.filter((d: any) => d.open_count > 0).length || 0;
      const totalClicked = data?.filter((d: any) => d.click_count > 0).length || 0;

      setOverall({
        totalSent,
        totalOpened,
        totalClicked,
        avgOpenRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
        avgClickRate: totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-20 bg-muted rounded" />
            </Card>
          ))}
        </div>
        <Card className="p-6 animate-pulse">
          <div className="h-64 bg-muted rounded" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Engagement Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Track open rates and click-through rates for comparison reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overall Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sent</p>
              <p className="text-2xl font-bold mt-1">{overall.totalSent}</p>
            </div>
            <Mail className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Opened</p>
              <p className="text-2xl font-bold mt-1">{overall.totalOpened}</p>
            </div>
            <Eye className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Clicked</p>
              <p className="text-2xl font-bold mt-1">{overall.totalClicked}</p>
            </div>
            <MousePointerClick className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Open Rate</p>
              <p className="text-2xl font-bold mt-1 text-primary">{overall.avgOpenRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Click Rate</p>
              <p className="text-2xl font-bold mt-1 text-primary">{overall.avgClickRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary opacity-50" />
          </div>
        </Card>
      </div>

      {metrics.length === 0 ? (
        <Card className="p-12 text-center">
          <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No data available for the selected time range</p>
          <p className="text-sm text-muted-foreground mt-1">
            Send some comparison reports to see engagement analytics
          </p>
        </Card>
      ) : (
        <>
          {/* Engagement Rate Trends */}
          <Card className="p-6">
            <h4 className="text-sm font-semibold mb-4">Engagement Rate Trends</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="openRate" 
                  name="Open Rate (%)"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="clickRate" 
                  name="Click Rate (%)"
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-2))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Volume Metrics */}
          <Card className="p-6">
            <h4 className="text-sm font-semibold mb-4">Email Volume & Engagement</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="sent" name="Sent" fill="hsl(var(--muted))" />
                <Bar dataKey="opened" name="Opened" fill="hsl(var(--primary))" />
                <Bar dataKey="clicked" name="Clicked" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  );
}
