import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle } from "lucide-react";

export interface LimitationResolution {
  limitation: string;
  status: "fully_resolved" | "partially_resolved" | "not_resolved" | "worsened" | null;
}

interface FunctionalLimitationResolutionTrackerProps {
  intakeLimitations: string[];
  resolutions: LimitationResolution[];
  onChange: (resolutions: LimitationResolution[]) => void;
}

export function FunctionalLimitationResolutionTracker({
  intakeLimitations,
  resolutions,
  onChange,
}: FunctionalLimitationResolutionTrackerProps) {
  const handleStatusChange = (limitation: string, status: string) => {
    const updated = [...resolutions];
    const index = updated.findIndex((r) => r.limitation === limitation);
    
    if (index >= 0) {
      updated[index] = { limitation, status: status as LimitationResolution["status"] };
    } else {
      updated.push({ limitation, status: status as LimitationResolution["status"] });
    }
    
    onChange(updated);
  };

  const getStatus = (limitation: string): string => {
    const resolution = resolutions.find((r) => r.limitation === limitation);
    return resolution?.status || "";
  };

  if (!intakeLimitations || intakeLimitations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Functional Limitation Resolution</CardTitle>
          <CardDescription>
            No functional limitations were recorded at intake
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">No limitations to track</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Functional Limitation Resolution</CardTitle>
        <CardDescription>
          Rate the resolution status of each functional limitation from intake
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {intakeLimitations.map((limitation) => (
          <div key={limitation} className="space-y-3 pb-4 border-b last:border-0 last:pb-0">
            <Label className="text-base font-medium">{limitation}</Label>
            <RadioGroup
              value={getStatus(limitation)}
              onValueChange={(value) => handleStatusChange(limitation, value)}
              className="grid grid-cols-2 gap-3"
            >
              <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="fully_resolved" id={`${limitation}-fully`} />
                <Label
                  htmlFor={`${limitation}-fully`}
                  className="flex-1 cursor-pointer font-normal"
                >
                  Fully Resolved
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="partially_resolved" id={`${limitation}-partial`} />
                <Label
                  htmlFor={`${limitation}-partial`}
                  className="flex-1 cursor-pointer font-normal"
                >
                  Partially Resolved
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="not_resolved" id={`${limitation}-not`} />
                <Label
                  htmlFor={`${limitation}-not`}
                  className="flex-1 cursor-pointer font-normal"
                >
                  Not Resolved
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="worsened" id={`${limitation}-worse`} />
                <Label
                  htmlFor={`${limitation}-worse`}
                  className="flex-1 cursor-pointer font-normal"
                >
                  Worsened
                </Label>
              </div>
            </RadioGroup>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
