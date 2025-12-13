import { OutcomeMeasureForm } from "./OutcomeMeasureForm";
import { ODI_INSTRUMENT } from "@/lib/outcomeInstruments";

interface ODIFormProps {
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

export function ODIForm({ onScoreChange, onComplete, readOnly }: ODIFormProps) {
  return (
    <OutcomeMeasureForm
      instrument={ODI_INSTRUMENT}
      onComplete={onComplete || (() => {})}
      onScoreChange={onScoreChange}
      readOnly={readOnly}
    />
  );
}
