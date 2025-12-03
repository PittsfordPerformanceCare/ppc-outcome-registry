import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import { format, subDays } from "date-fns";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

interface Lead {
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
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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
  }, [leads, search, sourceFilter, campaignFilter, sortField, sortDirection]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Leads Management</h1>
          <p className="text-muted-foreground text-sm">
            {filteredLeads.length} leads found
          </p>
        </div>
        <Button onClick={fetchLeads} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <Input
              placeholder="Filter by campaign..."
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">
              <TableSkeleton rows={10} columns={8} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
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
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("checkpoint_status")}
                    >
                      Status <SortIcon field="checkpoint_status" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("severity_score")}
                    >
                      Severity <SortIcon field="severity_score" />
                    </TableHead>
                    <TableHead>UTM Source</TableHead>
                    <TableHead>UTM Medium</TableHead>
                    <TableHead>UTM Campaign</TableHead>
                    <TableHead>Origin Page</TableHead>
                    <TableHead>Origin CTA</TableHead>
                    <TableHead>Intake</TableHead>
                    <TableHead>Episode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                        No leads found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(lead.created_at), "MMM d, yyyy")}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(lead.created_at), "h:mm a")}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {lead.name || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {lead.email || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {lead.phone || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>{getStatusBadge(lead)}</TableCell>
                        <TableCell>
                          {lead.severity_score !== null ? (
                            <span className="font-mono">{lead.severity_score}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.utm_source ? (
                            <Badge variant="outline">{lead.utm_source}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {lead.utm_medium || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-sm max-w-[150px] truncate">
                          {lead.utm_campaign || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-xs max-w-[120px] truncate" title={lead.origin_page || undefined}>
                          {lead.origin_page || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-sm">
                          {lead.origin_cta || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {lead.intake_completed_at ? (
                            <span className="text-green-600 text-xs">
                              {format(new Date(lead.intake_completed_at), "M/d/yy")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.episode_opened_at ? (
                            <span className="text-green-600 text-xs">
                              {format(new Date(lead.episode_opened_at), "M/d/yy")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
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
    </div>
  );
};

export default AdminLeads;
