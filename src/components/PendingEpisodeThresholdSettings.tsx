import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Save, AlertCircle, Building2, Globe } from "lucide-react";
import { toast } from "sonner";

interface ThresholdSettings {
  id: string;
  clinic_id: string | null;
  warning_days: number;
  critical_days: number;
}

interface Clinic {
  id: string;
  name: string;
}

interface PendingEpisodeThresholdSettingsProps {
  isAdmin: boolean;
  onSettingsChange?: () => void;
}

export function PendingEpisodeThresholdSettings({ isAdmin, onSettingsChange }: PendingEpisodeThresholdSettingsProps) {
  const [globalSettings, setGlobalSettings] = useState<ThresholdSettings | null>(null);
  const [clinicSettings, setClinicSettings] = useState<ThresholdSettings | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [settingsType, setSettingsType] = useState<"global" | "clinic">("global");
  const [selectedClinicId, setSelectedClinicId] = useState<string>("");
  const [warningDays, setWarningDays] = useState(30);
  const [criticalDays, setCriticalDays] = useState(60);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (open) {
      loadClinics();
      loadSettings();
    }
  }, [open]);

  useEffect(() => {
    if (settingsType === "clinic" && selectedClinicId) {
      loadClinicSettings(selectedClinicId);
    } else if (settingsType === "global") {
      loadGlobalSettings();
    }
  }, [settingsType, selectedClinicId]);

  const loadClinics = async () => {
    try {
      const { data, error } = await supabase
        .from("clinics")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setClinics(data || []);
    } catch (error: any) {
      console.error("Error loading clinics:", error);
    }
  };

  const loadSettings = async () => {
    await loadGlobalSettings();
    setLoading(false);
  };

  const loadGlobalSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("pending_episode_thresholds")
        .select("*")
        .is("clinic_id", null)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setGlobalSettings(data);
        if (settingsType === "global") {
          setWarningDays(data.warning_days);
          setCriticalDays(data.critical_days);
        }
      }
    } catch (error: any) {
      console.error("Error loading global settings:", error);
    }
  };

  const loadClinicSettings = async (clinicId: string) => {
    try {
      const { data, error } = await supabase
        .from("pending_episode_thresholds")
        .select("*")
        .eq("clinic_id", clinicId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setClinicSettings(data);
        setWarningDays(data.warning_days);
        setCriticalDays(data.critical_days);
      } else {
        // No clinic-specific settings, use global defaults
        setClinicSettings(null);
        if (globalSettings) {
          setWarningDays(globalSettings.warning_days);
          setCriticalDays(globalSettings.critical_days);
        }
      }
    } catch (error: any) {
      console.error("Error loading clinic settings:", error);
      toast.error("Failed to load clinic threshold settings");
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

    if (settingsType === "clinic" && !selectedClinicId) {
      toast.error("Please select a clinic");
      return;
    }

    setSaving(true);
    try {
      const targetClinicId = settingsType === "clinic" ? selectedClinicId : null;
      const existingSettings = settingsType === "clinic" ? clinicSettings : globalSettings;

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from("pending_episode_thresholds")
          .update({
            warning_days: warningDays,
            critical_days: criticalDays,
          })
          .eq("id", existingSettings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from("pending_episode_thresholds")
          .insert({
            clinic_id: targetClinicId,
            warning_days: warningDays,
            critical_days: criticalDays,
          });

        if (error) throw error;
      }

      toast.success(
        settingsType === "clinic"
          ? "Clinic threshold settings updated successfully"
          : "Global threshold settings updated successfully"
      );
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Pending Episode Threshold Settings</DialogTitle>
          <DialogDescription>
            Configure warning and critical day thresholds. Set global defaults or customize per clinic.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Episodes pending longer than these thresholds will be highlighted with visual indicators.
            </AlertDescription>
          </Alert>

          {/* Settings Type Selection */}
          <div className="space-y-3">
            <Label>Configuration Scope</Label>
            <RadioGroup value={settingsType} onValueChange={(value: "global" | "clinic") => setSettingsType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="global" id="global" />
                <Label htmlFor="global" className="flex items-center gap-2 cursor-pointer font-normal">
                  <Globe className="h-4 w-4" />
                  Global Settings (Default for all clinics)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="clinic" id="clinic" />
                <Label htmlFor="clinic" className="flex items-center gap-2 cursor-pointer font-normal">
                  <Building2 className="h-4 w-4" />
                  Clinic-Specific Settings
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Clinic Selection */}
          {settingsType === "clinic" && (
            <div>
              <Label htmlFor="clinicSelect">Select Clinic</Label>
              <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
                <SelectTrigger id="clinicSelect" className="mt-2">
                  <SelectValue placeholder="Choose a clinic..." />
                </SelectTrigger>
                <SelectContent>
                  {clinics.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No clinics found
                    </div>
                  ) : (
                    clinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedClinicId && !clinicSettings && globalSettings && (
                <p className="text-xs text-muted-foreground mt-2">
                  No clinic-specific settings found. Using global defaults: {globalSettings.warning_days}/{globalSettings.critical_days} days
                </p>
              )}
            </div>
          )}

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
              disabled={loading || saving || !!validationError || (settingsType === "clinic" && !selectedClinicId)}
              className="flex-1 gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : `Save ${settingsType === "clinic" ? "Clinic" : "Global"} Settings`}
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
