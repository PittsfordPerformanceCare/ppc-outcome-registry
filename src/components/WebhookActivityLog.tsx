import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, RefreshCw, Search, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface WebhookLog {
  id: string;
  webhook_config_id: string | null;
  webhook_name: string;
  trigger_type: string;
  webhook_url: string;
  status: 'success' | 'failed' | 'timeout';
  request_payload: any;
  response_status: number | null;
  response_body: string | null;
  error_message: string | null;
  duration_ms: number | null;
  triggered_at: string;
}

export function WebhookActivityLog() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadLogs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('webhook_activity_log')
        .select('*')
        .order('triggered_at', { ascending: false })
        .limit(100);

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setLogs((data || []) as WebhookLog[]);
    } catch (error: any) {
      console.error('Error loading webhook logs:', error);
      toast.error('Failed to load webhook activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [user, statusFilter]);

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'timeout':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      success: "default",
      failed: "destructive",
      timeout: "secondary",
    };
    return (
      <Badge variant={variants[status] || "outline"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getTriggerLabel = (type: string) => {
    const labels: Record<string, string> = {
      report_sent: "Report Sent",
      low_open_rate: "Low Open Rate",
      low_click_rate: "Low Click Rate",
      high_engagement: "High Engagement",
      low_engagement: "Low Engagement",
    };
    return labels[type] || type;
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.webhook_name.toLowerCase().includes(search) ||
      log.trigger_type.toLowerCase().includes(search) ||
      log.webhook_url.toLowerCase().includes(search)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Webhook Activity Log</CardTitle>
            <CardDescription>
              Track all webhook calls, responses, and failures
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search webhooks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="timeout">Timeout</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logs List */}
          <ScrollArea className="h-[600px] pr-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading webhook logs...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No webhook activity found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <Collapsible
                    key={log.id}
                    open={expandedLogs.has(log.id)}
                    onOpenChange={() => toggleExpanded(log.id)}
                  >
                    <Card>
                      <CollapsibleTrigger className="w-full">
                        <div className="p-4 hover:bg-accent/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(log.status)}
                              <div className="text-left">
                                <div className="font-medium">{log.webhook_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {getTriggerLabel(log.trigger_type)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {getStatusBadge(log.status)}
                              {log.duration_ms && (
                                <span className="text-sm text-muted-foreground">
                                  {log.duration_ms}ms
                                </span>
                              )}
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(log.triggered_at), 'MMM d, yyyy HH:mm:ss')}
                              </span>
                              {expandedLogs.has(log.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-3 border-t">
                          <div className="pt-4 space-y-2">
                            <div>
                              <span className="text-sm font-medium">Webhook URL:</span>
                              <code className="block mt-1 p-2 bg-muted rounded text-xs break-all">
                                {log.webhook_url}
                              </code>
                            </div>

                            {log.response_status && (
                              <div>
                                <span className="text-sm font-medium">Response Status:</span>
                                <span className="ml-2 text-sm">{log.response_status}</span>
                              </div>
                            )}

                            {log.error_message && (
                              <div>
                                <span className="text-sm font-medium text-destructive">Error:</span>
                                <code className="block mt-1 p-2 bg-destructive/10 rounded text-xs">
                                  {log.error_message}
                                </code>
                              </div>
                            )}

                            <div>
                              <span className="text-sm font-medium">Request Payload:</span>
                              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-[200px]">
                                {JSON.stringify(log.request_payload, null, 2)}
                              </pre>
                            </div>

                            {log.response_body && (
                              <div>
                                <span className="text-sm font-medium">Response Body:</span>
                                <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-[200px]">
                                  {log.response_body}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
