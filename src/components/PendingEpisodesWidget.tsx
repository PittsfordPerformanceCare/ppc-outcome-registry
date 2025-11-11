import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, AlertCircle, User, FileText, Filter, X, ArrowUpDown, TrendingUp, Clock, AlertTriangle, Flame } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

// Threshold constants (in days)
const THRESHOLD_WARNING = 30; // Yellow warning
const THRESHOLD_CRITICAL = 60; // Red alert

interface PendingEpisode {
  id: string;
  intake_form_id: string;
  complaint_priority: number;
  complaint_text: string;
  complaint_category: string;
  patient_name: string;
  status: string;
  previous_episode_id: string;
  created_at: string;
  scheduled_date: string | null;
  deferred_reason: string | null;
}

export function PendingEpisodesWidget() {
  const [pendingEpisodes, setPendingEpisodes] = useState<PendingEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPatientName, setFilterPatientName] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("priority-asc");
  const navigate = useNavigate();

  useEffect(() => {
    loadPendingEpisodes();

    // Set up realtime subscription
    const channel = supabase
      .channel('pending-episodes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pending_episodes'
        },
        () => {
          loadPendingEpisodes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPendingEpisodes = async () => {
    try {
      const { data, error } = await supabase
        .from("pending_episodes")
        .select("*")
        .in("status", ["pending", "deferred"])
        .order("complaint_priority", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingEpisodes(data || []);
    } catch (error) {
      console.error("Error loading pending episodes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort episodes
  const filteredAndSortedEpisodes = useMemo(() => {
    // First filter
    const filtered = pendingEpisodes.filter(episode => {
      // Status filter
      if (filterStatus !== "all" && episode.status !== filterStatus) {
        return false;
      }

      // Patient name filter
      if (filterPatientName.trim()) {
        const query = filterPatientName.toLowerCase();
        if (!episode.patient_name.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Priority filter
      if (filterPriority !== "all" && episode.complaint_priority !== parseInt(filterPriority)) {
        return false;
      }

      return true;
    });

    // Then sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "priority-asc":
          return a.complaint_priority - b.complaint_priority;
        case "priority-desc":
          return b.complaint_priority - a.complaint_priority;
        case "date-newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "date-oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name-asc":
          return a.patient_name.localeCompare(b.patient_name);
        case "name-desc":
          return b.patient_name.localeCompare(a.patient_name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [pendingEpisodes, filterStatus, filterPatientName, filterPriority, sortBy]);

  const pendingCount = filteredAndSortedEpisodes.filter(ep => ep.status === "pending").length;
  const deferredCount = filteredAndSortedEpisodes.filter(ep => ep.status === "deferred").length;

  const groupedByPatient = filteredAndSortedEpisodes.reduce((acc, episode) => {
    if (!acc[episode.patient_name]) {
      acc[episode.patient_name] = [];
    }
    acc[episode.patient_name].push(episode);
    return acc;
  }, {} as Record<string, PendingEpisode[]>);

  // Get unique priorities for filter dropdown
  const uniquePriorities = useMemo(() => {
    const priorities = new Set(pendingEpisodes.map(ep => ep.complaint_priority));
    return Array.from(priorities).sort((a, b) => a - b);
  }, [pendingEpisodes]);

  const hasActiveFilters = filterStatus !== "all" || filterPatientName.trim() !== "" || filterPriority !== "all";

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterPatientName("");
    setFilterPriority("all");
    setSortBy("priority-asc");
  };

  // Helper function to get days pending
  const getDaysPending = (createdAt: string) => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    return Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Helper function to get threshold status
  const getThresholdStatus = (daysPending: number) => {
    if (daysPending >= THRESHOLD_CRITICAL) return "critical";
    if (daysPending >= THRESHOLD_WARNING) return "warning";
    return "normal";
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    const pending = pendingEpisodes.filter(ep => ep.status === "pending");
    const deferred = pendingEpisodes.filter(ep => ep.status === "deferred");
    
    // Calculate average days pending
    const now = new Date();
    const totalDays = pending.reduce((sum, ep) => {
      const createdDate = new Date(ep.created_at);
      const daysPending = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + daysPending;
    }, 0);
    const avgDaysPending = pending.length > 0 ? Math.round(totalDays / pending.length) : 0;
    
    // Find oldest pending complaint
    const oldestPending = pending.length > 0 
      ? pending.reduce((oldest, ep) => {
          const epDate = new Date(ep.created_at);
          const oldestDate = new Date(oldest.created_at);
          return epDate < oldestDate ? ep : oldest;
        })
      : null;
    
    const oldestDays = oldestPending 
      ? Math.floor((now.getTime() - new Date(oldestPending.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    // Count episodes by threshold
    const criticalCount = pending.filter(ep => getDaysPending(ep.created_at) >= THRESHOLD_CRITICAL).length;
    const warningCount = pending.filter(ep => {
      const days = getDaysPending(ep.created_at);
      return days >= THRESHOLD_WARNING && days < THRESHOLD_CRITICAL;
    }).length;
    
    return {
      totalPending: pending.length,
      totalDeferred: deferred.length,
      avgDaysPending,
      oldestPending,
      oldestDays,
      criticalCount,
      warningCount,
      oldestThresholdStatus: getThresholdStatus(oldestDays),
      avgThresholdStatus: getThresholdStatus(avgDaysPending),
    };
  }, [pendingEpisodes]);

  const handleViewDischarge = (episodeId: string) => {
    navigate(`/discharge?episode=${episodeId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pending Episodes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const noEpisodes = pendingEpisodes.length === 0;
  const noFilteredResults = filteredAndSortedEpisodes.length === 0 && !noEpisodes;

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pending Episodes
              </CardTitle>
              <CardDescription>
                {noEpisodes ? (
                  "Additional complaints waiting to be scheduled"
                ) : (
                  `${pendingCount} pending, ${deferredCount} deferred complaints across ${Object.keys(groupedByPatient).length} patient${Object.keys(groupedByPatient).length !== 1 ? 's' : ''}`
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!noEpisodes && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    {showFilters ? "Hide" : "Filters"}
                  </Button>
                  <Badge variant="secondary">{pendingCount} Pending</Badge>
                  {deferredCount > 0 && <Badge variant="outline">{deferredCount} Deferred</Badge>}
                </>
              )}
            </div>
          </div>

          {/* Filter & Sort Controls */}
          {showFilters && !noEpisodes && (
            <div className="space-y-3 border-t pt-4">
              <div className="grid gap-3 sm:grid-cols-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="deferred">Deferred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Patient Name</label>
                  <Input
                    placeholder="Search patient..."
                    value={filterPatientName}
                    onChange={(e) => setFilterPatientName(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="all">All Priorities</SelectItem>
                      {uniquePriorities.map(priority => (
                        <SelectItem key={priority} value={priority.toString()}>
                          Priority #{priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="priority-asc">
                        <span className="flex items-center gap-2">
                          <ArrowUpDown className="h-3 w-3" />
                          Priority (Low to High)
                        </span>
                      </SelectItem>
                      <SelectItem value="priority-desc">
                        <span className="flex items-center gap-2">
                          <ArrowUpDown className="h-3 w-3" />
                          Priority (High to Low)
                        </span>
                      </SelectItem>
                      <SelectItem value="date-newest">
                        <span className="flex items-center gap-2">
                          <ArrowUpDown className="h-3 w-3" />
                          Date (Newest First)
                        </span>
                      </SelectItem>
                      <SelectItem value="date-oldest">
                        <span className="flex items-center gap-2">
                          <ArrowUpDown className="h-3 w-3" />
                          Date (Oldest First)
                        </span>
                      </SelectItem>
                      <SelectItem value="name-asc">
                        <span className="flex items-center gap-2">
                          <ArrowUpDown className="h-3 w-3" />
                          Patient Name (A-Z)
                        </span>
                      </SelectItem>
                      <SelectItem value="name-desc">
                        <span className="flex items-center gap-2">
                          <ArrowUpDown className="h-3 w-3" />
                          Patient Name (Z-A)
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear All Filters & Sorting
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Threshold Alerts */}
        {!noEpisodes && (statistics.criticalCount > 0 || statistics.warningCount > 0) && (
          <div className="space-y-2 mb-6">
            {statistics.criticalCount > 0 && (
              <Alert variant="destructive" className="border-destructive/50">
                <Flame className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-semibold">{statistics.criticalCount}</span> pending episode{statistics.criticalCount !== 1 ? 's' : ''} have been waiting <span className="font-semibold">over {THRESHOLD_CRITICAL} days</span> - immediate attention required
                </AlertDescription>
              </Alert>
            )}
            {statistics.warningCount > 0 && (
              <Alert className="border-warning/50 bg-warning/5">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-warning-foreground">
                  <span className="font-semibold">{statistics.warningCount}</span> pending episode{statistics.warningCount !== 1 ? 's' : ''} have been waiting <span className="font-semibold">over {THRESHOLD_WARNING} days</span>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Statistics Panel */}
        {!noEpisodes && (
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending vs Deferred</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className="text-3xl font-bold text-primary">{statistics.totalPending}</p>
                      <span className="text-muted-foreground">/</span>
                      <p className="text-xl font-semibold text-muted-foreground">{statistics.totalDeferred}</p>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-blue-500/20 ${statistics.avgThresholdStatus === 'critical' ? 'ring-2 ring-destructive' : statistics.avgThresholdStatus === 'warning' ? 'ring-2 ring-warning' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Days Pending</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className={`text-3xl font-bold ${statistics.avgThresholdStatus === 'critical' ? 'text-destructive' : statistics.avgThresholdStatus === 'warning' ? 'text-warning' : 'text-blue-500'}`}>
                        {statistics.avgDaysPending}
                      </p>
                      <span className="text-sm text-muted-foreground">days</span>
                    </div>
                    {statistics.avgThresholdStatus !== 'normal' && (
                      <Badge variant={statistics.avgThresholdStatus === 'critical' ? 'destructive' : 'outline'} className="mt-2 text-xs">
                        {statistics.avgThresholdStatus === 'critical' ? 'Critical' : 'Warning'}
                      </Badge>
                    )}
                  </div>
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${statistics.avgThresholdStatus === 'critical' ? 'bg-destructive/10' : statistics.avgThresholdStatus === 'warning' ? 'bg-warning/10' : 'bg-blue-500/10'}`}>
                    <Clock className={`h-6 w-6 ${statistics.avgThresholdStatus === 'critical' ? 'text-destructive' : statistics.avgThresholdStatus === 'warning' ? 'text-warning' : 'text-blue-500'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-warning/20 ${statistics.oldestThresholdStatus === 'critical' ? 'ring-2 ring-destructive' : statistics.oldestThresholdStatus === 'warning' ? 'ring-2 ring-warning' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Oldest Pending</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      {statistics.oldestPending ? (
                        <>
                          <p className={`text-3xl font-bold ${statistics.oldestThresholdStatus === 'critical' ? 'text-destructive' : statistics.oldestThresholdStatus === 'warning' ? 'text-warning' : 'text-warning'}`}>
                            {statistics.oldestDays}
                          </p>
                          <span className="text-sm text-muted-foreground">days</span>
                        </>
                      ) : (
                        <p className="text-2xl font-semibold text-muted-foreground">N/A</p>
                      )}
                    </div>
                    {statistics.oldestPending && (
                      <>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {statistics.oldestPending.patient_name}
                        </p>
                        {statistics.oldestThresholdStatus !== 'normal' && (
                          <Badge variant={statistics.oldestThresholdStatus === 'critical' ? 'destructive' : 'outline'} className="mt-1 text-xs">
                            {statistics.oldestThresholdStatus === 'critical' ? 'Critical' : 'Warning'}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${statistics.oldestThresholdStatus === 'critical' ? 'bg-destructive/10' : statistics.oldestThresholdStatus === 'warning' ? 'bg-warning/10' : 'bg-warning/10'}`}>
                    {statistics.oldestThresholdStatus === 'critical' ? (
                      <Flame className="h-6 w-6 text-destructive" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-warning" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {noEpisodes && (
          <Alert>
            <AlertDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              No pending episodes at this time
            </AlertDescription>
          </Alert>
        )}

        {noFilteredResults && (
          <Alert>
            <AlertDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              No episodes match the current filters
            </AlertDescription>
          </Alert>
        )}

        {!noEpisodes && !noFilteredResults && (
          <div className="space-y-4">
            {Object.entries(groupedByPatient).map(([patientName, episodes]) => (
              <div key={patientName} className="space-y-2 rounded-lg border bg-muted/30 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{patientName}</span>
                    <Badge variant="outline" className="text-xs">
                      {episodes.length} complaint{episodes.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {episodes[0]?.previous_episode_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDischarge(episodes[0].previous_episode_id)}
                      className="gap-2"
                    >
                      <Calendar className="h-3 w-3" />
                      Schedule
                    </Button>
                  )}
                </div>

                <div className="space-y-2 pl-6">
                  {episodes.map((episode) => {
                    const daysPending = getDaysPending(episode.created_at);
                    const thresholdStatus = getThresholdStatus(daysPending);
                    
                    return (
                      <div 
                        key={episode.id} 
                        className={`flex items-start justify-between text-sm rounded-md p-2 ${
                          thresholdStatus === 'critical' ? 'bg-destructive/5 border-l-4 border-destructive' :
                          thresholdStatus === 'warning' ? 'bg-warning/5 border-l-4 border-warning' : ''
                        }`}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={episode.status === "pending" ? "secondary" : "outline"} className="text-xs">
                              Priority #{episode.complaint_priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {episode.complaint_category || "General"}
                            </Badge>
                            {episode.status === "deferred" && (
                              <Badge variant="outline" className="text-xs text-warning">
                                Deferred
                              </Badge>
                            )}
                            {episode.status === "pending" && (
                              <>
                                {thresholdStatus === 'critical' && (
                                  <Badge variant="destructive" className="text-xs gap-1">
                                    <Flame className="h-3 w-3" />
                                    {daysPending}d - Critical
                                  </Badge>
                                )}
                                {thresholdStatus === 'warning' && (
                                  <Badge variant="outline" className="text-xs gap-1 text-warning border-warning">
                                    <AlertTriangle className="h-3 w-3" />
                                    {daysPending}d - Warning
                                  </Badge>
                                )}
                                {thresholdStatus === 'normal' && (
                                  <Badge variant="outline" className="text-xs">
                                    {daysPending} day{daysPending !== 1 ? 's' : ''} pending
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                          <p className="text-muted-foreground">{episode.complaint_text}</p>
                          {episode.deferred_reason && (
                            <p className="text-xs text-muted-foreground italic">
                              Reason: {episode.deferred_reason}
                            </p>
                          )}
                          {episode.scheduled_date && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Scheduled: {format(new Date(episode.scheduled_date), "MMM dd, yyyy")}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
