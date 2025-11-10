import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, Mail, Eye, MousePointerClick } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DeliveryHistory {
  id: string;
  schedule_id: string;
  sent_at: string;
  recipient_emails: string[];
  export_names: string[];
  status: 'success' | 'failed';
  error_message?: string;
  opened_at?: string;
  open_count: number;
  first_clicked_at?: string;
  click_count: number;
}

interface ComparisonReportDeliveryHistoryProps {
  scheduleId?: string;
}

export function ComparisonReportDeliveryHistory({ scheduleId }: ComparisonReportDeliveryHistoryProps) {
  const [deliveries, setDeliveries] = useState<DeliveryHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveryHistory();
  }, [scheduleId]);

  const loadDeliveryHistory = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('comparison_report_deliveries')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (scheduleId) {
        query = query.eq('schedule_id', scheduleId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDeliveries(data as any || []);
    } catch (error) {
      console.error('Error loading delivery history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No delivery history yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Scheduled reports will appear here once sent
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {deliveries.map((delivery) => (
        <Card key={delivery.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-1">
                {delivery.status === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={delivery.status === 'success' ? 'default' : 'destructive'}>
                    {delivery.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(delivery.sent_at), 'PPp')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Sent to: {delivery.recipient_emails.join(', ')}
                  </span>
                </div>

                {delivery.export_names && delivery.export_names.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Exports:</span> {delivery.export_names.join(', ')}
                  </div>
                )}

                {delivery.status === 'success' && (
                  <div className="flex items-center gap-4 text-sm mt-2">
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {delivery.open_count > 0 ? (
                          <>
                            Opened {delivery.open_count}x
                            {delivery.opened_at && (
                              <span className="text-xs ml-1">
                                (first: {format(new Date(delivery.opened_at), 'MMM d, h:mm a')})
                              </span>
                            )}
                          </>
                        ) : (
                          'Not opened yet'
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {delivery.click_count > 0 ? (
                          <>
                            {delivery.click_count} click{delivery.click_count > 1 ? 's' : ''}
                            {delivery.first_clicked_at && (
                              <span className="text-xs ml-1">
                                (first: {format(new Date(delivery.first_clicked_at), 'MMM d, h:mm a')})
                              </span>
                            )}
                          </>
                        ) : (
                          'No clicks'
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {delivery.error_message && (
                  <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    <span className="font-medium">Error:</span> {delivery.error_message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
