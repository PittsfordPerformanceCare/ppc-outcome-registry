import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Settings, Save, Mail, MessageSquare, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RateLimitConfig {
  id: string;
  service_type: 'email' | 'sms' | 'all';
  limit_type: 'per_minute' | 'per_hour' | 'per_day';
  max_requests: number;
  enabled: boolean;
}

export function RateLimitConfigPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState<RateLimitConfig[]>([]);
  const [editedConfigs, setEditedConfigs] = useState<Map<string, Partial<RateLimitConfig>>>(new Map());

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rate_limit_config')
        .select('*')
        .order('service_type', { ascending: true })
        .order('limit_type', { ascending: true });

      if (error) throw error;
      setConfigs((data || []) as RateLimitConfig[]);
    } catch (error: any) {
      console.error("Error loading rate limit configs:", error);
      toast.error(`Failed to load configurations: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (id: string, field: keyof RateLimitConfig, value: any) => {
    const current = editedConfigs.get(id) || {};
    const updated = { ...current, [field]: value };
    const newMap = new Map(editedConfigs);
    newMap.set(id, updated);
    setEditedConfigs(newMap);
  };

  const getConfigValue = (config: RateLimitConfig, field: keyof RateLimitConfig) => {
    const edited = editedConfigs.get(config.id);
    return edited && field in edited ? edited[field] : config[field];
  };

  const hasChanges = () => editedConfigs.size > 0;

  const handleSave = async () => {
    if (!hasChanges()) {
      toast.info("No changes to save");
      return;
    }

    setSaving(true);
    try {
      const updates = Array.from(editedConfigs.entries()).map(([id, changes]) => {
        const original = configs.find(c => c.id === id);
        return { id, ...original, ...changes };
      });

      // Validate max_requests
      const invalid = updates.find(u => u.max_requests <= 0);
      if (invalid) {
        toast.error("Max requests must be greater than 0");
        setSaving(false);
        return;
      }

      // Update each config
      for (const update of updates) {
        const { error } = await supabase
          .from('rate_limit_config')
          .update({
            max_requests: update.max_requests,
            enabled: update.enabled,
          })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast.success("Rate limit configuration updated successfully");
      setEditedConfigs(new Map());
      loadConfigs();
    } catch (error: any) {
      console.error("Error saving rate limit configs:", error);
      toast.error(`Failed to save configurations: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setEditedConfigs(new Map());
    toast.info("Changes discarded");
  };

  const getLimitTypeLabel = (type: string) => {
    switch (type) {
      case 'per_minute': return 'Per Minute';
      case 'per_hour': return 'Per Hour';
      case 'per_day': return 'Per Day';
      default: return type;
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'email': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'sms': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default: return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const getServiceBadge = (service: string) => {
    switch (service) {
      case 'email':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Email</Badge>;
      case 'sms':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">SMS</Badge>;
      case 'all':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">All Services</Badge>;
      default:
        return <Badge variant="outline">{service}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="border-blue-200">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-500" />
              Rate Limit Configuration
            </CardTitle>
            <CardDescription>
              Configure notification sending limits to stay within API quotas
            </CardDescription>
          </div>
          {hasChanges() && (
            <div className="flex gap-2">
              <Button onClick={handleReset} variant="outline" size="sm">
                Reset
              </Button>
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Rate limits prevent overwhelming email/SMS services. Notifications exceeding limits will be rejected with a 429 error.
          </AlertDescription>
        </Alert>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Max Requests</TableHead>
                <TableHead>Enabled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getServiceIcon(config.service_type)}
                      {getServiceBadge(config.service_type)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {getLimitTypeLabel(config.limit_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={getConfigValue(config, 'max_requests') as number}
                      onChange={(e) => handleFieldChange(config.id, 'max_requests', parseInt(e.target.value) || 1)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={getConfigValue(config, 'enabled') as boolean}
                      onCheckedChange={(checked) => handleFieldChange(config.id, 'enabled', checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">Default Limits (Recommended for most clinics)</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Email:</strong> 10/min, 100/hour, 1000/day</li>
            <li>• <strong>SMS:</strong> 5/min, 50/hour, 500/day</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            Adjust these limits based on your provider's API quotas and your clinic's sending patterns.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
