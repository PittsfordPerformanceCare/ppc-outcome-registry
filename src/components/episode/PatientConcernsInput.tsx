import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PatientConcernsInputProps {
  primaryConcern: string;
  onPrimaryConcernChange: (value: string) => void;
  secondaryConcern: string;
  onSecondaryConcernChange: (value: string) => void;
}

export function PatientConcernsInput({
  primaryConcern,
  onPrimaryConcernChange,
  secondaryConcern,
  onSecondaryConcernChange,
}: PatientConcernsInputProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="primaryConcern">What is bothering you? (Primary concern) *</Label>
        <Input
          id="primaryConcern"
          placeholder="Describe your main concern"
          value={primaryConcern}
          onChange={(e) => onPrimaryConcernChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="secondaryConcern">Secondary concern (optional)</Label>
        <Input
          id="secondaryConcern"
          placeholder="Any other concerns?"
          value={secondaryConcern}
          onChange={(e) => onSecondaryConcernChange(e.target.value)}
        />
      </div>
    </div>
  );
}
