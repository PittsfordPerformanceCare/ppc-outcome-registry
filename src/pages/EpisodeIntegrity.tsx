import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Copy, 
  FileWarning,
  RefreshCw,
  ExternalLink,
  Filter,
  Play
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

type IssueType = "missing_baseline" | "missing_discharge" | "stale_episode" | "duplicate_episode";

interface IntegrityIssue {
  id: string;
  episode_id: string;
  patient_name: string;
  clinician_id: string | null;
  clinic_id: string | null;
  issue_type: IssueType;
  issue_details: string;
  detected_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  is_active: boolean;
}

interface CheckRun {
  id: string;
  started_at: string;
  completed_at: string | null;
  issues_found: number;
  issues_by_type: Record<string, number> | null;
  email_sent: boolean;
  status: string;
}

const issueTypeConfig: Record<IssueType, { label: string; color: string; icon: React.ReactNode }> = {
  missing_baseline: { 
    label: "Missing Baseline", 
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: <FileWarning className="h-4 w-4" />
  },
  missing_discharge: { 
    label: "Missing Discharge", 
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <AlertTriangle className="h-4 w-4" />
  },
  stale_episode: { 
    label: "Stale Episode", 
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: <Clock className="h-4 w-4" />
  },
  duplicate_episode: { 
    label: "Potential Duplicate", 
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: <Copy className="h-4 w-4" />
  },
};

export default function EpisodeIntegrity() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"active" | "resolved" | "all">("active");
  const [typeFilter, setTypeFilter] = useState<IssueType | "all">("all");

  // Fetch issues
  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ["episode-integrity-issues", statusFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from("episode_integrity_issues")
        .select("*")
        .order("detected_at", { ascending: false });

      if (statusFilter === "active") {
        query = query.eq("is_active", true);
      } else if (statusFilter === "resolved") {
        query = query.eq("is_active", false);
      }

      if (typeFilter !== "all") {
        query = query.eq("issue_type", typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as IntegrityIssue[];
    },
  });

  // Fetch recent check runs
  const { data: checkRuns, isLoading: runsLoading } = useQuery({
    queryKey: ["episode-integrity-check-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episode_integrity_check_runs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as CheckRun[];
    },
  });

  // Resolve issue mutation
  const resolveMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("episode_integrity_issues")
        .update({
          is_active: false,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
        })
        .eq("id", issueId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episode-integrity-issues"] });
      toast.success("Issue marked as resolved");
    },
    onError: (error) => {
      toast.error("Failed to resolve issue");
      console.error(error);
    },
  });

  // Run check manually
  const runCheckMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("episode-lifecycle-integrity-check");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["episode-integrity-issues"] });
      queryClient.invalidateQueries({ queryKey: ["episode-integrity-check-runs"] });
      toast.success(`Check completed. Found ${data.issuesFound} new issues.`);
    },
    onError: (error) => {
      toast.error("Failed to run integrity check");
      console.error(error);
    },
  });

  // Calculate summary stats
  const activeIssues = issues?.filter(i => i.is_active) || [];
  const issuesByType = activeIssues.reduce((acc, issue) => {
    acc[issue.issue_type] = (acc[issue.issue_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const lastRun = checkRuns?.[0];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Episode Integrity Report</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and resolve episode lifecycle issues
          </p>
        </div>
        <Button 
          onClick={() => runCheckMutation.mutate()}
          disabled={runCheckMutation.isPending}
        >
          {runCheckMutation.isPending ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Run Check Now
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Issues</CardDescription>
            <CardTitle className="text-3xl">{activeIssues.length}</CardTitle>
          </CardHeader>
        </Card>
        
        {(Object.keys(issueTypeConfig) as IssueType[]).map((type) => (
          <Card key={type}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                {issueTypeConfig[type].icon}
                {issueTypeConfig[type].label}
              </CardDescription>
              <CardTitle className="text-2xl">{issuesByType[type] || 0}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Last Run Info */}
      {lastRun && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Last Check Run</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Started:</span>{" "}
                {format(new Date(lastRun.started_at), "MMM d, yyyy h:mm a")}
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                <Badge variant={lastRun.status === "completed" ? "default" : "destructive"}>
                  {lastRun.status}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Issues Found:</span>{" "}
                {lastRun.issues_found}
              </div>
              <div>
                <span className="text-muted-foreground">Email Sent:</span>{" "}
                {lastRun.email_sent ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 inline" />
                ) : (
                  <span className="text-muted-foreground">No</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-48">
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="resolved">Resolved Only</SelectItem>
                  <SelectItem value="all">All Issues</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <label className="text-sm font-medium mb-1 block">Issue Type</label>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {(Object.keys(issueTypeConfig) as IssueType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {issueTypeConfig[type].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues Table */}
      <Card>
        <CardHeader>
          <CardTitle>Issues</CardTitle>
          <CardDescription>
            {issues?.length || 0} issues found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {issuesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : issues?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">No issues found</p>
              <p className="text-sm">All episodes are passing integrity checks</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Episode ID</TableHead>
                  <TableHead>Issue Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues?.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium">{issue.patient_name}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => navigate(`/episode/${issue.episode_id}`)}
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {issue.episode_id.slice(0, 12)}...
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge className={issueTypeConfig[issue.issue_type].color}>
                        {issueTypeConfig[issue.issue_type].icon}
                        <span className="ml-1">{issueTypeConfig[issue.issue_type].label}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={issue.issue_details}>
                      {issue.issue_details}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(issue.detected_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {issue.is_active ? (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          Resolved
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {issue.is_active && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveMutation.mutate(issue.id)}
                          disabled={resolveMutation.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
