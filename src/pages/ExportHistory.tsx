import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { History, Download, CheckCircle, XCircle, Clock, Filter, X, FileDown } from "lucide-react";
import { format, startOfDay, startOfWeek, subDays, subWeeks } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ExportHistoryRecord {
  id: string;
  export_name: string;
  export_type: string;
  status: string;
  recipient_emails: string[];
  record_count: number | null;
  error_message: string | null;
  executed_at: string;
}

export default function ExportHistory() {
  const [history, setHistory] = useState<ExportHistoryRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ExportHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartPeriod, setChartPeriod] = useState<"daily" | "weekly">("daily");

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [history, nameFilter, statusFilter, startDate, endDate]);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("export_history")
        .select("*")
        .order("executed_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setHistory((data as any) || []);
    } catch (error: any) {
      toast({
        title: "Error loading export history",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...history];

    // Name filter
    if (nameFilter) {
      filtered = filtered.filter((record) =>
        record.export_name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(
        (record) => new Date(record.executed_at) >= new Date(startDate)
      );
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (record) => new Date(record.executed_at) <= end
      );
    }

    setFilteredHistory(filtered);
  };

  const clearFilters = () => {
    setNameFilter("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const exportToCSV = () => {
    try {
      // CSV Headers
      const headers = [
        "Status",
        "Export Name",
        "Type",
        "Records",
        "Recipients",
        "Recipient Emails",
        "Executed At",
        "Error Message"
      ];

      // Convert data to CSV rows
      const csvRows = [
        headers.join(","),
        ...filteredHistory.map((record) => {
          const row = [
            record.status,
            `"${record.export_name.replace(/"/g, '""')}"`, // Escape quotes
            record.export_type.toUpperCase(),
            record.record_count !== null ? record.record_count : "",
            record.recipient_emails.length,
            `"${record.recipient_emails.join("; ").replace(/"/g, '""')}"`, // Escape quotes
            format(new Date(record.executed_at), "yyyy-MM-dd HH:mm:ss"),
            record.error_message ? `"${record.error_message.replace(/"/g, '""')}"` : ""
          ];
          return row.join(",");
        })
      ];

      // Create CSV content
      const csvContent = csvRows.join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `export-history-${format(new Date(), "yyyy-MM-dd-HHmmss")}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Downloaded ${filteredHistory.length} records`,
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "success":
        return "default";
      case "failed":
        return "destructive";
      case "processing":
        return "secondary";
      default:
        return "outline";
    }
  };

  const hasActiveFilters = nameFilter || statusFilter !== "all" || startDate || endDate;

  // Calculate statistics
  const stats = {
    total: filteredHistory.length,
    successful: filteredHistory.filter((r) => r.status === "success").length,
    failed: filteredHistory.filter((r) => r.status === "failed").length,
    processing: filteredHistory.filter((r) => r.status === "processing").length,
    totalRecords: filteredHistory.reduce(
      (sum, r) => sum + (r.record_count || 0),
      0
    ),
    successRate:
      filteredHistory.length > 0
        ? (
            (filteredHistory.filter((r) => r.status === "success").length /
              filteredHistory.length) *
            100
          ).toFixed(1)
        : "0.0",
  };

  // Generate chart data
  const getChartData = () => {
    if (filteredHistory.length === 0) return [];

    const periods = chartPeriod === "daily" ? 14 : 8; // Last 14 days or 8 weeks
    const data: any[] = [];

    for (let i = periods - 1; i >= 0; i--) {
      let periodStart: Date;
      let periodLabel: string;

      if (chartPeriod === "daily") {
        periodStart = startOfDay(subDays(new Date(), i));
        periodLabel = format(periodStart, "MMM dd");
      } else {
        periodStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
        periodLabel = format(periodStart, "MMM dd");
      }

      const periodEnd =
        chartPeriod === "daily"
          ? startOfDay(subDays(new Date(), i - 1))
          : startOfWeek(subWeeks(new Date(), i - 1), { weekStartsOn: 1 });

      const periodExports = history.filter((record) => {
        const recordDate = new Date(record.executed_at);
        return recordDate >= periodStart && recordDate < periodEnd;
      });

      const successful = periodExports.filter((r) => r.status === "success").length;
      const failed = periodExports.filter((r) => r.status === "failed").length;

      data.push({
        period: periodLabel,
        successful,
        failed,
        total: successful + failed,
        startDate: format(periodStart, "yyyy-MM-dd"),
        endDate: format(periodEnd, "yyyy-MM-dd"),
      });
    }

    return data;
  };

  const chartData = getChartData();

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedData = data.activePayload[0].payload;
      setStartDate(clickedData.startDate);
      setEndDate(clickedData.endDate);
      
      toast({
        title: "Filters applied",
        description: `Showing exports from ${format(new Date(clickedData.startDate), "MMM d")} to ${format(new Date(clickedData.endDate), "MMM d")}`,
      });
    }
  };

  const resetDateFilters = () => {
    setStartDate("");
    setEndDate("");
    toast({
      title: "Date filters cleared",
      description: "Showing all exports",
    });
  };

  const hasDateFilters = startDate || endDate;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-8 w-8" />
            Export History
          </h1>
          <p className="text-muted-foreground mt-1">
            View and track all past export executions
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={filteredHistory.length === 0}>
          <FileDown className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Exports</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.processing > 0 && `${stats.processing} processing`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-3xl text-green-600 dark:text-green-400">
              {stats.successRate}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.successful} successful exports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Failed Exports</CardDescription>
            <CardTitle className="text-3xl text-red-600 dark:text-red-400">
              {stats.failed}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? ((stats.failed / stats.total) * 100).toFixed(1)
                : "0.0"}
              % failure rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Records</CardDescription>
            <CardTitle className="text-3xl">
              {stats.totalRecords.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Avg{" "}
              {stats.successful > 0
                ? Math.round(stats.totalRecords / stats.successful).toLocaleString()
                : 0}{" "}
              per export
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Export Trends</CardTitle>
              <CardDescription>
                Success and failure rates over time (click any point to filter)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {hasDateFilters && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetDateFilters}
                  className="gap-2"
                >
                  <X className="h-3 w-3" />
                  Reset Date Filter
                </Button>
              )}
              <Tabs value={chartPeriod} onValueChange={(v) => setChartPeriod(v as "daily" | "weekly")}>
                <TabsList>
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No data available for chart
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} onClick={handleChartClick} className="cursor-pointer">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="period" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="successful"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name="Successful"
                  dot={{ fill: 'hsl(var(--chart-2))' }}
                  activeDot={{ r: 8, cursor: 'pointer' }}
                />
                <Line
                  type="monotone"
                  dataKey="failed"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  name="Failed"
                  dot={{ fill: 'hsl(var(--destructive))' }}
                  activeDot={{ r: 8, cursor: 'pointer' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter exports by name, status, and date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name-filter">Export Name</Label>
              <Input
                id="name-filter"
                placeholder="Search by name..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredHistory.length} of {history.length} exports
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Export Executions</CardTitle>
          <CardDescription>
            Complete history of all export runs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : filteredHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {hasActiveFilters
                ? "No exports match your filters"
                : "No export history yet"}
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Export Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Executed At</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.status)}
                          <Badge variant={getStatusBadgeVariant(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.export_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {record.export_type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.record_count !== null ? (
                          <span className="text-sm">
                            {record.record_count.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {record.recipient_emails.length}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(
                          new Date(record.executed_at),
                          "MMM d, yyyy h:mm a"
                        )}
                      </TableCell>
                      <TableCell>
                        {record.error_message ? (
                          <div className="max-w-xs">
                            <p className="text-xs text-destructive line-clamp-2">
                              {record.error_message}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No errors
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
