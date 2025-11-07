import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PPC_STORE, EpisodeMeta } from "@/lib/ppcStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ClipboardPlus, TrendingUp, Users } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const [episodes, setEpisodes] = useState<EpisodeMeta[]>([]);

  useEffect(() => {
    const episodeIds = PPC_STORE.getAllEpisodes();
    const episodeData = episodeIds
      .map((id) => PPC_STORE.getEpisodeMeta(id))
      .filter((ep): ep is EpisodeMeta => ep !== null)
      .sort((a, b) => new Date(b.dateOfService).getTime() - new Date(a.dateOfService).getTime());
    setEpisodes(episodeData);
  }, []);

  const pendingFollowups = episodes.filter((ep) => {
    const followup = PPC_STORE.getFollowupMeta(ep.episodeId);
    return followup && !PPC_STORE.isFollowupCompleted(ep.episodeId);
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8">
        <h1 className="mb-2 text-3xl font-bold text-primary">Welcome to PPC Outcome Registry</h1>
        <p className="text-lg text-muted-foreground">
          Track patient progress and clinical outcomes with evidence-based MCID calculations
        </p>
        <div className="mt-6">
          <Link to="/new-episode">
            <Button size="lg" className="gap-2">
              <ClipboardPlus className="h-5 w-5" />
              Create New Episode
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Episodes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{episodes.length}</div>
            <p className="text-xs text-muted-foreground">All patient episodes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Follow-ups</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingFollowups.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {episodes.length > 0
                ? Math.round(((episodes.length - pendingFollowups.length) / episodes.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Follow-ups completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Episodes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Episodes</CardTitle>
          <CardDescription>Your most recent patient outcome episodes</CardDescription>
        </CardHeader>
        <CardContent>
          {episodes.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No episodes yet. Create your first episode to get started.</p>
              <Link to="/new-episode">
                <Button className="mt-4" variant="outline">
                  <ClipboardPlus className="mr-2 h-4 w-4" />
                  Create Episode
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {episodes.slice(0, 10).map((episode) => {
                const followup = PPC_STORE.getFollowupMeta(episode.episodeId);
                const isCompleted = PPC_STORE.isFollowupCompleted(episode.episodeId);

                return (
                  <div
                    key={episode.episodeId}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{episode.patientName}</p>
                        <Badge variant="outline" className="text-xs">
                          {episode.region}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Episode ID: {episode.episodeId} | Service Date:{" "}
                        {format(new Date(episode.dateOfService), "MMM dd, yyyy")}
                      </p>
                      <div className="flex gap-2">
                        {episode.indices.map((index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {index}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {followup && (
                        <Badge className={isCompleted ? "badge-complete" : "badge-warning"}>
                          {isCompleted ? "Completed" : "Pending Follow-up"}
                        </Badge>
                      )}
                      {!followup && (
                        <Link to={`/follow-up?episode=${episode.episodeId}`}>
                          <Button size="sm" variant="outline">
                            Schedule Follow-up
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
