import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Mail, Trash2, Plus, Edit, Play, Copy, CheckSquare, Square, ChevronDown, History, CheckCircle2, XCircle, AlertCircle, TrendingUp, Target, Database, BarChart3, GitCompare, Download } from "lucide-react";
import { format, startOfDay, startOfWeek, parseISO } from "date-fns";
import { ExportTemplateManager } from "./ExportTemplateManager";
import { Checkbox } from "@/components/ui/checkbox";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import jsPDF from "jspdf";
import { ComparisonReportScheduler } from "./ComparisonReportScheduler";
import { ComparisonReportAnalytics } from "./ComparisonReportAnalytics";
import { RecipientEngagementAnalytics } from "./RecipientEngagementAnalytics";

interface ScheduledExport {
  id: string;
  name: string;
  export_type: string;
  frequency: string;
  recipient_emails: string[];
  filters: Record<string, any>;
  enabled: boolean;
  next_run_at: string;
  last_run_at?: string;
}

interface ExportHistoryRecord {
  id: string;
  export_id: string;
  export_name: string;
  export_type: string;
  status: string;
  record_count: number | null;
  error_message: string | null;
  executed_at: string;
  recipient_emails: string[];
}

interface ExportSchedulerProps {
  currentFilters?: Record<string, any>;
}

export function ExportScheduler({ currentFilters = {} }: ExportSchedulerProps) {
  const [exports, setExports] = useState<ScheduledExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExport, setEditingExport] = useState<ScheduledExport | null>(null);
  const [selectedExports, setSelectedExports] = useState<string[]>([]);
  const [exportHistories, setExportHistories] = useState<Record<string, ExportHistoryRecord[]>>({});
  const [loadingHistory, setLoadingHistory] = useState<Record<string, boolean>>({});
  const [chartView, setChartView] = useState<Record<string, "daily" | "weekly">>({});
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareSelected, setCompareSelected] = useState<string[]>([]);
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState("");
  const [exportType, setExportType] = useState<"csv" | "pdf">("csv");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [recipientEmails, setRecipientEmails] = useState("");
  const [useCurrentFilters, setUseCurrentFilters] = useState(true);

  useEffect(() => {
    loadScheduledExports();
  }, []);

  const loadScheduledExports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("scheduled_exports" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExports((data as any) || []);
    } catch (error: any) {
      toast({
        title: "Error loading scheduled exports",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExportHistory = async (exportId: string) => {
    if (exportHistories[exportId]) return; // Already loaded
    
    setLoadingHistory(prev => ({ ...prev, [exportId]: true }));
    
    try {
      const { data, error } = await supabase
        .from("export_history")
        .select("*")
        .eq("export_id", exportId)
        .order("executed_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setExportHistories(prev => ({
        ...prev,
        [exportId]: (data as any) || []
      }));
    } catch (error: any) {
      toast({
        title: "Error loading export history",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingHistory(prev => ({ ...prev, [exportId]: false }));
    }
  };

  const calculateNextRunAt = (freq: string): string => {
    const now = new Date();
    switch (freq) {
      case "daily":
        now.setDate(now.getDate() + 1);
        break;
      case "weekly":
        now.setDate(now.getDate() + 7);
        break;
      case "monthly":
        now.setMonth(now.getMonth() + 1);
        break;
    }
    return now.toISOString();
  };

  const handleSaveExport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const emails = recipientEmails.split(",").map(e => e.trim()).filter(e => e);
      if (emails.length === 0) {
        toast({
          title: "Invalid emails",
          description: "Please enter at least one recipient email",
          variant: "destructive",
        });
        return;
      }

      const exportData = {
        name: name || `${exportType.toUpperCase()} Export - ${frequency}`,
        export_type: exportType,
        frequency,
        recipient_emails: emails,
        filters: useCurrentFilters ? currentFilters : {},
        user_id: user.id,
        next_run_at: calculateNextRunAt(frequency),
        enabled: true,
      };

      if (editingExport) {
        const { error } = await supabase
          .from("scheduled_exports" as any)
          .update(exportData)
          .eq("id", editingExport.id);

        if (error) throw error;

        toast({
          title: "Export updated",
          description: "Scheduled export has been updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("scheduled_exports" as any)
          .insert([exportData]);

        if (error) throw error;

        toast({
          title: "Export scheduled",
          description: `Your ${frequency} ${exportType.toUpperCase()} export has been scheduled`,
        });
      }

      setDialogOpen(false);
      resetForm();
      loadScheduledExports();
    } catch (error: any) {
      toast({
        title: "Error saving export",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from("scheduled_exports" as any)
        .update({ enabled })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: enabled ? "Export enabled" : "Export disabled",
        description: `Scheduled export has been ${enabled ? "enabled" : "disabled"}`,
      });

      loadScheduledExports();
    } catch (error: any) {
      toast({
        title: "Error updating export",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteExport = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_exports" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Export deleted",
        description: "Scheduled export has been deleted",
      });

      loadScheduledExports();
    } catch (error: any) {
      toast({
        title: "Error deleting export",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRunNow = async (exportId: string) => {
    try {
      toast({
        title: "Running export...",
        description: "Your export is being processed and will be emailed shortly",
      });

      const { data, error } = await supabase.functions.invoke('process-scheduled-exports', {
        body: { export_id: exportId }
      });

      if (error) throw error;

      toast({
        title: "Export completed",
        description: data?.results?.[0]?.status === 'success' 
          ? "Export has been sent successfully"
          : "Export processing completed",
      });

      loadScheduledExports();
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditExport = (exp: ScheduledExport) => {
    setEditingExport(exp);
    setName(exp.name);
    setExportType(exp.export_type as "csv" | "pdf");
    setFrequency(exp.frequency as "daily" | "weekly" | "monthly");
    setRecipientEmails(exp.recipient_emails.join(", "));
    setUseCurrentFilters(Object.keys(exp.filters).length > 0);
    setDialogOpen(true);
  };

  const handleDuplicateExport = (exp: ScheduledExport) => {
    setEditingExport(null); // Not editing, creating new
    setName(`Copy of ${exp.name}`);
    setExportType(exp.export_type as "csv" | "pdf");
    setFrequency(exp.frequency as "daily" | "weekly" | "monthly");
    setRecipientEmails(exp.recipient_emails.join(", "));
    setUseCurrentFilters(Object.keys(exp.filters).length > 0);
    setDialogOpen(true);
    toast({
      title: "Duplicating export",
      description: "Modify the settings and save to create a copy",
    });
  };

  const handleApplyTemplate = (template: any) => {
    setName(template.name);
    setExportType(template.export_type);
    setRecipientEmails(template.recipient_emails.join(", "));
    setUseCurrentFilters(Object.keys(template.filters || {}).length > 0);
    setDialogOpen(true);
    toast({
      title: "Template applied",
      description: `Using "${template.name}" configuration`,
    });
  };

  const resetForm = () => {
    setEditingExport(null);
    setName("");
    setExportType("csv");
    setFrequency("weekly");
    setRecipientEmails("");
    setUseCurrentFilters(true);
  };

  // Bulk selection handlers
  const toggleSelectExport = (id: string) => {
    setSelectedExports(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedExports.length === exports.length) {
      setSelectedExports([]);
    } else {
      setSelectedExports(exports.map(exp => exp.id));
    }
  };

  const handleBulkEnable = async () => {
    if (selectedExports.length === 0) return;
    
    try {
      const { error } = await supabase
        .from("scheduled_exports" as any)
        .update({ enabled: true })
        .in("id", selectedExports);

      if (error) throw error;

      toast({
        title: "Exports enabled",
        description: `${selectedExports.length} export(s) have been enabled`,
      });
      
      setSelectedExports([]);
      loadScheduledExports();
    } catch (error: any) {
      toast({
        title: "Error enabling exports",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBulkDisable = async () => {
    if (selectedExports.length === 0) return;
    
    try {
      const { error } = await supabase
        .from("scheduled_exports" as any)
        .update({ enabled: false })
        .in("id", selectedExports);

      if (error) throw error;

      toast({
        title: "Exports disabled",
        description: `${selectedExports.length} export(s) have been disabled`,
      });
      
      setSelectedExports([]);
      loadScheduledExports();
    } catch (error: any) {
      toast({
        title: "Error disabling exports",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedExports.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedExports.length} scheduled export(s)?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("scheduled_exports" as any)
        .delete()
        .in("id", selectedExports);

      if (error) throw error;

      toast({
        title: "Exports deleted",
        description: `${selectedExports.length} export(s) have been removed`,
      });
      
      setSelectedExports([]);
      loadScheduledExports();
    } catch (error: any) {
      toast({
        title: "Error deleting exports",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getFrequencyBadgeVariant = (freq: string) => {
    switch (freq) {
      case "daily": return "default";
      case "weekly": return "secondary";
      case "monthly": return "outline";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "partial":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "success": return "default";
      case "failed": return "destructive";
      case "partial": return "secondary";
      default: return "outline";
    }
  };

  const calculateMetrics = (history: ExportHistoryRecord[]) => {
    if (history.length === 0) {
      return {
        successRate: 0,
        totalRecords: 0,
        averageRecords: 0,
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
      };
    }

    const successfulRuns = history.filter(h => h.status === "success").length;
    const failedRuns = history.filter(h => h.status === "failed").length;
    const totalRuns = history.length;
    const successRate = (successfulRuns / totalRuns) * 100;
    
    const recordCounts = history
      .filter(h => h.status === "success" && h.record_count !== null)
      .map(h => h.record_count as number);
    
    const totalRecords = recordCounts.reduce((sum, count) => sum + count, 0);
    const averageRecords = recordCounts.length > 0 
      ? Math.round(totalRecords / recordCounts.length)
      : 0;

    return {
      successRate: Math.round(successRate),
      totalRecords,
      averageRecords,
      totalRuns,
      successfulRuns,
      failedRuns,
    };
  };

  const prepareChartData = (history: ExportHistoryRecord[], view: "daily" | "weekly") => {
    if (history.length === 0) return [];

    // Group by day or week
    const grouped = history.reduce((acc, record) => {
      const date = parseISO(record.executed_at);
      const key = view === "daily" 
        ? format(startOfDay(date), "MMM d")
        : format(startOfWeek(date, { weekStartsOn: 1 }), "MMM d");
      
      if (!acc[key]) {
        acc[key] = {
          period: key,
          total: 0,
          success: 0,
          failed: 0,
          records: 0,
        };
      }
      
      acc[key].total += 1;
      if (record.status === "success") {
        acc[key].success += 1;
        acc[key].records += record.record_count || 0;
      } else if (record.status === "failed") {
        acc[key].failed += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and calculate success rate
    return Object.values(grouped).map((item: any) => ({
      period: item.period,
      successRate: Math.round((item.success / item.total) * 100),
      records: item.records,
      totalRuns: item.total,
      successful: item.success,
      failed: item.failed,
    })).reverse().slice(0, 10); // Show last 10 periods
  };

  const toggleCompareSelection = (id: string) => {
    setCompareSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else {
        if (prev.length >= 5) {
          toast({
            title: "Selection limit reached",
            description: "You can compare up to 5 exports at a time",
            variant: "destructive",
          });
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const loadComparisonHistories = async () => {
    for (const exportId of compareSelected) {
      if (!exportHistories[exportId]) {
        await loadExportHistory(exportId);
      }
    }
  };

  const prepareComparisonData = () => {
    return compareSelected.map(exportId => {
      const exp = exports.find(e => e.id === exportId);
      const history = exportHistories[exportId] || [];
      const metrics = calculateMetrics(history);
      
      return {
        id: exportId,
        name: exp?.name || "Unknown",
        ...metrics,
      };
    });
  };

  const exportComparisonToPDF = async () => {
    try {
      toast({
        title: "Generating PDF...",
        description: "Please wait while we create your report",
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Title
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Export Schedule Performance Comparison", pageWidth / 2, yPosition, { align: "center" });
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, pageWidth / 2, yPosition, { align: "center" });
      
      yPosition += 15;

      // Summary
      const comparisonData = prepareComparisonData();
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Performance Summary", 15, yPosition);
      
      yPosition += 8;
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      
      // Table headers
      const colWidths = [60, 30, 30, 30, 25];
      const headers = ["Export Schedule", "Success Rate", "Total Records", "Avg Records", "Failed"];
      let xPosition = 15;
      
      pdf.setFont("helvetica", "bold");
      pdf.setFillColor(240, 240, 240);
      pdf.rect(15, yPosition - 5, pageWidth - 30, 8, "F");
      
      headers.forEach((header, i) => {
        pdf.text(header, xPosition, yPosition, { align: i === 0 ? "left" : "right" });
        xPosition += colWidths[i];
      });
      
      yPosition += 8;
      
      // Table rows
      pdf.setFont("helvetica", "normal");
      comparisonData.forEach((data, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Alternating row colors
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(15, yPosition - 5, pageWidth - 30, 8, "F");
        }
        
        xPosition = 15;
        
        // Name
        pdf.text(data.name.substring(0, 35), xPosition, yPosition);
        xPosition += colWidths[0];
        
        // Success Rate
        pdf.text(`${data.successRate}%`, xPosition, yPosition, { align: "right" });
        xPosition += colWidths[1];
        
        // Total Records
        pdf.text(data.totalRecords.toLocaleString(), xPosition, yPosition, { align: "right" });
        xPosition += colWidths[2];
        
        // Average Records
        pdf.text(data.averageRecords.toLocaleString(), xPosition, yPosition, { align: "right" });
        xPosition += colWidths[3];
        
        // Failed Runs
        pdf.text(data.failedRuns.toString(), xPosition, yPosition, { align: "right" });
        
        yPosition += 8;
      });
      
      yPosition += 10;
      
      // Detailed Metrics
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Detailed Metrics", 15, yPosition);
      
      yPosition += 8;
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      
      comparisonData.forEach((data, index) => {
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFont("helvetica", "bold");
        pdf.text(`${index + 1}. ${data.name}`, 15, yPosition);
        yPosition += 6;
        
        pdf.setFont("helvetica", "normal");
        pdf.text(`Success Rate: ${data.successRate}% (${data.successfulRuns} successful out of ${data.totalRuns} total runs)`, 20, yPosition);
        yPosition += 5;
        pdf.text(`Total Records Exported: ${data.totalRecords.toLocaleString()}`, 20, yPosition);
        yPosition += 5;
        pdf.text(`Average Records per Export: ${data.averageRecords.toLocaleString()}`, 20, yPosition);
        yPosition += 5;
        pdf.text(`Failed Runs: ${data.failedRuns}`, 20, yPosition);
        yPosition += 8;
      });
      
      // Visual summary note
      yPosition += 5;
      
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "italic");
      pdf.text(
        "Note: Charts and visual trends can be viewed in the application's comparison view.",
        15,
        yPosition
      );
      
      // Footer on last page
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "italic");
      pdf.text(
        "Generated by PPC Outcome Registry - Export Performance Comparison",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
      
      // Save the PDF
      pdf.save(`export-comparison-${format(new Date(), "yyyy-MM-dd-HHmmss")}.pdf`);
      
      toast({
        title: "PDF exported successfully",
        description: "Your comparison report has been downloaded",
      });
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error generating PDF",
        description: error.message || "Failed to create PDF report",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Export Automation
            </CardTitle>
            <CardDescription>
              Manage templates and scheduled exports
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {!comparisonMode && (
              <Button
                variant="outline"
                onClick={() => {
                  setComparisonMode(true);
                  setCompareSelected([]);
                }}
                className="gap-2"
              >
                <GitCompare className="h-4 w-4" />
                Compare Schedules
              </Button>
            )}
            {comparisonMode && (
              <>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    if (compareSelected.length < 2) {
                      toast({
                        title: "Select at least 2 exports",
                        description: "Choose 2-5 exports to compare",
                        variant: "destructive",
                      });
                      return;
                    }
                    await loadComparisonHistories();
                  }}
                  disabled={compareSelected.length < 2}
                >
                  View Comparison ({compareSelected.length})
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setComparisonMode(false);
                    setCompareSelected([]);
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingExport ? "Edit Scheduled Export" : "Create Scheduled Export"}
                </DialogTitle>
                <DialogDescription>
                  Set up automatic data exports sent to your email
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Export Name</Label>
                  <Input
                    id="name"
                    placeholder="Weekly Performance Report"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Export Type</Label>
                    <Select value={exportType} onValueChange={(v) => setExportType(v as "csv" | "pdf")}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={frequency} onValueChange={(v) => setFrequency(v as "daily" | "weekly" | "monthly")}>
                      <SelectTrigger id="frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="emails">Recipient Emails</Label>
                  <Input
                    id="emails"
                    placeholder="email1@example.com, email2@example.com"
                    value={recipientEmails}
                    onChange={(e) => setRecipientEmails(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Separate multiple emails with commas
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label>Use Current Filters</Label>
                    <p className="text-sm text-muted-foreground">
                      Apply your current dashboard filters to exports
                    </p>
                  </div>
                  <Switch
                    checked={useCurrentFilters}
                    onCheckedChange={setUseCurrentFilters}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveExport}>
                  {editingExport ? "Update" : "Create"} Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="schedules" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedules">Scheduled Exports</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="reports">Comparison Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="schedules" className="mt-4">
            {/* Comparison View */}
            {comparisonMode && compareSelected.length >= 2 && (() => {
              const comparisonData = prepareComparisonData();
              const maxValues = {
                successRate: Math.max(...comparisonData.map(d => d.successRate)),
                totalRecords: Math.max(...comparisonData.map(d => d.totalRecords)),
                averageRecords: Math.max(...comparisonData.map(d => d.averageRecords)),
              };

              return (
                <div className="mb-6 p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GitCompare className="h-5 w-5" />
                      <h3 className="font-semibold">Performance Comparison</h3>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportComparisonToPDF}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export PDF
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setComparisonMode(false);
                          setCompareSelected([]);
                        }}
                      >
                        Close
                      </Button>
                    </div>
                  </div>

                  {/* Comparison Table */}
                  <div className="mb-4 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Export Schedule</TableHead>
                          <TableHead className="text-right">Success Rate</TableHead>
                          <TableHead className="text-right">Total Records</TableHead>
                          <TableHead className="text-right">Avg Records</TableHead>
                          <TableHead className="text-right">Total Runs</TableHead>
                          <TableHead className="text-right">Failed Runs</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparisonData.map((data) => (
                          <TableRow key={data.id}>
                            <TableCell className="font-medium">{data.name}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className={data.successRate === maxValues.successRate ? "font-bold text-green-600" : ""}>
                                  {data.successRate}%
                                </span>
                                {data.successRate === maxValues.successRate && (
                                  <Badge variant="secondary" className="text-xs">Best</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className={data.totalRecords === maxValues.totalRecords ? "font-bold text-blue-600" : ""}>
                                  {data.totalRecords.toLocaleString()}
                                </span>
                                {data.totalRecords === maxValues.totalRecords && (
                                  <Badge variant="secondary" className="text-xs">Most</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={data.averageRecords === maxValues.averageRecords ? "font-bold text-purple-600" : ""}>
                                {data.averageRecords.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">{data.totalRuns}</TableCell>
                            <TableCell className="text-right">
                              <span className={data.failedRuns > 0 ? "text-red-600" : "text-muted-foreground"}>
                                {data.failedRuns}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Comparison Charts */}
                  <div className="grid grid-cols-2 gap-4" data-comparison-charts>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Success Rate Comparison</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={comparisonData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 10 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="successRate" name="Success Rate (%)">
                            {comparisonData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`}
                                fill={entry.successRate >= 90 ? "hsl(142 76% 36%)" : 
                                      entry.successRate >= 70 ? "hsl(48 96% 53%)" : 
                                      "hsl(0 84% 60%)"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Total Records Comparison</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={comparisonData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 10 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="totalRecords" fill="hsl(var(--primary))" name="Total Records" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );
            })()}

            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : exports.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No scheduled exports yet. Create one to get started!
              </p>
            ) : (
              <>
                {/* Comparison Mode Instructions */}
                {comparisonMode && (
                  <div className="mb-4 p-3 border rounded-lg bg-blue-50 dark:bg-blue-950">
                    <p className="text-sm">
                      Select 2-5 exports to compare their performance metrics. 
                      Click <strong>View Comparison</strong> when ready.
                    </p>
                  </div>
                )}

                {/* Bulk Actions Bar */}
                {!comparisonMode && selectedExports.length > 0 && (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50 mb-3">
                    <p className="text-sm font-medium">
                      {selectedExports.length} export{selectedExports.length !== 1 ? 's' : ''} selected
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkEnable}
                        className="gap-2"
                      >
                        <CheckSquare className="h-3 w-3" />
                        Enable
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkDisable}
                        className="gap-2"
                      >
                        <Square className="h-3 w-3" />
                        Disable
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="gap-2"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedExports([])}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}

                {/* Select All */}
                {!comparisonMode && (
                  <div className="flex items-center gap-2 p-2 border-b">
                    <Checkbox
                      checked={selectedExports.length === exports.length && exports.length > 0}
                      onCheckedChange={toggleSelectAll}
                      id="select-all"
                    />
                    <Label htmlFor="select-all" className="text-sm cursor-pointer">
                      Select all ({exports.length})
                    </Label>
                  </div>
                )}

                <div className="space-y-3">
                {exports.map((exp) => (
                  <Collapsible key={exp.id}>
                    <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      {comparisonMode ? (
                        <Checkbox
                          checked={compareSelected.includes(exp.id)}
                          onCheckedChange={() => toggleCompareSelection(exp.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <Checkbox
                          checked={selectedExports.includes(exp.id)}
                          onCheckedChange={() => toggleSelectExport(exp.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{exp.name}</h4>
                          <Badge variant={getFrequencyBadgeVariant(exp.frequency)}>
                            {exp.frequency}
                          </Badge>
                          <Badge variant="outline">{exp.export_type.toUpperCase()}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {exp.recipient_emails.length} recipient{exp.recipient_emails.length !== 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Next: {format(new Date(exp.next_run_at), "MMM d, h:mm a")}
                          </span>
                          {exp.last_run_at && (
                            <span className="flex items-center gap-1">
                              <History className="h-3 w-3" />
                              Last: {format(new Date(exp.last_run_at), "MMM d, h:mm a")}
                            </span>
                          )}
                        </div>
                      </div>

                      {!comparisonMode && (
                        <div className="flex items-center gap-2">
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadExportHistory(exp.id)}
                            className="gap-2"
                          >
                            <History className="h-4 w-4" />
                            History
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </CollapsibleTrigger>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRunNow(exp.id)}
                          className="gap-2"
                        >
                          <Play className="h-3 w-3" />
                          Run Now
                        </Button>
                        <Switch
                          checked={exp.enabled}
                          onCheckedChange={(checked) => handleToggleEnabled(exp.id, checked)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicateExport(exp)}
                          title="Duplicate export"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditExport(exp)}
                          title="Edit export"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteExport(exp.id)}
                          title="Delete export"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      )}
                    </div>

                    {!comparisonMode && (
                      <CollapsibleContent>
                      <div className="ml-10 mr-4 mb-3 p-4 border border-t-0 rounded-b-lg bg-muted/20">
                        <div className="flex items-center gap-2 mb-4">
                          <History className="h-4 w-4" />
                          <h5 className="font-semibold text-sm">Export Performance & History</h5>
                        </div>
                        
                        {loadingHistory[exp.id] ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Loading history...
                          </p>
                        ) : !exportHistories[exp.id] || exportHistories[exp.id].length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No run history yet
                          </p>
                        ) : (
                          <>
                            {/* Performance Metrics */}
                            {(() => {
                              const metrics = calculateMetrics(exportHistories[exp.id]);
                              return (
                                <div className="grid grid-cols-4 gap-3 mb-4">
                                  <Card className="p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Target className="h-4 w-4 text-green-600" />
                                      <p className="text-xs font-medium text-muted-foreground">Success Rate</p>
                                    </div>
                                    <p className="text-2xl font-bold">
                                      {metrics.successRate}%
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {metrics.successfulRuns} of {metrics.totalRuns} runs
                                    </p>
                                  </Card>

                                  <Card className="p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Database className="h-4 w-4 text-blue-600" />
                                      <p className="text-xs font-medium text-muted-foreground">Total Records</p>
                                    </div>
                                    <p className="text-2xl font-bold">
                                      {metrics.totalRecords.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      All successful exports
                                    </p>
                                  </Card>

                                  <Card className="p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <TrendingUp className="h-4 w-4 text-purple-600" />
                                      <p className="text-xs font-medium text-muted-foreground">Avg Records</p>
                                    </div>
                                    <p className="text-2xl font-bold">
                                      {metrics.averageRecords.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Per successful export
                                    </p>
                                  </Card>

                                  <Card className="p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <XCircle className="h-4 w-4 text-red-600" />
                                      <p className="text-xs font-medium text-muted-foreground">Failed Runs</p>
                                    </div>
                                    <p className="text-2xl font-bold">
                                      {metrics.failedRuns}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Require attention
                                    </p>
                                  </Card>
                                </div>
                              );
                            })()}

                            {/* Trend Chart */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4" />
                                  <h6 className="text-sm font-semibold">Performance Trends</h6>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant={chartView[exp.id] === "daily" || !chartView[exp.id] ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setChartView(prev => ({ ...prev, [exp.id]: "daily" }))}
                                  >
                                    Daily
                                  </Button>
                                  <Button
                                    variant={chartView[exp.id] === "weekly" ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setChartView(prev => ({ ...prev, [exp.id]: "weekly" }))}
                                  >
                                    Weekly
                                  </Button>
                                </div>
                              </div>
                              
                              <ResponsiveContainer width="100%" height={250}>
                                <LineChart
                                  data={prepareChartData(exportHistories[exp.id], chartView[exp.id] || "daily")}
                                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                  <XAxis 
                                    dataKey="period" 
                                    className="text-xs"
                                    tick={{ fontSize: 12 }}
                                  />
                                  <YAxis 
                                    yAxisId="left"
                                    className="text-xs"
                                    tick={{ fontSize: 12 }}
                                    label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                                  />
                                  <YAxis 
                                    yAxisId="right" 
                                    orientation="right"
                                    className="text-xs"
                                    tick={{ fontSize: 12 }}
                                    label={{ value: 'Records', angle: 90, position: 'insideRight', style: { fontSize: 12 } }}
                                  />
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: 'hsl(var(--background))',
                                      border: '1px solid hsl(var(--border))',
                                      borderRadius: '6px',
                                      fontSize: '12px'
                                    }}
                                  />
                                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                                  <Line 
                                    yAxisId="left"
                                    type="monotone" 
                                    dataKey="successRate" 
                                    stroke="hsl(var(--primary))" 
                                    strokeWidth={2}
                                    name="Success Rate (%)"
                                    dot={{ r: 4 }}
                                  />
                                  <Line 
                                    yAxisId="right"
                                    type="monotone" 
                                    dataKey="records" 
                                    stroke="hsl(142 76% 36%)" 
                                    strokeWidth={2}
                                    name="Records Exported"
                                    dot={{ r: 4 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>

                            {/* Run History */}
                            <div>
                              <h6 className="text-xs font-semibold text-muted-foreground mb-2">
                                Recent Runs (Last 10)
                              </h6>
                              <div className="space-y-2">
                                {exportHistories[exp.id].map((record) => (
                                  <div
                                    key={record.id}
                                    className="flex items-center justify-between p-3 bg-background rounded-lg border"
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      {getStatusIcon(record.status)}
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <Badge variant={getStatusBadgeVariant(record.status)}>
                                            {record.status}
                                          </Badge>
                                          <span className="text-sm text-muted-foreground">
                                            {format(new Date(record.executed_at), "MMM d, yyyy 'at' h:mm a")}
                                          </span>
                                        </div>
                                        {record.error_message && (
                                          <p className="text-xs text-red-600 mt-1">
                                            Error: {record.error_message}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                      {record.record_count !== null && (
                                        <span className="text-muted-foreground">
                                          {record.record_count.toLocaleString()} records
                                        </span>
                                      )}
                                      <Badge variant="outline">
                                        {record.recipient_emails.length} recipients
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CollapsibleContent>
                    )}
                  </Collapsible>
                ))}
              </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
            <ExportTemplateManager
              onApplyTemplate={handleApplyTemplate}
              currentFilters={currentFilters}
              currentType={exportType}
              currentRecipients={recipientEmails.split(",").map(e => e.trim()).filter(e => e)}
            />
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <div className="space-y-6">
              <ComparisonReportAnalytics />
              
              <RecipientEngagementAnalytics />
              
              <ComparisonReportScheduler
                availableExports={exports.map(exp => ({ id: exp.id, name: exp.name }))}
                selectedExportIds={compareSelected}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
