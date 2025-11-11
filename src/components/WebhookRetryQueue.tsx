import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { RefreshCw, Clock, CheckCircle2, XCircle, Ban, RotateCcw } from "lucide-react";
import { format } from "date-fns";

interface RetryQueueItem {
  id: string;
  webhook_name: string;
  webhook_url: string;
  trigger_type: string;
  retry_count: number;
  max_retries: number;
  next_retry_at: string;
  last_error: string | null;
  status: 'pending' | 'retrying' | 'succeeded' | 'failed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export function WebhookRetryQueue() {
  const { user } = useAuth();
  const [items, setItems] = useState<RetryQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("active");

  const loadRetryQueue = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('webhook_retry_queue')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter === "active") {
        query = query.in('status', ['pending', 'retrying']);
      } else if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      setItems((data || []) as RetryQueueItem[]);
    } catch (error: any) {
      console.error('Error loading retry queue:', error);
      toast.error('Failed to load retry queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRetryQueue();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadRetryQueue, 30000);
    return () => clearInterval(interval);
  }, [user, statusFilter]);

  const handleRetryNow = async (itemId: string) => {
    try {
      // Update next_retry_at to now to trigger immediate retry
      const { error } = await supabase
        .from('webhook_retry_queue')
        .update({ 
          next_retry_at: new Date().toISOString(),
          status: 'pending' 
        })
        .eq('id', itemId);

      if (error) throw error;

      toast.success('Webhook queued for immediate retry');
      
      // Trigger the retry function
      await supabase.functions.invoke('retry-webhooks');
      
      // Reload after a brief delay
      setTimeout(loadRetryQueue, 2000);
    } catch (error: any) {
      console.error('Error retrying webhook:', error);
      toast.error('Failed to queue webhook for retry');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'abandoned':
        return <Ban className="h-4 w-4 text-red-600" />;
      case 'retrying':
        return <RotateCcw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      succeeded: "default",
      abandoned: "destructive",
      retrying: "secondary",
      pending: "outline",
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Webhook Retry Queue</CardTitle>
            <CardDescription>
              Failed webhooks with automatic retry scheduling
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active (Pending/Retrying)</SelectItem>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="retrying">Retrying</SelectItem>
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={loadRetryQueue}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading retry queue...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items in retry queue
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <div className="font-medium">{item.webhook_name}</div>
                        <Badge variant="secondary" className="text-xs">
                          {getTriggerLabel(item.trigger_type)}
                        </Badge>
                        {getStatusBadge(item.status)}
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="font-mono text-xs truncate">
                          {item.webhook_url}
                        </p>
                        
                        <div className="flex gap-4">
                          <span>
                            Attempt: {item.retry_count + 1}/{item.max_retries}
                          </span>
                          {item.status === 'pending' && (
                            <span>
                              Next retry: {format(new Date(item.next_retry_at), 'MMM d, HH:mm:ss')}
                            </span>
                          )}
                        </div>
                        
                        {item.last_error && (
                          <p className="text-xs text-destructive mt-1">
                            Error: {item.last_error}
                          </p>
                        )}
                        
                        <p className="text-xs">
                          Created: {format(new Date(item.created_at), 'MMM d, yyyy HH:mm:ss')}
                        </p>
                      </div>
                    </div>
                    
                    {item.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetryNow(item.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Retry Now
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
