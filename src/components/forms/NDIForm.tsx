import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface NDIFormProps {
  onScoreChange: (score: number) => void;
  initialScore?: number;
}

const NDI_QUESTIONS = [
  {
    section: "Pain Intensity",
    options: [
      "I have no pain at the moment",
      "The pain is very mild at the moment",
      "The pain is moderate at the moment",
      "The pain is fairly severe at the moment",
      "The pain is very severe at the moment",
      "The pain is the worst imaginable at the moment",
    ],
  },
  {
    section: "Personal Care (Washing, Dressing, etc.)",
    options: [
      "I can look after myself normally without causing extra pain",
      "I can look after myself normally but it causes extra pain",
      "It is painful to look after myself and I am slow and careful",
      "I need some help but manage most of my personal care",
      "I need help every day in most aspects of self care",
      "I do not get dressed, wash with difficulty, and stay in bed",
    ],
  },
  {
    section: "Lifting",
    options: [
      "I can lift heavy weights without extra pain",
      "I can lift heavy weights but it gives extra pain",
      "Pain prevents me from lifting heavy weights off the floor, but I can manage if they are conveniently positioned",
      "Pain prevents me from lifting heavy weights but I can manage light to medium weights if they are conveniently positioned",
      "I can lift only very light weights",
      "I cannot lift or carry anything",
    ],
  },
  {
    section: "Reading",
    options: [
      "I can read as much as I want to with no pain in my neck",
      "I can read as much as I want to with slight pain in my neck",
      "I can read as much as I want with moderate pain in my neck",
      "I cannot read as much as I want because of moderate pain in my neck",
      "I cannot read as much as I want because of severe pain in my neck",
      "I cannot read at all",
    ],
  },
  {
    section: "Headaches",
    options: [
      "I have no headaches at all",
      "I have slight headaches, which come infrequently",
      "I have moderate headaches, which come infrequently",
      "I have moderate headaches, which come frequently",
      "I have severe headaches, which come frequently",
      "I have headaches almost all the time",
    ],
  },
  {
    section: "Concentration",
    options: [
      "I can concentrate fully when I want to with no difficulty",
      "I can concentrate fully when I want to with slight difficulty",
      "I have a fair degree of difficulty in concentrating when I want to",
      "I have a lot of difficulty in concentrating when I want to",
      "I have a great deal of difficulty in concentrating when I want to",
      "I cannot concentrate at all",
    ],
  },
  {
    section: "Work",
    options: [
      "I can do as much work as I want to",
      "I can only do my usual work, but no more",
      "I can do most of my usual work, but no more",
      "I cannot do my usual work",
      "I can hardly do any work at all",
      "I cannot do any work at all",
    ],
  },
  {
    section: "Driving",
    options: [
      "I can drive my car without any neck pain",
      "I can drive my car as long as I want with slight pain in my neck",
      "I can drive my car as long as I want with moderate pain in my neck",
      "I cannot drive my car as long as I want because of moderate pain in my neck",
      "I can hardly drive at all because of severe pain in my neck",
      "I cannot drive my car at all",
    ],
  },
  {
    section: "Sleeping",
    options: [
      "I have no trouble sleeping",
      "My sleep is slightly disturbed (less than 1 hour sleepless)",
      "My sleep is mildly disturbed (1-2 hours sleepless)",
      "My sleep is moderately disturbed (2-3 hours sleepless)",
      "My sleep is greatly disturbed (3-5 hours sleepless)",
      "My sleep is completely disturbed (5-7 hours sleepless)",
    ],
  },
  {
    section: "Recreation",
    options: [
      "I am able to engage in all my recreation activities with no neck pain at all",
      "I am able to engage in all my recreation activities, with some pain in my neck",
      "I am able to engage in most, but not all of my usual recreation activities because of pain in my neck",
      "I am able to engage in a few of my usual recreation activities because of pain in my neck",
      "I can hardly do any recreation activities because of pain in my neck",
      "I cannot do any recreation activities at all",
    ],
  },
];

export function NDIForm({ onScoreChange, initialScore }: NDIFormProps) {
  const [responses, setResponses] = useState<Record<number, number>>({});

  useEffect(() => {
    const total = Object.values(responses).reduce((sum, val) => sum + val, 0);
    const percentage = (total / 50) * 100;
    onScoreChange(percentage);
  }, [responses, onScoreChange]);

  const handleResponseChange = (questionIndex: number, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionIndex]: parseInt(value),
    }));
  };

  const totalScore = Object.values(responses).reduce((sum, val) => sum + val, 0);
  const percentageScore = ((totalScore / 50) * 100).toFixed(1);
  const isComplete = Object.keys(responses).length === 10;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Neck Disability Index (NDI)</CardTitle>
        <CardDescription>
          Please select the statement that best describes your condition today.
          {isComplete && (
            <span className="block mt-2 font-semibold text-foreground">
              Score: {totalScore}/50 ({percentageScore}%)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {NDI_QUESTIONS.map((question, qIndex) => (
          <div key={qIndex} className="space-y-3 rounded-lg border p-4">
            <Label className="text-base font-semibold">
              Section {qIndex + 1}: {question.section}
            </Label>
            <RadioGroup
              value={responses[qIndex]?.toString()}
              onValueChange={(value) => handleResponseChange(qIndex, value)}
            >
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-start space-x-3">
                  <RadioGroupItem value={oIndex.toString()} id={`ndi-${qIndex}-${oIndex}`} />
                  <Label
                    htmlFor={`ndi-${qIndex}-${oIndex}`}
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
