import { OutcomeMeasureForm } from "./OutcomeMeasureForm";
import { LEFS_INSTRUMENT } from "@/lib/outcomeInstruments";

interface LEFSFormProps {
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

export function LEFSForm({ onScoreChange, onComplete, readOnly }: LEFSFormProps) {
  const handleScoreChange = (score: number) => {
    // For LEFS, we need to track if the form is complete (all 20 questions answered)
    // The score is the raw total (0-80), form is complete when we get a non-zero score
    // Actually, we should check completion status from the form itself
    onScoreChange(score);
  };

  const handleComplete = (data: {
    score: number;
    responses: Map<number, number | null>;
    isValid: boolean;
    interpretation: string;
  }) => {
    // Report completion to parent
    onScoreChange(data.score, data.isValid);
    onComplete?.(data);
  };

  return (
    <OutcomeMeasureForm
      instrument={LEFS_INSTRUMENT}
      onComplete={handleComplete}
      onScoreChange={handleScoreChange}
      readOnly={readOnly}
    />
  );
}
