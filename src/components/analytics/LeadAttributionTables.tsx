import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import type { Lead } from "@/hooks/useLeadAnalytics";

interface LeadAttributionTablesProps {
  topConvertingSources: { source: string; leads: number; episodes: number; rate: number }[];
  ctaEffectiveness: { cta: string; leads: number; intakeRate: number; episodeRate: number }[];
  allLeads: Lead[];
}

function getStatusBadge(status: string) {
  switch (status) {
    case "episode_opened":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Episode</Badge>;
    case "intake_completed":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Intake Done</Badge>;
    case "intake_started":
      return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Intake Started</Badge>;
    case "severity_check_completed":
      return <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">Checked</Badge>;
    default:
      return <Badge variant="secondary">Started</Badge>;
  }
}

export function LeadAttributionTables({
  topConvertingSources,
  ctaEffectiveness,
  allLeads,
}: LeadAttributionTablesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  // Get unique sources for filter
  const uniqueSources = Array.from(new Set(allLeads.map(l => l.utm_source || "direct")));

  // Filter leads
  const filteredLeads = allLeads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.checkpoint_status === statusFilter;
    const matchesSource = sourceFilter === "all" || (lead.utm_source || "direct") === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  }).slice(0, 50);

  return (
    <div className="space-y-6">
      {/* Top Converting Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Converting Sources (90d)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Episodes</TableHead>
                  <TableHead className="text-right">Conv. Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topConvertingSources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  topConvertingSources.map((row) => (
                    <TableRow key={row.source}>
                      <TableCell className="font-medium">{row.source}</TableCell>
                      <TableCell className="text-right">{row.leads}</TableCell>
                      <TableCell className="text-right">{row.episodes}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={row.rate > 0.3 ? "default" : "secondary"}>
                          {(row.rate * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* CTA Effectiveness */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CTA Effectiveness (90d)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CTA</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Intake %</TableHead>
                  <TableHead className="text-right">Episode %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ctaEffectiveness.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  ctaEffectiveness.slice(0, 10).map((row) => (
                    <TableRow key={row.cta}>
                      <TableCell className="font-medium text-xs">
                        {row.cta.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell className="text-right">{row.leads}</TableCell>
                      <TableCell className="text-right">{(row.intakeRate * 100).toFixed(0)}%</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={row.episodeRate > 0.3 ? "default" : "secondary"}>
                          {(row.episodeRate * 100).toFixed(0)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Full Attribution Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-sm font-medium">Attribution Detail (90d)</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Search name/email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-40 h-8 text-xs"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="severity_check_started">Started</SelectItem>
                  <SelectItem value="severity_check_completed">Checked</SelectItem>
                  <SelectItem value="intake_started">Intake Started</SelectItem>
                  <SelectItem value="intake_completed">Intake Done</SelectItem>
                  <SelectItem value="episode_opened">Episode</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {uniqueSources.map((source) => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>CTA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Intake At</TableHead>
                  <TableHead>Episode At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No leads match your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {format(new Date(lead.created_at), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {lead.name || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {lead.utm_source || "direct"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {lead.utm_campaign || "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {lead.origin_cta?.replace(/_/g, " ") || "—"}
                      </TableCell>
                      <TableCell>{getStatusBadge(lead.checkpoint_status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {lead.intake_completed_at 
                          ? format(new Date(lead.intake_completed_at), "MMM d, h:mm a")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {lead.episode_opened_at
                          ? format(new Date(lead.episode_opened_at), "MMM d, h:mm a")
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
