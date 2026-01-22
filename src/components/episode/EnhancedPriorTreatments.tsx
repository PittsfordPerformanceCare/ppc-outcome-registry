import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PriorTreatmentSelector, type PriorTreatment } from "@/components/PriorTreatmentSelector";

const COMMON_TREATMENTS = [
  "Physical Therapy",
  "Chiropractic",
  "Massage",
  "Acupuncture",
  "Injections",
  "Medications",
  "Rest",
  "Ice/Heat",
  "Stretching",
  "Exercise",
  "Bracing",
  "Surgery",
] as const;

interface EnhancedPriorTreatmentsProps {
  region: string;
  priorTreatments: PriorTreatment[];
  priorTreatmentsOther: string;
  onPriorTreatmentsChange: (data: { prior_treatments: PriorTreatment[]; prior_treatments_other: string }) => void;
  helpfulTreatments: string[];
  onHelpfulTreatmentsChange: (treatments: string[]) => void;
  worseningFactors: string;
  onWorseningFactorsChange: (value: string) => void;
}

export function EnhancedPriorTreatments({
  region,
  priorTreatments,
  priorTreatmentsOther,
  onPriorTreatmentsChange,
  helpfulTreatments,
  onHelpfulTreatmentsChange,
  worseningFactors,
  onWorseningFactorsChange,
}: EnhancedPriorTreatmentsProps) {
  const toggleHelpful = (treatment: string) => {
    if (helpfulTreatments.includes(treatment)) {
      onHelpfulTreatmentsChange(helpfulTreatments.filter(t => t !== treatment));
    } else {
      onHelpfulTreatmentsChange([...helpfulTreatments, treatment]);
    }
  };

  // Get all selected treatment names
  const selectedTreatmentNames = priorTreatments.map(t => t.name);

  return (
    <div className="space-y-6">
      <PriorTreatmentSelector
        region={region}
        initialTreatments={priorTreatments}
        initialOther={priorTreatmentsOther}
        onChange={onPriorTreatmentsChange}
      />

      {selectedTreatmentNames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What has been helpful?</CardTitle>
            <CardDescription>
              Select the treatments that provided relief
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {selectedTreatmentNames.map((name) => {
                const isHelpful = helpfulTreatments.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleHelpful(name)}
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors hover:bg-accent ${
                      isHelpful
                        ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                        : "bg-background border-border"
                    }`}
                  >
                    {isHelpful ? "✓ " : ""}
                    {name}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <Label htmlFor="worseningFactors">What made it worse? (optional)</Label>
              <Input
                id="worseningFactors"
                placeholder="Activities, movements, or factors that aggravate the condition"
                value={worseningFactors}
                onChange={(e) => onWorseningFactorsChange(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
