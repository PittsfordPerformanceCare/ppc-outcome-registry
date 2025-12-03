import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Users, TrendingUp, CheckCircle2, Clock, Eye, Activity, Brain, Zap, RefreshCw } from "lucide-react";
import { format, subDays, isAfter } from "date-fns";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  checkpoint_status: string;
  severity_score: number | null;
  system_category: string | null;
  created_at: string;
}

const categoryIcons: Record<string, { icon: React.ElementType; color: string }> = {
  visual: { icon: Eye, color: "text-blue-500" },
  vestibular: { icon: Activity, color: "text-purple-500" },
  cerebellar: { icon: Brain, color: "text-teal-500" },
  autonomic: { icon: Zap, color: "text-orange-500" },
};

const LeadsOverview = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7" | "30">("7");

  const loadLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error loading leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("leads-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        () => loadLeads()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const periodDays = period === "7" ? 7 : 30;
  const cutoffDate = subDays(new Date(), periodDays);
  
  const filteredLeads = leads.filter(lead => 
    isAfter(new Date(lead.created_at), cutoffDate)
  );

  const stats = {
    total: filteredLeads.length,
    started: filteredLeads.filter(l => l.checkpoint_status === "severity_check_started").length,
    completed: filteredLeads.filter(l => l.checkpoint_status === "severity_check_completed").length,
    conversionRate: filteredLeads.length > 0 
      ? Math.round((filteredLeads.filter(l => l.checkpoint_status === "severity_check_completed").length / filteredLeads.length) * 100)
      : 0,
  };

  const recentLeads = filteredLeads.slice(0, 20);

  const getSeverityBadge = (score: number | null) => {
    if (score === null) return null;
    if (score <= 16) return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Mild</Badge>;
    if (score <= 32) return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Moderate</Badge>;
    if (score <= 48) return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Significant</Badge>;
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Severe</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === "severity_check_completed") {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
    }
    return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Started</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Leads Overview
          </CardTitle>
          <CardDescription>Severity Check leads and conversions</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as "7" | "30")}>
            <TabsList className="h-8">
              <TabsTrigger value="7" className="text-xs px-3">7 Days</TabsTrigger>
              <TabsTrigger value="30" className="text-xs px-3">30 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="ghost" size="icon" onClick={loadLeads} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-sm">Total Leads</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Started</span>
            </div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.started}</div>
          </div>
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Completed</span>
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.completed}</div>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Conversion</span>
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.conversionRate}%</div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name/Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>System</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No leads in the selected period
                  </TableCell>
                </TableRow>
              ) : (
                recentLeads.map(lead => {
                  const categoryInfo = lead.system_category ? categoryIcons[lead.system_category] : null;
                  const CategoryIcon = categoryInfo?.icon;
                  
                  return (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="font-medium">{lead.name || "—"}</div>
                        <div className="text-sm text-muted-foreground">{lead.email || lead.phone || "No contact"}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(lead.checkpoint_status)}</TableCell>
                      <TableCell>
                        {lead.severity_score !== null ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{lead.severity_score}</span>
                            {getSeverityBadge(lead.severity_score)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {CategoryIcon && categoryInfo ? (
                          <div className="flex items-center gap-1.5">
                            <CategoryIcon className={`h-4 w-4 ${categoryInfo.color}`} />
                            <span className="text-sm capitalize">{lead.system_category}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.utm_source ? (
                          <Badge variant="outline" className="text-xs">{lead.utm_source}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Direct</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(lead.created_at), "MMM d, h:mm a")}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadsOverview;