import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useDirectorDashboard, DateRange } from "@/hooks/useDirectorDashboard";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  FileCheck, 
  Target,
  ExternalLink,
  Activity,
  PieChart
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RePieChart,
  Pie,
  Legend,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function DirectorDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>(7);
  const { data, isLoading, error } = useDirectorDashboard(dateRange);

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load dashboard data. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dischargeCompliance = data?.episodesClosed 
    ? Math.round((data.episodesWithDischargeNote / data.episodesClosed) * 100) 
    : 0;
  
  const pcpCompliance = data?.episodesClosed 
    ? Math.round((data.pcpSummariesCompleted / data.episodesClosed) * 100) 
    : 0;

  const intakeConversion = data?.leadsCreated 
    ? Math.round((data.intakesCompleted / data.leadsCreated) * 100) 
    : 0;

  const episodeConversion = data?.intakesCompleted 
    ? Math.round((data.episodesFromLeads / data.intakesCompleted) * 100) 
    : 0;

  const utmCompleteness = data?.totalLeadsForUTM 
    ? Math.round((data.leadsWithCompleteUTM / data.totalLeadsForUTM) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Director Dashboard</h1>
          <p className="text-muted-foreground">
            Weekly command view of clinical + operational health
          </p>
        </div>
        <Tabs value={String(dateRange)} onValueChange={(v) => setDateRange(Number(v) as DateRange)}>
          <TabsList>
            <TabsTrigger value="7">Last 7 Days</TabsTrigger>
            <TabsTrigger value="30">Last 30 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Section A: Episode Volume & Types */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Episode Volume
            </CardTitle>
            <CardDescription>Total episodes created in period</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="text-4xl font-bold text-primary">
                {data?.totalEpisodes || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Episodes by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : data?.episodesByType && data.episodesByType.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={data.episodesByType}
                      dataKey="count"
                      nameKey="episode_type"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label={({ episode_type, count }) => `${episode_type}: ${count}`}
                    >
                      {data.episodesByType.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No episode data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section B: Episode Closure & PCP Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Episode Closure & PCP Summary Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Episodes Closed</p>
                <p className="text-2xl font-bold">{data?.episodesClosed || 0}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">With Discharge Note</p>
                <p className="text-2xl font-bold">
                  {data?.episodesWithDischargeNote || 0}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({dischargeCompliance}% compliance)
                  </span>
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">PCP Summary Sent</p>
                <p className="text-2xl font-bold">
                  {data?.pcpSummariesCompleted || 0}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({pcpCompliance}% compliance)
                  </span>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section C: Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Lead → Intake → Episode Conversion
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Leads Created</span>
                    <span className="text-lg font-bold">{data?.leadsCreated || 0}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Intakes Completed</span>
                    <span className="text-lg font-bold">
                      {data?.intakesCompleted || 0}
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({intakeConversion}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-chart-2" 
                      style={{ width: `${intakeConversion}%` }} 
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Episodes Created</span>
                    <span className="text-lg font-bold">
                      {data?.episodesFromLeads || 0}
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({episodeConversion}% of intakes)
                      </span>
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-chart-3" 
                      style={{ width: `${data?.leadsCreated ? (data.episodesFromLeads / data.leadsCreated) * 100 : 0}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section D: Clinician Workload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Clinician Episode Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : data?.clinicianWorkload && data.clinicianWorkload.length > 0 ? (
            <div className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.clinicianWorkload} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="clinician" 
                      type="category" 
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="episodes_created" name="Created" fill="hsl(var(--primary))" />
                    <Bar dataKey="episodes_closed" name="Closed" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clinician</TableHead>
                    <TableHead className="text-right">Episodes Created</TableHead>
                    <TableHead className="text-right">Episodes Closed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.clinicianWorkload.slice(0, 10).map((row) => (
                    <TableRow key={row.clinician}>
                      <TableCell className="font-medium">{row.clinician}</TableCell>
                      <TableCell className="text-right">{row.episodes_created}</TableCell>
                      <TableCell className="text-right">{row.episodes_closed}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No clinician data available</p>
          )}
        </CardContent>
      </Card>

      {/* Section F: UTM Attribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            UTM Attribution Overview
          </CardTitle>
          <CardDescription>
            {utmCompleteness}% of leads have complete UTM data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="font-medium mb-2">Top Sources</h4>
                {data?.topSources && data.topSources.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Leads</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topSources.map((row) => (
                        <TableRow key={row.value}>
                          <TableCell className="font-medium">{row.value}</TableCell>
                          <TableCell className="text-right">{row.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No source data</p>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Top Campaigns</h4>
                {data?.topCampaigns && data.topCampaigns.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead className="text-right">Leads</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topCampaigns.map((row) => (
                        <TableRow key={row.value}>
                          <TableCell className="font-medium truncate max-w-[120px]">{row.value}</TableCell>
                          <TableCell className="text-right">{row.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No campaign data</p>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Top CTAs</h4>
                {data?.topCTAs && data.topCTAs.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>CTA</TableHead>
                        <TableHead className="text-right">Leads</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topCTAs.map((row) => (
                        <TableRow key={row.value}>
                          <TableCell className="font-medium truncate max-w-[120px]">{row.value}</TableCell>
                          <TableCell className="text-right">{row.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No CTA data</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section G: Episode Integrity Snapshot */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Episode Integrity Snapshot
            </CardTitle>
            <CardDescription>
              Active issues detected by the Episode Lifecycle Integrity Checker
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/episode-integrity">
              View Details
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={data?.totalActiveIssues ? "destructive" : "secondary"}>
                  {data?.totalActiveIssues || 0} Active Issues
                </Badge>
              </div>
              {data?.integrityIssues && data.integrityIssues.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Issue Type</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.integrityIssues.map((row) => (
                      <TableRow key={row.issue_type}>
                        <TableCell className="font-medium">
                          <Badge variant="outline" className="capitalize">
                            {row.issue_type.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-green-600">No active integrity issues detected</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
