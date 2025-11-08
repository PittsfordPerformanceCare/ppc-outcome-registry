import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PPC_STORE, EpisodeMeta } from "@/lib/ppcStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ClipboardPlus, TrendingUp, Users, Activity, Clock, Search, Filter, X, Download, Printer, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { CircularProgress } from "@/components/CircularProgress";
import { TrendChart } from "@/components/TrendChart";
import { RegionalPerformanceChart } from "@/components/RegionalPerformanceChart";
import { TreatmentEfficacyChart } from "@/components/TreatmentEfficacyChart";
import { PPC_CONFIG } from "@/lib/ppcConfig";

export default function Dashboard() {
  const [episodes, setEpisodes] = useState<EpisodeMeta[]>([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterClinician, setFilterClinician] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const episodeIds = PPC_STORE.getAllEpisodes();
    const episodeData = episodeIds
      .map((id) => PPC_STORE.getEpisodeMeta(id))
      .filter((ep): ep is EpisodeMeta => ep !== null)
      .sort((a, b) => new Date(b.dateOfService).getTime() - new Date(a.dateOfService).getTime());
    setEpisodes(episodeData);
  }, []);

  // Get unique clinicians from episodes
  const uniqueClinicians = useMemo(() => {
    const clinicians = new Set(episodes.map(ep => ep.clinician).filter(Boolean));
    return Array.from(clinicians).sort();
  }, [episodes]);

  // Filtered episodes
  const filteredEpisodes = useMemo(() => {
    return episodes.filter(episode => {
      // Search query filter (patient name, episode ID, diagnosis)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          episode.patientName.toLowerCase().includes(query) ||
          episode.episodeId.toLowerCase().includes(query) ||
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
        const episodeDate = new Date(episode.dateOfService);
        const fromDate = new Date(filterDateFrom);
        if (episodeDate < fromDate) return false;
      }

      if (filterDateTo) {
        const episodeDate = new Date(episode.dateOfService);
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
  };

  const hasActiveFilters = searchQuery || filterRegion !== "all" || filterClinician !== "all" || filterDateFrom || filterDateTo;

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
      const baselineScoresStr = ep.baselineScores 
        ? Object.entries(ep.baselineScores).map(([idx, score]) => `${idx}:${score}`).join("; ")
        : "";
      const dischargeScoresStr = ep.dischargeScores
        ? Object.entries(ep.dischargeScores).map(([idx, score]) => `${idx}:${score}`).join("; ")
        : "";
      
      const status = ep.dischargeDate ? "Completed" : "Active";

      return [
        ep.episodeId,
        ep.patientName,
        ep.region,
        ep.clinician || "",
        format(new Date(ep.dateOfService), "MMM dd, yyyy"),
        ep.diagnosis || "",
        baselineScoresStr,
        dischargeScoresStr,
        ep.dischargeDate ? format(new Date(ep.dischargeDate), "MMM dd, yyyy") : "",
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

  const pendingFollowups = filteredEpisodes.filter((ep) => {
    const followup = PPC_STORE.getFollowupMeta(ep.episodeId);
    return followup && !PPC_STORE.isFollowupCompleted(ep.episodeId);
  });

  // Calculate average outcome improvement
  const calculateOutcomeImprovement = () => {
    const completedEpisodes = episodes.filter(ep => 
      ep.dischargeScores && ep.baselineScores && Object.keys(ep.dischargeScores).length > 0
    );

    if (completedEpisodes.length === 0) return 0;

    let totalImprovement = 0;
    let count = 0;

    completedEpisodes.forEach(ep => {
      Object.keys(ep.baselineScores || {}).forEach(index => {
        const baseline = ep.baselineScores?.[index];
        const discharge = ep.dischargeScores?.[index];
        
        if (baseline != null && discharge != null && baseline > 0) {
          // Calculate percentage improvement (lower scores are better, so discharge < baseline = improvement)
          const improvement = ((baseline - discharge) / baseline) * 100;
          totalImprovement += improvement;
          count++;
        }
      });
    });

    return count > 0 ? Math.max(0, Math.min(100, totalImprovement / count)) : 0;
  };

  // Calculate average days to discharge
  const calculateAvgDaysToDischarge = () => {
    const dischargedEpisodes = episodes.filter(ep => ep.dischargeDate && ep.dateOfService);
    
    if (dischargedEpisodes.length === 0) return 0;

    const totalDays = dischargedEpisodes.reduce((sum, ep) => {
      const start = new Date(ep.dateOfService).getTime();
      const end = new Date(ep.dischargeDate!).getTime();
      const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return Math.round(totalDays / dischargedEpisodes.length);
  };

  const avgOutcomeImprovement = calculateOutcomeImprovement();
  const avgDaysToDischarge = calculateAvgDaysToDischarge();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8">
        <h1 className="mb-2 text-3xl font-bold text-primary">Welcome to PPC Outcome Registry</h1>
        <p className="text-lg text-muted-foreground">
          Track patient progress and clinical outcomes with evidence-based MCID calculations
        </p>
        <div className="mt-6">
          <Link to="/new-episode">
            <Button size="lg" className="gap-2">
              <ClipboardPlus className="h-5 w-5" />
              Create New Episode
            </Button>
          </Link>
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
              subtitle={`Based on ${episodes.filter(ep => ep.dischargeScores).length} completed episodes`}
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

      {/* Data Visualization Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-primary">Analytics & Insights</h2>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <TrendChart episodes={filteredEpisodes} />
          <RegionalPerformanceChart episodes={filteredEpisodes} />
        </div>
        
        <TreatmentEfficacyChart episodes={filteredEpisodes} />
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
      <div className="grid gap-6 md:grid-cols-3">
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
          <CardTitle>
            {hasActiveFilters ? "Filtered Episodes" : "Recent Episodes"}
          </CardTitle>
          <CardDescription>
            {hasActiveFilters 
              ? `${filteredEpisodes.length} episode${filteredEpisodes.length !== 1 ? "s" : ""} match your search criteria`
              : "Your most recent patient outcome episodes"
            }
          </CardDescription>
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
                const followup = PPC_STORE.getFollowupMeta(episode.episodeId);
                const isCompleted = PPC_STORE.isFollowupCompleted(episode.episodeId);

                return (
                  <div
                    key={episode.episodeId}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{episode.patientName}</p>
                        <Badge variant="outline" className="text-xs">
                          {episode.region}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Episode ID: {episode.episodeId} | Service Date:{" "}
                        {format(new Date(episode.dateOfService), "MMM dd, yyyy")}
                      </p>
                      <div className="flex gap-2">
                        {episode.indices.map((index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {index}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {followup && (
                        <Badge className={isCompleted ? "badge-complete" : "badge-warning"}>
                          {isCompleted ? "Completed" : "Pending Follow-up"}
                        </Badge>
                      )}
                      <Link to={`/episode-summary?id=${episode.episodeId}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                      {!followup && (
                        <Link to={`/follow-up?episode=${episode.episodeId}`}>
                          <Button size="sm" variant="outline">
                            Schedule Follow-up
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
