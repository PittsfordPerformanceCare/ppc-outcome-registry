import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw, TrendingUp, Users, Activity, Award, FileText, UserCheck } from "lucide-react";
import { format, subDays, subMonths } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnalyticsSkeleton } from "@/components/skeletons/AnalyticsSkeleton";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface MetricsData {
  // Patient Flow Metrics
  totalEpisodes: number;
  activeEpisodes: number;
  completedEpisodes: number;
  avgTimeToComplete: number;
  pendingIntakes: number;
  
  // Clinical Outcomes
  mcidAchievementRate: number;
  avgImprovement: number;
  dischargeCompletionRate: number;
  followupCompletionRate: number;
  
  // Patient Engagement
  outcomeCompletionRate: number;
  avgResponseTime: number;
  patientSatisfaction: number;
  
  // Referral Network
  totalReferrals: number;
  conversionRate: number;
  avgReferralsPerPatient: number;
  
  // Regional Data
  regionalBreakdown: Array<{
    region: string;
    count: number;
    mcidRate: number;
    avgImprovement: number;
  }>;
  
  // Time Series
  episodeTrend: Array<{
    date: string;
    newEpisodes: number;
    completed: number;
    active: number;
  }>;
  
  outcomeTrend: Array<{
    date: string;
    mcidRate: number;
    avgImprovement: number;
  }>;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [dateRange, setDateRange] = useState("30");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [regions, setRegions] = useState<string[]>([]);

  const loadMetrics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const startDate = dateRange === "7" 
        ? subDays(new Date(), 7)
        : dateRange === "30"
        ? subDays(new Date(), 30)
        : subMonths(new Date(), 3);

      // Fetch episodes
      let episodesQuery = supabase
        .from("episodes")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString());

      if (selectedRegion !== "all") {
        episodesQuery = episodesQuery.eq("region", selectedRegion);
      }

      const { data: episodes } = await episodesQuery;

      // Fetch outcome scores
      const { data: outcomeScores } = await supabase
        .from("outcome_scores")
        .select("*")
        .gte("recorded_at", startDate.toISOString());

      // Fetch referrals
      const { data: referrals } = await supabase
        .from("patient_referrals")
        .select("*")
        .gte("created_at", startDate.toISOString());

      // Calculate metrics
      const totalEpisodes = episodes?.length || 0;
      const activeEpisodes = episodes?.filter(e => !e.discharge_date)?.length || 0;
      const completedEpisodes = episodes?.filter(e => e.discharge_date)?.length || 0;

      // Calculate MCID achievement rate
      const episodesWithScores = episodes?.filter(ep => {
        const epScores = outcomeScores?.filter(os => os.episode_id === ep.id) || [];
        const hasBaseline = epScores.some(s => s.score_type === 'baseline');
        const hasFinal = epScores.some(s => s.score_type === 'discharge' || s.score_type === 'followup');
        return hasBaseline && hasFinal;
      }) || [];

      let mcidCount = 0;
      let totalImprovement = 0;
      let improvementCount = 0;

      episodesWithScores.forEach(ep => {
        const epScores = outcomeScores?.filter(os => os.episode_id === ep.id) || [];
        const indexTypes = [...new Set(epScores.map(s => s.index_type))];

        indexTypes.forEach(indexType => {
          const baselineScore = epScores.find(s => s.index_type === indexType && s.score_type === 'baseline')?.score;
          const finalScores = epScores.filter(s => s.index_type === indexType && (s.score_type === 'discharge' || s.score_type === 'followup'));
          const finalScore = finalScores.length > 0 ? Math.min(...finalScores.map(s => s.score)) : null;

          if (baselineScore !== null && baselineScore !== undefined && finalScore !== null) {
            const improvement = baselineScore - finalScore;
            totalImprovement += improvement;
            improvementCount++;

            const mcidThreshold = indexType === 'NDI' ? 7.5 : indexType === 'ODI' ? 6 : indexType === 'QuickDASH' ? 10 : indexType === 'LEFS' ? 9 : 0;
            if (improvement >= mcidThreshold) {
              mcidCount++;
            }
          }
        });
      });

      const mcidAchievementRate = improvementCount > 0 ? (mcidCount / improvementCount) * 100 : 0;
      const avgImprovement = improvementCount > 0 ? totalImprovement / improvementCount : 0;

      // Regional breakdown
      const regionalBreakdown = episodes?.reduce((acc: any[], ep) => {
        const region = ep.region || 'Unknown';
        let regionData = acc.find(r => r.region === region);
        
        if (!regionData) {
          regionData = { region, count: 0, mcidRate: 0, avgImprovement: 0, mcidCount: 0, improvementSum: 0, improvementCount: 0 };
          acc.push(regionData);
        }
        
        regionData.count++;

        // Calculate MCID for this episode
        const epScores = outcomeScores?.filter(os => os.episode_id === ep.id) || [];
        const indexTypes = [...new Set(epScores.map(s => s.index_type))];

        indexTypes.forEach(indexType => {
          const baselineScore = epScores.find(s => s.index_type === indexType && s.score_type === 'baseline')?.score;
          const finalScores = epScores.filter(s => s.index_type === indexType && (s.score_type === 'discharge' || s.score_type === 'followup'));
          const finalScore = finalScores.length > 0 ? Math.min(...finalScores.map(s => s.score)) : null;

          if (baselineScore !== null && baselineScore !== undefined && finalScore !== null) {
            const improvement = baselineScore - finalScore;
            regionData.improvementSum += improvement;
            regionData.improvementCount++;

            const mcidThreshold = indexType === 'NDI' ? 7.5 : indexType === 'ODI' ? 6 : indexType === 'QuickDASH' ? 10 : indexType === 'LEFS' ? 9 : 0;
            if (improvement >= mcidThreshold) {
              regionData.mcidCount++;
            }
          }
        });

        return acc;
      }, []).map(r => ({
        region: r.region,
        count: r.count,
        mcidRate: r.improvementCount > 0 ? (r.mcidCount / r.improvementCount) * 100 : 0,
        avgImprovement: r.improvementCount > 0 ? r.improvementSum / r.improvementCount : 0
      })) || [];

      // Get unique regions for filter
      const uniqueRegions = [...new Set(episodes?.map(e => e.region).filter(Boolean))].sort();
      setRegions(uniqueRegions);

      // Time series data
      const episodeTrend = generateTimeSeries(episodes || [], startDate);
      const outcomeTrend = generateOutcomeTrend(episodes || [], outcomeScores || [], startDate);

      // Referral metrics
      const totalReferrals = referrals?.length || 0;
      const convertedReferrals = referrals?.filter(r => r.status === 'converted')?.length || 0;
      const conversionRate = totalReferrals > 0 ? (convertedReferrals / totalReferrals) * 100 : 0;

      setMetrics({
        totalEpisodes,
        activeEpisodes,
        completedEpisodes,
        avgTimeToComplete: 45, // Placeholder
        pendingIntakes: 0, // Placeholder
        mcidAchievementRate,
        avgImprovement,
        dischargeCompletionRate: completedEpisodes > 0 ? (completedEpisodes / totalEpisodes) * 100 : 0,
        followupCompletionRate: 85, // Placeholder
        outcomeCompletionRate: episodesWithScores.length > 0 ? (episodesWithScores.length / totalEpisodes) * 100 : 0,
        avgResponseTime: 2.5, // Placeholder
        patientSatisfaction: 4.6, // Placeholder
        totalReferrals,
        conversionRate,
        avgReferralsPerPatient: 1.2, // Placeholder
        regionalBreakdown,
        episodeTrend,
        outcomeTrend
      });
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSeries = (episodes: any[], startDate: Date) => {
    const days: any[] = [];
    const dayCount = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < dayCount; i++) {
      const date = subDays(new Date(), dayCount - i - 1);
      const dateStr = format(date, 'MM/dd');
      
      const newEpisodes = episodes.filter(e => 
        format(new Date(e.created_at), 'MM/dd') === dateStr
      ).length;
      
      const completed = episodes.filter(e => 
        e.discharge_date && format(new Date(e.discharge_date), 'MM/dd') === dateStr
      ).length;
      
      const active = episodes.filter(e => 
        new Date(e.created_at) <= date && (!e.discharge_date || new Date(e.discharge_date) > date)
      ).length;
      
      days.push({ date: dateStr, newEpisodes, completed, active });
    }
    
    return days;
  };

  const generateOutcomeTrend = (episodes: any[], outcomeScores: any[], startDate: Date) => {
    const days: any[] = [];
    const dayCount = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < Math.min(dayCount, 30); i += Math.ceil(dayCount / 10)) {
      const date = subDays(new Date(), dayCount - i - 1);
      const dateStr = format(date, 'MM/dd');
      
      // Calculate MCID rate for episodes up to this date
      const episodesToDate = episodes.filter(e => new Date(e.created_at) <= date);
      let mcidCount = 0;
      let totalCount = 0;
      let improvementSum = 0;
      
      episodesToDate.forEach(ep => {
        const epScores = outcomeScores.filter(os => os.episode_id === ep.id && new Date(os.recorded_at) <= date);
        const indexTypes = [...new Set(epScores.map(s => s.index_type))];
        
        indexTypes.forEach(indexType => {
          const baselineScore = epScores.find(s => s.index_type === indexType && s.score_type === 'baseline')?.score;
          const finalScores = epScores.filter(s => s.index_type === indexType && (s.score_type === 'discharge' || s.score_type === 'followup'));
          const finalScore = finalScores.length > 0 ? Math.min(...finalScores.map(s => s.score)) : null;
          
          if (baselineScore !== null && baselineScore !== undefined && finalScore !== null) {
            const improvement = baselineScore - finalScore;
            improvementSum += improvement;
            totalCount++;
            
            const mcidThreshold = indexType === 'NDI' ? 7.5 : indexType === 'ODI' ? 6 : indexType === 'QuickDASH' ? 10 : indexType === 'LEFS' ? 9 : 0;
            if (improvement >= mcidThreshold) {
              mcidCount++;
            }
          }
        });
      });
      
      days.push({
        date: dateStr,
        mcidRate: totalCount > 0 ? (mcidCount / totalCount) * 100 : 0,
        avgImprovement: totalCount > 0 ? improvementSum / totalCount : 0
      });
    }
    
    return days;
  };

  useEffect(() => {
    loadMetrics();
  }, [user, dateRange, selectedRegion]);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (!metrics) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive clinic performance metrics and insights</p>
        </div>
        <Button onClick={loadMetrics} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map(region => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clinical">Clinical Outcomes</TabsTrigger>
          <TabsTrigger value="engagement">Patient Engagement</TabsTrigger>
          <TabsTrigger value="referrals">Referral Network</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Episodes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalEpisodes}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.activeEpisodes} active, {metrics.completedEpisodes} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MCID Achievement</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.mcidAchievementRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Avg improvement: {metrics.avgImprovement.toFixed(1)} points
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outcome Completion</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.outcomeCompletionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Discharge: {metrics.dischargeCompletionRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Referral Conversion</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.totalReferrals} total referrals
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Episode Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Episode Activity Trend</CardTitle>
              <CardDescription>New, active, and completed episodes over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                newEpisodes: { label: "New Episodes", color: "hsl(var(--chart-1))" },
                active: { label: "Active", color: "hsl(var(--chart-2))" },
                completed: { label: "Completed", color: "hsl(var(--chart-3))" }
              }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.episodeTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="newEpisodes" stroke="hsl(var(--chart-1))" name="New Episodes" />
                    <Line type="monotone" dataKey="active" stroke="hsl(var(--chart-2))" name="Active" />
                    <Line type="monotone" dataKey="completed" stroke="hsl(var(--chart-3))" name="Completed" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Regional Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Performance</CardTitle>
              <CardDescription>Episode count and outcomes by body region</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                count: { label: "Episodes", color: "hsl(var(--chart-1))" }
              }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.regionalBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="region" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="count" fill="hsl(var(--chart-1))" name="Episodes" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinical Outcomes Tab */}
        <TabsContent value="clinical" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>MCID Achievement Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{metrics.mcidAchievementRate.toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Percentage of patients achieving clinically meaningful improvement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{metrics.avgImprovement.toFixed(1)}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Average point improvement across all outcome measures
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discharge Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{metrics.dischargeCompletionRate.toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Percentage of episodes with completed discharge assessments
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Outcome Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Clinical Outcomes Trend</CardTitle>
              <CardDescription>MCID rate and average improvement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                mcidRate: { label: "MCID Rate (%)", color: "hsl(var(--chart-1))" },
                avgImprovement: { label: "Avg Improvement", color: "hsl(var(--chart-2))" }
              }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.outcomeTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="mcidRate" stroke="hsl(var(--chart-1))" name="MCID Rate (%)" />
                    <Line type="monotone" dataKey="avgImprovement" stroke="hsl(var(--chart-2))" name="Avg Improvement" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Regional MCID Performance */}
          <Card>
            <CardHeader>
              <CardTitle>MCID Achievement by Region</CardTitle>
              <CardDescription>Clinical outcome success rates across body regions</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                mcidRate: { label: "MCID Rate (%)", color: "hsl(var(--chart-1))" }
              }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.regionalBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="region" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="mcidRate" fill="hsl(var(--chart-1))" name="MCID Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patient Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Outcome Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{metrics.outcomeCompletionRate.toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Episodes with complete baseline and follow-up scores
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{metrics.avgResponseTime.toFixed(1)}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Average days to complete outcome measures
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patient Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{metrics.patientSatisfaction.toFixed(1)}/5.0</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Average satisfaction rating from feedback surveys
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Episode Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Episode Status Distribution</CardTitle>
              <CardDescription>Current breakdown of episode statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                value: { label: "Count", color: "hsl(var(--chart-1))" }
              }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: metrics.activeEpisodes },
                        { name: 'Completed', value: metrics.completedEpisodes }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1].map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referral Network Tab */}
        <TabsContent value="referrals" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{metrics.totalReferrals}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Total patient referrals in selected period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{metrics.conversionRate.toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Referrals converted to active patients
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg Referrals/Patient</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{metrics.avgReferralsPerPatient.toFixed(1)}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Average referrals generated per patient
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
