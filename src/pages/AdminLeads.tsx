import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, ChevronUp, ChevronDown, Mail, MailCheck, Clock, Users } from "lucide-react";
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
}

type SortField = "created_at" | "name" | "severity_score" | "checkpoint_status";
type SortDirection = "asc" | "desc";

const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("");
  const [reminderFilter, setReminderFilter] = useState("all");
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

  // Get unique sources for filter dropdown
  const uniqueSources = useMemo(() => {
    const sources = new Set(leads.map(l => l.utm_source).filter(Boolean));
    return Array.from(sources) as string[];
  }, [leads]);

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        l =>
          l.name?.toLowerCase().includes(searchLower) ||
          l.email?.toLowerCase().includes(searchLower)
      );
    }

    // Source filter
    if (sourceFilter !== "all") {
      result = result.filter(l => l.utm_source === sourceFilter);
    }

    // Campaign filter
    if (campaignFilter) {
      const campaignLower = campaignFilter.toLowerCase();
      result = result.filter(l =>
        l.utm_campaign?.toLowerCase().includes(campaignLower)
      );
    }

    // Reminder filter
    if (reminderFilter !== "all") {
      result = result.filter(l => {
        const isIncomplete = !l.intake_completed_at;
        if (reminderFilter === "no_reminder") {
          return isIncomplete && !l.intake_first_reminder_sent_at;
        }
        if (reminderFilter === "first_sent") {
          return isIncomplete && l.intake_first_reminder_sent_at && !l.intake_second_reminder_sent_at;
        }
        if (reminderFilter === "second_sent") {
          return isIncomplete && l.intake_second_reminder_sent_at;
        }
        if (reminderFilter === "completed") {
          return !!l.intake_completed_at;
        }
        return true;
      });
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
  }, [leads, search, sourceFilter, campaignFilter, reminderFilter, sortField, sortDirection]);

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

  const getStatusBadge = (lead: Lead) => {
    if (lead.episode_opened_at) {
      return <Badge className="bg-green-500/10 text-green-600 border-green-200">Episode</Badge>;
    }
    if (lead.intake_completed_at) {
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Intake Done</Badge>;
    }
    if (lead.checkpoint_status === "severity_check_completed") {
      return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Screened</Badge>;
    }
    return <Badge variant="outline">New</Badge>;
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

    // Second reminder sent
    if (lead.intake_second_reminder_sent_at) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge className="bg-orange-500/10 text-orange-600 border-orange-200">
                <Mail className="h-3 w-3 mr-1" />
                2nd Sent
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>1st: {format(new Date(lead.intake_first_reminder_sent_at!), "MMM d, h:mm a")}</p>
              <p>2nd: {format(new Date(lead.intake_second_reminder_sent_at), "MMM d, h:mm a")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // First reminder sent
    if (lead.intake_first_reminder_sent_at) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
                <Mail className="h-3 w-3 mr-1" />
                1st Sent
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sent {format(new Date(lead.intake_first_reminder_sent_at), "MMM d, h:mm a")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // No reminders sent yet
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
            <p>No reminders sent yet</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Stats for reminder status
  const reminderStats = useMemo(() => {
    const incomplete = leads.filter(l => !l.intake_completed_at);
    return {
      total: leads.length,
      completed: leads.filter(l => l.intake_completed_at).length,
      noReminder: incomplete.filter(l => !l.intake_first_reminder_sent_at).length,
      firstSent: incomplete.filter(l => l.intake_first_reminder_sent_at && !l.intake_second_reminder_sent_at).length,
      secondSent: incomplete.filter(l => l.intake_second_reminder_sent_at).length,
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

      {/* Reminder Status Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-slate-500/5" />
          <CardContent className="relative pt-4 pb-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Leads</div>
            <div className="text-2xl font-bold mt-1">{reminderStats.total}</div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5" />
          <CardContent className="relative pt-4 pb-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Completed</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{reminderStats.completed}</div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-gray-500/5" />
          <CardContent className="relative pt-4 pb-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">No Reminder</div>
            <div className="text-2xl font-bold text-gray-500 mt-1">{reminderStats.noReminder}</div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-500/5" />
          <CardContent className="relative pt-4 pb-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">1st Sent</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{reminderStats.firstSent}</div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-500/5" />
          <CardContent className="relative pt-4 pb-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">2nd Sent</div>
            <div className="text-2xl font-bold text-orange-600 mt-1">{reminderStats.secondSent}</div>
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
                placeholder="Search name or email..."
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
            <Select value={reminderFilter} onValueChange={setReminderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Reminder Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="no_reminder">No reminder sent</SelectItem>
                <SelectItem value="first_sent">1st reminder sent</SelectItem>
                <SelectItem value="second_sent">2nd reminder sent</SelectItem>
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
                      onClick={() => handleSort("checkpoint_status")}
                    >
                      Status <SortIcon field="checkpoint_status" />
                    </TableHead>
                    <TableHead>Reminders</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("severity_score")}
                    >
                      Severity <SortIcon field="severity_score" />
                    </TableHead>
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
                            {lead.email ? (
                              <span className="truncate max-w-[150px] block">{lead.email}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {lead.phone || "No phone"}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(lead)}</TableCell>
                        <TableCell>{getReminderStatus(lead)}</TableCell>
                        <TableCell>
                          {lead.severity_score !== null ? (
                            <Badge 
                              variant="outline" 
                              className={
                                lead.severity_score >= 7 
                                  ? "border-red-500/30 text-red-600" 
                                  : lead.severity_score >= 4 
                                    ? "border-amber-500/30 text-amber-600" 
                                    : "border-emerald-500/30 text-emerald-600"
                              }
                            >
                              {lead.severity_score}/10
                            </Badge>
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
      />
    </div>
  );
};

export default AdminLeads;
