import { OutcomeMeasureForm } from "./OutcomeMeasureForm";
import { ODI_INSTRUMENT } from "@/lib/outcomeInstruments";

interface ODIFormProps {
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

export function ODIForm({ onScoreChange, onComplete, readOnly }: ODIFormProps) {
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
      instrument={ODI_INSTRUMENT}
      onComplete={handleComplete}
      onScoreChange={handleScoreChange}
      readOnly={readOnly}
    />
  );
}
