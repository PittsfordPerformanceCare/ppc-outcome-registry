import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface QuickDASHFormProps {
  onScoreChange: (score: number) => void;
  initialScore?: number;
}

const QUICKDASH_QUESTIONS = [
  "Open a tight or new jar",
  "Do heavy household chores (e.g., wash walls, floors)",
  "Carry a shopping bag or briefcase",
  "Wash your back",
  "Use a knife to cut food",
  "Recreational activities in which you take some force or impact through your arm, shoulder or hand (e.g., golf, hammering, tennis, etc.)",
  "During the past week, to what extent has your arm, shoulder or hand problem interfered with your normal social activities with family, friends, neighbors or groups?",
  "During the past week, were you limited in your work or other regular daily activities as a result of your arm, shoulder or hand problem?",
  "Arm, shoulder or hand pain",
  "Tingling (pins and needles) in your arm, shoulder or hand",
  "During the past week, how much difficulty have you had sleeping because of the pain in your arm, shoulder or hand?",
];

const DIFFICULTY_OPTIONS = [
  "No difficulty",
  "Mild difficulty",
  "Moderate difficulty",
  "Severe difficulty",
  "Unable",
];

const INTERFERENCE_OPTIONS = [
  "Not at all",
  "Slightly",
  "Moderately",
  "Quite a bit",
  "Extremely",
];

const PAIN_OPTIONS = [
  "None",
  "Mild",
  "Moderate",
  "Severe",
  "Extreme",
];

const SLEEP_OPTIONS = [
  "No difficulty",
  "Mild difficulty",
  "Moderate difficulty",
  "Severe difficulty",
  "So much difficulty that I can't sleep",
];

export function QuickDASHForm({ onScoreChange, initialScore }: QuickDASHFormProps) {
  const [responses, setResponses] = useState<Record<number, number>>({});

  useEffect(() => {
    if (Object.keys(responses).length === 11) {
      const total = Object.values(responses).reduce((sum, val) => sum + val, 0);
      const score = ((total - 11) / 44) * 100;
      onScoreChange(score);
    }
  }, [responses, onScoreChange]);

  const handleResponseChange = (questionIndex: number, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionIndex]: parseInt(value) + 1,
    }));
  };

  const getOptionsForQuestion = (index: number) => {
    if (index === 6 || index === 7) return INTERFERENCE_OPTIONS;
    if (index === 8 || index === 9) return PAIN_OPTIONS;
    if (index === 10) return SLEEP_OPTIONS;
    return DIFFICULTY_OPTIONS;
  };

  const isComplete = Object.keys(responses).length === 11;
  const totalScore = isComplete
    ? (((Object.values(responses).reduce((sum, val) => sum + val, 0) - 11) / 44) * 100).toFixed(1)
    : "0.0";

  return (
    <Card>
      <CardHeader>
        <CardTitle>QuickDASH (Disabilities of the Arm, Shoulder and Hand)</CardTitle>
        <CardDescription>
          Please rate your ability to do the following activities in the last week.
          {isComplete && (
            <span className="block mt-2 font-semibold text-foreground">
              Score: {totalScore}%
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {QUICKDASH_QUESTIONS.map((question, qIndex) => (
          <div key={qIndex} className="space-y-3 rounded-lg border p-4">
            <Label className="text-base font-semibold">
              {qIndex + 1}. {question}
            </Label>
            <RadioGroup
              value={responses[qIndex] ? (responses[qIndex] - 1).toString() : undefined}
              onValueChange={(value) => handleResponseChange(qIndex, value)}
            >
              {getOptionsForQuestion(qIndex).map((option, oIndex) => (
                <div key={oIndex} className="flex items-start space-x-3">
                  <RadioGroupItem value={oIndex.toString()} id={`dash-${qIndex}-${oIndex}`} />
                  <Label
                    htmlFor={`dash-${qIndex}-${oIndex}`}
                    className="font-normal cursor-pointer leading-relaxed"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
