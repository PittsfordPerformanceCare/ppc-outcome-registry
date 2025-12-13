import { OutcomeMeasureForm } from "./OutcomeMeasureForm";
import { QUICKDASH_INSTRUMENT } from "@/lib/outcomeInstruments";

interface QuickDASHFormProps {
  onScoreChange: (score: number, isComplete?: boolean) => void;
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
  const handleScoreChange = (score: number) => {
    onScoreChange(score);
  };

  const handleComplete = (data: {
    score: number;
    responses: Map<number, number | null>;
    isValid: boolean;
    interpretation: string;
  }) => {
    onScoreChange(data.score, data.isValid);
    onComplete?.(data);
  };

  return (
    <OutcomeMeasureForm
      instrument={QUICKDASH_INSTRUMENT}
      onComplete={handleComplete}
      onScoreChange={handleScoreChange}
      readOnly={readOnly}
    />
  );
}
