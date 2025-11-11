import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, AlertCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface ThresholdSettings {
  id: string;
  clinic_id: string | null;
  warning_days: number;
  critical_days: number;
}

export function PendingEpisodeThresholdSettings() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [globalThresholds, setGlobalThresholds] = useState<ThresholdSettings | null>(null);
  const [clinicThresholds, setClinicThresholds] = useState<ThresholdSettings | null>(null);
  const [useClinicSpecific, setUseClinicSpecific] = useState(false);
  const [warningDays, setWarningDays] = useState(30);
  const [criticalDays, setCriticalDays] = useState(60);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (open && isAdmin) {
      loadThresholds();
    }
  }, [open, isAdmin]);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      if (profile) {
        setClinicId(profile.clinic_id);
      }

      const { data } = await supabase
        .from("user_roles")
        .select()
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!data);
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const loadThresholds = async () => {
    try {
      setLoading(true);
      
      // Load global thresholds
      const { data: globalData } = await supabase
        .from("pending_episode_thresholds")
        .select("*")
        .is("clinic_id", null)
        .single();

      if (globalData) {
        setGlobalThresholds(globalData);
      }

      // Load clinic-specific thresholds if user has a clinic
      if (clinicId) {
        const { data: clinicData } = await supabase
          .from("pending_episode_thresholds")
          .select("*")
          .eq("clinic_id", clinicId)
          .maybeSingle();

        if (clinicData) {
          setClinicThresholds(clinicData);
          setUseClinicSpecific(true);
          setWarningDays(clinicData.warning_days);
          setCriticalDays(clinicData.critical_days);
        } else if (globalData) {
          setWarningDays(globalData.warning_days);
          setCriticalDays(globalData.critical_days);
        }
      } else if (globalData) {
        setWarningDays(globalData.warning_days);
        setCriticalDays(globalData.critical_days);
      }
    } catch (error: any) {
      console.error("Error loading thresholds:", error);
      toast.error("Failed to load threshold settings");
    } finally {
      setLoading(false);
    }
  };

  const validateInputs = () => {
    setError("");

    if (warningDays < 1) {
      setError("Warning threshold must be at least 1 day");
      return false;
    }

    if (criticalDays < 1) {
      setError("Critical threshold must be at least 1 day");
      return false;
    }

    if (warningDays >= criticalDays) {
      setError("Warning threshold must be less than critical threshold");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);

      const targetClinicId = useClinicSpecific ? clinicId : null;

      if (useClinicSpecific && clinicThresholds) {
        // Update existing clinic-specific thresholds
        const { error } = await supabase
          .from("pending_episode_thresholds")
          .update({
            warning_days: warningDays,
            critical_days: criticalDays,
          })
          .eq("id", clinicThresholds.id);

        if (error) throw error;
      } else if (useClinicSpecific && !clinicThresholds && clinicId) {
        // Create new clinic-specific thresholds
        const { error } = await supabase
          .from("pending_episode_thresholds")
          .insert({
            clinic_id: clinicId,
            warning_days: warningDays,
            critical_days: criticalDays,
          });

        if (error) throw error;
      } else if (!useClinicSpecific && clinicThresholds) {
        // Delete clinic-specific thresholds to revert to global
        const { error } = await supabase
          .from("pending_episode_thresholds")
          .delete()
          .eq("id", clinicThresholds.id);

        if (error) throw error;
      } else if (!useClinicSpecific && globalThresholds) {
        // Update global thresholds
        const { error } = await supabase
          .from("pending_episode_thresholds")
          .update({
            warning_days: warningDays,
            critical_days: criticalDays,
          })
          .eq("id", globalThresholds.id);

        if (error) throw error;
      }

      toast.success("Threshold settings updated successfully");
      await loadThresholds();
      setOpen(false);
    } catch (error: any) {
      console.error("Error saving thresholds:", error);
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Configure Thresholds
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pending Episode Threshold Settings</DialogTitle>
          <DialogDescription>
            Configure the day thresholds for warning and critical alerts on pending episodes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Episodes pending longer than these thresholds will be highlighted with visual indicators.
            </AlertDescription>
          </Alert>

          {clinicId && (
            <div className="flex items-center justify-between space-x-2 rounded-lg border border-border p-3 bg-muted/50">
              <div className="space-y-0.5">
                <Label htmlFor="clinic-override" className="text-sm font-medium">
                  Clinic-Specific Override
                </Label>
                <p className="text-xs text-muted-foreground">
                  Use custom thresholds for your clinic instead of global defaults
                </p>
              </div>
              <Switch
                id="clinic-override"
                checked={useClinicSpecific}
                onCheckedChange={(checked) => {
                  setUseClinicSpecific(checked);
                  if (checked && clinicThresholds) {
                    setWarningDays(clinicThresholds.warning_days);
                    setCriticalDays(clinicThresholds.critical_days);
                  } else if (!checked && globalThresholds) {
                    setWarningDays(globalThresholds.warning_days);
                    setCriticalDays(globalThresholds.critical_days);
                  }
                }}
              />
            </div>
          )}

          {useClinicSpecific && clinicId && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                These settings will only apply to your clinic. Other clinics will use the global defaults.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="warningDays">Warning Threshold (days)</Label>
            <Input
              id="warningDays"
              type="number"
              min="1"
              value={warningDays}
              onChange={(e) => setWarningDays(parseInt(e.target.value) || 0)}
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">
              Episodes pending longer than this will show a yellow warning indicator
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="criticalDays">Critical Threshold (days)</Label>
            <Input
              id="criticalDays"
              type="number"
              min="1"
              value={criticalDays}
              onChange={(e) => setCriticalDays(parseInt(e.target.value) || 0)}
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">
              Episodes pending longer than this will show a red critical alert
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
