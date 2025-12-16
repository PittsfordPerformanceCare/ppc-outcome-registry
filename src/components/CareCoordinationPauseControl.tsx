import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PauseCircle, CheckCircle } from 'lucide-react';
import { useCareCoordinationPause, PAUSE_REASON_LABELS } from '@/hooks/useCareCoordinationPause';
import { CareCoordinationPauseDialog } from './CareCoordinationPauseDialog';
import { toast } from 'sonner';

interface CareCoordinationPauseControlProps {
  episodeId: string;
}

export function CareCoordinationPauseControl({ episodeId }: CareCoordinationPauseControlProps) {
  const { activePause, loading, resolvePause, refetch } = useCareCoordinationPause(episodeId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleResolvePause = async () => {
    setIsSubmitting(true);
    try {
      const success = await resolvePause();
      if (success) {
        toast.success('Pause resolved — episode is now active');
      } else {
        toast.error('Failed to resolve pause');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return null;
  }

  // If there's an active pause, show the resolve button
  if (activePause) {
    return (
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <PauseCircle className="h-3 w-3 mr-1" />
          {PAUSE_REASON_LABELS[activePause.pause_reason]}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResolvePause}
          disabled={isSubmitting}
          className="gap-1.5"
        >
          <CheckCircle className="h-4 w-4" />
          Mark pause resolved
        </Button>
      </div>
    );
  }

  // No active pause - show button to open pause dialog
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="gap-1.5"
      >
        <PauseCircle className="h-4 w-4" />
        Care coordination pause
      </Button>
      
      <CareCoordinationPauseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        episodeId={episodeId}
        onSuccess={refetch}
      />
    </>
  );
}
