import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { PauseCircle, CheckCircle, ChevronDown } from 'lucide-react';
import { useCareCoordinationPause, PAUSE_REASON_LABELS, PauseReason } from '@/hooks/useCareCoordinationPause';
import { toast } from 'sonner';

interface CareCoordinationPauseControlProps {
  episodeId: string;
}

export function CareCoordinationPauseControl({ episodeId }: CareCoordinationPauseControlProps) {
  const { activePause, loading, createPause, resolvePause } = useCareCoordinationPause(episodeId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePause = async (reason: PauseReason) => {
    setIsSubmitting(true);
    try {
      const success = await createPause(reason);
      if (success) {
        toast.success('Care coordination pause activated');
      } else {
        toast.error('Failed to activate pause');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolvePause = async () => {
    setIsSubmitting(true);
    try {
      const success = await resolvePause();
      if (success) {
        toast.success('Pause resolved - episode is now active');
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

  // No active pause - show dropdown to create one
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isSubmitting}
          className="gap-1.5"
        >
          <PauseCircle className="h-4 w-4" />
          Care coordination pause
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleCreatePause('neuro_exam')}>
          Neuro exam in progress
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCreatePause('imaging')}>
          Imaging requested
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCreatePause('specialist_referral')}>
          Specialist referral in progress
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
