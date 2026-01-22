import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { IndexType } from "@/lib/ppcConfig";
import { NDIForm } from "@/components/forms/NDIForm";
import { ODIForm } from "@/components/forms/ODIForm";
import { QuickDASHForm } from "@/components/forms/QuickDASHForm";
import { LEFSForm } from "@/components/forms/LEFSForm";
import { RPQForm } from "@/components/forms/RPQForm";

interface CollapsibleOutcomeMeasuresProps {
  episodeType: "MSK" | "Neurology" | "Performance";
  selectedIndices: IndexType[];
  baselineScores: Record<string, string>;
  formCompletionStatus: Record<string, boolean>;
  onIndexToggle: (index: IndexType, checked: boolean) => void;
  onScoreChange: (index: string, value: string, isComplete?: boolean) => void;
}

const OUTCOME_MEASURES: Record<IndexType, { name: string; description: string }> = {
  NDI: { name: "Neck Disability Index", description: "Cervical spine function" },
  ODI: { name: "Oswestry Disability Index", description: "Lumbar spine function" },
  QuickDASH: { name: "QuickDASH", description: "Upper extremity function" },
  LEFS: { name: "Lower Extremity Functional Scale", description: "Lower extremity function" },
  RPQ: { name: "Rivermead Post-Concussion Questionnaire", description: "Post-concussion symptoms" },
};

export function CollapsibleOutcomeMeasures({
  episodeType,
  selectedIndices,
  baselineScores,
  formCompletionStatus,
  onIndexToggle,
  onScoreChange,
}: CollapsibleOutcomeMeasuresProps) {
  const [expandedForms, setExpandedForms] = useState<Record<string, boolean>>({});

  const toggleExpand = (index: string) => {
    setExpandedForms(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const renderForm = (index: IndexType) => {
    const props = {
      onScoreChange: (score: number, isComplete?: boolean) => 
        onScoreChange(index, score.toString(), isComplete),
      initialScore: parseFloat(baselineScores[index] || "0"),
    };

    switch (index) {
      case "NDI":
        return <NDIForm {...props} />;
      case "ODI":
        return <ODIForm {...props} />;
      case "QuickDASH":
        return <QuickDASHForm {...props} />;
      case "LEFS":
        return <LEFSForm {...props} />;
      case "RPQ":
        return <RPQForm onScoreChange={(score) => onScoreChange("RPQ", score.toString())} initialScore={props.initialScore} />;
      default:
        return null;
    }
  };

  const availableIndices: IndexType[] = episodeType === "Neurology" 
    ? ["RPQ"] 
    : ["NDI", "ODI", "QuickDASH", "LEFS"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outcome Measures</CardTitle>
        <CardDescription>
          Complete baseline assessments. Forms can be expanded and saved with the episode.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableIndices.map((index) => {
          const isSelected = selectedIndices.includes(index);
          const isComplete = formCompletionStatus[index] === true;
          const isExpanded = expandedForms[index] ?? isSelected;
          const measure = OUTCOME_MEASURES[index];
          const isRequired = episodeType === "Neurology" && index === "RPQ";

          return (
            <div key={index} className="border rounded-lg">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={index}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      onIndexToggle(index, checked as boolean);
                      if (checked) {
                        setExpandedForms(prev => ({ ...prev, [index]: true }));
                      }
                    }}
                    disabled={isRequired}
                  />
                  <div>
                    <Label htmlFor={index} className="font-medium cursor-pointer">
                      {measure.name}
                      {isRequired && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <p className="text-sm text-muted-foreground">{measure.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isComplete && (
                    <Badge variant="default" className="bg-green-600 gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Complete
                    </Badge>
                  )}
                  {isSelected && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(index)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {isSelected && (
                <Collapsible open={isExpanded}>
                  <CollapsibleContent>
                    <div className="border-t p-4">
                      {renderForm(index)}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          );
        })}

        {selectedIndices.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Select at least one outcome measure to continue
          </p>
        )}
      </CardContent>
    </Card>
  );
}
