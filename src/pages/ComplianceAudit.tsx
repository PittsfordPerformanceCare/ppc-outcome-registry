import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Shield, 
  FileText, 
  Download, 
  Search, 
  Filter,
  Activity,
  Users,
  Database,
  Clock
} from "lucide-react";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_data: any;
  new_data: any;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface ComplianceMetrics {
  totalAuditLogs: number;
  totalUsers: number;
  totalEpisodes: number;
  recentActivity: number;
}

export default function ComplianceAudit() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    totalAuditLogs: 0,
    totalUsers: 0,
    totalEpisodes: 0,
    recentActivity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [tableFilter, setTableFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAuditLogs(),
        loadMetrics(),
      ]);
    } catch (error: any) {
      console.error("Error loading compliance data:", error);
      toast.error("Failed to load compliance data");
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    const { data, error } = await supabase
      .from("audit_logs")
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error loading audit logs:", error);
      return;
    }

    setAuditLogs(data || []);
  };

  const loadMetrics = async () => {
    const [logsCount, usersCount, episodesCount, recentLogsCount] = await Promise.all([
      supabase.from("audit_logs").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("episodes").select("*", { count: "exact", head: true }),
      supabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    ]);

    setMetrics({
      totalAuditLogs: logsCount.count || 0,
      totalUsers: usersCount.count || 0,
      totalEpisodes: episodesCount.count || 0,
      recentActivity: recentLogsCount.count || 0,
    });
  };

  const exportAuditLogs = () => {
    const csv = [
      ["Timestamp", "User", "Action", "Table", "Record ID", "IP Address"].join(","),
      ...filteredLogs.map((log) =>
        [
          format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
          log.profiles?.email || "Unknown",
          log.action,
          log.table_name,
          log.record_id,
          log.ip_address || "N/A",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Audit logs exported successfully");
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesTable = tableFilter === "all" || log.table_name === tableFilter;

    return matchesSearch && matchesAction && matchesTable;
  });

  const uniqueActions = Array.from(new Set(auditLogs.map((log) => log.action)));
  const uniqueTables = Array.from(new Set(auditLogs.map((log) => log.table_name)));

  const getActionBadgeColor = (action: string) => {
    if (action.toLowerCase().includes("create") || action.toLowerCase().includes("insert"))
      return "default";
    if (action.toLowerCase().includes("update")) return "secondary";
    if (action.toLowerCase().includes("delete")) return "destructive";
    return "outline";
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading compliance data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Compliance & Audit</h1>
          <p className="text-muted-foreground mt-2">
            Track system activity and maintain compliance records
          </p>
        </div>
        <Button onClick={exportAuditLogs} className="gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audit Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAuditLogs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time activity records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered system users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Episodes</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEpisodes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Patient episodes tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.recentActivity}</div>
            <p className="text-xs text-muted-foreground">Recent activity events</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-success" />
            <CardTitle>Compliance Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Audit Logging</p>
                <p className="text-2xl font-bold text-success">Active</p>
              </div>
              <Badge className="bg-success/15 text-success border-success/30">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data Encryption</p>
                <p className="text-2xl font-bold text-success">Active</p>
              </div>
              <Badge className="bg-success/15 text-success border-success/30">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Access Control</p>
                <p className="text-2xl font-bold text-success">Active</p>
              </div>
              <Badge className="bg-success/15 text-success border-success/30">RLS Enabled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Complete activity history and system changes</CardDescription>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                {uniqueTables.map((table) => (
                  <SelectItem key={table} value={table}>
                    {table}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredLogs.length} of {auditLogs.length} logs
          </div>

          {/* Logs Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Record ID</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {format(new Date(log.created_at), "MMM dd, yyyy HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{log.profiles?.full_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{log.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeColor(log.action) as any}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.table_name}</TableCell>
                      <TableCell className="font-mono text-xs">{log.record_id}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {log.ip_address || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* HIPAA Compliance Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>HIPAA Compliance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <div className="mt-0.5 h-4 w-4 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                <div className="h-2 w-2 rounded-full bg-success" />
              </div>
              <span>All patient data access is logged and monitored</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-0.5 h-4 w-4 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                <div className="h-2 w-2 rounded-full bg-success" />
              </div>
              <span>Data is encrypted at rest and in transit</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-0.5 h-4 w-4 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                <div className="h-2 w-2 rounded-full bg-success" />
              </div>
              <span>Role-based access control (RBAC) is enforced</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-0.5 h-4 w-4 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                <div className="h-2 w-2 rounded-full bg-success" />
              </div>
              <span>Audit logs are retained for compliance requirements</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
