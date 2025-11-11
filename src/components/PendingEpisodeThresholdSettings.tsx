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

interface ThresholdSettings {
  id: string;
  warning_days: number;
  critical_days: number;
}

export function PendingEpisodeThresholdSettings() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [thresholds, setThresholds] = useState<ThresholdSettings | null>(null);
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
      const { data, error } = await supabase
        .from("pending_episode_thresholds")
        .select("*")
        .is("clinic_id", null)
        .single();

      if (error) throw error;

      if (data) {
        setThresholds(data);
        setWarningDays(data.warning_days);
        setCriticalDays(data.critical_days);
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

      const { error } = await supabase
        .from("pending_episode_thresholds")
        .update({
          warning_days: warningDays,
          critical_days: criticalDays,
        })
        .eq("id", thresholds?.id);

      if (error) throw error;

      toast.success("Threshold settings updated successfully");
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
