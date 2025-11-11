import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { AlertCircle, Trash2, RefreshCw, Globe, Building2, Download, Upload, FileText, CheckCircle, XCircle, AlertTriangle, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import { PendingEpisodeThresholdSettings } from "./PendingEpisodeThresholdSettings";

interface ThresholdConfig {
  id: string;
  clinic_id: string | null;
  clinic_name: string | null;
  warning_days: number;
  critical_days: number;
  is_global: boolean;
}

interface ValidationResult {
  action: "create" | "update" | "skip";
  clinic_id: string | null;
  clinic_name: string;
  warning_days: number;
  critical_days: number;
  reason?: string;
  existing_id?: string;
}

interface PendingEpisodeThresholdManagementProps {
  isAdmin: boolean;
}

export function PendingEpisodeThresholdManagement({ isAdmin }: PendingEpisodeThresholdManagementProps) {
  const [thresholds, setThresholds] = useState<ThresholdConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ warning_days: string; critical_days: string }>({
    warning_days: "",
    critical_days: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdmin) {
      loadThresholds();
    }
  }, [isAdmin]);

  const loadThresholds = async () => {
    setLoading(true);
    try {
      // Fetch all thresholds with clinic names
      const { data, error } = await supabase
        .from("pending_episode_thresholds")
        .select(`
          id,
          clinic_id,
          warning_days,
          critical_days,
          clinics (
            name
          )
        `)
        .order("clinic_id", { ascending: true, nullsFirst: true });

      if (error) throw error;

      const formatted: ThresholdConfig[] = (data || []).map((item: any) => ({
        id: item.id,
        clinic_id: item.clinic_id,
        clinic_name: item.clinics?.name || null,
        warning_days: item.warning_days,
        critical_days: item.critical_days,
        is_global: item.clinic_id === null,
      }));

      setThresholds(formatted);
    } catch (error: any) {
      console.error("Error loading thresholds:", error);
      toast.error("Failed to load threshold configurations");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, isGlobal: boolean) => {
    if (isGlobal) {
      toast.error("Cannot delete global threshold settings");
      return;
    }

    setDeleting(id);
    try {
      const { error } = await supabase
        .from("pending_episode_thresholds")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Clinic threshold override removed");
      loadThresholds();
    } catch (error: any) {
      console.error("Error deleting threshold:", error);
      toast.error("Failed to delete threshold configuration");
    } finally {
      setDeleting(null);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      // Create CSV with example data
      const headers = ["Clinic ID", "Clinic Name", "Warning Days", "Critical Days"];
      const examples = [
        ["GLOBAL", "Global Default", "30", "60"],
        ["clinic-uuid-123", "Downtown Physical Therapy", "21", "45"],
        ["clinic-uuid-456", "Sports Medicine Center", "14", "30"],
      ];
      
      const csvRows = [headers.join(","), ...examples.map(row => row.join(","))];
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", "threshold-import-template.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Template downloaded successfully");
    } catch (error: any) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template");
    }
  };

  const handleExportCSV = () => {
    try {
      // Create CSV header
      const headers = ["Clinic ID", "Clinic Name", "Warning Days", "Critical Days"];
      const csvRows = [headers.join(",")];

      // Add data rows
      thresholds.forEach((threshold) => {
        const row = [
          threshold.clinic_id || "GLOBAL",
          threshold.clinic_name || "Global Default",
          threshold.warning_days,
          threshold.critical_days,
        ];
        csvRows.push(row.join(","));
      });

      // Create and download file
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `threshold-config-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Configuration exported successfully");
    } catch (error: any) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export configuration");
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error("CSV file is empty or invalid");
      }

      // Skip header row
      const dataRows = lines.slice(1);
      
      // Fetch all clinics to validate IDs
      const { data: clinics, error: clinicsError } = await supabase
        .from("clinics")
        .select("id, name");

      if (clinicsError) throw clinicsError;

      const clinicMap = new Map(clinics.map(c => [c.id, c.name]));
      
      // Fetch existing thresholds
      const { data: existingThresholds } = await supabase
        .from("pending_episode_thresholds")
        .select("id, clinic_id");

      const existingMap = new Map(
        existingThresholds?.map(t => [t.clinic_id ?? "GLOBAL", t.id]) || []
      );

      const results: ValidationResult[] = [];

      for (const line of dataRows) {
        const [clinicId, clinicNameRaw, warningDays, criticalDays] = line.split(",").map(s => s.trim());
        
        // Validate data
        const warning = parseInt(warningDays);
        const critical = parseInt(criticalDays);

        // Validation checks
        if (!clinicId || !warningDays || !criticalDays) {
          results.push({
            action: "skip",
            clinic_id: clinicId || null,
            clinic_name: clinicNameRaw || "Unknown",
            warning_days: warning || 0,
            critical_days: critical || 0,
            reason: "Missing required fields",
          });
          continue;
        }

        if (isNaN(warning) || isNaN(critical)) {
          results.push({
            action: "skip",
            clinic_id: clinicId === "GLOBAL" ? null : clinicId,
            clinic_name: clinicNameRaw,
            warning_days: 0,
            critical_days: 0,
            reason: "Invalid number format",
          });
          continue;
        }

        if (warning <= 0 || critical <= 0) {
          results.push({
            action: "skip",
            clinic_id: clinicId === "GLOBAL" ? null : clinicId,
            clinic_name: clinicNameRaw,
            warning_days: warning,
            critical_days: critical,
            reason: "Days must be greater than 0",
          });
          continue;
        }

        if (warning >= critical) {
          results.push({
            action: "skip",
            clinic_id: clinicId === "GLOBAL" ? null : clinicId,
            clinic_name: clinicNameRaw,
            warning_days: warning,
            critical_days: critical,
            reason: "Warning days must be less than critical days",
          });
          continue;
        }

        // Validate clinic ID
        const targetClinicId = clinicId === "GLOBAL" ? null : clinicId;
        const clinicName = clinicId === "GLOBAL" 
          ? "Global Default" 
          : clinicMap.get(clinicId) || clinicNameRaw;

        if (targetClinicId && !clinicMap.has(targetClinicId)) {
          results.push({
            action: "skip",
            clinic_id: targetClinicId,
            clinic_name: clinicName,
            warning_days: warning,
            critical_days: critical,
            reason: "Clinic ID not found in database",
          });
          continue;
        }

        // Check if exists
        const existingId = existingMap.get(targetClinicId ?? "GLOBAL");
        
        results.push({
          action: existingId ? "update" : "create",
          clinic_id: targetClinicId,
          clinic_name: clinicName,
          warning_days: warning,
          critical_days: critical,
          existing_id: existingId,
        });
      }

      if (results.length === 0) {
        throw new Error("No rows found in CSV file");
      }

      setValidationResults(results);
      setShowPreview(true);
    } catch (error: any) {
      console.error("Error validating CSV:", error);
      toast.error(`Failed to validate: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    setImporting(true);
    try {
      let imported = 0;
      let updated = 0;

      const toProcess = validationResults.filter(r => r.action !== "skip");

      for (const result of toProcess) {
        if (result.action === "update" && result.existing_id) {
          const { error } = await supabase
            .from("pending_episode_thresholds")
            .update({
              warning_days: result.warning_days,
              critical_days: result.critical_days,
            })
            .eq("id", result.existing_id);

          if (!error) updated++;
        } else if (result.action === "create") {
          const { error } = await supabase
            .from("pending_episode_thresholds")
            .insert({
              clinic_id: result.clinic_id,
              warning_days: result.warning_days,
              critical_days: result.critical_days,
            });

          if (!error) imported++;
        }
      }

      const skipped = validationResults.filter(r => r.action === "skip").length;
      
      toast.success(
        `Import complete: ${imported} created, ${updated} updated${skipped > 0 ? `, ${skipped} skipped` : ""}`
      );
      
      setShowPreview(false);
      setValidationResults([]);
      loadThresholds();
    } catch (error: any) {
      console.error("Error importing:", error);
      toast.error(`Failed to import: ${error.message}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCancelImport = () => {
    setShowPreview(false);
    setValidationResults([]);
    setEditingIndex(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleStartEdit = (index: number, result: ValidationResult) => {
    setEditingIndex(index);
    setEditValues({
      warning_days: result.warning_days.toString(),
      critical_days: result.critical_days.toString(),
    });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValues({ warning_days: "", critical_days: "" });
  };

  const validateEditedValues = (warning: number, critical: number): { valid: boolean; error?: string } => {
    if (isNaN(warning) || isNaN(critical)) {
      return { valid: false, error: "Invalid number format" };
    }
    if (warning <= 0 || critical <= 0) {
      return { valid: false, error: "Days must be greater than 0" };
    }
    if (warning >= critical) {
      return { valid: false, error: "Warning days must be less than critical days" };
    }
    return { valid: true };
  };

  const handleSaveEdit = async (index: number) => {
    const warning = parseInt(editValues.warning_days);
    const critical = parseInt(editValues.critical_days);

    const validation = validateEditedValues(warning, critical);
    
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const updatedResults = [...validationResults];
    const result = updatedResults[index];

    // Update the values
    result.warning_days = warning;
    result.critical_days = critical;

    // If it was skipped, check if we should change it to create/update
    if (result.action === "skip") {
      // Check if clinic exists for non-global settings
      if (result.clinic_id !== null) {
        const { data: clinic } = await supabase
          .from("clinics")
          .select("id")
          .eq("id", result.clinic_id)
          .maybeSingle();

        if (!clinic) {
          toast.error("Clinic ID not found in database");
          return;
        }
      }

      // Check if threshold already exists
      const { data: existing } = await supabase
        .from("pending_episode_thresholds")
        .select("id")
        .eq("clinic_id", result.clinic_id ?? null)
        .maybeSingle();

      result.action = existing ? "update" : "create";
      result.existing_id = existing?.id;
      result.reason = undefined;
    }

    setValidationResults(updatedResults);
    setEditingIndex(null);
    setEditValues({ warning_days: "", critical_days: "" });
    toast.success("Values updated");
  };

  if (!isAdmin) {
    return null;
  }

  const createCount = validationResults.filter(r => r.action === "create").length;
  const updateCount = validationResults.filter(r => r.action === "update").length;
  const skipCount = validationResults.filter(r => r.action === "skip").length;

  return (
    <>
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Import Preview</DialogTitle>
            <DialogDescription>
              Review the changes before importing. {createCount} will be created, {updateCount} will be updated, and {skipCount} will be skipped.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-4">
              {createCount > 0 && (
                <div>
                  <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    New Configurations ({createCount})
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Clinic</TableHead>
                          <TableHead className="text-right">Warning Days</TableHead>
                          <TableHead className="text-right">Critical Days</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validationResults
                          .filter(r => r.action === "create")
                          .map((result, idx) => {
                            const actualIndex = validationResults.indexOf(result);
                            const isEditing = editingIndex === actualIndex;
                            
                            return (
                              <TableRow key={idx}>
                                <TableCell>
                                  {result.clinic_id === null ? (
                                    <Badge variant="secondary" className="gap-1">
                                      <Globe className="h-3 w-3" />
                                      {result.clinic_name}
                                    </Badge>
                                  ) : (
                                    result.clinic_name
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {isEditing ? (
                                    <Input
                                      type="number"
                                      min="1"
                                      value={editValues.warning_days}
                                      onChange={(e) => setEditValues(prev => ({ ...prev, warning_days: e.target.value }))}
                                      className="w-20 ml-auto text-right"
                                    />
                                  ) : (
                                    <span className="font-mono">{result.warning_days}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {isEditing ? (
                                    <Input
                                      type="number"
                                      min="1"
                                      value={editValues.critical_days}
                                      onChange={(e) => setEditValues(prev => ({ ...prev, critical_days: e.target.value }))}
                                      className="w-20 ml-auto text-right"
                                    />
                                  ) : (
                                    <span className="font-mono">{result.critical_days}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {isEditing ? (
                                    <div className="flex items-center justify-end gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSaveEdit(actualIndex)}
                                      >
                                        <Save className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCancelEdit}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleStartEdit(actualIndex, result)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {updateCount > 0 && (
                <div>
                  <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Updates ({updateCount})
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Clinic</TableHead>
                          <TableHead className="text-right">Warning Days</TableHead>
                          <TableHead className="text-right">Critical Days</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validationResults
                          .filter(r => r.action === "update")
                          .map((result, idx) => {
                            const actualIndex = validationResults.indexOf(result);
                            const isEditing = editingIndex === actualIndex;
                            
                            return (
                              <TableRow key={idx}>
                                <TableCell>
                                  {result.clinic_id === null ? (
                                    <Badge variant="secondary" className="gap-1">
                                      <Globe className="h-3 w-3" />
                                      {result.clinic_name}
                                    </Badge>
                                  ) : (
                                    result.clinic_name
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {isEditing ? (
                                    <Input
                                      type="number"
                                      min="1"
                                      value={editValues.warning_days}
                                      onChange={(e) => setEditValues(prev => ({ ...prev, warning_days: e.target.value }))}
                                      className="w-20 ml-auto text-right"
                                    />
                                  ) : (
                                    <span className="font-mono">{result.warning_days}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {isEditing ? (
                                    <Input
                                      type="number"
                                      min="1"
                                      value={editValues.critical_days}
                                      onChange={(e) => setEditValues(prev => ({ ...prev, critical_days: e.target.value }))}
                                      className="w-20 ml-auto text-right"
                                    />
                                  ) : (
                                    <span className="font-mono">{result.critical_days}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {isEditing ? (
                                    <div className="flex items-center justify-end gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSaveEdit(actualIndex)}
                                      >
                                        <Save className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCancelEdit}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleStartEdit(actualIndex, result)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {skipCount > 0 && (
                <div>
                  <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    Skipped ({skipCount})
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Clinic</TableHead>
                          <TableHead className="text-right">Warning Days</TableHead>
                          <TableHead className="text-right">Critical Days</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validationResults
                          .filter(r => r.action === "skip")
                          .map((result, idx) => {
                            const actualIndex = validationResults.indexOf(result);
                            const isEditing = editingIndex === actualIndex;
                            
                            return (
                              <TableRow key={idx}>
                                <TableCell className="text-muted-foreground">{result.clinic_name}</TableCell>
                                <TableCell className="text-right">
                                  {isEditing ? (
                                    <Input
                                      type="number"
                                      min="1"
                                      value={editValues.warning_days}
                                      onChange={(e) => setEditValues(prev => ({ ...prev, warning_days: e.target.value }))}
                                      className="w-20 ml-auto text-right"
                                    />
                                  ) : (
                                    <span className="font-mono text-muted-foreground">
                                      {result.warning_days || "-"}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {isEditing ? (
                                    <Input
                                      type="number"
                                      min="1"
                                      value={editValues.critical_days}
                                      onChange={(e) => setEditValues(prev => ({ ...prev, critical_days: e.target.value }))}
                                      className="w-20 ml-auto text-right"
                                    />
                                  ) : (
                                    <span className="font-mono text-muted-foreground">
                                      {result.critical_days || "-"}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-destructive">{result.reason}</TableCell>
                                <TableCell className="text-right">
                                  {isEditing ? (
                                    <div className="flex items-center justify-end gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSaveEdit(actualIndex)}
                                      >
                                        <Save className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCancelEdit}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleStartEdit(actualIndex, result)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelImport} disabled={importing}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmImport} 
              disabled={importing || (createCount === 0 && updateCount === 0)}
            >
              {importing ? "Importing..." : `Confirm Import (${createCount + updateCount} changes)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Threshold Configuration Management</CardTitle>
            <CardDescription>
              View and manage warning and critical day thresholds across all clinics
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Download Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={loading || thresholds.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {importing ? "Importing..." : "Import CSV"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={loadThresholds}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <PendingEpisodeThresholdSettings isAdmin={isAdmin} onSettingsChange={loadThresholds} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {thresholds.length === 0 && !loading ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No threshold configurations found. Create global settings to get started.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scope</TableHead>
                  <TableHead>Clinic</TableHead>
                  <TableHead className="text-right">Warning Days</TableHead>
                  <TableHead className="text-right">Critical Days</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading threshold configurations...
                    </TableCell>
                  </TableRow>
                ) : (
                  thresholds.map((threshold) => (
                    <TableRow key={threshold.id}>
                      <TableCell>
                        {threshold.is_global ? (
                          <Badge variant="secondary" className="gap-1">
                            <Globe className="h-3 w-3" />
                            Global
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <Building2 className="h-3 w-3" />
                            Clinic
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {threshold.is_global ? (
                          <span className="text-muted-foreground">Default for all clinics</span>
                        ) : (
                          <span className="font-medium">{threshold.clinic_name || "Unknown Clinic"}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-2 rounded-full bg-warning" />
                          <span className="font-mono">{threshold.warning_days} days</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-2 rounded-full bg-destructive" />
                          <span className="font-mono">{threshold.critical_days} days</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {!threshold.is_global && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(threshold.id, threshold.is_global)}
                            disabled={deleting === threshold.id}
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove Override
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-4 space-y-2">
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Global settings</strong> apply to all clinics by default. 
              <strong> Clinic-specific overrides</strong> take precedence when configured.
            </p>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>CSV Format:</strong> Use columns: "Clinic ID" (or "GLOBAL"), "Clinic Name", "Warning Days", "Critical Days". 
              Export current config as a template to get started.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
