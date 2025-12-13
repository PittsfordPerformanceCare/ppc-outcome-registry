import { OutcomeMeasureForm } from "./OutcomeMeasureForm";
import { NDI_INSTRUMENT } from "@/lib/outcomeInstruments";

interface NDIFormProps {
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

export function NDIForm({ onScoreChange, onComplete, readOnly }: NDIFormProps) {
  const handleScoreChange = (score: number, isComplete?: boolean) => {
    onScoreChange(score, isComplete);
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
      instrument={NDI_INSTRUMENT}
      onComplete={handleComplete}
      onScoreChange={handleScoreChange}
      readOnly={readOnly}
    />
  );
}
