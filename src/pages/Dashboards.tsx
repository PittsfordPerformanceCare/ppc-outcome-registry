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
  mcidThreshold: number;
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

  // Filters (default to 12 months to capture all demo data)
  const [dateFrom, setDateFrom] = useState(format(subMonths(new Date(), 12), "yyyy-MM-dd"));
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
            mcidThreshold,
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

  // Chart data: Visit Count Distribution
  const visitCountDistribution = useMemo(() => {
    if (filteredOutcomes.length === 0) return { histogram: [], stats: null };

    const visitCounts = filteredOutcomes.map(o => o.visitCount);
    
    // Calculate statistics
    const sorted = [...visitCounts].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const median = sorted[Math.floor(sorted.length / 2)];
    const mean = Math.round(visitCounts.reduce((a, b) => a + b, 0) / visitCounts.length);
    
    // Calculate quartiles
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    
    // Create histogram bins
    const binMap = new Map<number, number>();
    visitCounts.forEach(count => {
      binMap.set(count, (binMap.get(count) || 0) + 1);
    });

    const histogram = Array.from(binMap.entries())
      .map(([visits, count]) => ({ visits, count }))
      .sort((a, b) => a.visits - b.visits);

    return {
      histogram,
      stats: { min, max, median, mean, q1, q3 },
    };
  }, [filteredOutcomes]);

  // Quality Metrics: Anonymized Clinician Benchmarking
  const clinicianBenchmarkData = useMemo(() => {
    const clinicianMap = new Map<string, { total: number; mcidAchieved: number }>();

    filteredOutcomes.forEach(outcome => {
      const current = clinicianMap.get(outcome.clinicianId) || { total: 0, mcidAchieved: 0 };
      current.total++;
      if (outcome.mcidAchieved) current.mcidAchieved++;
      clinicianMap.set(outcome.clinicianId, current);
    });

    // Filter clinicians with at least 5 episodes
    const minEpisodes = 5;
    const clinicians = Array.from(clinicianMap.entries())
      .filter(([_, stats]) => stats.total >= minEpisodes)
      .map(([id, stats], idx) => ({
        id,
        label: `Clinician ${String.fromCharCode(65 + idx)}`, // A, B, C, etc.
        mcidRate: Math.round((stats.mcidAchieved / stats.total) * 100),
        episodeCount: stats.total,
      }))
      .sort((a, b) => b.mcidRate - a.mcidRate);

    return clinicians;
  }, [filteredOutcomes]);

  // Quality Metrics: Compliance Distribution (from episodes table)
  const [complianceData, setComplianceData] = useState<Array<{ category: string; count: number; percentage: number }>>([]);

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        const { data: episodes, error } = await supabase
          .from("episodes")
          .select("compliance_rating")
          .not("discharge_date", "is", null);

        if (error) throw error;

        // Group by compliance rating
        const complianceMap = new Map<string, number>();
        episodes?.forEach(ep => {
          const rating = ep.compliance_rating || "Unknown";
          complianceMap.set(rating, (complianceMap.get(rating) || 0) + 1);
        });

        const total = episodes?.length || 1;
        const data = Array.from(complianceMap.entries())
          .map(([category, count]) => ({
            category,
            count,
            percentage: Math.round((count / total) * 100),
          }))
          .sort((a, b) => b.count - a.count);

        setComplianceData(data);
      } catch (error) {
        console.error("Error fetching compliance data:", error);
      }
    };

    if (!loading) {
      fetchComplianceData();
    }
  }, [loading]);

  // Quality Metrics: Referral Source Breakdown
  const referralSourceData = useMemo(() => {
    const sourceMap = new Map<string, number>();

    filteredOutcomes.forEach(outcome => {
      const source = outcome.referralSource || "Unknown";
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });

    const total = filteredOutcomes.length || 1;
    return Array.from(sourceMap.entries())
      .map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredOutcomes]);

  // At-Risk Episodes: Identify episodes needing intervention
  const [atRiskEpisodes, setAtRiskEpisodes] = useState<Array<{
    episodeId: string;
    patientName: string;
    region: string;
    diagnosis: string;
    daysActive: number;
    visitCount: number;
    compliance: string;
    delta: number;
    mcidThreshold: number;
    riskFactors: string[];
    recommendation: string;
  }>>([]);

  useEffect(() => {
    const fetchAtRiskEpisodes = async () => {
      try {
        // Fetch active episodes (no discharge date or recently discharged)
        const { data: episodes, error } = await supabase
          .from("episodes")
          .select("*")
          .order("date_of_service", { ascending: false });

        if (error) throw error;
        if (!episodes) return;

        const atRisk: typeof atRiskEpisodes = [];

        for (const episode of episodes) {
          // Find outcome data for this episode
          const episodeOutcome = outcomes.find(o => o.episodeId === episode.id);
          
          // Skip if no outcome data yet
          if (!episodeOutcome) continue;

          const riskFactors: string[] = [];
          let recommendation = "";

          // Calculate days active
          const startDate = new Date(episode.date_of_service);
          const endDate = episode.discharge_date ? new Date(episode.discharge_date) : new Date();
          const daysActive = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

          // Risk Factor 1: Low Compliance
          const compliance = episode.compliance_rating || "Unknown";
          if (compliance === "Low" || compliance.includes("0-59")) {
            riskFactors.push("Low Compliance");
          }

          // Risk Factor 2: Minimal Improvement (< 50% of MCID threshold)
          const mcidThreshold = episodeOutcome.mcidThreshold;
          const improvementPct = (Math.abs(episodeOutcome.delta) / mcidThreshold) * 100;
          if (improvementPct < 50 && improvementPct > 0) {
            riskFactors.push("Minimal Improvement");
          }

          // Risk Factor 3: Declining Trajectory
          if (episodeOutcome.delta < 0) {
            riskFactors.push("Declining Trajectory");
            recommendation = "Consider neurological examination or imaging to rule out underlying pathology";
          }

          // Risk Factor 4: Extended Care without good results
          if (episodeOutcome.visitCount > 6 && improvementPct < 75) {
            riskFactors.push("Extended Care");
            if (!recommendation) {
              recommendation = "Review for complex presentation - may need advanced imaging or specialist referral";
            }
          }

          // Only include episodes with at least one risk factor
          if (riskFactors.length > 0) {
            atRisk.push({
              episodeId: episode.id,
              patientName: episode.patient_name,
              region: episode.region,
              diagnosis: episode.diagnosis || "Unknown",
              daysActive,
              visitCount: episodeOutcome.visitCount,
              compliance,
              delta: episodeOutcome.delta,
              mcidThreshold,
              riskFactors,
              recommendation: recommendation || "Continue monitoring - consider treatment plan adjustment",
            });
          }
        }

        // Sort by number of risk factors (highest risk first)
        atRisk.sort((a, b) => b.riskFactors.length - a.riskFactors.length);
        setAtRiskEpisodes(atRisk);

      } catch (error) {
        console.error("Error fetching at-risk episodes:", error);
      }
    };

    if (!loading && outcomes.length > 0) {
      fetchAtRiskEpisodes();
    }
  }, [loading, outcomes]);

  // Chart colors
  const CHART_COLORS = ['#A51C30', '#16a34a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
  const COMPLIANCE_COLORS = {
    'High': '#16a34a',
    'Moderate': '#f59e0b', 
    'Low': '#ef4444',
    'Unknown': '#6b7280',
  };

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
              <CardDescription>Default: Last 12 months • Adjust to refine results</CardDescription>
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

          {/* Visit Count Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Visit Count Distribution</CardTitle>
              <CardDescription>
                Treatment episode length patterns • Target: 3 visits typical
              </CardDescription>
            </CardHeader>
            <CardContent>
              {visitCountDistribution.histogram.length > 0 && visitCountDistribution.stats ? (
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={visitCountDistribution.histogram}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="visits" 
                          label={{ value: 'Number of Visits', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis label={{ value: 'Episode Count', angle: -90, position: 'insideLeft' }} />
                        <Tooltip content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const count = Number(payload[0].value) || 0;
                            return (
                              <div className="bg-background border rounded-lg p-3 shadow-lg">
                                <p className="font-semibold">{payload[0].payload.visits} visits</p>
                                <p className="text-sm">{count} episodes</p>
                                <p className="text-xs text-muted-foreground">
                                  {Math.round((count / filteredOutcomes.length) * 100)}% of total
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }} />
                        <Bar dataKey="count" fill={PPC_CONFIG.brandColor}>
                          {visitCountDistribution.histogram.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`}
                              fill={entry.visits === 3 ? '#16a34a' : entry.visits > 5 ? '#f59e0b' : PPC_CONFIG.brandColor}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Distribution Statistics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between p-2 rounded bg-muted/50">
                          <span className="text-sm text-muted-foreground">Mean</span>
                          <span className="font-semibold">{visitCountDistribution.stats.mean} visits</span>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-muted/50">
                          <span className="text-sm text-muted-foreground">Median</span>
                          <span className="font-semibold">{visitCountDistribution.stats.median} visits</span>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-muted/50">
                          <span className="text-sm text-muted-foreground">Range</span>
                          <span className="font-semibold">
                            {visitCountDistribution.stats.min} - {visitCountDistribution.stats.max}
                          </span>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-muted/50">
                          <span className="text-sm text-muted-foreground">Q1 - Q3</span>
                          <span className="font-semibold">
                            {visitCountDistribution.stats.q1} - {visitCountDistribution.stats.q3}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Interpretation</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500 mt-0.5" />
                          <span className="text-muted-foreground">
                            <strong className="text-foreground">3 visits:</strong> Target benchmark (typical discharge)
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-3 h-3 rounded-full mt-0.5" style={{ backgroundColor: PPC_CONFIG.brandColor }} />
                          <span className="text-muted-foreground">
                            <strong className="text-foreground">1-5 visits:</strong> Within normal range
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500 mt-0.5" />
                          <span className="text-muted-foreground">
                            <strong className="text-foreground">6+ visits:</strong> Extended care (review for complexity)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <p>No visit count data available</p>
                </div>
              )}
            </CardContent>
          </Card>

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
          {/* Quality KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall MCID Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: PPC_CONFIG.brandColor }}>{kpis.mcidRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Clinical effectiveness
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clinicians Tracked</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{clinicianBenchmarkData.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  With 5+ episodes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Data</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{complianceData.length > 0 ? complianceData.reduce((sum, c) => sum + c.count, 0) : 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Episodes rated
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Referral Sources</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{referralSourceData.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Unique sources
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quality Charts Row 1 */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Anonymized Clinician Benchmarking */}
            <Card>
              <CardHeader>
                <CardTitle>Clinician Benchmarking (Anonymized)</CardTitle>
                <CardDescription>MCID achievement rates by clinician (minimum 5 episodes)</CardDescription>
              </CardHeader>
              <CardContent>
                {clinicianBenchmarkData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={clinicianBenchmarkData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis label={{ value: '% MCID Achieved', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                              <p className="font-semibold">{payload[0].payload.label}</p>
                              <p className="text-sm">MCID Rate: {payload[0].value}%</p>
                              <p className="text-xs text-muted-foreground">Episodes: {payload[0].payload.episodeCount}</p>
                            </div>
                          );
                        }
                        return null;
                      }} />
                      <Bar dataKey="mcidRate" fill={PPC_CONFIG.brandColor} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <p>No clinicians with 5+ episodes in filtered data</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compliance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Distribution</CardTitle>
                <CardDescription>Patient compliance ratings across episodes</CardDescription>
              </CardHeader>
              <CardContent>
                {complianceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={complianceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percentage }) => `${category}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {complianceData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COMPLIANCE_COLORS[entry.category as keyof typeof COMPLIANCE_COLORS] || CHART_COLORS[index % CHART_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                              <p className="font-semibold">{payload[0].payload.category}</p>
                              <p className="text-sm">Count: {payload[0].value}</p>
                              <p className="text-xs text-muted-foreground">{payload[0].payload.percentage}%</p>
                            </div>
                          );
                        }
                        return null;
                      }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <p>No compliance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Referral Source Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Referral Source Distribution</CardTitle>
              <CardDescription>Where patients are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              {referralSourceData.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={referralSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ source, percentage }) => `${source}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {referralSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                              <p className="font-semibold">{payload[0].payload.source}</p>
                              <p className="text-sm">Count: {payload[0].value}</p>
                              <p className="text-xs text-muted-foreground">{payload[0].payload.percentage}%</p>
                            </div>
                          );
                        }
                        return null;
                      }} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm mb-3">Referral Breakdown</h4>
                    {referralSourceData.map((source, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded border">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                          />
                          <span className="text-sm">{source.source}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm">{source.count}</div>
                          <div className="text-xs text-muted-foreground">{source.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <p>No referral source data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* At-Risk Episodes Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🚨</span> Episodes Requiring Attention
                  </CardTitle>
                  <CardDescription>
                    Patients with minimal improvement, declining trajectory, or extended care
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: PPC_CONFIG.brandColor }}>
                    {atRiskEpisodes.length}
                  </div>
                  <div className="text-xs text-muted-foreground">At-Risk Episodes</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {atRiskEpisodes.length > 0 ? (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid gap-3 md:grid-cols-4 mb-4">
                    <div className="p-3 rounded-lg border bg-red-50 dark:bg-red-950/20">
                      <div className="text-xs text-muted-foreground">Declining</div>
                      <div className="text-xl font-bold text-red-600">
                        {atRiskEpisodes.filter(e => e.riskFactors.includes("Declining Trajectory")).length}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border bg-orange-50 dark:bg-orange-950/20">
                      <div className="text-xs text-muted-foreground">Extended Care</div>
                      <div className="text-xl font-bold text-orange-600">
                        {atRiskEpisodes.filter(e => e.riskFactors.includes("Extended Care")).length}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20">
                      <div className="text-xs text-muted-foreground">Minimal Progress</div>
                      <div className="text-xl font-bold text-yellow-600">
                        {atRiskEpisodes.filter(e => e.riskFactors.includes("Minimal Improvement")).length}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-950/20">
                      <div className="text-xs text-muted-foreground">Low Compliance</div>
                      <div className="text-xl font-bold text-gray-600">
                        {atRiskEpisodes.filter(e => e.riskFactors.includes("Low Compliance")).length}
                      </div>
                    </div>
                  </div>

                  {/* Episodes Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Priority</th>
                          <th className="text-left p-2">Patient</th>
                          <th className="text-left p-2">Region/Diagnosis</th>
                          <th className="text-center p-2">Days Active</th>
                          <th className="text-center p-2">Visits</th>
                          <th className="text-left p-2">Risk Factors</th>
                          <th className="text-left p-2">Clinical Recommendation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {atRiskEpisodes.map((episode, idx) => (
                          <tr key={idx} className="border-b hover:bg-muted/50">
                            <td className="p-2">
                              <div className="flex items-center gap-1">
                                {episode.riskFactors.length >= 3 ? (
                                  <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
                                    HIGH
                                  </span>
                                ) : episode.riskFactors.length === 2 ? (
                                  <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-800">
                                    MEDIUM
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                                    LOW
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="font-medium">{episode.patientName}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {episode.episodeId.substring(0, 12)}...
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="font-medium">{episode.region}</div>
                              <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                                {episode.diagnosis}
                              </div>
                            </td>
                            <td className="p-2 text-center">{episode.daysActive}</td>
                            <td className="p-2 text-center">{episode.visitCount}</td>
                            <td className="p-2">
                              <div className="space-y-1">
                                {episode.riskFactors.map((factor, fIdx) => (
                                  <div key={fIdx} className="text-xs">
                                    <span 
                                      className="px-1.5 py-0.5 rounded"
                                      style={{
                                        backgroundColor: 
                                          factor === "Declining Trajectory" ? "#fee2e2" :
                                          factor === "Extended Care" ? "#ffedd5" :
                                          factor === "Minimal Improvement" ? "#fef3c7" :
                                          "#f3f4f6",
                                        color:
                                          factor === "Declining Trajectory" ? "#991b1b" :
                                          factor === "Extended Care" ? "#9a3412" :
                                          factor === "Minimal Improvement" ? "#92400e" :
                                          "#374151",
                                      }}
                                    >
                                      {factor}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="text-xs max-w-[300px]">
                                {episode.recommendation}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="font-semibold">No At-Risk Episodes</p>
                    <p className="text-sm">All patients are progressing well within expected parameters</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
