import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const ONSET_TYPES = [
  { value: "gradual", label: "Gradual (developed slowly over time)" },
  { value: "acute", label: "Acute injury (specific event)" },
  { value: "post_surgical", label: "Post-surgical" },
  { value: "not_sure", label: "Not sure" },
] as const;

export type OnsetType = typeof ONSET_TYPES[number]["value"];

interface OnsetTypeSelectorProps {
  onsetType: OnsetType | "";
  onOnsetTypeChange: (value: OnsetType) => void;
  injuryDate: string;
  onInjuryDateChange: (value: string) => void;
  injuryMechanism: string;
  onInjuryMechanismChange: (value: string) => void;
}

export function OnsetTypeSelector({
  onsetType,
  onOnsetTypeChange,
  injuryDate,
  onInjuryDateChange,
  injuryMechanism,
  onInjuryMechanismChange,
}: OnsetTypeSelectorProps) {
  const isDateRequired = onsetType === "acute" || onsetType === "post_surgical";
  const isMechanismRequired = onsetType === "acute";
  const showDateField = onsetType !== "";
  const showMechanismField = onsetType === "acute" || onsetType === "post_surgical";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="onsetType">Did this develop slowly over time or was there an acute injury?</Label>
        <Select value={onsetType} onValueChange={(v) => onOnsetTypeChange(v as OnsetType)}>
          <SelectTrigger id="onsetType">
            <SelectValue placeholder="Select onset type" />
          </SelectTrigger>
          <SelectContent>
            {ONSET_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showDateField && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="injuryDate">
              {onsetType === "post_surgical" ? "Surgery Date" : "Injury/Onset Date"}
              {isDateRequired ? " *" : " (optional)"}
            </Label>
            <Input
              id="injuryDate"
              type="date"
              value={injuryDate}
              onChange={(e) => onInjuryDateChange(e.target.value)}
            />
          </div>

          {showMechanismField && (
            <div className="space-y-2">
              <Label htmlFor="injuryMechanism">
                {onsetType === "post_surgical" ? "Procedure Type" : "Mechanism of Injury"}
                {isMechanismRequired ? " *" : ""}
              </Label>
              <Input
                id="injuryMechanism"
                placeholder={onsetType === "post_surgical" ? "Describe the procedure" : "How did the injury occur?"}
                value={injuryMechanism}
                onChange={(e) => onInjuryMechanismChange(e.target.value)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
