import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, RefreshCw, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface MissingEpisodeAlert {
  id: string;
  appointment_id: string;
  patient_name: string;
  scheduled_date: string;
  scheduled_time: string;
  clinician_name: string | null;
  status: string;
  created_at: string;
}

const MissingEpisodeAlerts = () => {
  const [alerts, setAlerts] = useState<MissingEpisodeAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("missing_episode_alerts")
        .select("*")
        .eq("status", "pending")
        .order("scheduled_date", { ascending: true });

      if (error) throw error;
      setAlerts(data || []);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const resolveAlert = async (alertId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("missing_episode_alerts")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
        })
        .eq("id", alertId);

      if (error) throw error;

      toast({
        title: "Alert Resolved",
        description: "The missing episode alert has been marked as resolved.",
      });

      fetchAlerts();
    } catch (err) {
      console.error("Error resolving alert:", err);
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Visit Readiness – Missing Episodes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-muted rounded" />
            <div className="h-8 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Visit Readiness
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchAlerts}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All upcoming appointments have active episodes. ✓
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Visit Readiness – Missing Episodes
            <Badge variant="destructive" className="ml-2">
              {alerts.length}
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchAlerts}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          These patients have appointments within 24 hours but no active Episode.
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Appointment</TableHead>
                <TableHead>Clinician</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.patient_name}</TableCell>
                  <TableCell>
                    <div>
                      {format(new Date(alert.scheduled_date), "MMM d, yyyy")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {alert.scheduled_time}
                    </div>
                  </TableCell>
                  <TableCell>{alert.clinician_name || "Unassigned"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      No Episode
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/new-episode?patient=${encodeURIComponent(alert.patient_name)}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Create Episode
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolve
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MissingEpisodeAlerts;
