import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ThresholdSettings {
  id: string;
  warning_days: number;
  critical_days: number;
}

interface PendingEpisodeThresholdSettingsProps {
  isAdmin: boolean;
  onSettingsChange?: () => void;
}

export function PendingEpisodeThresholdSettings({ isAdmin, onSettingsChange }: PendingEpisodeThresholdSettingsProps) {
  const [settings, setSettings] = useState<ThresholdSettings | null>(null);
  const [warningDays, setWarningDays] = useState(30);
  const [criticalDays, setCriticalDays] = useState(60);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("pending_episode_thresholds")
        .select("*")
        .is("clinic_id", null)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
        setWarningDays(data.warning_days);
        setCriticalDays(data.critical_days);
      }
    } catch (error: any) {
      console.error("Error loading threshold settings:", error);
      toast.error("Failed to load threshold settings");
    } finally {
      setLoading(false);
    }
  };

  const validateInputs = () => {
    if (warningDays <= 0) {
      setValidationError("Warning threshold must be greater than 0");
      return false;
    }
    if (criticalDays <= 0) {
      setValidationError("Critical threshold must be greater than 0");
      return false;
    }
    if (warningDays >= criticalDays) {
      setValidationError("Warning threshold must be less than critical threshold");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    setSaving(true);
    try {
      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from("pending_episode_thresholds")
          .update({
            warning_days: warningDays,
            critical_days: criticalDays,
          })
          .eq("id", settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from("pending_episode_thresholds")
          .insert({
            clinic_id: null,
            warning_days: warningDays,
            critical_days: criticalDays,
          });

        if (error) throw error;
      }

      toast.success("Threshold settings updated successfully");
      setOpen(false);
      onSettingsChange?.();
    } catch (error: any) {
      console.error("Error saving threshold settings:", error);
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleWarningChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num)) {
      setWarningDays(num);
      setValidationError("");
    }
  };

  const handleCriticalChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num)) {
      setCriticalDays(num);
      setValidationError("");
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Configure
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Pending Episode Threshold Settings</DialogTitle>
          <DialogDescription>
            Configure warning and critical day thresholds for pending episodes. These settings apply to all pending episodes in the system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Episodes pending longer than these thresholds will be highlighted with visual indicators.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="warningDays">Warning Threshold (days)</Label>
              <Input
                id="warningDays"
                type="number"
                min="1"
                value={warningDays}
                onChange={(e) => handleWarningChange(e.target.value)}
                className="mt-2"
                disabled={loading || saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Episodes pending for this many days will show a yellow warning indicator
              </p>
            </div>

            <div>
              <Label htmlFor="criticalDays">Critical Threshold (days)</Label>
              <Input
                id="criticalDays"
                type="number"
                min="1"
                value={criticalDays}
                onChange={(e) => handleCriticalChange(e.target.value)}
                className="mt-2"
                disabled={loading || saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Episodes pending for this many days will show a red critical alert
              </p>
            </div>
          </div>

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Preview:</span>
            </div>
            <div className="space-y-2 rounded-md border p-3 bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm">0-{warningDays - 1} days: Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-warning" />
                <span className="text-sm">{warningDays}-{criticalDays - 1} days: Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                <span className="text-sm">{criticalDays}+ days: Critical</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={loading || saving || !!validationError}
              className="flex-1 gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
