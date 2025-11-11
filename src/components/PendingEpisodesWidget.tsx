import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, AlertCircle, User, FileText } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface PendingEpisode {
  id: string;
  intake_form_id: string;
  complaint_priority: number;
  complaint_text: string;
  complaint_category: string;
  patient_name: string;
  status: string;
  previous_episode_id: string;
  created_at: string;
  scheduled_date: string | null;
  deferred_reason: string | null;
}

export function PendingEpisodesWidget() {
  const [pendingEpisodes, setPendingEpisodes] = useState<PendingEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPendingEpisodes();

    // Set up realtime subscription
    const channel = supabase
      .channel('pending-episodes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pending_episodes'
        },
        () => {
          loadPendingEpisodes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPendingEpisodes = async () => {
    try {
      const { data, error } = await supabase
        .from("pending_episodes")
        .select("*")
        .in("status", ["pending", "deferred"])
        .order("complaint_priority", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingEpisodes(data || []);
    } catch (error) {
      console.error("Error loading pending episodes:", error);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = pendingEpisodes.filter(ep => ep.status === "pending").length;
  const deferredCount = pendingEpisodes.filter(ep => ep.status === "deferred").length;

  const groupedByPatient = pendingEpisodes.reduce((acc, episode) => {
    if (!acc[episode.patient_name]) {
      acc[episode.patient_name] = [];
    }
    acc[episode.patient_name].push(episode);
    return acc;
  }, {} as Record<string, PendingEpisode[]>);

  const handleViewDischarge = (episodeId: string) => {
    navigate(`/discharge?episode=${episodeId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pending Episodes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingEpisodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pending Episodes
          </CardTitle>
          <CardDescription>
            Additional complaints waiting to be scheduled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              No pending episodes at this time
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pending Episodes
            </CardTitle>
            <CardDescription>
              {pendingCount} pending, {deferredCount} deferred complaints across {Object.keys(groupedByPatient).length} patient{Object.keys(groupedByPatient).length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">{pendingCount} Pending</Badge>
            {deferredCount > 0 && <Badge variant="outline">{deferredCount} Deferred</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(groupedByPatient).map(([patientName, episodes]) => (
            <div key={patientName} className="space-y-2 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{patientName}</span>
                  <Badge variant="outline" className="text-xs">
                    {episodes.length} complaint{episodes.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                {episodes[0]?.previous_episode_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDischarge(episodes[0].previous_episode_id)}
                    className="gap-2"
                  >
                    <Calendar className="h-3 w-3" />
                    Schedule
                  </Button>
                )}
              </div>

              <div className="space-y-2 pl-6">
                {episodes.map((episode) => (
                  <div key={episode.id} className="flex items-start justify-between text-sm">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={episode.status === "pending" ? "secondary" : "outline"} className="text-xs">
                          Priority #{episode.complaint_priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {episode.complaint_category || "General"}
                        </Badge>
                        {episode.status === "deferred" && (
                          <Badge variant="outline" className="text-xs text-warning">
                            Deferred
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{episode.complaint_text}</p>
                      {episode.deferred_reason && (
                        <p className="text-xs text-muted-foreground italic">
                          Reason: {episode.deferred_reason}
                        </p>
                      )}
                      {episode.scheduled_date && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Scheduled: {format(new Date(episode.scheduled_date), "MMM dd, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
