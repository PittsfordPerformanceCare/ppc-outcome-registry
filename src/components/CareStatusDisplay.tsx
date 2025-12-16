import { useCareCoordinationPause, PAUSE_REASON_LABELS } from '@/hooks/useCareCoordinationPause';
import { formatDistanceToNow } from 'date-fns';

interface CareStatusDisplayProps {
  episodeId: string;
}

export function CareStatusDisplay({ episodeId }: CareStatusDisplayProps) {
  const { activePause, loading } = useCareCoordinationPause(episodeId);

  if (loading) {
    return (
      <div>
        <p className="text-xs text-muted-foreground">Care status</p>
        <p className="text-lg font-semibold text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!activePause) {
    return (
      <div>
        <p className="text-xs text-muted-foreground">Care status</p>
        <p className="text-lg font-semibold text-foreground">Active</p>
      </div>
    );
  }

  const pauseDuration = formatDistanceToNow(new Date(activePause.created_at), { addSuffix: false });

  return (
    <div className="col-span-2">
      <p className="text-xs text-muted-foreground">Care status</p>
      <p className="text-lg font-semibold text-amber-700">Care coordination pause</p>
      <p className="text-sm text-muted-foreground mt-1">
        {PAUSE_REASON_LABELS[activePause.pause_reason]} · {pauseDuration}
      </p>
      <p className="text-xs text-muted-foreground mt-1 italic">
        PPC remains coordinating provider. Episode discharge is completed by PPC when patient returns.
      </p>
    </div>
  );
}
