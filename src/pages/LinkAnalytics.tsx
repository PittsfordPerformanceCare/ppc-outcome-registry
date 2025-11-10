import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ExternalLink, TrendingUp, MousePointerClick, Users, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { format, subDays, startOfDay } from "date-fns";

interface LinkClick {
  id: string;
  notification_id: string;
  link_url: string;
  link_label: string | null;
  clicked_at: string;
}

interface LinkMetrics {
  url: string;
  label: string | null;
  totalClicks: number;
  uniqueNotifications: number;
  firstClicked: string;
  lastClicked: string;
  hourlyDistribution: { [hour: number]: number };
}

export default function LinkAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clicks, setClicks] = useState<LinkClick[]>([]);
  const [dateRange, setDateRange] = useState<string>("30");
  const [linkMetrics, setLinkMetrics] = useState<LinkMetrics[]>([]);

  useEffect(() => {
    if (user) {
      loadLinkAnalytics();
    }
  }, [user, dateRange]);

  const loadLinkAnalytics = async () => {
    setLoading(true);
    try {
      const daysAgo = parseInt(dateRange);
      const startDate = startOfDay(subDays(new Date(), daysAgo));

      const { data, error } = await supabase
        .from("notification_link_clicks")
        .select("*")
        .gte("clicked_at", startDate.toISOString())
        .order("clicked_at", { ascending: false });

      if (error) throw error;

      setClicks((data || []) as LinkClick[]);
      calculateLinkMetrics((data || []) as LinkClick[]);
    } catch (error: any) {
      console.error("Error loading link analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLinkMetrics = (data: LinkClick[]) => {
    const metricsMap = new Map<string, LinkMetrics>();

    data.forEach((click) => {
      const key = click.link_url;
      
      if (!metricsMap.has(key)) {
        metricsMap.set(key, {
          url: click.link_url,
          label: click.link_label,
          totalClicks: 0,
          uniqueNotifications: new Set<string>().size,
          firstClicked: click.clicked_at,
          lastClicked: click.clicked_at,
          hourlyDistribution: {},
        });
      }

      const metrics = metricsMap.get(key)!;
      metrics.totalClicks++;
      
      // Track unique notifications
      const uniqueSet = new Set<string>();
      data
        .filter(c => c.link_url === key)
        .forEach(c => uniqueSet.add(c.notification_id));
      metrics.uniqueNotifications = uniqueSet.size;

      // Update first/last clicked
      if (new Date(click.clicked_at) < new Date(metrics.firstClicked)) {
        metrics.firstClicked = click.clicked_at;
      }
      if (new Date(click.clicked_at) > new Date(metrics.lastClicked)) {
        metrics.lastClicked = click.clicked_at;
      }

      // Calculate hourly distribution
      const hour = new Date(click.clicked_at).getHours();
      metrics.hourlyDistribution[hour] = (metrics.hourlyDistribution[hour] || 0) + 1;
    });

    const sorted = Array.from(metricsMap.values()).sort((a, b) => b.totalClicks - a.totalClicks);
    setLinkMetrics(sorted);
  };

  const getHourlyData = () => {
    const hourlyData: { [hour: number]: number } = {};
    
    clicks.forEach((click) => {
      const hour = new Date(click.clicked_at).getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });

    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      clicks: hourlyData[i] || 0,
    }));
  };

  const getColorForIndex = (index: number, total: number) => {
    const intensity = 1 - (index / total) * 0.7;
    return `hsl(262, 83%, ${50 * intensity}%)`;
  };

  const topLinksData = linkMetrics.slice(0, 10).map((link, index) => ({
    name: link.label || link.url.substring(0, 30) + '...',
    clicks: link.totalClicks,
    unique: link.uniqueNotifications,
  }));

  const hourlyData = getHourlyData();
  const maxHourlyClicks = Math.max(...hourlyData.map(d => d.clicks), 1);

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
          <h1 className="text-3xl font-bold">Link Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track which links patients click in your notification emails
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

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clicks.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all links
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unique Links</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{linkMetrics.length}</div>
            <p className="text-xs text-muted-foreground">
              Different URLs tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Clicks/Link</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {linkMetrics.length > 0 ? (clicks.length / linkMetrics.length).toFixed(1) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average engagement per link
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hourlyData.reduce((max, current) => current.clicks > max.clicks ? current : max, hourlyData[0]).hour}
            </div>
            <p className="text-xs text-muted-foreground">
              Most active time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Links Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Most Clicked Links</CardTitle>
          <CardDescription>Links ranked by total number of clicks</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topLinksData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="clicks" fill="#8b5cf6" name="Total Clicks">
                {topLinksData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColorForIndex(index, topLinksData.length)} />
                ))}
              </Bar>
              <Bar dataKey="unique" fill="#3b82f6" name="Unique Recipients" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hourly Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Click Activity Heatmap (24 Hour)</CardTitle>
          <CardDescription>Visualize when patients are most likely to click links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-2">
              {hourlyData.map((data, index) => {
                const intensity = data.clicks / maxHourlyClicks;
                const opacity = 0.1 + intensity * 0.9;
                
                return (
                  <div
                    key={index}
                    className="relative aspect-square rounded-md border border-border flex items-center justify-center text-xs font-medium transition-all hover:scale-110 hover:z-10 cursor-pointer"
                    style={{
                      backgroundColor: `rgba(139, 92, 246, ${opacity})`,
                      color: intensity > 0.5 ? 'white' : 'inherit',
                    }}
                    title={`${data.hour}: ${data.clicks} clicks`}
                  >
                    <div className="text-center">
                      <div className="font-semibold">{index}</div>
                      <div className="text-[10px]">{data.clicks}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Midnight</span>
              <span>6 AM</span>
              <span>Noon</span>
              <span>6 PM</span>
              <span>11 PM</span>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t">
              <span className="text-xs font-medium">Activity Level:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}></div>
                <span className="text-xs text-muted-foreground">Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(139, 92, 246, 0.5)' }}></div>
                <span className="text-xs text-muted-foreground">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(139, 92, 246, 1)' }}></div>
                <span className="text-xs text-muted-foreground">High</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Link Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Link Performance Details</CardTitle>
          <CardDescription>
            Detailed metrics for each tracked link ({linkMetrics.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Total Clicks</TableHead>
                  <TableHead>Unique Recipients</TableHead>
                  <TableHead>Avg Clicks/Recipient</TableHead>
                  <TableHead>First Clicked</TableHead>
                  <TableHead>Last Clicked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linkMetrics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No link clicks recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  linkMetrics.map((link, index) => (
                    <TableRow key={link.url}>
                      <TableCell>
                        <Badge variant={index < 3 ? "default" : "outline"}>
                          #{index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="space-y-1">
                          {link.label && (
                            <div className="font-medium text-sm">{link.label}</div>
                          )}
                          <div className="text-xs text-muted-foreground break-all">
                            {link.url}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{link.totalClicks}</span>
                          <MousePointerClick className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{link.uniqueNotifications}</span>
                          <Users className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {(link.totalClicks / link.uniqueNotifications).toFixed(1)}x
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(link.firstClicked), "MMM dd, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(link.firstClicked), "h:mm a")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(link.lastClicked), "MMM dd, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(link.lastClicked), "h:mm a")}
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
