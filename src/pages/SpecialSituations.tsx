import { useState } from "react";
import { useSpecialSituations, SITUATION_TYPE_LABELS } from "@/hooks/useSpecialSituations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, AlertTriangle, CheckCircle, ExternalLink, Flag, Clock } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function SpecialSituations() {
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [daysBack, setDaysBack] = useState(30);

  const { 
    situations, 
    summary, 
    isLoading, 
    refetch, 
    resolveSituation, 
    isResolving 
  } = useSpecialSituations({
    status: statusFilter || undefined,
    situationType: typeFilter || undefined,
    daysBack
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Flag className="h-6 w-6 text-red-500" />
            Special Situations
          </h1>
          <p className="text-muted-foreground">Track and manage clinical flags requiring attention</p>
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
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open Situations</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {summary?.totalOpen || 0}
              {(summary?.totalOpen || 0) > 0 && (
                <AlertTriangle className="h-6 w-6 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Red Flags</CardDescription>
            <CardTitle className="text-3xl text-red-500">
              {(summary?.byType?.red_flag || 0) + (summary?.byType?.emergency_or_911 || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">High priority items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Referrals</CardDescription>
            <CardTitle className="text-3xl text-blue-500">
              {summary?.byType?.referral_initiated || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Pending follow-up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open &gt; 7 Days</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {summary?.openOlderThan7Days || 0}
              {(summary?.openOlderThan7Days || 0) > 0 && (
                <Clock className="h-6 w-6 text-orange-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Needs review</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by Type</CardTitle>
          <CardDescription>Click a type to filter the table below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={typeFilter === null ? "default" : "outline"}
              className="h-auto py-2 px-4"
              onClick={() => setTypeFilter(null)}
            >
              All Types
              <Badge variant="secondary" className="ml-2">{situations.length}</Badge>
            </Button>
            {Object.entries(SITUATION_TYPE_LABELS).map(([type, info]) => {
              const count = summary?.byType[type] || 0;
              const isSelected = typeFilter === type;
              return (
                <Button
                  key={type}
                  variant={isSelected ? "default" : "outline"}
                  className="h-auto py-2 px-4"
                  onClick={() => setTypeFilter(isSelected ? null : type)}
                >
                  <div className={`w-3 h-3 rounded-full ${info.color} mr-2`} />
                  {info.label}
                  <Badge variant="secondary" className="ml-2">{count}</Badge>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Situations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Special Situations</CardTitle>
              <CardDescription>
                {situations.length} situation{situations.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open Only</SelectItem>
                <SelectItem value="resolved">Resolved Only</SelectItem>
                <SelectItem value="">All Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Detected</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Clinician</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {situations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {typeFilter ? "No situations of this type found" : "No special situations found"}
                  </TableCell>
                </TableRow>
              ) : (
                situations.map((situation) => {
                  const typeInfo = SITUATION_TYPE_LABELS[situation.situation_type];
                  return (
                    <TableRow key={situation.id}>
                      <TableCell className="text-sm">
                        {format(new Date(situation.detected_at), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {situation.patient_name}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${typeInfo?.color} text-white border-0`}
                        >
                          {typeInfo?.label || situation.situation_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {situation.clinician_name || "Unknown"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                        {situation.summary}
                      </TableCell>
                      <TableCell>
                        {situation.status === "open" ? (
                          <Badge variant="destructive">Open</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {situation.status === "open" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resolveSituation(situation.id)}
                              disabled={isResolving}
                            >
                              Resolve
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/episode-summary?id=${situation.episode_id}`}>
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
