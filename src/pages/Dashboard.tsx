import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PatientInvitationDialog } from "@/components/PatientInvitationDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ClipboardPlus, TrendingUp, Users, Search, Filter, X, Download, Printer, BarChart3, Trash2, CheckSquare, FileText } from "lucide-react";
import { format } from "date-fns";
import { MCIDStatisticsCard } from "@/components/MCIDStatisticsCard";
import { PPC_CONFIG } from "@/lib/ppcConfig";
import { generateBatchMCIDReports } from "@/lib/batchPDFExport";
import { useClinicSettings } from "@/hooks/useClinicSettings";
import { useToast } from "@/hooks/use-toast";
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
import { EpisodeCardWithSwipe } from "@/components/EpisodeCardWithSwipe";
import { ReferralQRGenerator } from "@/components/ReferralQRGenerator";
import LeadsOverview from "@/components/LeadsOverview";
import IntakesReviewQueue from "@/components/IntakesReviewQueue";
import { DailyPrepWidget } from "@/components/DailyPrepWidget";
import { TrendChart } from "@/components/TrendChart";
import { RegionalPerformanceChart } from "@/components/RegionalPerformanceChart";
import { TreatmentEfficacyChart } from "@/components/TreatmentEfficacyChart";
import { useDashboardData, Episode } from "@/hooks/useDashboardData";
import { DashboardHero, InboxCards, PerformanceDials } from "@/components/dashboard";
import { ErrorBoundary, InlineErrorBoundary } from "@/components/ErrorBoundary";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    episodes, 
    episodesWithScores, 
    loading, 
    inboxCounts,
    uniqueClinicians,
    uniqueDiagnoses,
    uniqueRegions,
    avgOutcomeImprovement,
    avgDaysToDischarge,
    mcidStatistics,
    loadEpisodes,
  } = useDashboardData();
  
  const [exportingPDFs, setExportingPDFs] = useState(false);
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

  // Filtered episodes
  const filteredEpisodes = useMemo(() => {
    return episodes.filter(episode => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          episode.patient_name.toLowerCase().includes(query) ||
          episode.id.toLowerCase().includes(query) ||
          (episode.diagnosis && episode.diagnosis.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      if (filterRegion !== "all" && episode.region !== filterRegion) return false;
      if (filterClinician !== "all" && episode.clinician !== filterClinician) return false;
      if (filterDateFrom) {
        const episodeDate = new Date(episode.date_of_service);
        if (episodeDate < new Date(filterDateFrom)) return false;
      }
      if (filterDateTo) {
        const episodeDate = new Date(episode.date_of_service);
        if (episodeDate > new Date(filterDateTo)) return false;
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

  const exportToCSV = () => {
    const dataToExport = selectedEpisodes.size > 0 
      ? filteredEpisodes.filter(ep => selectedEpisodes.has(ep.id))
      : filteredEpisodes;

    if (dataToExport.length === 0) {
      toast({
        title: "No episodes to export",
        description: "Please select episodes or adjust your filters",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Episode ID", "Patient Name", "Region", "Clinician", "Date of Service", "Diagnosis", "Discharge Date", "Status"];
    const rows = dataToExport.map(ep => [
      ep.id,
      ep.patient_name,
      ep.region,
      ep.clinician || "",
      format(new Date(ep.date_of_service), "MMM dd, yyyy"),
      ep.diagnosis || "",
      ep.discharge_date ? format(new Date(ep.discharge_date), "MMM dd, yyyy") : "",
      ep.discharge_date ? "Completed" : "Active"
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `ppc-episodes-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Export successful", description: `Exported ${dataToExport.length} episodes` });
  };

  const exportSelectedToPDF = async () => {
    if (selectedEpisodes.size === 0) {
      toast({ title: "No episodes selected", description: "Please select at least one episode", variant: "destructive" });
      return;
    }

    setExportingPDFs(true);
    try {
      const result = await generateBatchMCIDReports(Array.from(selectedEpisodes), settings);
      if (result.success > 0) {
        toast({ title: "PDF export completed", description: `Exported ${result.success} reports` });
      }
      if (result.errors.length > 0) {
        toast({ title: "Some exports failed", description: result.errors.slice(0, 3).join("; "), variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
    } finally {
      setExportingPDFs(false);
    }
  };

  const deleteSelectedEpisodes = async () => {
    if (selectedEpisodes.size === 0 || !confirm(`Delete ${selectedEpisodes.size} episode(s)?`)) return;

    try {
      const { error } = await supabase.from("episodes").delete().in("id", Array.from(selectedEpisodes));
      if (error) throw error;
      await loadEpisodes();
      setSelectedEpisodes(new Set());
      toast({ title: "Episodes deleted", description: `Deleted ${selectedEpisodes.size} episodes` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRefresh = async () => {
    await loadEpisodes();
    success();
    toast({ title: "Refreshed", description: "Dashboard data has been updated." });
  };

  const handleNeuroExamClick = () => setNeuroExamDialogOpen(true);

  const handleNeuroExamConfirm = () => {
    if (selectedEpisodeForNeuro) {
      navigate(`/neuro-exam?episode=${selectedEpisodeForNeuro}`);
      setNeuroExamDialogOpen(false);
      setSelectedEpisodeForNeuro("");
    }
  };

  const pendingFollowups: Episode[] = [];

  if (loading) return <DashboardSkeleton />;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-8">
        <DashboardHero onNeuroExamClick={handleNeuroExamClick} />
        <ErrorBoundary>
          <DailyPrepWidget />
        </ErrorBoundary>
        <ErrorBoundary>
          <InboxCards inboxCounts={inboxCounts} />
        </ErrorBoundary>
        <ErrorBoundary>
          <ReferralQRGenerator />
        </ErrorBoundary>
        <ErrorBoundary>
          <LeadsOverview />
        </ErrorBoundary>
        <ErrorBoundary>
          <IntakesReviewQueue />
        </ErrorBoundary>
        
        <ErrorBoundary>
          <PerformanceDials 
            avgOutcomeImprovement={avgOutcomeImprovement}
            avgDaysToDischarge={avgDaysToDischarge}
            completedEpisodesCount={episodes.filter(ep => ep.discharge_date).length}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <PendingEpisodesWidget />
        </ErrorBoundary>
        <ErrorBoundary>
          <OutcomeReminderCronStatus />
        </ErrorBoundary>
        <ErrorBoundary>
          <OutcomeReminderHistory />
        </ErrorBoundary>

        {/* Analytics Section */}
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
                <ErrorBoundary>
                  <TrendChart episodes={episodesWithScores} />
                </ErrorBoundary>
                <ErrorBoundary>
                  <RegionalPerformanceChart episodes={episodesWithScores} />
                </ErrorBoundary>
              </div>
              <ErrorBoundary>
                <TreatmentEfficacyChart episodes={episodesWithScores} />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="advanced-filters">
              <ErrorBoundary>
                <AdvancedFilters
                  availableDiagnoses={uniqueDiagnoses}
                  availableRegions={uniqueRegions}
                  onFiltersChange={setAdvancedFilters}
                  initialFilters={advancedFilters}
                />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="comparison">
              <ErrorBoundary>
                <DateRangeComparison episodes={episodes} />
              </ErrorBoundary>
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
                <Button variant="outline" size="sm" onClick={exportToCSV} disabled={filteredEpisodes.length === 0} className="gap-2">
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()} disabled={filteredEpisodes.length === 0} className="gap-2 print:hidden">
                  <Printer className="h-4 w-4" /> Print
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                  <Filter className="h-4 w-4" /> {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by patient name, episode ID, or diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {showFilters && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select value={filterRegion} onValueChange={setFilterRegion}>
                    <SelectTrigger><SelectValue placeholder="All regions" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {PPC_CONFIG.regionEnum.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Clinician</Label>
                  <Select value={filterClinician} onValueChange={setFilterClinician}>
                    <SelectTrigger><SelectValue placeholder="All clinicians" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Clinicians</SelectItem>
                      {uniqueClinicians.map(clinician => <SelectItem key={clinician} value={clinician}>{clinician}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date From</Label>
                  <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date To</Label>
                  <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
                </div>
              </div>
            )}

            {hasActiveFilters && (
              <div className="flex items-center justify-between rounded-md bg-muted p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">Active Filters:</span>
                  {searchQuery && <Badge variant="secondary">Search: {searchQuery}</Badge>}
                  {filterRegion !== "all" && <Badge variant="secondary">Region: {filterRegion}</Badge>}
                  {filterClinician !== "all" && <Badge variant="secondary">Clinician: {filterClinician}</Badge>}
                  {filterDateFrom && <Badge variant="secondary">From: {format(new Date(filterDateFrom), "MMM dd, yyyy")}</Badge>}
                  {filterDateTo && <Badge variant="secondary">To: {format(new Date(filterDateTo), "MMM dd, yyyy")}</Badge>}
                </div>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" /> Clear All
                </Button>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredEpisodes.length}</span> of <span className="font-semibold text-foreground">{episodes.length}</span> episodes
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MCIDStatisticsCard statistics={mcidStatistics} />
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
                {episodes.length > 0 ? Math.round(((episodes.length - pendingFollowups.length) / episodes.length) * 100) : 0}%
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
                <CardTitle>{hasActiveFilters ? "Filtered Episodes" : "Recent Episodes"}</CardTitle>
                <CardDescription>
                  {hasActiveFilters 
                    ? `${filteredEpisodes.length} episode${filteredEpisodes.length !== 1 ? "s" : ""} match your criteria`
                    : "Your most recent patient outcome episodes"
                  }
                </CardDescription>
              </div>
              {filteredEpisodes.length > 0 && (
                <div className="flex items-center gap-2">
                  {selectedEpisodes.size > 0 && (
                    <>
                      <Badge variant="secondary" className="h-8 px-3">{selectedEpisodes.size} selected</Badge>
                      <Button variant="outline" size="sm" onClick={exportSelectedToPDF} disabled={exportingPDFs} className="gap-2">
                        <FileText className="h-4 w-4" /> {exportingPDFs ? "Exporting..." : "Export PDFs"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
                        <Download className="h-4 w-4" /> Export CSV
                      </Button>
                      <Button variant="destructive" size="sm" onClick={deleteSelectedEpisodes} className="gap-2">
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="gap-2">
                    <CheckSquare className="h-4 w-4" /> {selectedEpisodes.size === filteredEpisodes.length ? "Deselect All" : "Select All"}
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
                    <ClipboardPlus className="mr-2 h-4 w-4" /> Create Episode
                  </Button>
                </Link>
              </div>
            ) : filteredEpisodes.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No episodes match your search criteria.</p>
                <Button className="mt-4" variant="outline" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" /> Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEpisodes.slice(0, 10).map((episode) => (
                  <EpisodeCardWithSwipe
                    key={episode.id}
                    episode={episode}
                    isSelected={selectedEpisodes.has(episode.id)}
                    onSelect={() => toggleSelectEpisode(episode.id)}
                    onInvite={() => {
                      setSelectedEpisodeForInvitation(episode);
                      setInvitationDialogOpen(true);
                    }}
                    onDelete={async () => {
                      const { error } = await supabase.from("episodes").delete().eq("id", episode.id);
                      if (error) {
                        toast({ title: "Error", description: "Failed to delete episode", variant: "destructive" });
                      } else {
                        toast({ title: "Deleted", description: "Episode deleted successfully" });
                        loadEpisodes();
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedEpisodeForInvitation && (
          <PatientInvitationDialog
            open={invitationDialogOpen}
            onOpenChange={setInvitationDialogOpen}
            episodeId={selectedEpisodeForInvitation.id}
            patientName={selectedEpisodeForInvitation.patient_name}
          />
        )}

        <Dialog open={neuroExamDialogOpen} onOpenChange={setNeuroExamDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Episode for Neuro Exam</DialogTitle>
              <DialogDescription>Choose which episode to perform the neurologic examination for.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Episode</Label>
                <Select value={selectedEpisodeForNeuro} onValueChange={setSelectedEpisodeForNeuro}>
                  <SelectTrigger><SelectValue placeholder="Select an episode..." /></SelectTrigger>
                  <SelectContent>
                    {episodes.filter(ep => !ep.discharge_date).map(ep => (
                      <SelectItem key={ep.id} value={ep.id}>
                        {ep.patient_name} - {ep.region} ({format(new Date(ep.date_of_service), "MMM dd, yyyy")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setNeuroExamDialogOpen(false); setSelectedEpisodeForNeuro(""); }}>Cancel</Button>
                <Button onClick={handleNeuroExamConfirm} disabled={!selectedEpisodeForNeuro}>Continue to Exam</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PullToRefresh>
  );
}