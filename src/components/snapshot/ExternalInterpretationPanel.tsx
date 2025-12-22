import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ExternalInterpretationPanel() {
  return (
    <Alert variant="default" className="bg-muted/50 border-primary/20">
      <AlertTriangle className="h-4 w-4 text-primary" />
      <AlertTitle className="text-sm font-semibold">Data Interpretation Notice</AlertTitle>
      <AlertDescription className="mt-2">
        <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
          <li>All metrics are aggregated from care-target–level baseline → discharge comparisons.</li>
          <li>Episode metrics are descriptive and do not average outcome scores.</li>
          <li>MCID is an interpretive reference and may vary by context.</li>
          <li>This snapshot is de-identified and not patient-level data.</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}
