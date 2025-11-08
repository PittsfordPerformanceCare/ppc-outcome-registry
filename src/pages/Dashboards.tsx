import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BarChart3, Download, TrendingUp, Clock, Target, Users } from "lucide-react";
import { format, subMonths } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { PPC_CONFIG, IndexType } from "@/lib/ppcConfig";
import { getMCIDThreshold } from "@/lib/mcidUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface EpisodeOutcome {
  episodeId: string;
  region: string;
  diagnosis: string;
  indexType: IndexType;
  intakeScore: number;
  dischargeScore: number;
  delta: number;
  mcidAchieved: boolean;
  daysToDischarge: number;
  visitCount: number;
  clinicianId: string;
  dischargeDate: string;
  referralSource?: string;
}

export default function Dashboards() {
  const [loading, setLoading] = useState(true);
  const [outcomes, setOutcomes] = useState<EpisodeOutcome[]>([]);
  const { toast } = useToast();

  // Filters
  const [dateFrom, setDateFrom] = useState(format(subMonths(new Date(), 6), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterDiagnosis, setFilterDiagnosis] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch episodes with discharge dates
      const { data: episodes, error: episodesError } = await supabase
        .from("episodes")
        .select("*")
        .not("discharge_date", "is", null)
        .order("discharge_date", { ascending: false });

      if (episodesError) throw episodesError;
      if (!episodes || episodes.length === 0) {
        setOutcomes([]);
        return;
      }

      // Fetch all outcome scores for these episodes
      const episodeIds = episodes.map(ep => ep.id);
      const { data: scores, error: scoresError } = await supabase
        .from("outcome_scores")
        .select("*")
        .in("episode_id", episodeIds)
        .order("recorded_at", { ascending: true });

      if (scoresError) throw scoresError;

      // Process outcomes
      const computedOutcomes: EpisodeOutcome[] = [];

      for (const episode of episodes) {
        const episodeScores = scores?.filter(s => s.episode_id === episode.id) || [];
        
        // Group by index_type
        const indexTypes = new Set(episodeScores.map(s => s.index_type));
        
        for (const indexType of indexTypes) {
          const typeScores = episodeScores.filter(s => s.index_type === indexType);
          
          // Find intake (baseline) and discharge scores
          const intakeScore = typeScores.find(s => s.score_type === "baseline");
          const dischargeScore = typeScores.find(s => s.score_type === "discharge");

          if (!intakeScore || !dischargeScore) continue;

          // Calculate delta based on instrument direction
          const isLowerBetter = ["NDI", "ODI", "QuickDASH"].includes(indexType);
          const delta = isLowerBetter 
            ? intakeScore.score - dischargeScore.score 
            : dischargeScore.score - intakeScore.score;

          // Check MCID achievement
          const mcidThreshold = getMCIDThreshold(indexType) || 0;
          const mcidAchieved = Math.abs(delta) >= mcidThreshold;

          // Calculate days to discharge
          const intakeDate = new Date(episode.date_of_service);
          const dischargeDate = new Date(episode.discharge_date!);
          const daysToDischarge = Math.round((dischargeDate.getTime() - intakeDate.getTime()) / (1000 * 60 * 60 * 24));

          // Count visits (number of unique score dates)
          const uniqueDates = new Set(episodeScores.map(s => s.recorded_at.split('T')[0]));
          const visitCount = uniqueDates.size;

          computedOutcomes.push({
            episodeId: episode.id,
            region: episode.region,
            diagnosis: episode.diagnosis || "Unknown",
            indexType: indexType as IndexType,
            intakeScore: intakeScore.score,
            dischargeScore: dischargeScore.score,
            delta,
            mcidAchieved,
            daysToDischarge,
            visitCount,
            clinicianId: episode.clinician || "Unknown",
            dischargeDate: episode.discharge_date!,
            referralSource: episode.referring_physician || undefined,
          });
        }
      }

      setOutcomes(computedOutcomes);
    } catch (error: any) {
      toast({
        title: "Error loading analytics data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtered outcomes
  const filteredOutcomes = useMemo(() => {
    return outcomes.filter(outcome => {
      // Date filter
      const outcomeDate = new Date(outcome.dischargeDate);
      if (dateFrom && outcomeDate < new Date(dateFrom)) return false;
      if (dateTo && outcomeDate > new Date(dateTo)) return false;

      // Region filter
      if (filterRegion !== "all" && outcome.region !== filterRegion) return false;

      // Diagnosis filter
      if (filterDiagnosis !== "all" && outcome.diagnosis !== filterDiagnosis) return false;

      return true;
    });
  }, [outcomes, dateFrom, dateTo, filterRegion, filterDiagnosis]);

  // Get unique diagnoses
  const uniqueDiagnoses = useMemo(() => {
    const diagnoses = new Set(outcomes.map(o => o.diagnosis));
    return Array.from(diagnoses).sort();
  }, [outcomes]);

  // KPI calculations
  const kpis = useMemo(() => {
    if (filteredOutcomes.length === 0) {
      return {
        mcidRate: 0,
        medianDaysToDischarge: 0,
        medianVisitCount: 0,
        totalEpisodes: 0,
      };
    }

    const mcidAchievedCount = filteredOutcomes.filter(o => o.mcidAchieved).length;
    const mcidRate = (mcidAchievedCount / filteredOutcomes.length) * 100;

    const sortedDays = [...filteredOutcomes].map(o => o.daysToDischarge).sort((a, b) => a - b);
    const medianDaysToDischarge = sortedDays[Math.floor(sortedDays.length / 2)];

    const sortedVisits = [...filteredOutcomes].map(o => o.visitCount).sort((a, b) => a - b);
    const medianVisitCount = sortedVisits[Math.floor(sortedVisits.length / 2)];

    return {
      mcidRate: Math.round(mcidRate),
      medianDaysToDischarge,
      medianVisitCount,
      totalEpisodes: filteredOutcomes.length,
    };
  }, [filteredOutcomes]);

  // Chart data: MCID by Region
  const mcidByRegionData = useMemo(() => {
    const regionMap = new Map<string, { total: number; achieved: number }>();

    filteredOutcomes.forEach(outcome => {
      const current = regionMap.get(outcome.region) || { total: 0, achieved: 0 };
      current.total++;
      if (outcome.mcidAchieved) current.achieved++;
      regionMap.set(outcome.region, current);
    });

    return Array.from(regionMap.entries())
      .map(([region, stats]) => ({
        region,
        rate: Math.round((stats.achieved / stats.total) * 100),
        count: stats.total,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredOutcomes]);

  // Chart data: Avg Delta by Diagnosis (top 10)
  const avgDeltaByDiagnosis = useMemo(() => {
    const diagnosisMap = new Map<string, { totalDelta: number; count: number }>();

    filteredOutcomes.forEach(outcome => {
      const current = diagnosisMap.get(outcome.diagnosis) || { totalDelta: 0, count: 0 };
      current.totalDelta += outcome.delta;
      current.count++;
      diagnosisMap.set(outcome.diagnosis, current);
    });

    return Array.from(diagnosisMap.entries())
      .map(([diagnosis, stats]) => ({
        diagnosis: diagnosis.length > 25 ? diagnosis.substring(0, 25) + "..." : diagnosis,
        avgDelta: Math.round(stats.totalDelta / stats.count),
        count: stats.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredOutcomes]);

  // Chart data: Monthly Discharges and MCID Rate (with rolling 3-month average)
  const monthlyTrendData = useMemo(() => {
    if (filteredOutcomes.length === 0) return [];

    // Group by month
    const monthMap = new Map<string, { total: number; mcidAchieved: number }>();

    filteredOutcomes.forEach(outcome => {
      const monthKey = format(new Date(outcome.dischargeDate), "yyyy-MM");
      const current = monthMap.get(monthKey) || { total: 0, mcidAchieved: 0 };
      current.total++;
      if (outcome.mcidAchieved) current.mcidAchieved++;
      monthMap.set(monthKey, current);
    });

    // Convert to array and sort by date
    const monthlyData = Array.from(monthMap.entries())
      .map(([month, stats]) => ({
        month,
        date: new Date(month + "-01"),
        discharges: stats.total,
        mcidRate: Math.round((stats.mcidAchieved / stats.total) * 100),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate rolling 3-month average
    const withRollingAvg = monthlyData.map((item, idx) => {
      if (idx < 2) {
        // Not enough data for 3-month average yet
        return { ...item, rollingAvg: null };
      }

      const last3Months = monthlyData.slice(idx - 2, idx + 1);
      const avgRate = last3Months.reduce((sum, m) => sum + m.mcidRate, 0) / 3;
      
      return {
        ...item,
        rollingAvg: Math.round(avgRate),
      };
    });

    // Format month labels
    return withRollingAvg.map(item => ({
      ...item,
      monthLabel: format(item.date, "MMM yyyy"),
    }));
  }, [filteredOutcomes]);

  // Export CSV
  const exportCSV = () => {
    const headers = [
      "Episode ID",
      "Region",
      "Diagnosis",
      "Index Type",
      "Intake Score",
      "Discharge Score",
      "Delta",
      "MCID Achieved",
      "Days to Discharge",
      "Visit Count",
      "Clinician ID",
      "Discharge Date",
    ];

    const rows = filteredOutcomes.map(o => [
      o.episodeId,
      o.region,
      o.diagnosis,
      o.indexType,
      o.intakeScore.toFixed(1),
      o.dischargeScore.toFixed(1),
      o.delta.toFixed(1),
      o.mcidAchieved ? "Yes" : "No",
      o.daysToDischarge,
      o.visitCount,
      o.clinicianId,
      format(new Date(o.dischargeDate), "yyyy-MM-dd"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `aggregate-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `Exported ${filteredOutcomes.length} episode outcomes`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: PPC_CONFIG.brandColor }}>Dashboards</h1>
          <p className="text-muted-foreground mt-1">Population-level outcomes and quality metrics</p>
        </div>
      </div>

      <Tabs defaultValue="aggregate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="aggregate">Aggregate Outcomes</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="aggregate" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Date From</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date To</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select value={filterRegion} onValueChange={setFilterRegion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {PPC_CONFIG.regionEnum.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Diagnosis</Label>
                  <Select value={filterDiagnosis} onValueChange={setFilterDiagnosis}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Diagnoses</SelectItem>
                      {uniqueDiagnoses.map(dx => (
                        <SelectItem key={dx} value={dx}>{dx}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MCID Achievement Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: PPC_CONFIG.brandColor }}>{kpis.mcidRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Clinically significant improvement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Median Days to Discharge</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpis.medianDaysToDischarge}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Days from intake to discharge
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Median Visit Count</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpis.medianVisitCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Visits per episode
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Episodes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpis.totalEpisodes}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Filtered results
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>MCID Achievement Rate by Region</CardTitle>
                <CardDescription>Percentage achieving clinically significant improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mcidByRegionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="region" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                    <YAxis label={{ value: '% MCID Achieved', angle: -90, position: 'insideLeft' }} />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-semibold">{payload[0].payload.region}</p>
                            <p className="text-sm">MCID Rate: {payload[0].value}%</p>
                            <p className="text-xs text-muted-foreground">n = {payload[0].payload.count}</p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Bar dataKey="rate" fill={PPC_CONFIG.brandColor} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Improvement by Diagnosis</CardTitle>
                <CardDescription>Top 10 diagnoses by volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={avgDeltaByDiagnosis} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" label={{ value: 'Avg Score Improvement', position: 'insideBottom', offset: -5 }} />
                    <YAxis dataKey="diagnosis" type="category" width={150} tick={{ fontSize: 11 }} />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-semibold text-sm">{payload[0].payload.diagnosis}</p>
                            <p className="text-sm">Avg Improvement: {payload[0].value} points</p>
                            <p className="text-xs text-muted-foreground">n = {payload[0].payload.count}</p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Bar dataKey="avgDelta" fill={PPC_CONFIG.brandColor} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Discharge Trends</CardTitle>
              <CardDescription>MCID achievement rate over time with rolling 3-month average</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="monthLabel" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis 
                      yAxisId="left"
                      label={{ value: '% MCID Achieved', angle: -90, position: 'insideLeft' }}
                      domain={[0, 100]}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      label={{ value: 'Discharges', angle: 90, position: 'insideRight' }}
                    />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-semibold mb-1">{payload[0].payload.monthLabel}</p>
                            <p className="text-sm">MCID Rate: {payload[0].value}%</p>
                            {payload[0].payload.rollingAvg && (
                              <p className="text-sm">3-Month Avg: {payload[0].payload.rollingAvg}%</p>
                            )}
                            <p className="text-sm">Discharges: {payload[0].payload.discharges}</p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="mcidRate" 
                      stroke={PPC_CONFIG.brandColor}
                      strokeWidth={2}
                      name="MCID Rate (%)"
                      dot={{ fill: PPC_CONFIG.brandColor, r: 4 }}
                    />
                    {monthlyTrendData.some(d => d.rollingAvg !== null) && (
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="rollingAvg" 
                        stroke="#16a34a"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="3-Month Rolling Avg (%)"
                        dot={false}
                      />
                    )}
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="discharges" 
                      stroke="#6b7280"
                      strokeWidth={2}
                      name="Discharges"
                      dot={{ fill: "#6b7280", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                  <p>No data available for trend analysis</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Episode Outcomes</CardTitle>
                  <CardDescription>Filtered results ({filteredOutcomes.length} episodes)</CardDescription>
                </div>
                <Button onClick={exportCSV} size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Episode ID</th>
                      <th className="text-left p-2">Region</th>
                      <th className="text-left p-2">Diagnosis</th>
                      <th className="text-left p-2">Index</th>
                      <th className="text-right p-2">Intake</th>
                      <th className="text-right p-2">Discharge</th>
                      <th className="text-right p-2">Δ</th>
                      <th className="text-center p-2">MCID</th>
                      <th className="text-right p-2">Days</th>
                      <th className="text-right p-2">Visits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOutcomes.slice(0, 50).map((outcome, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-mono text-xs">{outcome.episodeId.substring(0, 12)}...</td>
                        <td className="p-2">{outcome.region}</td>
                        <td className="p-2 max-w-[200px] truncate">{outcome.diagnosis}</td>
                        <td className="p-2">{outcome.indexType}</td>
                        <td className="p-2 text-right">{outcome.intakeScore.toFixed(1)}</td>
                        <td className="p-2 text-right">{outcome.dischargeScore.toFixed(1)}</td>
                        <td className="p-2 text-right font-semibold" style={{ color: outcome.delta > 0 ? '#16a34a' : '#dc2626' }}>
                          {outcome.delta > 0 ? '+' : ''}{outcome.delta.toFixed(1)}
                        </td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${outcome.mcidAchieved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {outcome.mcidAchieved ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="p-2 text-right">{outcome.daysToDischarge}</td>
                        <td className="p-2 text-right">{outcome.visitCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredOutcomes.length > 50 && (
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Showing first 50 of {filteredOutcomes.length} results. Export CSV for complete data.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics Dashboard</CardTitle>
              <CardDescription>Coming soon - Compliance tracking, follow-up rates, and clinician benchmarking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Quality metrics dashboard under development</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
