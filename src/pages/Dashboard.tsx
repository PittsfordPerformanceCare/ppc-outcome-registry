import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getAllEpisodes } from "@/lib/dbOperations";
import { PatientInvitationDialog } from "@/components/PatientInvitationDialog";
import { calculateMCIDSummary } from "@/lib/mcidTracking";
import { EpisodeMeta } from "@/lib/ppcStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ClipboardPlus, TrendingUp, Users, Activity, Clock, Search, Filter, X, Download, Printer, BarChart3, Trash2, CheckSquare, FileText, Mail } from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CircularProgress } from "@/components/CircularProgress";
import { TrendChart } from "@/components/TrendChart";
import { RegionalPerformanceChart } from "@/components/RegionalPerformanceChart";
import { TreatmentEfficacyChart } from "@/components/TreatmentEfficacyChart";
import { MCIDStatisticsCard } from "@/components/MCIDStatisticsCard";
import { PPC_CONFIG } from "@/lib/ppcConfig";
import { generateBatchMCIDReports } from "@/lib/batchPDFExport";
import { useClinicSettings } from "@/hooks/useClinicSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportScheduler } from "@/components/ExportScheduler";
import { AdvancedFilters, FilterState } from "@/components/AdvancedFilters";
import { DateRangeComparison } from "@/components/DateRangeComparison";
import { PendingEpisodesWidget } from "@/components/PendingEpisodesWidget";
import { OutcomeReminderCronStatus } from "@/components/OutcomeReminderCronStatus";
import { OutcomeReminderHistory } from "@/components/OutcomeReminderHistory";
import { PullToRefresh } from "@/components/PullToRefresh";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { useHaptics } from "@/hooks/useHaptics";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { EpisodeCardWithSwipe } from "@/components/EpisodeCardWithSwipe";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Episode {
  id: string;
  user_id: string;
  patient_name: string;
  date_of_birth?: string;
  region: string;
  diagnosis?: string;
  date_of_service: string;
  discharge_date?: string;
  clinician?: string;
  created_at: string;
  episode_type?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodesWithScores, setEpisodesWithScores] = useState<EpisodeMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [exportingPDFs, setExportingPDFs] = useState(false);
  const { toast } = useToast();
  const { settings } = useClinicSettings();
  const { success } = useHaptics();
  
  // Neuro exam dialog state
  const [neuroExamDialogOpen, setNeuroExamDialogOpen] = useState(false);
  const [selectedEpisodeForNeuro, setSelectedEpisodeForNeuro] = useState<string>("");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterClinician, setFilterClinician] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    statuses: [],
    diagnoses: [],
    regions: [],
    scoreRange: [0, 100],
    hasOutcomeScores: null,
  });
  
  // Bulk action states
  const [selectedEpisodes, setSelectedEpisodes] = useState<Set<string>>(new Set());
  
  // Patient invitation dialog state
  const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);
  const [selectedEpisodeForInvitation, setSelectedEpisodeForInvitation] = useState<Episode | null>(null);

  useEffect(() => {
    loadEpisodes();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from("user_roles")
      .select()
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const loadEpisodes = async () => {
    try {
      const data = await getAllEpisodes();
      setEpisodes(data);
      
      // Fetch outcome scores for chart components
      const { data: scores, error } = await supabase
        .from("outcome_scores")
        .select("*")
        .order("recorded_at", { ascending: true });
      
      if (error) throw error;
      
      // Transform to EpisodeMeta format
      const episodesWithScoresData: EpisodeMeta[] = data
        .filter(ep => ep.discharge_date) // Only completed episodes for charts
        .map(ep => {
          const episodeScores = scores?.filter(s => s.episode_id === ep.id) || [];
          
          // Build baselineScores and dischargeScores
          const baselineScores: Record<string, number> = {};
          const dischargeScores: Record<string, number> = {};
          
          episodeScores.forEach(score => {
            if (score.score_type === "baseline") {
              baselineScores[score.index_type] = score.score;
            } else if (score.score_type === "discharge") {
              dischargeScores[score.index_type] = score.score;
            }
          });
          
          return {
            episodeId: ep.id,
            patientName: ep.patient_name,
            region: ep.region,
            dateOfService: ep.date_of_service,
            indices: Object.keys(baselineScores),
            baselineScores: Object.keys(baselineScores).length > 0 ? baselineScores : undefined,
            dischargeScores: Object.keys(dischargeScores).length > 0 ? dischargeScores : undefined,
            dischargeDate: ep.discharge_date || undefined,
          };
        });
      
      setEpisodesWithScores(episodesWithScoresData);
    } catch (error: any) {
      toast({
        title: "Error loading episodes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get unique clinicians from episodes
  const uniqueClinicians = useMemo(() => {
    const clinicians = new Set(episodes.map(ep => ep.clinician).filter(Boolean));
    return Array.from(clinicians).sort();
  }, [episodes]);

  // Get unique diagnoses from episodes
  const uniqueDiagnoses = useMemo(() => {
    const diagnoses = new Set(episodes.map(ep => ep.diagnosis).filter(Boolean));
    return Array.from(diagnoses).sort();
  }, [episodes]);

  // Get unique regions from episodes
  const uniqueRegions = useMemo(() => {
    const regions = new Set(episodes.map(ep => ep.region).filter(Boolean));
    return Array.from(regions).sort();
  }, [episodes]);

  // Filtered episodes
  const filteredEpisodes = useMemo(() => {
    return episodes.filter(episode => {
      // Search query filter (patient name, episode ID, diagnosis)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          episode.patient_name.toLowerCase().includes(query) ||
          episode.id.toLowerCase().includes(query) ||
          (episode.diagnosis && episode.diagnosis.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // Region filter
      if (filterRegion !== "all" && episode.region !== filterRegion) {
        return false;
      }

      // Clinician filter
      if (filterClinician !== "all" && episode.clinician !== filterClinician) {
        return false;
      }

      // Date range filter
      if (filterDateFrom) {
        const episodeDate = new Date(episode.date_of_service);
        const fromDate = new Date(filterDateFrom);
        if (episodeDate < fromDate) return false;
      }

      if (filterDateTo) {
        const episodeDate = new Date(episode.date_of_service);
        const toDate = new Date(filterDateTo);
        if (episodeDate > toDate) return false;
      }

      return true;
    });
  }, [episodes, searchQuery, filterRegion, filterClinician, filterDateFrom, filterDateTo]);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterRegion("all");
    setFilterClinician("all");
    setFilterDateFrom("");
    setFilterDateTo("");
    setAdvancedFilters({
      statuses: [],
      diagnoses: [],
      regions: [],
      scoreRange: [0, 100],
      hasOutcomeScores: null,
    });
  };

  const hasActiveFilters = searchQuery || filterRegion !== "all" || filterClinician !== "all" || filterDateFrom || filterDateTo;

  // Bulk action handlers
  const toggleSelectAll = () => {
    if (selectedEpisodes.size === filteredEpisodes.length) {
      setSelectedEpisodes(new Set());
    } else {
      setSelectedEpisodes(new Set(filteredEpisodes.map(ep => ep.id)));
    }
  };

  const toggleSelectEpisode = (episodeId: string) => {
    const newSelected = new Set(selectedEpisodes);
    if (newSelected.has(episodeId)) {
      newSelected.delete(episodeId);
    } else {
      newSelected.add(episodeId);
    }
    setSelectedEpisodes(newSelected);
  };

  const exportSelectedToCSV = () => {
    if (selectedEpisodes.size === 0) {
      toast({
        title: "No episodes selected",
        description: "Please select at least one episode to export",
        variant: "destructive",
      });
      return;
    }

    const selectedData = filteredEpisodes.filter(ep => selectedEpisodes.has(ep.id));
    
    const headers = [
      "Episode ID",
      "Patient Name",
      "Region",
      "Clinician",
      "Date of Service",
      "Diagnosis",
      "Baseline Scores",
      "Discharge Scores",
      "Discharge Date",
      "Status"
    ];

    const rows = selectedData.map(ep => {
      const status = ep.discharge_date ? "Completed" : "Active";

      return [
        ep.id,
        ep.patient_name,
        ep.region,
        ep.clinician || "",
        format(new Date(ep.date_of_service), "MMM dd, yyyy"),
        ep.diagnosis || "",
        "", // baselineScores - TODO: fetch from outcome_scores table
        "", // dischargeScores - TODO: fetch from outcome_scores table
        ep.discharge_date ? format(new Date(ep.discharge_date), "MMM dd, yyyy") : "",
        status
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `selected-episodes-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `Exported ${selectedEpisodes.size} episode${selectedEpisodes.size !== 1 ? 's' : ''}`,
    });
  };

  const exportSelectedToPDF = async () => {
    if (selectedEpisodes.size === 0) {
      toast({
        title: "No episodes selected",
        description: "Please select at least one episode to export",
        variant: "destructive",
      });
      return;
    }

    setExportingPDFs(true);

    try {
      const result = await generateBatchMCIDReports(
        Array.from(selectedEpisodes),
        settings
      );

      if (result.success > 0) {
        toast({
          title: "PDF export completed",
          description: `Successfully exported ${result.success} report${result.success !== 1 ? 's' : ''}${result.failed > 0 ? `. ${result.failed} failed.` : ''}`,
        });
      }

      if (result.errors.length > 0) {
        console.error("Export errors:", result.errors);
        toast({
          title: "Some exports failed",
          description: result.errors.slice(0, 3).join("; "),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setExportingPDFs(false);
    }
  };

  const deleteSelectedEpisodes = async () => {
    if (selectedEpisodes.size === 0) {
      toast({
        title: "No episodes selected",
        description: "Please select at least one episode to delete",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedEpisodes.size} episode${selectedEpisodes.size !== 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete episodes from database
      const { error } = await supabase
        .from("episodes")
        .delete()
        .in("id", Array.from(selectedEpisodes));

      if (error) throw error;

      // Refresh episodes
      await loadEpisodes();
      setSelectedEpisodes(new Set());

      toast({
        title: "Episodes deleted",
        description: `Successfully deleted ${selectedEpisodes.size} episode${selectedEpisodes.size !== 1 ? 's' : ''}`,
      });
    } catch (error: any) {
      toast({
        title: "Error deleting episodes",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Episode ID",
      "Patient Name",
      "Region",
      "Clinician",
      "Date of Service",
      "Diagnosis",
      "Baseline Scores",
      "Discharge Scores",
      "Discharge Date",
      "Status"
    ];

    const rows = filteredEpisodes.map(ep => {
      const status = ep.discharge_date ? "Completed" : "Active";

      return [
        ep.id,
        ep.patient_name,
        ep.region,
        ep.clinician || "",
        format(new Date(ep.date_of_service), "MMM dd, yyyy"),
        ep.diagnosis || "",
        "", // baselineScores - TODO: fetch from outcome_scores table
        "", // dischargeScores - TODO: fetch from outcome_scores table
        ep.discharge_date ? format(new Date(ep.discharge_date), "MMM dd, yyyy") : "",
        status
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ppc-episodes-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Pull to refresh handler
  const handleRefresh = async () => {
    await loadEpisodes();
    
    // Trigger success haptic on successful refresh
    success();
    
    toast({
      title: "Refreshed",
      description: "Dashboard data has been updated.",
    });
  };

  // Handle neuro exam navigation
  const handleNeuroExamClick = () => {
    setNeuroExamDialogOpen(true);
  };

  const handleNeuroExamConfirm = () => {
    if (selectedEpisodeForNeuro) {
      navigate(`/neuro-exam?episode=${selectedEpisodeForNeuro}`);
      setNeuroExamDialogOpen(false);
      setSelectedEpisodeForNeuro("");
    }
  };

  // TODO: Fetch followups from database
  const pendingFollowups: Episode[] = [];

  // Calculate average patient improvement from outcome scores
  const calculateOutcomeImprovement = () => {
    const completedEpisodes = episodesWithScores.filter(ep => 
      ep.dischargeScores && 
      ep.baselineScores && 
      ep.dischargeDate
    );
    
    if (completedEpisodes.length === 0) return 0;
    
    const totalImprovement = completedEpisodes.reduce((sum, ep) => {
      const baselineValues = Object.values(ep.baselineScores || {});
      const dischargeValues = Object.values(ep.dischargeScores || {});
      
      if (baselineValues.length === 0 || dischargeValues.length === 0) return sum;
      
      const baseline = baselineValues.reduce((s, v) => s + v, 0) / baselineValues.length;
      const discharge = dischargeValues.reduce((s, v) => s + v, 0) / dischargeValues.length;
      const improvement = baseline > 0 ? ((baseline - discharge) / baseline) * 100 : 0;
      
      // Skip if NaN or not finite
      if (isNaN(improvement) || !isFinite(improvement)) return sum;
      
      return sum + Math.max(0, Math.min(100, improvement));
    }, 0);
    
    return Math.round(totalImprovement / completedEpisodes.length);
  };

  // Calculate average days to discharge
  const calculateAvgDaysToDischarge = () => {
    const dischargedEpisodes = episodes.filter(ep => ep.discharge_date && ep.date_of_service);
    
    if (dischargedEpisodes.length === 0) return 0;

    const totalDays = dischargedEpisodes.reduce((sum, ep) => {
      const start = new Date(ep.date_of_service).getTime();
      const end = new Date(ep.discharge_date!).getTime();
      const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return Math.round(totalDays / dischargedEpisodes.length);
  };

  const avgOutcomeImprovement = calculateOutcomeImprovement();
  const avgDaysToDischarge = calculateAvgDaysToDischarge();

  // Calculate MCID statistics (must be before early return to satisfy Rules of Hooks)
  const mcidStatistics = useMemo(() => {
    const completedEpisodes = episodesWithScores.filter(e => 
      e.dischargeScores && Object.keys(e.dischargeScores).length > 0
    );
    
    let totalAchieved = 0;
    let totalImprovementSum = 0;
    let measurementCount = 0;

    completedEpisodes.forEach(episode => {
      if (episode.baselineScores && episode.dischargeScores) {
        const summary = calculateMCIDSummary(
          episode.baselineScores,
          episode.dischargeScores
        );
        if (summary.achievedMCID > 0) {
          totalAchieved++;
        }
        totalImprovementSum += summary.averageImprovement;
        measurementCount++;
      }
    });

    const achievementRate = completedEpisodes.length > 0
      ? (totalAchieved / completedEpisodes.length) * 100
      : 0;
    
    const averageImprovement = measurementCount > 0
      ? totalImprovementSum / measurementCount
      : 0;

    return {
      totalCompletedEpisodes: completedEpisodes.length,
      episodesAchievingMCID: totalAchieved,
      achievementRate,
      averageImprovement
    };
  }, [episodesWithScores]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-8">
      {/* Hero Section */}
      <div className="rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8">
        <h1 className="mb-2 text-3xl font-bold text-primary">Welcome to PPC Outcome Registry</h1>
        <p className="text-lg text-muted-foreground">
          Track patient progress and clinical outcomes with evidence-based MCID calculations
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link to="/patient-intake" className="group inline-block">
            <Button 
              size="lg" 
              className="gap-3 relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-primary hover:from-primary hover:via-primary/80 hover:to-primary/90 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in px-8 py-7 text-lg font-bold border-2 border-primary/20 hover:border-primary/40"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <ClipboardPlus className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative">Create New Patient</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
            </Button>
          </Link>
          
          <Button 
            size="lg"
            onClick={handleNeuroExamClick}
            variant="outline"
            className="gap-3 relative overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in px-8 py-7 text-lg font-bold border-2 hover:bg-primary/5"
          >
            <Activity className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
            <span className="relative">Neuro Exam</span>
          </Button>
        </div>
      </div>

      {/* Performance Dials */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>Outcome Improvement</CardTitle>
            </div>
            <CardDescription>Average patient improvement across all indices</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <CircularProgress
              value={avgOutcomeImprovement}
              max={100}
              size={180}
              strokeWidth={14}
              color="success"
              label="Improvement"
              subtitle={`Based on ${episodes.filter(ep => ep.discharge_date).length} completed episodes`}
            />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <CardTitle>Time to Discharge</CardTitle>
            </div>
            <CardDescription>Average days from intake to discharge</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <CircularProgress
              value={avgDaysToDischarge}
              max={90}
              size={180}
              strokeWidth={14}
              color="info"
              label="Days"
              subtitle={`Target: ≤ 45 days | Actual: ${avgDaysToDischarge} days avg`}
            />
          </CardContent>
        </Card>
      </div>

      {/* Pending Episodes Widget */}
      <PendingEpisodesWidget />

      {/* Outcome Reminder Cron Status */}
      <OutcomeReminderCronStatus />

      {/* Outcome Reminder History */}
      <OutcomeReminderHistory />

      {/* Data Visualization & Analytics Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-primary">Analytics & Insights</h2>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="advanced-filters">Advanced Filters</TabsTrigger>
            <TabsTrigger value="comparison">Date Comparison</TabsTrigger>
            <TabsTrigger value="scheduler">Export Scheduler</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <TrendChart episodes={episodesWithScores} />
              <RegionalPerformanceChart episodes={episodesWithScores} />
            </div>
            
            <TreatmentEfficacyChart episodes={episodesWithScores} />
          </TabsContent>

          <TabsContent value="advanced-filters">
            <AdvancedFilters
              availableDiagnoses={uniqueDiagnoses}
              availableRegions={uniqueRegions}
              onFiltersChange={setAdvancedFilters}
              initialFilters={advancedFilters}
            />
          </TabsContent>

          <TabsContent value="comparison">
            <DateRangeComparison episodes={episodes} />
          </TabsContent>

          <TabsContent value="scheduler">
            <ExportScheduler 
              currentFilters={{
                region: filterRegion !== "all" ? filterRegion : undefined,
                clinician: filterClinician !== "all" ? filterClinician : undefined,
                dateFrom: filterDateFrom || undefined,
                dateTo: filterDateTo || undefined,
                ...advancedFilters,
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Search & Filter Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Search & Filter Episodes</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={filteredEpisodes.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={filteredEpisodes.length === 0}
                className="gap-2 print:hidden"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by patient name, episode ID, or diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <Label htmlFor="filter-region">Region</Label>
                <Select value={filterRegion} onValueChange={setFilterRegion}>
                  <SelectTrigger id="filter-region">
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {PPC_CONFIG.regionEnum.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-clinician">Clinician</Label>
                <Select value={filterClinician} onValueChange={setFilterClinician}>
                  <SelectTrigger id="filter-clinician">
                    <SelectValue placeholder="All clinicians" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clinicians</SelectItem>
                    {uniqueClinicians.map((clinician) => (
                      <SelectItem key={clinician} value={clinician}>
                        {clinician}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-date-from">Date From</Label>
                <Input
                  id="filter-date-from"
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-date-to">Date To</Label>
                <Input
                  id="filter-date-to"
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between rounded-md bg-muted p-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Active Filters:</span>
                {searchQuery && (
                  <Badge variant="secondary">
                    Search: {searchQuery}
                  </Badge>
                )}
                {filterRegion !== "all" && (
                  <Badge variant="secondary">
                    Region: {filterRegion}
                  </Badge>
                )}
                {filterClinician !== "all" && (
                  <Badge variant="secondary">
                    Clinician: {filterClinician}
                  </Badge>
                )}
                {filterDateFrom && (
                  <Badge variant="secondary">
                    From: {format(new Date(filterDateFrom), "MMM dd, yyyy")}
                  </Badge>
                )}
                {filterDateTo && (
                  <Badge variant="secondary">
                    To: {format(new Date(filterDateTo), "MMM dd, yyyy")}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredEpisodes.length}</span> of{" "}
            <span className="font-semibold text-foreground">{episodes.length}</span> episodes
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* MCID Success Rate */}
        <MCIDStatisticsCard 
          statistics={mcidStatistics}
        />
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Filtered Episodes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEpisodes.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredEpisodes.length === episodes.length ? "All episodes" : `Filtered from ${episodes.length} total`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Follow-ups</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingFollowups.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {episodes.length > 0
                ? Math.round(((episodes.length - pendingFollowups.length) / episodes.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Follow-ups completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Episodes List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {hasActiveFilters ? "Filtered Episodes" : "Recent Episodes"}
              </CardTitle>
              <CardDescription>
                {hasActiveFilters 
                  ? `${filteredEpisodes.length} episode${filteredEpisodes.length !== 1 ? "s" : ""} match your search criteria`
                  : "Your most recent patient outcome episodes"
                }
              </CardDescription>
            </div>
            {filteredEpisodes.length > 0 && (
              <div className="flex items-center gap-2">
                {selectedEpisodes.size > 0 && (
                  <>
                    <Badge variant="secondary" className="h-8 px-3">
                      {selectedEpisodes.size} selected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportSelectedToPDF}
                      disabled={exportingPDFs}
                      className="gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {exportingPDFs ? "Exporting PDFs..." : "Export PDFs"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportSelectedToCSV}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={deleteSelectedEpisodes}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="gap-2"
                >
                  <CheckSquare className="h-4 w-4" />
                  {selectedEpisodes.size === filteredEpisodes.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {episodes.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No episodes yet. Create your first episode to get started.</p>
              <Link to="/new-episode">
                <Button className="mt-4" variant="outline">
                  <ClipboardPlus className="mr-2 h-4 w-4" />
                  Create Episode
                </Button>
              </Link>
            </div>
          ) : filteredEpisodes.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No episodes match your search criteria.</p>
              <Button className="mt-4" variant="outline" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEpisodes.slice(0, 10).map((episode) => {
                const isSelected = selectedEpisodes.has(episode.id);

                return (
                  <EpisodeCardWithSwipe
                    key={episode.id}
                    episode={episode}
                    isSelected={isSelected}
                    onSelect={() => toggleSelectEpisode(episode.id)}
                    onInvite={() => {
                      setSelectedEpisodeForInvitation(episode);
                      setInvitationDialogOpen(true);
                    }}
                    onDelete={async () => {
                      const { error } = await supabase
                        .from("episodes")
                        .delete()
                        .eq("id", episode.id);

                      if (error) {
                        toast({
                          title: "Error",
                          description: "Failed to delete episode",
                          variant: "destructive",
                        });
                      } else {
                        toast({
                          title: "Deleted",
                          description: "Episode deleted successfully",
                        });
                        loadEpisodes();
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Invitation Dialog */}
      {selectedEpisodeForInvitation && (
        <PatientInvitationDialog
          open={invitationDialogOpen}
          onOpenChange={setInvitationDialogOpen}
          episodeId={selectedEpisodeForInvitation.id}
          patientName={selectedEpisodeForInvitation.patient_name}
        />
      )}

      {/* Neuro Exam Episode Selection Dialog */}
      <Dialog open={neuroExamDialogOpen} onOpenChange={setNeuroExamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Episode for Neuro Exam</DialogTitle>
            <DialogDescription>
              Choose which episode to perform the neurologic examination for.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="episode-select">Episode</Label>
              <Select
                value={selectedEpisodeForNeuro}
                onValueChange={setSelectedEpisodeForNeuro}
              >
                <SelectTrigger id="episode-select">
                  <SelectValue placeholder="Select an episode..." />
                </SelectTrigger>
                <SelectContent>
                  {episodes
                    .filter(ep => !ep.discharge_date) // Only active episodes
                    .map(ep => (
                      <SelectItem key={ep.id} value={ep.id}>
                        {ep.patient_name} - {ep.region} ({format(new Date(ep.date_of_service), "MMM dd, yyyy")})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setNeuroExamDialogOpen(false);
                  setSelectedEpisodeForNeuro("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNeuroExamConfirm}
                disabled={!selectedEpisodeForNeuro}
              >
                Continue to Exam
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </PullToRefresh>
  );
}
