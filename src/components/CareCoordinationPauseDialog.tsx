import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  PauseCircle, 
  ImageIcon, 
  Stethoscope, 
  UserRound, 
  FileText,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { 
  useCareCoordinationPause, 
  PAUSE_REASON_LABELS, 
  PAUSE_REASON_DESCRIPTIONS,
  PauseReason 
} from '@/hooks/useCareCoordinationPause';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CareCoordinationPauseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episodeId: string;
  onSuccess?: () => void;
}

const PAUSE_REASON_ICONS: Record<PauseReason, React.ElementType> = {
  imaging_required: ImageIcon,
  ortho_consult: Stethoscope,
  pcp_consult: UserRound,
  outside_records_pending: FileText,
  other: HelpCircle,
};

const pauseReasons: PauseReason[] = [
  'imaging_required',
  'ortho_consult',
  'pcp_consult',
  'outside_records_pending',
  'other',
];

export function CareCoordinationPauseDialog({
  open,
  onOpenChange,
  episodeId,
  onSuccess,
}: CareCoordinationPauseDialogProps) {
  const { createPause } = useCareCoordinationPause(episodeId);
  const [selectedReason, setSelectedReason] = useState<PauseReason | null>(null);
  const [otherNote, setOtherNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    
    if (selectedReason === 'other' && !otherNote.trim()) {
      toast.error('Please provide a note for the pause reason');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await createPause(selectedReason);
      if (success) {
        toast.success('Care coordination pause activated');
        onOpenChange(false);
        setSelectedReason(null);
        setOtherNote('');
        onSuccess?.();
      } else {
        toast.error('Failed to activate pause');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    setOtherNote('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PauseCircle className="h-5 w-5 text-amber-600" />
            Care Coordination Pause
          </DialogTitle>
          <DialogDescription>
            Select the reason care cannot safely continue at this time.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Helper microcopy */}
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-100 text-amber-800 text-sm flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              Use Pause when care cannot safely continue without imaging, consult, or records. 
              PPC remains the coordinating provider during pause.
            </p>
          </div>

          <RadioGroup
            value={selectedReason || ''}
            onValueChange={(value) => setSelectedReason(value as PauseReason)}
            className="space-y-2"
          >
            {pauseReasons.map((reason) => {
              const Icon = PAUSE_REASON_ICONS[reason];
              return (
                <div key={reason}>
                  <div
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      "hover:border-amber-300 hover:bg-amber-50/50",
                      selectedReason === reason && "border-amber-400 bg-amber-50"
                    )}
                    onClick={() => setSelectedReason(reason)}
                  >
                    <RadioGroupItem value={reason} id={reason} className="mt-1" />
                    <div className="flex-1">
                      <Label 
                        htmlFor={reason} 
                        className="flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Icon className="h-4 w-4 text-amber-600" />
                        {PAUSE_REASON_LABELS[reason]}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {PAUSE_REASON_DESCRIPTIONS[reason]}
                      </p>
                    </div>
                  </div>
                  
                  {/* Show note input for "Other" when selected */}
                  {reason === 'other' && selectedReason === 'other' && (
                    <div className="ml-8 mt-2">
                      <Label htmlFor="otherNote" className="text-sm">
                        Brief description <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="otherNote"
                        placeholder="e.g., Awaiting specialist records from out-of-state"
                        value={otherNote}
                        onChange={(e) => setOtherNote(e.target.value)}
                        className="mt-1"
                        maxLength={100}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting || (selectedReason === 'other' && !otherNote.trim())}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isSubmitting ? 'Activating...' : 'Activate Pause'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}