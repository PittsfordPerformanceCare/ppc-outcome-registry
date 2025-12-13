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
  const handleScoreChange = (score: number, isComplete?: boolean) => {
    onScoreChange(score, isComplete);
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
