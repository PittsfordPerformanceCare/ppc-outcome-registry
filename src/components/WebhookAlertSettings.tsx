import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Bell, Plus, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface AlertConfig {
  id: string;
  enabled: boolean;
  alert_recipients: string[];
  failure_rate_threshold: number;
  response_time_threshold: number;
  check_window_hours: number;
  min_calls_required: number;
  cooldown_hours: number;
  last_alert_sent_at: string | null;
  created_at: string;
}

interface AlertHistory {
  id: string;
  alert_type: string;
  webhook_name: string | null;
  alert_details: any;
  triggered_at: string;
}

export function WebhookAlertSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  
  // Form states
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [failureRateThreshold, setFailureRateThreshold] = useState("30");
  const [responseTimeThreshold, setResponseTimeThreshold] = useState("5000");
  const [checkWindowHours, setCheckWindowHours] = useState("1");
  const [minCallsRequired, setMinCallsRequired] = useState("5");
  const [cooldownHours, setCooldownHours] = useState("2");

  const loadConfig = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("webhook_alert_config")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig(data as AlertConfig);
        setRecipients(data.alert_recipients);
        setEnabled(data.enabled);
        setFailureRateThreshold(data.failure_rate_threshold.toString());
        setResponseTimeThreshold(data.response_time_threshold.toString());
        setCheckWindowHours(data.check_window_hours.toString());
        setMinCallsRequired(data.min_calls_required.toString());
        setCooldownHours(data.cooldown_hours.toString());
      }

      // Load alert history
      if (data) {
        const { data: history, error: historyError } = await supabase
          .from("webhook_alert_history")
          .select("*")
          .eq("config_id", data.id)
          .order("triggered_at", { ascending: false })
          .limit(20);

        if (!historyError && history) {
          setAlertHistory(history as AlertHistory[]);
        }
      }
    } catch (error: any) {
      console.error("Error loading alert config:", error);
      toast.error("Failed to load alert configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [user]);

  const handleSaveConfig = async () => {
    if (!user) return;

    if (recipients.length === 0) {
      toast.error("Please add at least one email recipient");
      return;
    }

    try {
      const configData = {
        user_id: user.id,
        alert_recipients: recipients,
        enabled,
        failure_rate_threshold: parseInt(failureRateThreshold),
        response_time_threshold: parseInt(responseTimeThreshold),
        check_window_hours: parseInt(checkWindowHours),
        min_calls_required: parseInt(minCallsRequired),
        cooldown_hours: parseInt(cooldownHours),
      };

      if (config) {
        const { error } = await supabase
          .from("webhook_alert_config")
          .update(configData)
          .eq("id", config.id);

        if (error) throw error;
        toast.success("Alert settings updated");
      } else {
        const { error } = await supabase
          .from("webhook_alert_config")
          .insert(configData);

        if (error) throw error;
        toast.success("Alert settings created");
      }

      loadConfig();
    } catch (error: any) {
      console.error("Error saving config:", error);
      toast.error("Failed to save alert configuration");
    }
  };

  const handleAddRecipient = () => {
    if (!newRecipient.trim()) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipient)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (recipients.includes(newRecipient)) {
      toast.error("This email is already in the list");
      return;
    }

    setRecipients([...recipients, newRecipient]);
    setNewRecipient("");
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      abandoned_webhook: "Abandoned Webhook",
      high_failure_rate: "High Failure Rate",
      slow_response_time: "Slow Response Time",
    };
    return labels[type] || type;
  };

  const getAlertTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      abandoned_webhook: "destructive",
      high_failure_rate: "secondary",
      slow_response_time: "outline",
    };
    return variants[type] || "outline";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alert Settings
              </CardTitle>
              <CardDescription>
                Configure automated alerts for webhook health issues
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadConfig}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enabled" className="text-base">Enable Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications when issues are detected
              </p>
            </div>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {/* Email Recipients */}
          <div className="space-y-3">
            <Label>Alert Recipients</Label>
            <div className="flex gap-2">
              <Input
                placeholder="admin@example.com"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddRecipient()}
              />
              <Button onClick={handleAddRecipient} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recipients.map((email) => (
                <Badge key={email} variant="secondary" className="gap-1">
                  {email}
                  <button
                    onClick={() => handleRemoveRecipient(email)}
                    className="ml-1 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Thresholds */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="failure-rate">Failure Rate Threshold (%)</Label>
              <Input
                id="failure-rate"
                type="number"
                min="0"
                max="100"
                value={failureRateThreshold}
                onChange={(e) => setFailureRateThreshold(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Alert when failure rate exceeds this percentage
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="response-time">Response Time Threshold (ms)</Label>
              <Input
                id="response-time"
                type="number"
                min="0"
                value={responseTimeThreshold}
                onChange={(e) => setResponseTimeThreshold(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Alert when average response time exceeds this value
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="window">Check Window (hours)</Label>
              <Input
                id="window"
                type="number"
                min="1"
                max="24"
                value={checkWindowHours}
                onChange={(e) => setCheckWindowHours(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Time window for analyzing webhook activity
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-calls">Minimum Calls Required</Label>
              <Input
                id="min-calls"
                type="number"
                min="1"
                value={minCallsRequired}
                onChange={(e) => setMinCallsRequired(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Minimum calls needed before triggering alerts
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cooldown">Alert Cooldown (hours)</Label>
              <Input
                id="cooldown"
                type="number"
                min="1"
                max="24"
                value={cooldownHours}
                onChange={(e) => setCooldownHours(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Minimum time between alert emails
              </p>
            </div>
          </div>

          <Button onClick={handleSaveConfig} className="w-full">
            <Bell className="h-4 w-4 mr-2" />
            Save Alert Settings
          </Button>

          {config?.last_alert_sent_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Last alert sent: {format(new Date(config.last_alert_sent_at), "MMM d, yyyy 'at' h:mm a")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>History of triggered webhook alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {alertHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No alerts have been triggered yet
              </div>
            ) : (
              <div className="space-y-3">
                {alertHistory.map((alert) => (
                  <Card key={alert.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={getAlertTypeBadge(alert.alert_type)}>
                          {getAlertTypeLabel(alert.alert_type)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(alert.triggered_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                      
                      {alert.webhook_name && (
                        <div className="font-medium">{alert.webhook_name}</div>
                      )}
                      
                      {alert.alert_details && (
                        <div className="text-sm text-muted-foreground">
                          {alert.alert_type === "high_failure_rate" && (
                            <span>
                              {alert.alert_details.failure_rate}% failure rate 
                              ({alert.alert_details.failed_calls}/{alert.alert_details.total_calls} calls)
                            </span>
                          )}
                          {alert.alert_type === "slow_response_time" && (
                            <span>
                              Avg response: {alert.alert_details.avg_response_time}ms
                              (threshold: {alert.alert_details.threshold}ms)
                            </span>
                          )}
                          {alert.alert_type === "abandoned_webhook" && (
                            <span>
                              Abandoned after {alert.alert_details.retry_count} retries
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
