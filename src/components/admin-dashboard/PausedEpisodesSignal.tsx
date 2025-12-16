import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PauseCircle, Clock, User, Stethoscope } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface PausedEpisode {
  id: string;
  episode_id: string;
  patient_name: string;
  clinician_name: string | null;
  situation_type: string;
  summary: string;
  created_at: string;
}

const PAUSE_AWAITING_LABELS: Record<string, string> = {
  imaging_request: 'Imaging',
  ortho_referral: 'Ortho consult',
  pcp_consult: 'PCP consult',
  outside_records: 'Outside records',
  other_pause: 'External input',
  neuro_exam_pivot: 'Neuro exam',
};

export function PausedEpisodesSignal() {
  const [pausedEpisodes, setPausedEpisodes] = useState<PausedEpisode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPausedEpisodes = async () => {
      try {
        const { data, error } = await supabase
          .from('special_situations')
          .select('id, episode_id, patient_name, clinician_name, situation_type, summary, created_at')
          .eq('status', 'open')
          .in('situation_type', [
            'imaging_request', 
            'ortho_referral', 
            'pcp_consult', 
            'outside_records', 
            'other_pause',
            'neuro_exam_pivot'
          ])
          .order('created_at', { ascending: true });

        if (error) throw error;
        setPausedEpisodes(data || []);
      } catch (error) {
        console.error('Error fetching paused episodes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPausedEpisodes();
  }, []);

  const getDaysInPause = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <PauseCircle className="h-4 w-4 text-amber-600" />
            Episodes on Pause
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pausedEpisodes.length === 0) {
    return null; // Don't show card if no paused episodes
  }

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <PauseCircle className="h-4 w-4 text-amber-600" />
              Episodes on Pause
            </CardTitle>
            <CardDescription className="text-amber-700/70">
              Awaiting external input — no action required
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            {pausedEpisodes.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pausedEpisodes.map((episode) => {
            const daysInPause = getDaysInPause(episode.created_at);
            const awaitingLabel = PAUSE_AWAITING_LABELS[episode.situation_type] || 'External input';
            
            return (
              <div
                key={episode.id}
                className={cn(
                  "p-3 rounded-lg border bg-white/80",
                  "border-amber-200"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium text-sm truncate">{episode.patient_name}</span>
                    </div>
                    
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      {episode.clinician_name && (
                        <span className="flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" />
                          {episode.clinician_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(episode.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className="shrink-0 bg-amber-100 text-amber-800 border-amber-300 text-xs"
                  >
                    Awaiting: {awaitingLabel}
                  </Badge>
                </div>

                {/* Time-in-state reassurance for longer pauses */}
                {daysInPause >= 7 && (
                  <p className="mt-2 text-xs text-amber-700/80 italic">
                    Still awaiting external input — no action required
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}