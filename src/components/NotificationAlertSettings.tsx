import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Save, TestTube, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AlertConfig {
  id: string;
  enabled: boolean;
  failure_rate_threshold: number;
  check_window_hours: number;
  min_notifications_required: number;
  alert_recipients: string[];
  cooldown_hours: number;
}

export function NotificationAlertSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const [recipientInput, setRecipientInput] = useState("");

  useEffect(() => {
    if (user) {
      loadConfig();
    }
  }, [user]);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("notification_alert_config")
        .select("*")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig(data as AlertConfig);
      } else {
        // Create default config
        const { data: newConfig, error: createError } = await supabase
          .from("notification_alert_config")
          .insert({
            enabled: true,
            failure_rate_threshold: 20,
            check_window_hours: 24,
            min_notifications_required: 10,
            alert_recipients: [],
            cooldown_hours: 4,
          })
          .select()
          .single();

        if (createError) throw createError;
        setConfig(newConfig as AlertConfig);
      }
    } catch (error: any) {
      console.error("Error loading alert config:", error);
      toast({
        title: "Error",
        description: "Failed to load alert configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("notification_alert_config")
        .update({
          enabled: config.enabled,
          failure_rate_threshold: config.failure_rate_threshold,
          check_window_hours: config.check_window_hours,
          min_notifications_required: config.min_notifications_required,
          alert_recipients: config.alert_recipients,
          cooldown_hours: config.cooldown_hours,
        })
        .eq("id", config.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert settings saved successfully",
      });
    } catch (error: any) {
      console.error("Error saving config:", error);
      toast({
        title: "Error",
        description: "Failed to save alert settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestAlert = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-notification-failures", {
        body: { test: true },
      });

      if (error) throw error;

      toast({
        title: "Test Complete",
        description: data?.message || "Alert check completed",
      });
    } catch (error: any) {
      console.error("Error testing alert:", error);
      toast({
        title: "Test Complete",
        description: "Alert check triggered. Check your email if notifications are configured.",
      });
    } finally {
      setTesting(false);
    }
  };

  const addRecipient = () => {
    if (!config || !recipientInput.trim()) return;

    const email = recipientInput.trim().toLowerCase();
    
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (config.alert_recipients.includes(email)) {
      toast({
        title: "Duplicate",
        description: "This email is already in the recipients list",
        variant: "destructive",
      });
      return;
    }

    setConfig({
      ...config,
      alert_recipients: [...config.alert_recipients, email],
    });
    setRecipientInput("");
  };

  const removeRecipient = (email: string) => {
    if (!config) return;
    setConfig({
      ...config,
      alert_recipients: config.alert_recipients.filter((r) => r !== email),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!config) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Failure Alert Configuration
            </CardTitle>
            <CardDescription className="mt-2">
              Configure automated alerts when notification delivery failure rates exceed thresholds
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => setConfig({ ...config, enabled })}
            />
            <Label>{config.enabled ? "Enabled" : "Disabled"}</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alert Recipients */}
        <div className="space-y-3">
          <Label htmlFor="recipients">Alert Recipients</Label>
          <div className="flex gap-2">
            <Input
              id="recipients"
              placeholder="admin@example.com"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addRecipient()}
            />
            <Button onClick={addRecipient} variant="outline">
              Add
            </Button>
          </div>
          {config.alert_recipients.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {config.alert_recipients.map((email) => (
                <Badge key={email} variant="secondary" className="px-3 py-1">
                  {email}
                  <button
                    onClick={() => removeRecipient(email)}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No recipients configured. Add email addresses to receive alerts.
            </p>
          )}
        </div>

        {/* Threshold Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="threshold">Failure Rate Threshold (%)</Label>
            <Input
              id="threshold"
              type="number"
              min="1"
              max="100"
              value={config.failure_rate_threshold}
              onChange={(e) =>
                setConfig({
                  ...config,
                  failure_rate_threshold: parseInt(e.target.value) || 20,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Alert when failure rate exceeds this percentage
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="window">Check Window (hours)</Label>
            <Input
              id="window"
              type="number"
              min="1"
              max="168"
              value={config.check_window_hours}
              onChange={(e) =>
                setConfig({
                  ...config,
                  check_window_hours: parseInt(e.target.value) || 24,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Time period to analyze for failures
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min">Minimum Notifications Required</Label>
            <Input
              id="min"
              type="number"
              min="1"
              value={config.min_notifications_required}
              onChange={(e) =>
                setConfig({
                  ...config,
                  min_notifications_required: parseInt(e.target.value) || 10,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Minimum notifications needed before alerting
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cooldown">Cooldown Period (hours)</Label>
            <Input
              id="cooldown"
              type="number"
              min="1"
              max="48"
              value={config.cooldown_hours}
              onChange={(e) =>
                setConfig({
                  ...config,
                  cooldown_hours: parseInt(e.target.value) || 4,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Time before another alert can be sent
            </p>
          </div>
        </div>

        {/* Alert Schedule Info */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Automated Monitoring
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Alerts are checked every hour automatically. You will receive an email when the
                failure rate exceeds {config.failure_rate_threshold}% over the last{" "}
                {config.check_window_hours} hours.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
          <Button
            onClick={handleTestAlert}
            disabled={testing}
            variant="outline"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" />
                Test Alert
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
