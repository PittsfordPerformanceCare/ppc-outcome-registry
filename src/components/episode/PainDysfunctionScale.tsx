import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface PainDysfunctionScaleProps {
  painLevel: number | null;
  onPainLevelChange: (value: number) => void;
  dysfunctionLevel: number | null;
  onDysfunctionLevelChange: (value: number) => void;
}

export function PainDysfunctionScale({
  painLevel,
  onPainLevelChange,
  dysfunctionLevel,
  onDysfunctionLevelChange,
}: PainDysfunctionScaleProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Pain Level (0-10)</Label>
          <span className="text-2xl font-bold text-primary">
            {painLevel ?? 0}
          </span>
        </div>
        <Slider
          value={[painLevel ?? 0]}
          onValueChange={([v]) => onPainLevelChange(v)}
          max={10}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>No pain</span>
          <span>Worst pain</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>How limited do you feel right now? (0-10)</Label>
          <span className="text-2xl font-bold text-primary">
            {dysfunctionLevel ?? 0}
          </span>
        </div>
        <Slider
          value={[dysfunctionLevel ?? 0]}
          onValueChange={([v]) => onDysfunctionLevelChange(v)}
          max={10}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Not limited</span>
          <span>Completely limited</span>
        </div>
      </div>
    </div>
  );
}
