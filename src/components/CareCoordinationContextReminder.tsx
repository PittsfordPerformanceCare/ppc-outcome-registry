import { useCareCoordinationPause, PAUSE_REASON_LABELS } from '@/hooks/useCareCoordinationPause';
import { PauseCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface CareCoordinationContextReminderProps {
  episodeId: string;
  className?: string;
}

/**
 * Inline context reminder displayed when a clinician opens a paused episode.
 * Shows the pause reason and duration without requiring any action.
 * No popups or alerts - just a calm inline reminder.
 */
export function CareCoordinationContextReminder({ 
  episodeId,
  className 
}: CareCoordinationContextReminderProps) {
  const { activePause, loading } = useCareCoordinationPause(episodeId);

  if (loading || !activePause) {
    return null;
  }

  const pauseDuration = formatDistanceToNow(new Date(activePause.created_at), { addSuffix: false });

  return (
    <div 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg",
        "bg-amber-50 border border-amber-200",
        className
      )}
    >
      <PauseCircle className="h-5 w-5 text-amber-600 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-800">
          Care Coordination Pause
        </p>
        <p className="text-sm text-amber-700">
          {PAUSE_REASON_LABELS[activePause.pause_reason]}
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs text-amber-600 shrink-0">
        <Clock className="h-3 w-3" />
        <span>{pauseDuration}</span>
      </div>
    </div>
  );
}