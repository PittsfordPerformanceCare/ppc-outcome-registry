import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Trash2, RefreshCw, Globe, Building2, Download, Upload, FileText } from "lucide-react";
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

interface PendingEpisodeThresholdManagementProps {
  isAdmin: boolean;
}

export function PendingEpisodeThresholdManagement({ isAdmin }: PendingEpisodeThresholdManagementProps) {
  const [thresholds, setThresholds] = useState<ThresholdConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
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
      const updates: Array<{ clinic_id: string | null; warning_days: number; critical_days: number }> = [];
      let skipped = 0;

      for (const line of dataRows) {
        const [clinicId, , warningDays, criticalDays] = line.split(",").map(s => s.trim());
        
        // Validate data
        const warning = parseInt(warningDays);
        const critical = parseInt(criticalDays);

        if (isNaN(warning) || isNaN(critical) || warning <= 0 || critical <= 0 || warning >= critical) {
          skipped++;
          continue;
        }

        // Validate clinic ID
        const targetClinicId = clinicId === "GLOBAL" ? null : clinicId;
        if (targetClinicId && !clinicMap.has(targetClinicId)) {
          skipped++;
          continue;
        }

        updates.push({
          clinic_id: targetClinicId,
          warning_days: warning,
          critical_days: critical,
        });
      }

      if (updates.length === 0) {
        throw new Error("No valid rows found in CSV file");
      }

      // Process updates
      let imported = 0;
      for (const config of updates) {
        // Check if threshold exists
        const { data: existing } = await supabase
          .from("pending_episode_thresholds")
          .select("id")
          .eq("clinic_id", config.clinic_id ?? null)
          .maybeSingle();

        if (existing) {
          // Update existing
          const { error } = await supabase
            .from("pending_episode_thresholds")
            .update({
              warning_days: config.warning_days,
              critical_days: config.critical_days,
            })
            .eq("id", existing.id);

          if (!error) imported++;
        } else {
          // Insert new
          const { error } = await supabase
            .from("pending_episode_thresholds")
            .insert(config);

          if (!error) imported++;
        }
      }

      toast.success(`Imported ${imported} configurations${skipped > 0 ? `, skipped ${skipped} invalid rows` : ""}`);
      loadThresholds();
    } catch (error: any) {
      console.error("Error importing CSV:", error);
      toast.error(`Failed to import: ${error.message}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
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
  );
}
