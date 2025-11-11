import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Trash2, RefreshCw, Globe, Building2 } from "lucide-react";
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
          <div className="flex gap-2">
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

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            <strong>Global settings</strong> apply to all clinics by default. 
            <strong> Clinic-specific overrides</strong> take precedence when configured.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
