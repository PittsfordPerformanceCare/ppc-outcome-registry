import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface RPQFormProps {
  onScoreChange: (score: number) => void;
  initialScore?: number;
}

// Rivermead Post-Concussion Symptoms Questionnaire (RPQ)
// 16 symptoms rated 0-4 (Not experienced at all to A severe problem)
const RPQ_SYMPTOMS = [
  "Headaches",
  "Feelings of Dizziness",
  "Nausea and/or Vomiting",
  "Noise Sensitivity, easily upset by loud noise",
  "Sleep Disturbance",
  "Fatigue, tiring more easily",
  "Being Irritable, easily angered",
  "Feeling Depressed or Tearful",
  "Feeling Frustrated or Impatient",
  "Forgetfulness, poor memory",
  "Poor Concentration",
  "Taking Longer to Think",
  "Blurred Vision",
  "Light Sensitivity, easily upset by bright light",
  "Double Vision",
  "Restlessness",
];

const RATING_OPTIONS = [
  { value: 0, label: "Not experienced at all" },
  { value: 1, label: "No more of a problem" },
  { value: 2, label: "A mild problem" },
  { value: 3, label: "A moderate problem" },
  { value: 4, label: "A severe problem" },
];

export function RPQForm({ onScoreChange, initialScore }: RPQFormProps) {
  const [responses, setResponses] = useState<{ [key: number]: number }>({});
  const [otherDifficulties, setOtherDifficulties] = useState("");

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

    // Calculate total score: recode "1" to "0" (no more of a problem than before)
    const totalScore = Object.values(newResponses).reduce((sum, val) => {
      return sum + (val === 1 ? 0 : val);
    }, 0);
    onScoreChange(totalScore);
  };

  // Calculate scores with "1" recoded to "0"
  const getRecodedScore = (val: number) => (val === 1 ? 0 : val);
  
  const totalScore = Object.values(responses).reduce((sum, val) => sum + getRecodedScore(val), 0);
  const isComplete = Object.keys(responses).length === RPQ_SYMPTOMS.length;
  
  // RPQ-3: First 3 items (headaches, dizziness, nausea) - range 0-12
  const rpq3Score = [0, 1, 2].reduce((sum, idx) => {
    return sum + (responses[idx] !== undefined ? getRecodedScore(responses[idx]) : 0);
  }, 0);
  
  // RPQ-13: Remaining 13 items - range 0-52
  const rpq13Score = Array.from({ length: 13 }, (_, i) => i + 3).reduce((sum, idx) => {
    return sum + (responses[idx] !== undefined ? getRecodedScore(responses[idx]) : 0);
  }, 0);
  
  // Clinical interpretation
  const getInterpretation = () => {
    if (!isComplete) return null;
    if (totalScore < 12) return { level: "Below threshold", color: "text-green-600", description: "Symptoms are minimal" };
    if (totalScore >= 16 && totalScore <= 35) return { level: "May indicate Post-Concussion Syndrome", color: "text-orange-600", description: "Consider further evaluation" };
    if (totalScore > 35) return { level: "Severe symptoms", color: "text-red-600", description: "Recommend comprehensive assessment" };
    return { level: "Clinically relevant", color: "text-yellow-600", description: "Symptoms warrant monitoring" };
  };
  
  const interpretation = getInterpretation();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>The Rivermead Post-Concussion Symptoms Questionnaire</CardTitle>
        <CardDescription>
          Total Score: {totalScore}/64 (Rating of "1" recoded to "0" in total)
          {isComplete && (
            <span className="ml-2 text-primary font-medium">✓ Complete</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground mb-4">
          <p className="mb-2">
            After a head injury or accident some people experience symptoms which can cause worry or nuisance. 
            We would like to know if you now suffer from any of the symptoms given below.
          </p>
          <p className="font-medium">
            As many of these symptoms occur normally, we would like you to compare yourself now with before the accident. 
            For each one, please select the rating closest to your answer.
          </p>
          <p className="mt-2 font-medium">
            Compared with before the accident, do you now (i.e., over the last 24 hours) suffer from:
          </p>
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

        <div className="pt-4 border-t space-y-4">
          <div>
            <Label className="text-base font-medium">
              Are you experiencing any other difficulties?
            </Label>
            <textarea
              value={otherDifficulties}
              onChange={(e) => setOtherDifficulties(e.target.value)}
              className="w-full mt-2 p-3 border rounded-md min-h-[100px] bg-background text-foreground"
              placeholder="Please describe any other difficulties you are experiencing..."
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Score:</span>
              <span className="text-2xl font-bold text-primary">{totalScore} / 64</span>
            </div>
            
            {isComplete && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-muted rounded-md">
                  <div className="font-medium text-muted-foreground">RPQ-3 (Early symptoms)</div>
                  <div className="text-lg font-semibold">{rpq3Score} / 12</div>
                  <div className="text-xs text-muted-foreground mt-1">Headaches, dizziness, nausea</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="font-medium text-muted-foreground">RPQ-13 (Later symptoms)</div>
                  <div className="text-lg font-semibold">{rpq13Score} / 52</div>
                  <div className="text-xs text-muted-foreground mt-1">Cognitive & emotional</div>
                </div>
              </div>
            )}
            
            {interpretation && (
              <div className={`p-3 bg-muted rounded-md ${interpretation.color}`}>
                <div className="font-semibold">{interpretation.level}</div>
                <div className="text-sm">{interpretation.description}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Clinical threshold: ≥12 | PCS range: 16-35
                </div>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              Note: Ratings of "1" (no more of a problem than before) are recoded to "0" in the total score to focus on new or worsened symptoms.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
