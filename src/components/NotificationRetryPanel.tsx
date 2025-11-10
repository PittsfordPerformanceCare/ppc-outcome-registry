import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

interface FailedNotification {
  id: string;
  patient_name: string;
  notification_type: string;
  error_message: string | null;
  sent_at: string;
  retry_count: number;
  max_retries: number;
  last_retry_at: string | null;
  next_retry_at: string | null;
}

export function NotificationRetryPanel() {
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [failedNotifications, setFailedNotifications] = useState<FailedNotification[]>([]);

  const loadFailedNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications_history')
        .select('id, patient_name, notification_type, error_message, sent_at, retry_count, max_retries, last_retry_at, next_retry_at')
        .eq('status', 'failed')
        .lt('retry_count', supabase.rpc('max_retries'))
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setFailedNotifications(data || []);
    } catch (error: any) {
      console.error("Error loading failed notifications:", error);
      toast.error(`Failed to load notifications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (notificationId: string) => {
    setRetrying(notificationId);
    try {
      const { data, error } = await supabase.functions.invoke('retry-notifications', {
        body: { notificationId }
      });

      if (error) throw error;

      if (data.succeeded > 0) {
        toast.success("Notification retried successfully!");
        loadFailedNotifications(); // Refresh the list
      } else {
        toast.error("Retry failed. The notification will be retried automatically.");
      }
    } catch (error: any) {
      console.error("Error retrying notification:", error);
      toast.error(`Failed to retry: ${error.message}`);
    } finally {
      setRetrying(null);
    }
  };

  const handleBulkRetry = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('retry-notifications', {
        body: {}
      });

      if (error) throw error;

      toast.success(`Processed ${data.processed} notifications: ${data.succeeded} succeeded, ${data.failed} failed, ${data.skipped} skipped`);
      loadFailedNotifications(); // Refresh the list
    } catch (error: any) {
      console.error("Error bulk retrying:", error);
      toast.error(`Bulk retry failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-orange-500" />
          Notification Retry Management
        </CardTitle>
        <CardDescription>
          View and manually retry failed notifications with exponential backoff
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Automatic Retry Schedule</p>
            <p className="text-xs text-muted-foreground">
              Failed notifications retry at 5min, 15min, 45min intervals
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={loadFailedNotifications} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button 
              onClick={handleBulkRetry} 
              disabled={loading || failedNotifications.length === 0}
              size="sm"
            >
              Retry All Due
            </Button>
          </div>
        </div>

        {failedNotifications.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead>Next Retry</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failedNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">
                      {notification.patient_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {notification.notification_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {notification.retry_count}/{notification.max_retries}
                        </span>
                        {notification.retry_count >= notification.max_retries ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {notification.next_retry_at ? (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.next_retry_at), { 
                            addSuffix: true 
                          })}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Due now</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
                        {notification.error_message || 'Unknown error'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRetry(notification.id)}
                        disabled={
                          retrying === notification.id || 
                          notification.retry_count >= notification.max_retries
                        }
                      >
                        {retrying === notification.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No failed notifications to retry</p>
            <p className="text-xs">Click refresh to check for failed deliveries</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
