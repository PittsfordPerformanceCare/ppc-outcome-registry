import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface RPQFormProps {
  onScoreChange: (score: number) => void;
  initialScore?: number;
}

// Rivermead Post-Concussion Symptoms Questionnaire (RPQ)
// 16 symptoms rated 0-4 (Not experienced at all to Severe problem)
const RPQ_SYMPTOMS = [
  "Headaches",
  "Feelings of dizziness",
  "Nausea and/or vomiting",
  "Noise sensitivity (easily upset by loud noise)",
  "Sleep disturbance",
  "Fatigue (tiring more easily)",
  "Being irritable (easily angered)",
  "Feeling depressed or tearful",
  "Feeling frustrated or impatient",
  "Forgetfulness (poor memory)",
  "Poor concentration",
  "Taking longer to think",
  "Blurred vision",
  "Light sensitivity (easily upset by bright light)",
  "Double vision",
  "Restlessness",
];

const RATING_OPTIONS = [
  { value: 0, label: "Not experienced at all" },
  { value: 1, label: "No more of a problem" },
  { value: 2, label: "Mild problem" },
  { value: 3, label: "Moderate problem" },
  { value: 4, label: "Severe problem" },
];

export function RPQForm({ onScoreChange, initialScore }: RPQFormProps) {
  const [responses, setResponses] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (initialScore !== undefined) {
      const avgScore = Math.floor(initialScore / RPQ_SYMPTOMS.length);
      const initialResponses: { [key: number]: number } = {};
      RPQ_SYMPTOMS.forEach((_, index) => {
        initialResponses[index] = avgScore;
      });
      setResponses(initialResponses);
    }
  }, [initialScore]);

  const handleResponseChange = (questionIndex: number, value: string) => {
    const numValue = parseInt(value);
    const newResponses = { ...responses, [questionIndex]: numValue };
    setResponses(newResponses);

    const totalScore = Object.values(newResponses).reduce((sum, val) => sum + val, 0);
    onScoreChange(totalScore);
  };

  const totalScore = Object.values(responses).reduce((sum, val) => sum + val, 0);
  const isComplete = Object.keys(responses).length === RPQ_SYMPTOMS.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Rivermead Post-Concussion Symptoms Questionnaire (RPQ)</CardTitle>
        <CardDescription>
          Rate each symptom compared to before your injury/concussion. Total Score: {totalScore}/64
          {isComplete && (
            <span className="ml-2 text-primary font-medium">✓ Complete</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground mb-4">
          Please rate the following symptoms as you have experienced them over the past 24 hours:
        </div>

        {RPQ_SYMPTOMS.map((symptom, index) => (
          <div key={index} className="space-y-3 pb-4 border-b last:border-0">
            <Label className="text-base font-medium">
              {index + 1}. {symptom}
            </Label>
            <RadioGroup
              value={responses[index]?.toString() || ""}
              onValueChange={(value) => handleResponseChange(index, value)}
              className="space-y-2"
            >
              {RATING_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value.toString()} id={`q${index}-${option.value}`} />
                  <Label
                    htmlFor={`q${index}-${option.value}`}
                    className="font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Score:</span>
            <span className="text-2xl font-bold text-primary">{totalScore} / 64</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Higher scores indicate greater symptom severity. A score of 0 means no symptoms.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
