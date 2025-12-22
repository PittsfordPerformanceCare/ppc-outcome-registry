import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function InterpretationSafetyPanel() {
  return (
    <Alert variant="default" className="bg-muted/50 border-primary/20">
      <AlertTriangle className="h-4 w-4 text-primary" />
      <AlertTitle className="text-sm font-semibold">Interpretation Safety Notice</AlertTitle>
      <AlertDescription className="mt-2">
        <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
          <li>All claims are derived from care-target–level analytics.</li>
          <li>Episode metrics are descriptive, not outcome-scored.</li>
          <li>MCID is an interpretive reference, not a universal threshold.</li>
          <li>This framework is preparatory and internal only.</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}
