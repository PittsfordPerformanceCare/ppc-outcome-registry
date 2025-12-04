import { useState } from "react";
import { useUTMHealth, UTMHealthIssue } from "@/hooks/useUTMHealth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, AlertTriangle, CheckCircle, TrendingUp, Link2, Target, Megaphone, ExternalLink, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const ISSUE_TYPE_LABELS: Record<string, { label: string; color: string; description: string }> = {
  no_utms: { label: "No UTMs", color: "bg-red-500", description: "Missing all UTM attribution" },
  missing_source: { label: "Missing Source", color: "bg-orange-500", description: "utm_source is empty" },
  missing_campaign: { label: "Missing Campaign", color: "bg-yellow-500", description: "utm_campaign is empty" },
  missing_cta: { label: "Missing CTA", color: "bg-blue-500", description: "origin_cta is empty" },
  suspicious_value: { label: "Suspicious Value", color: "bg-purple-500", description: "Contains placeholder values" }
};

export default function UTMHealth() {
  const [daysBack, setDaysBack] = useState(30);
  const [selectedIssueType, setSelectedIssueType] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [sending, setSending] = useState(false);
  
  const { issues, summary, isLoading, refetch } = useUTMHealth(daysBack);

  const handleRunMonitor = async () => {
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("utm-health-monitor", {
        body: { daysBack }
      });
      if (error) throw error;
      toast.success("UTM Health Monitor completed successfully");
      refetch();
    } catch (error) {
      console.error("Error running monitor:", error);
      toast.error("Failed to run UTM Health Monitor");
    } finally {
      setSending(false);
    }
  };

  const handleSendEmail = async () => {
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("utm-health-monitor", {
        body: { daysBack: 7, sendEmail: true }
      });
      if (error) throw error;
      toast.success("Weekly summary email sent");
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email summary");
    } finally {
      setSending(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (selectedIssueType && issue.issue_type !== selectedIssueType) return false;
    if (showActiveOnly && !issue.is_active) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">UTM Health Monitor</h1>
          <p className="text-muted-foreground">Monitor UTM attribution completeness for leads</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(daysBack)} onValueChange={(v) => setDaysBack(Number(v))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()} disabled={sending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${sending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleSendEmail} disabled={sending}>
            <Send className="h-4 w-4 mr-2" />
            Send Summary
          </Button>
          <Button onClick={handleRunMonitor} disabled={sending}>
            Run Monitor
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Leads</CardDescription>
            <CardTitle className="text-3xl">{summary?.totalLeads || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Last {daysBack} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Complete Attribution</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {summary?.completionRate || 0}%
              {(summary?.completionRate || 0) >= 80 ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {summary?.leadsWithCompleteUtms || 0} of {summary?.totalLeads || 0} leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Leads with Issues</CardDescription>
            <CardTitle className="text-3xl text-orange-500">{summary?.leadsWithIssues || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Issues</CardDescription>
            <CardTitle className="text-3xl">{issues.filter(i => i.is_active).length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Detected issues</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issues">Issues Breakdown</TabsTrigger>
          <TabsTrigger value="sources">Top Sources</TabsTrigger>
          <TabsTrigger value="campaigns">Top Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          {/* Issues by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Issues by Type</CardTitle>
              <CardDescription>Click a type to filter the table below</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {Object.entries(ISSUE_TYPE_LABELS).map(([type, info]) => {
                  const count = summary?.issuesByType[type] || 0;
                  const isSelected = selectedIssueType === type;
                  return (
                    <Button
                      key={type}
                      variant={isSelected ? "default" : "outline"}
                      className="h-auto py-2 px-4"
                      onClick={() => setSelectedIssueType(isSelected ? null : type)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${info.color}`} />
                        <span>{info.label}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Issues Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Issue Details</CardTitle>
                  <CardDescription>
                    {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} found
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActiveOnly(!showActiveOnly)}
                >
                  {showActiveOnly ? "Show All" : "Active Only"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Issue Type</TableHead>
                    <TableHead>UTM Source</TableHead>
                    <TableHead>UTM Campaign</TableHead>
                    <TableHead>Origin CTA</TableHead>
                    <TableHead>Detected</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIssues.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {selectedIssueType ? "No issues of this type found" : "No issues detected - great job!"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIssues.slice(0, 50).map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell>
                          <div className="font-medium">{issue.lead?.name || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {issue.lead?.origin_page || "No origin page"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${ISSUE_TYPE_LABELS[issue.issue_type]?.color} text-white border-0`}
                          >
                            {ISSUE_TYPE_LABELS[issue.issue_type]?.label || issue.issue_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {issue.lead?.utm_source || <span className="text-muted-foreground italic">Empty</span>}
                        </TableCell>
                        <TableCell className="text-sm">
                          {issue.lead?.utm_campaign || <span className="text-muted-foreground italic">Empty</span>}
                        </TableCell>
                        <TableCell className="text-sm">
                          {issue.lead?.origin_cta || <span className="text-muted-foreground italic">Empty</span>}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(issue.detected_at), "MMM d, h:mm a")}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/admin/leads?id=${issue.lead_id}`}>
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {filteredIssues.length > 50 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Showing first 50 of {filteredIssues.length} issues
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Top UTM Sources
              </CardTitle>
              <CardDescription>Most common traffic sources</CardDescription>
            </CardHeader>
            <CardContent>
              {summary?.topSources && summary.topSources.length > 0 ? (
                <div className="space-y-3">
                  {summary.topSources.map((source, idx) => (
                    <div key={source.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>
                        <span className="font-medium">{source.name}</span>
                      </div>
                      <Badge variant="secondary">{source.count} leads</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No UTM sources recorded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Top UTM Campaigns
              </CardTitle>
              <CardDescription>Most common campaign names</CardDescription>
            </CardHeader>
            <CardContent>
              {summary?.topCampaigns && summary.topCampaigns.length > 0 ? (
                <div className="space-y-3">
                  {summary.topCampaigns.map((campaign, idx) => (
                    <div key={campaign.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>
                        <span className="font-medium">{campaign.name}</span>
                      </div>
                      <Badge variant="secondary">{campaign.count} leads</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No UTM campaigns recorded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
