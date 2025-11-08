import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface ODIFormProps {
  onScoreChange: (score: number) => void;
  initialScore?: number;
}

const ODI_QUESTIONS = [
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
      "I do not get dressed, I wash with difficulty and stay in bed",
    ],
  },
  {
    section: "Lifting",
    options: [
      "I can lift heavy weights without extra pain",
      "I can lift heavy weights but it gives extra pain",
      "Pain prevents me from lifting heavy weights off the floor, but I can manage if they are conveniently positioned",
      "Pain prevents me from lifting heavy weights, but I can manage light to medium weights if they are conveniently positioned",
      "I can lift very light weights",
      "I cannot lift or carry anything at all",
    ],
  },
  {
    section: "Walking",
    options: [
      "Pain does not prevent me walking any distance",
      "Pain prevents me from walking more than 1 mile",
      "Pain prevents me from walking more than 1/2 mile",
      "Pain prevents me from walking more than 1/4 mile",
      "I can only walk using a stick or crutches",
      "I am in bed most of the time and have to crawl to the toilet",
    ],
  },
  {
    section: "Sitting",
    options: [
      "I can sit in any chair as long as I like",
      "I can only sit in my favorite chair as long as I like",
      "Pain prevents me sitting more than one hour",
      "Pain prevents me from sitting more than 30 minutes",
      "Pain prevents me from sitting more than 10 minutes",
      "Pain prevents me from sitting at all",
    ],
  },
  {
    section: "Standing",
    options: [
      "I can stand as long as I want without extra pain",
      "I can stand as long as I want but it gives me extra pain",
      "Pain prevents me from standing for more than 1 hour",
      "Pain prevents me from standing for more than 30 minutes",
      "Pain prevents me from standing for more than 10 minutes",
      "Pain prevents me from standing at all",
    ],
  },
  {
    section: "Sleeping",
    options: [
      "My sleep is never disturbed by pain",
      "My sleep is occasionally disturbed by pain",
      "Because of pain I have less than 6 hours sleep",
      "Because of pain I have less than 4 hours sleep",
      "Because of pain I have less than 2 hours sleep",
      "Pain prevents me from sleeping at all",
    ],
  },
  {
    section: "Sex Life (if applicable)",
    options: [
      "My sex life is normal and causes no extra pain",
      "My sex life is normal but causes some extra pain",
      "My sex life is nearly normal but is very painful",
      "My sex life is severely restricted by pain",
      "My sex life is nearly absent because of pain",
      "Pain prevents any sex life at all",
    ],
  },
  {
    section: "Social Life",
    options: [
      "My social life is normal and gives me no extra pain",
      "My social life is normal but increases the degree of pain",
      "Pain has no significant effect on my social life apart from limiting my more energetic interests",
      "Pain has restricted my social life and I do not go out as often",
      "Pain has restricted my social life to my home",
      "I have no social life because of pain",
    ],
  },
  {
    section: "Traveling",
    options: [
      "I can travel anywhere without pain",
      "I can travel anywhere but it gives me extra pain",
      "Pain is bad but I manage journeys over two hours",
      "Pain restricts me to journeys of less than one hour",
      "Pain restricts me to short necessary journeys under 30 minutes",
      "Pain prevents me from traveling except to receive treatment",
    ],
  },
];

export function ODIForm({ onScoreChange, initialScore }: ODIFormProps) {
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
        <CardTitle>Oswestry Disability Index (ODI)</CardTitle>
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
        {ODI_QUESTIONS.map((question, qIndex) => (
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
                  <RadioGroupItem value={oIndex.toString()} id={`odi-${qIndex}-${oIndex}`} />
                  <Label
                    htmlFor={`odi-${qIndex}-${oIndex}`}
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
