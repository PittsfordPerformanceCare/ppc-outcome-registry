import { OutcomeMeasureForm } from "./OutcomeMeasureForm";
import { LEFS_INSTRUMENT } from "@/lib/outcomeInstruments";

interface LEFSFormProps {
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

export function LEFSForm({ onScoreChange, onComplete, readOnly }: LEFSFormProps) {
  return (
    <OutcomeMeasureForm
      instrument={LEFS_INSTRUMENT}
      onComplete={onComplete || (() => {})}
      onScoreChange={onScoreChange}
      readOnly={readOnly}
    />
  );
}
