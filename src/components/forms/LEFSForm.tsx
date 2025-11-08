import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface LEFSFormProps {
  onScoreChange: (score: number) => void;
  initialScore?: number;
}

const LEFS_QUESTIONS = [
  "Any of your usual work, housework, or school activities",
  "Your usual hobbies, recreational or sporting activities",
  "Getting into or out of the bath",
  "Walking between rooms",
  "Putting on your shoes or socks",
  "Squatting",
  "Lifting an object, like a bag of groceries from the floor",
  "Performing light activities around your home",
  "Performing heavy activities around your home",
  "Getting into or out of a car",
  "Walking 2 blocks",
  "Walking a mile",
  "Going up or down 10 stairs (about 1 flight of stairs)",
  "Standing for 1 hour",
  "Sitting for 1 hour",
  "Running on even ground",
  "Running on uneven ground",
  "Making sharp turns while running fast",
  "Hopping",
  "Rolling over in bed",
];

const DIFFICULTY_OPTIONS = [
  "Extreme difficulty or unable to perform activity",
  "Quite a bit of difficulty",
  "Moderate difficulty",
  "A little bit of difficulty",
  "No difficulty",
];

export function LEFSForm({ onScoreChange, initialScore }: LEFSFormProps) {
  const [responses, setResponses] = useState<Record<number, number>>({});

  useEffect(() => {
    const total = Object.values(responses).reduce((sum, val) => sum + val, 0);
    const percentage = (total / 80) * 100;
    onScoreChange(percentage);
  }, [responses, onScoreChange]);

  const handleResponseChange = (questionIndex: number, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionIndex]: parseInt(value),
    }));
  };

  const totalScore = Object.values(responses).reduce((sum, val) => sum + val, 0);
  const percentageScore = ((totalScore / 80) * 100).toFixed(1);
  const isComplete = Object.keys(responses).length === 20;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lower Extremity Functional Scale (LEFS)</CardTitle>
        <CardDescription>
          Today, do you have any difficulty at all with:
          {isComplete && (
            <span className="block mt-2 font-semibold text-foreground">
              Score: {totalScore}/80 ({percentageScore}%)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {LEFS_QUESTIONS.map((question, qIndex) => (
          <div key={qIndex} className="space-y-3 rounded-lg border p-4">
            <Label className="text-base font-semibold">
              {qIndex + 1}. {question}
            </Label>
            <RadioGroup
              value={responses[qIndex]?.toString()}
              onValueChange={(value) => handleResponseChange(qIndex, value)}
            >
              {DIFFICULTY_OPTIONS.map((option, oIndex) => (
                <div key={oIndex} className="flex items-start space-x-3">
                  <RadioGroupItem value={oIndex.toString()} id={`lefs-${qIndex}-${oIndex}`} />
                  <Label
                    htmlFor={`lefs-${qIndex}-${oIndex}`}
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
