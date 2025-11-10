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
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Mail, Trash2, Plus, Edit, Play, Copy, CheckSquare, Square } from "lucide-react";
import { format } from "date-fns";
import { ExportTemplateManager } from "./ExportTemplateManager";
import { Checkbox } from "@/components/ui/checkbox";

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

interface ExportSchedulerProps {
  currentFilters?: Record<string, any>;
}

export function ExportScheduler({ currentFilters = {} }: ExportSchedulerProps) {
  const [exports, setExports] = useState<ScheduledExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExport, setEditingExport] = useState<ScheduledExport | null>(null);
  const [selectedExports, setSelectedExports] = useState<string[]>([]);
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedules">Scheduled Exports</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="schedules" className="mt-4">
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : exports.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No scheduled exports yet. Create one to get started!
              </p>
            ) : (
              <>
                {/* Bulk Actions Bar */}
                {selectedExports.length > 0 && (
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

                <div className="space-y-3">
                {exports.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedExports.includes(exp.id)}
                      onCheckedChange={() => toggleSelectExport(exp.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
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
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
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
                  </div>
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
        </Tabs>
      </CardContent>
    </Card>
  );
}
