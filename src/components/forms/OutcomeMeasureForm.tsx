import { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { InstrumentDefinition } from "@/lib/outcomeInstruments";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface OutcomeMeasureFormProps {
  instrument: InstrumentDefinition;
  onComplete: (data: {
    score: number;
    responses: Map<number, number | null>;
    isValid: boolean;
    interpretation: string;
  }) => void;
  onScoreChange?: (score: number, isComplete?: boolean) => void;
  initialResponses?: Map<number, number | null>;
  readOnly?: boolean;
}

export function OutcomeMeasureForm({
  instrument,
  onComplete,
  onScoreChange,
  initialResponses,
  readOnly = false,
}: OutcomeMeasureFormProps) {
  const [responses, setResponses] = useState<Map<number, number | null>>(
    initialResponses || new Map()
  );
  const [skippedQuestions, setSkippedQuestions] = useState<Set<number>>(new Set());

  const calculateCurrentScore = useCallback(() => {
    return instrument.calculateScore(responses);
  }, [instrument, responses]);

  useEffect(() => {
    const result = calculateCurrentScore();
    onScoreChange?.(result.score, result.isValid);
  }, [responses, calculateCurrentScore, onScoreChange]);

  const handleResponseChange = (questionNumber: number, value: number) => {
    if (readOnly) return;
    
    const newResponses = new Map(responses);
    newResponses.set(questionNumber, value);
    setResponses(newResponses);

    // Remove from skipped if answered
    const newSkipped = new Set(skippedQuestions);
    newSkipped.delete(questionNumber);
    setSkippedQuestions(newSkipped);
  };

  const handleSkipQuestion = (questionNumber: number, isSkipped: boolean) => {
    if (readOnly) return;

    const newSkipped = new Set(skippedQuestions);
    const newResponses = new Map(responses);

    if (isSkipped) {
      newSkipped.add(questionNumber);
      newResponses.set(questionNumber, null);
    } else {
      newSkipped.delete(questionNumber);
      newResponses.delete(questionNumber);
    }

    setSkippedQuestions(newSkipped);
    setResponses(newResponses);
  };

  const handleSubmit = () => {
    const result = calculateCurrentScore();
    onComplete({
      score: result.score,
      responses,
      isValid: result.isValid,
      interpretation: result.interpretation,
    });
  };

  const currentResult = calculateCurrentScore();
  const answeredCount = currentResult.answeredCount;
  const progress = (answeredCount / instrument.totalItems) * 100;
  const canSubmit = currentResult.isValid;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{instrument.fullName}</CardTitle>
            <CardDescription className="mt-1">
              {instrument.description}
            </CardDescription>
          </div>
          <Badge variant={canSubmit ? "default" : "secondary"}>
            {answeredCount}/{instrument.totalItems} answered
          </Badge>
        </div>
        <div className="mt-4 space-y-2">
          <Progress value={progress} className="h-2" />
          {answeredCount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Current Score: <span className="font-semibold text-foreground">{currentResult.score} {instrument.scoreUnit}</span>
              </span>
              <span className="text-muted-foreground">{currentResult.interpretation}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {instrument.questions.map((question) => {
          const isSkipped = skippedQuestions.has(question.number);
          const currentValue = responses.get(question.number);
          const isAnswered = currentValue !== undefined && currentValue !== null;

          return (
            <div
              key={question.number}
              className={`space-y-3 rounded-lg border p-4 transition-colors ${
                isAnswered ? "border-primary/30 bg-primary/5" : isSkipped ? "border-muted bg-muted/30" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  {question.section ? (
                    <>
                      <span className="text-muted-foreground">Q{question.number}:</span>
                      {question.section}
                    </>
                  ) : (
                    <>
                      <span className="text-muted-foreground">{question.number}.</span>
                      {question.text}
                    </>
                  )}
                  {isAnswered && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </Label>
              </div>

              {question.section && (
                <p className="text-sm text-muted-foreground -mt-1">
                  {question.text}
                </p>
              )}

              {question.allowSkip && (
                <div className="flex items-center space-x-2 pb-2">
                  <Checkbox
                    id={`skip-${question.number}`}
                    checked={isSkipped}
                    onCheckedChange={(checked) =>
                      handleSkipQuestion(question.number, checked === true)
                    }
                    disabled={readOnly}
                  />
                  <Label
                    htmlFor={`skip-${question.number}`}
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    {question.skipLabel || "Prefer not to answer"}
                  </Label>
                </div>
              )}

              {!isSkipped && (
                <RadioGroup
                  value={currentValue?.toString() || ""}
                  onValueChange={(value) =>
                    handleResponseChange(question.number, parseInt(value))
                  }
                  disabled={readOnly}
                >
                  {question.options.map((option) => (
                    <div key={option.value} className="flex items-start space-x-3">
                      <RadioGroupItem
                        value={option.value.toString()}
                        id={`${instrument.code}-${question.number}-${option.value}`}
                      />
                      <Label
                        htmlFor={`${instrument.code}-${question.number}-${option.value}`}
                        className="font-normal cursor-pointer leading-relaxed"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          );
        })}

        {!readOnly && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              {!canSubmit && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    {instrument.minRequiredItems
                      ? `Please answer at least ${instrument.minRequiredItems} questions`
                      : "Please answer all questions to submit"}
                  </span>
                </div>
              )}
              {canSubmit && (
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Form is complete and ready to submit</span>
                </div>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full"
              size="lg"
            >
              Submit {instrument.name} Assessment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
