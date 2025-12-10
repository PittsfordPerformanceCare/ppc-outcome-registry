import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckSquare, 
  ArrowRight,
  Clock,
  AlertCircle,
  Calendar,
  FileText,
  Bell,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load components
const PCPSummaryTasks = lazy(() => import("@/components/PCPSummaryTasks").then(m => ({ default: m.PCPSummaryTasks })));
const MissingEpisodeAlerts = lazy(() => import("@/components/MissingEpisodeAlerts"));

function LoadingSkeleton() {
  return <Skeleton className="h-48 w-full" />;
}

const AdminShellTasks = () => {
  // Fetch PCP summary tasks
  const { data: pcpTasks = [], isLoading: pcpLoading } = useQuery({
    queryKey: ["pcp-summary-tasks-pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pcp_summary_tasks")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  // Fetch upcoming followups
  const { data: followups = [], isLoading: followupsLoading } = useQuery({
    queryKey: ["upcoming-followups"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("followups")
        .select("*, episodes(patient_name, region)")
        .eq("completed", false)
        .gte("scheduled_date", today)
        .order("scheduled_date", { ascending: true })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  // Fetch missing episode alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["missing-episode-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("missing_episode_alerts")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const totalPending = pcpTasks.length + followups.length + alerts.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            Task Management
          </h1>
          <p className="text-muted-foreground">
            Manage worklists, follow-ups, and pending tasks
          </p>
        </div>
        <Badge variant={totalPending > 0 ? "default" : "secondary"} className="text-lg px-4 py-1">
          {totalPending} Pending Tasks
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              PCP Summaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pcpTasks.length}</div>
            <p className="text-xs text-muted-foreground">pending to send</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Follow-ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{followups.length}</div>
            <p className="text-xs text-muted-foreground">upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Total Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPending}</div>
            <p className="text-xs text-muted-foreground">all task types</p>
          </CardContent>
        </Card>
      </div>

      {/* Task Tabs */}
      <Tabs defaultValue="pcp" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pcp">
            PCP Summaries ({pcpTasks.length})
          </TabsTrigger>
          <TabsTrigger value="followups">
            Follow-ups ({followups.length})
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pcp" className="space-y-4">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <PCPSummaryTasks />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="followups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Follow-ups</CardTitle>
              <CardDescription>Scheduled patient follow-up appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {followupsLoading ? (
                <LoadingSkeleton />
              ) : followups.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No upcoming follow-ups scheduled.
                </p>
              ) : (
                <div className="space-y-3">
                  {followups.map((followup: any) => (
                    <div
                      key={followup.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {followup.episodes?.patient_name || "Unknown Patient"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {followup.episodes?.region} • {format(new Date(followup.scheduled_date), "MMM d, yyyy")}
                          {followup.scheduled_time && ` at ${followup.scheduled_time}`}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/followup?id=${followup.id}`}>
                          View
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <Link to="/followup">
                    View All Follow-ups
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <MissingEpisodeAlerts />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Pending Tasks</CardTitle>
              <CardDescription>Combined view of all task types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pcpTasks.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PCP Summaries ({pcpTasks.length})
                    </h4>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/pcp-summary">View All</Link>
                    </Button>
                  </div>
                )}
                {followups.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Follow-ups ({followups.length})
                    </h4>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/followup">View All</Link>
                    </Button>
                  </div>
                )}
                {alerts.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      Alerts ({alerts.length})
                    </h4>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/alert-history">View All</Link>
                    </Button>
                  </div>
                )}
                {totalPending === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No pending tasks. All caught up!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Task Tools</CardTitle>
          <CardDescription>Access task management functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4">
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/pcp-summary">
                <FileText className="mr-2 h-4 w-4" />
                PCP Summaries
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/followup">
                <Calendar className="mr-2 h-4 w-4" />
                Follow-ups
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/alert-history">
                <Bell className="mr-2 h-4 w-4" />
                Alert History
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/clinician-inbox">
                <MessageSquare className="mr-2 h-4 w-4" />
                Clinician Inbox
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminShellTasks;
