import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Zap, Trash2, Edit, ExternalLink, TestTube } from "lucide-react";
import { format } from "date-fns";
import { WebhookActivityLog } from "./WebhookActivityLog";

interface WebhookConfig {
  id: string;
  name: string;
  webhook_url: string;
  trigger_type: string;
  threshold_value: number | null;
  enabled: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

export function ZapierWebhookConfig() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form states
  const [name, setName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [triggerType, setTriggerType] = useState("report_sent");
  const [thresholdValue, setThresholdValue] = useState("50");

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("zapier_webhook_config")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading webhooks",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setWebhooks((data as any) || []);
    }
    setLoading(false);
  };

  const handleSaveWebhook = async () => {
    if (!user) return;
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a webhook name",
        variant: "destructive",
      });
      return;
    }

    if (!webhookUrl.trim()) {
      toast({
        title: "Webhook URL required",
        description: "Please enter your Zapier webhook URL",
        variant: "destructive",
      });
      return;
    }

    const webhookData = {
      user_id: user.id,
      name: name.trim(),
      webhook_url: webhookUrl.trim(),
      trigger_type: triggerType,
      threshold_value: ['low_open_rate', 'low_click_rate', 'high_engagement', 'low_engagement'].includes(triggerType) 
        ? parseInt(thresholdValue) 
        : null,
    };

    if (editingWebhook) {
      const { error } = await supabase
        .from("zapier_webhook_config")
        .update(webhookData)
        .eq("id", editingWebhook.id);

      if (error) {
        toast({
          title: "Error updating webhook",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Webhook updated",
          description: "Zapier webhook has been updated",
        });
        resetForm();
        loadWebhooks();
      }
    } else {
      const { error } = await supabase
        .from("zapier_webhook_config")
        .insert(webhookData);

      if (error) {
        toast({
          title: "Error creating webhook",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Webhook created",
          description: "Zapier webhook has been created",
        });
        resetForm();
        loadWebhooks();
      }
    }
  };

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    setTesting(webhook.id);

    try {
      const response = await fetch(webhook.webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          test: true,
          trigger_type: webhook.trigger_type,
          timestamp: new Date().toISOString(),
          webhook_name: webhook.name,
          message: "This is a test trigger from PPC Outcome Registry",
        }),
      });

      toast({
        title: "Test webhook sent",
        description: "Check your Zap's history to confirm it was triggered successfully.",
      });
    } catch (error) {
      console.error("Error testing webhook:", error);
      toast({
        title: "Test failed",
        description: "Failed to trigger the webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    const { error } = await supabase
      .from("zapier_webhook_config")
      .update({ enabled })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error updating webhook",
        description: error.message,
        variant: "destructive",
      });
    } else {
      loadWebhooks();
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;

    const { error } = await supabase
      .from("zapier_webhook_config")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error deleting webhook",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Webhook deleted",
        description: "Zapier webhook has been removed",
      });
      loadWebhooks();
    }
  };

  const handleEditWebhook = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook);
    setName(webhook.name);
    setWebhookUrl(webhook.webhook_url);
    setTriggerType(webhook.trigger_type);
    setThresholdValue(webhook.threshold_value?.toString() || "50");
    setDialogOpen(true);
  };

  const resetForm = () => {
    setDialogOpen(false);
    setEditingWebhook(null);
    setName("");
    setWebhookUrl("");
    setTriggerType("report_sent");
    setThresholdValue("50");
  };

  const getTriggerLabel = (type: string) => {
    const labels: Record<string, string> = {
      'report_sent': 'Report Sent',
      'low_open_rate': 'Low Open Rate',
      'low_click_rate': 'Low Click Rate',
      'high_engagement': 'High Engagement',
      'low_engagement': 'Low Engagement',
    };
    return labels[type] || type;
  };

  return (
    <Tabs defaultValue="config" className="w-full space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="config">Configuration</TabsTrigger>
        <TabsTrigger value="activity">Activity Log</TabsTrigger>
      </TabsList>

      <TabsContent value="config" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              Zapier Webhook Integration
            </h3>
            <p className="text-sm text-muted-foreground">
              Trigger custom workflows when engagement events occur
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open('https://zapier.com/app/zaps', '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              Open Zapier
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingWebhook(null)} className="gap-2" size="sm">
                  <Zap className="h-4 w-4" />
                  Add Webhook
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingWebhook ? "Edit Webhook" : "Add Zapier Webhook"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
                  <p className="font-medium">How to set up:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Create a new Zap in Zapier</li>
                    <li>Add "Webhooks by Zapier" as the trigger</li>
                    <li>Choose "Catch Hook" and copy the webhook URL</li>
                    <li>Paste the URL below and configure the trigger</li>
                  </ol>
                </div>

                <div>
                  <Label htmlFor="webhook-name">Webhook Name *</Label>
                  <Input
                    id="webhook-name"
                    placeholder="e.g., Notify Slack on Low Engagement"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="webhook-url">Zapier Webhook URL *</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="trigger-type">Trigger Event</Label>
                  <Select value={triggerType} onValueChange={setTriggerType}>
                    <SelectTrigger id="trigger-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="report_sent">Report Sent</SelectItem>
                      <SelectItem value="low_open_rate">Low Open Rate Detected</SelectItem>
                      <SelectItem value="low_click_rate">Low Click Rate Detected</SelectItem>
                      <SelectItem value="high_engagement">High Engagement Detected</SelectItem>
                      <SelectItem value="low_engagement">Low Engagement Detected</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose when this webhook should be triggered
                  </p>
                </div>

                {['low_open_rate', 'low_click_rate', 'high_engagement', 'low_engagement'].includes(triggerType) && (
                  <div>
                    <Label htmlFor="threshold">Threshold (%)</Label>
                    <Input
                      id="threshold"
                      type="number"
                      min="0"
                      max="100"
                      value={thresholdValue}
                      onChange={(e) => setThresholdValue(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {triggerType === 'low_open_rate' && 'Trigger when average open rate falls below this percentage'}
                      {triggerType === 'low_click_rate' && 'Trigger when average click rate falls below this percentage'}
                      {triggerType === 'high_engagement' && 'Trigger when average open rate exceeds this percentage'}
                      {triggerType === 'low_engagement' && 'Trigger when average open rate falls below this percentage'}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveWebhook}>
                    {editingWebhook ? "Update Webhook" : "Create Webhook"}
                  </Button>
                </div>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading webhooks...</p>
        ) : webhooks.length === 0 ? (
          <Card className="p-6 text-center">
          <Zap className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-2">
            No webhooks configured yet
          </p>
          <p className="text-sm text-muted-foreground">
            Connect Zapier to trigger custom workflows based on engagement events
          </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {webhooks.map((webhook) => (
              <Card key={webhook.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-orange-500" />
                      <h4 className="font-semibold">{webhook.name}</h4>
                      <Badge variant="secondary">
                        {getTriggerLabel(webhook.trigger_type)}
                      </Badge>
                      {webhook.threshold_value && (
                        <Badge variant="outline">
                          {webhook.threshold_value}% threshold
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="font-mono text-xs truncate">
                        {webhook.webhook_url}
                      </p>
                      {webhook.last_triggered_at && (
                        <p className="text-xs">
                          Last triggered: {format(new Date(webhook.last_triggered_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleTestWebhook(webhook)}
                      disabled={testing === webhook.id}
                      title="Test webhook"
                    >
                      <TestTube className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={webhook.enabled}
                      onCheckedChange={(checked) => handleToggleEnabled(webhook.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditWebhook(webhook)}
                      title="Edit webhook"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteWebhook(webhook.id)}
                      title="Delete webhook"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="activity">
        <WebhookActivityLog />
      </TabsContent>
    </Tabs>
  );
}
