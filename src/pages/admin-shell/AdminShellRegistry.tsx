import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Database, 
  FileText, 
  Users, 
  ClipboardList, 
  TrendingUp, 
  ArrowRight,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock
} from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load heavy components from existing dashboard
const LeadsOverview = lazy(() => import("@/components/LeadsOverview"));
const IntakesReviewQueue = lazy(() => import("@/components/IntakesReviewQueue"));
const DailyPrepWidget = lazy(() => import("@/components/DailyPrepWidget").then(m => ({ default: m.DailyPrepWidget })));
const PendingEpisodesWidget = lazy(() => import("@/components/PendingEpisodesWidget").then(m => ({ default: m.PendingEpisodesWidget })));
const MCIDStatisticsCard = lazy(() => import("@/components/MCIDStatisticsCard").then(m => ({ default: m.MCIDStatisticsCard })));

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

// Quick Action Cards
const quickActions = [
  {
    title: "Lead Intakes",
    description: "Review new patient leads and severity assessments",
    icon: Users,
    href: "/admin/registry",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    title: "Episode Management",
    description: "View and manage active episodes",
    icon: FileText,
    href: "/admin/episodes",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    title: "Intake Review Queue",
    description: "Process pending intake forms",
    icon: ClipboardList,
    href: "/intake-review",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    title: "Analytics Dashboard",
    description: "View performance metrics and trends",
    icon: TrendingUp,
    href: "/admin/analytics",
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
];

const AdminShellRegistry = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            PPC Outcome Registry
          </h1>
          <p className="text-muted-foreground">
            Manage leads, intakes, and outcome data
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/dashboards">
              Full Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild>
            <Link to="/new-episode">
              New Episode
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.href} to={action.href}>
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <div className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center mb-2`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <CardTitle className="text-base">{action.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Lead Intakes</TabsTrigger>
          <TabsTrigger value="intakes">Intake Review</TabsTrigger>
          <TabsTrigger value="outcomes">Outcome Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Daily Prep */}
          <ErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <DailyPrepWidget />
            </Suspense>
          </ErrorBoundary>

          {/* Pending Episodes */}
          <ErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <PendingEpisodesWidget />
            </Suspense>
          </ErrorBoundary>

        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <LeadsOverview />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="intakes" className="space-y-6">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <IntakesReviewQueue />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Outcome Measures
              </CardTitle>
              <CardDescription>
                MCID tracking and outcome history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">--</p>
                  <p className="text-sm text-muted-foreground">MCID Achieved</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">--</p>
                  <p className="text-sm text-muted-foreground">Pending Follow-up</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">--</p>
                  <p className="text-sm text-muted-foreground">Needs Attention</p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link to="/dashboards">
                    View Full Outcome Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Links to Existing Registry Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Registry Tools</CardTitle>
          <CardDescription>Access specialized registry functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/director-dashboard">Director Dashboard</Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/analytics-dashboard">Analytics Dashboard</Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/referral-analytics">Referral Analytics</Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/notification-analytics">Notification Analytics</Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/export-history">Export History</Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/compliance-audit">Compliance Audit</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminShellRegistry;
