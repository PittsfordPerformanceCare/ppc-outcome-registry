import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, ChevronUp, ChevronDown, Mail, MailCheck, Clock, Users, Phone, Pause, Flame } from "lucide-react";
import { format, subDays } from "date-fns";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LeadSummaryCard } from "@/components/LeadSummaryCard";

export interface Lead {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  checkpoint_status: string;
  severity_score: number | null;
  system_category: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  origin_page: string | null;
  origin_cta: string | null;
  intake_completed_at: string | null;
  episode_opened_at: string | null;
  intake_first_reminder_sent_at: string | null;
  intake_second_reminder_sent_at: string | null;
  primary_concern: string | null;
  symptom_summary: string | null;
  who_is_this_for: string | null;
  preferred_contact_method: string | null;
  pillar_origin: string | null;
  funnel_stage: string | null;
  notes: string | null;
  // New contact tracking fields
  lead_status: string | null;
  contact_attempt_count: number | null;
  last_contacted_at: string | null;
  next_follow_up_date: string | null;
}

type SortField = "created_at" | "name" | "severity_score" | "lead_status";
type SortDirection = "asc" | "desc";

const AdminLeads = () => {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [campaignFilter, setCampaignFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (dateRange !== "all") {
        const days = parseInt(dateRange);
        const cutoff = subDays(new Date(), days).toISOString();
        query = query.gte("created_at", cutoff);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [dateRange]);

  // Reset status filter when URL param changes
  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter) {
      setStatusFilter(filter);
    }
  }, [searchParams]);

  // Get unique sources for filter dropdown
  const uniqueSources = useMemo(() => {
    const sources = new Set(leads.map(l => l.utm_source).filter(Boolean));
    return Array.from(sources) as string[];
  }, [leads]);

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let result = [...leads];
    const todayStr = format(new Date(), "yyyy-MM-dd");

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        l =>
          l.name?.toLowerCase().includes(searchLower) ||
          l.email?.toLowerCase().includes(searchLower) ||
          l.phone?.includes(search)
      );
    }

    // Source filter
    if (sourceFilter !== "all") {
      result = result.filter(l => l.utm_source === sourceFilter);
    }

    // Status filter based on lead_status and next_follow_up_date
    if (statusFilter !== "all") {
      result = result.filter(l => {
        const leadStatus = l.lead_status || "new";
        const nextFollowUp = l.next_follow_up_date;
        
        switch (statusFilter) {
          case "new":
            return leadStatus === "new" && !l.episode_opened_at;
          case "followup_today":
            return leadStatus === "attempting" && nextFollowUp === todayStr;
          case "paused":
            return leadStatus === "paused" && (!nextFollowUp || nextFollowUp > todayStr);
          case "rewarm":
            return leadStatus === "paused" && nextFollowUp && nextFollowUp <= todayStr;
          case "referral":
            return l.utm_source?.toLowerCase().includes("referral");
          case "attempting":
            return leadStatus === "attempting";
          case "scheduled":
            return leadStatus === "scheduled";
          default:
            return true;
        }
      });
    }

    // Campaign filter
    if (campaignFilter) {
      const campaignLower = campaignFilter.toLowerCase();
      result = result.filter(l =>
        l.utm_campaign?.toLowerCase().includes(campaignLower)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "created_at") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (sortField === "severity_score") {
        aVal = aVal ?? 0;
        bVal = bVal ?? 0;
      } else {
        aVal = aVal ?? "";
        bVal = bVal ?? "";
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [leads, search, sourceFilter, statusFilter, campaignFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  const getLeadStatusBadge = (lead: Lead) => {
    const status = lead.lead_status || "new";
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const isRewarm = status === "paused" && lead.next_follow_up_date && lead.next_follow_up_date <= todayStr;
    
    if (isRewarm) {
      return (
        <Badge className="bg-orange-500/10 text-orange-600 border-orange-200">
          <Flame className="h-3 w-3 mr-1" />
          Rewarm
        </Badge>
      );
    }
    
    const config: Record<string, { label: string; icon: any; className: string }> = {
      new: { label: "New", icon: null, className: "bg-blue-500/10 text-blue-600 border-blue-200" },
      attempting: { label: "Attempting", icon: Phone, className: "bg-amber-500/10 text-amber-600 border-amber-200" },
      scheduled: { label: "Scheduled", icon: null, className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
      paused: { label: "Paused", icon: Pause, className: "bg-slate-500/10 text-slate-600 border-slate-200" },
    };
    
    const { label, icon: Icon, className } = config[status] || config.new;
    return (
      <Badge className={className}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {label}
      </Badge>
    );
  };

  const getReminderStatus = (lead: Lead) => {
    // If intake is completed, show completed status
    if (lead.intake_completed_at) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge className="bg-green-500/10 text-green-600 border-green-200">
                <MailCheck className="h-3 w-3 mr-1" />
                Done
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Intake completed {format(new Date(lead.intake_completed_at), "MMM d, h:mm a")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Show contact attempt count
    const attemptCount = lead.contact_attempt_count || 0;
    if (attemptCount > 0) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="text-muted-foreground">
                <Phone className="h-3 w-3 mr-1" />
                {attemptCount} {attemptCount === 1 ? "attempt" : "attempts"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {lead.last_contacted_at && (
                <p>Last contacted: {format(new Date(lead.last_contacted_at), "MMM d, h:mm a")}</p>
              )}
              {lead.next_follow_up_date && (
                <p>Next follow-up: {format(new Date(lead.next_follow_up_date), "MMM d")}</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // No contact attempts yet
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>No contact attempts yet</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Stats for status overview
  const statusStats = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return {
      total: leads.length,
      new: leads.filter(l => (l.lead_status || "new") === "new" && !l.episode_opened_at).length,
      followUpToday: leads.filter(l => l.lead_status === "attempting" && l.next_follow_up_date === todayStr).length,
      paused: leads.filter(l => l.lead_status === "paused" && (!l.next_follow_up_date || l.next_follow_up_date > todayStr)).length,
      rewarm: leads.filter(l => l.lead_status === "paused" && l.next_follow_up_date && l.next_follow_up_date <= todayStr).length,
    };
  }, [leads]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leads Management</h1>
            <p className="text-muted-foreground text-sm">
              {filteredLeads.length} leads found
            </p>
          </div>
        </div>
        <Button onClick={fetchLeads} variant="outline" size="sm" disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card 
          className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-md ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-slate-500/5" />
          <CardContent className="relative pt-4 pb-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Total</div>
            <div className="text-2xl font-bold mt-1">{statusStats.total}</div>
          </CardContent>
        </Card>
        <Card 
          className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-md ${statusFilter === "new" ? "ring-2 ring-blue-500" : ""}`}
          onClick={() => setStatusFilter("new")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5" />
          <CardContent className="relative pt-4 pb-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">New</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{statusStats.new}</div>
          </CardContent>
        </Card>
        <Card 
          className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-md ${statusFilter === "followup_today" ? "ring-2 ring-amber-500" : ""}`}
          onClick={() => setStatusFilter("followup_today")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-500/5" />
          <CardContent className="relative pt-4 pb-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Follow-Up Today</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{statusStats.followUpToday}</div>
          </CardContent>
        </Card>
        <Card 
          className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-md ${statusFilter === "rewarm" ? "ring-2 ring-orange-500" : ""}`}
          onClick={() => setStatusFilter("rewarm")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-500/5" />
          <CardContent className="relative pt-4 pb-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Ready to Rewarm</div>
            <div className="text-2xl font-bold text-orange-600 mt-1">{statusStats.rewarm}</div>
          </CardContent>
        </Card>
        <Card 
          className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-md ${statusFilter === "paused" ? "ring-2 ring-slate-500" : ""}`}
          onClick={() => setStatusFilter("paused")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-slate-500/5" />
          <CardContent className="relative pt-4 pb-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Paused</div>
            <div className="text-2xl font-bold text-slate-600 mt-1">{statusStats.paused}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Lead Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="attempting">Attempting Contact</SelectItem>
                <SelectItem value="followup_today">Follow-Up Today</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="rewarm">Ready to Rewarm</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="referral">Referrals</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="UTM Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {uniqueSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by campaign..."
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">
              <TableSkeleton rows={10} columns={8} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("created_at")}
                    >
                      Created <SortIcon field="created_at" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("name")}
                    >
                      Name <SortIcon field="name" />
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("lead_status")}
                    >
                      Status <SortIcon field="lead_status" />
                    </TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Next Follow-Up</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No leads found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow 
                        key={lead.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <TableCell className="whitespace-nowrap">
                          <div className="font-medium text-sm">
                            {format(new Date(lead.created_at), "MMM d, yyyy")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(lead.created_at), "h:mm a")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {lead.name || <span className="text-muted-foreground">—</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {lead.phone ? (
                              <span className="font-medium">{lead.phone}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {lead.email || "No email"}
                          </div>
                        </TableCell>
                        <TableCell>{getLeadStatusBadge(lead)}</TableCell>
                        <TableCell>{getReminderStatus(lead)}</TableCell>
                        <TableCell>
                          {lead.next_follow_up_date ? (
                            <span className="text-sm">
                              {format(new Date(lead.next_follow_up_date), "MMM d")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.utm_source ? (
                            <Badge variant="outline" className="text-xs">{lead.utm_source}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Direct</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {lead.intake_completed_at && (
                              <Badge className="bg-blue-500/10 text-blue-600 text-[10px] px-1">Intake</Badge>
                            )}
                            {lead.episode_opened_at && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px] px-1">Episode</Badge>
                            )}
                            {!lead.intake_completed_at && !lead.episode_opened_at && (
                              <span className="text-muted-foreground text-xs">Pending</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Summary Card Sheet */}
      <LeadSummaryCard
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={() => {
          fetchLeads();
          if (selectedLead) {
            // Refetch the selected lead to get updated data
            supabase
              .from("leads")
              .select("*")
              .eq("id", selectedLead.id)
              .single()
              .then(({ data }) => {
                if (data) setSelectedLead(data);
              });
          }
        }}
      />
    </div>
  );
};

export default AdminLeads;
