import { OutcomeMeasureForm } from "./OutcomeMeasureForm";
import { QUICKDASH_INSTRUMENT } from "@/lib/outcomeInstruments";

interface QuickDASHFormProps {
  onScoreChange: (score: number) => void;
  onComplete?: (data: {
    score: number;
    responses: Map<number, number | null>;
    isValid: boolean;
    interpretation: string;
  }) => void;
  initialScore?: number;
  readOnly?: boolean;
}

export function QuickDASHForm({ onScoreChange, onComplete, readOnly }: QuickDASHFormProps) {
  return (
    <OutcomeMeasureForm
      instrument={QUICKDASH_INSTRUMENT}
      onComplete={onComplete || (() => {})}
      onScoreChange={onScoreChange}
      readOnly={readOnly}
    />
  );
}
