import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  XCircle
} from "lucide-react";
import type { IntakeBulkValidationResult, ValidatedIntake, IntakeValidationIssue } from "@/lib/bulkIntakeValidation";

interface ValidationSummaryPanelProps {
  validationResult: IntakeBulkValidationResult;
  excludedIds?: Set<string>;
  onToggleExclude?: (intakeId: string) => void;
}

export function ValidationSummaryPanel({ 
  validationResult, 
  excludedIds = new Set(), 
  onToggleExclude 
}: ValidationSummaryPanelProps) {
  const getIssueSeverityIcon = (severity: IntakeValidationIssue["severity"]) => {
    switch (severity) {
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getIssueSeverityColor = (severity: IntakeValidationIssue["severity"]) => {
    switch (severity) {
      case "error":
        return "text-destructive";
      case "warning":
        return "text-amber-600";
      case "info":
        return "text-blue-600";
    }
  };

  const getIntakeStatusBadge = (intake: ValidatedIntake) => {
    if (!intake.canConvert) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Cannot Convert
        </Badge>
      );
    }
    
    const hasWarnings = intake.issues.some(i => i.severity === "warning");
    if (hasWarnings) {
      return (
        <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
          <AlertTriangle className="h-3 w-3" />
          Review Required
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
        <CheckCircle2 className="h-3 w-3" />
        Ready
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Validation Summary
        </CardTitle>
        <CardDescription>
          Review validation results before proceeding with conversion
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border p-3">
            <div className="text-2xl font-bold">{validationResult.totalSelected}</div>
            <div className="text-xs text-muted-foreground">Total Selected</div>
          </div>
          <div className="rounded-lg border p-3 border-green-500/20 bg-green-500/5">
            <div className="text-2xl font-bold text-green-600">
              {validationResult.validForConversion - excludedIds.size}
            </div>
            <div className="text-xs text-muted-foreground">Ready to Convert</div>
          </div>
          <div className="rounded-lg border p-3 border-amber-500/20 bg-amber-500/5">
            <div className="text-2xl font-bold text-amber-600">{validationResult.requiresReview}</div>
            <div className="text-xs text-muted-foreground">Need Review</div>
          </div>
          <div className="rounded-lg border p-3 border-muted/20 bg-muted/5">
            <div className="text-2xl font-bold text-muted-foreground">{excludedIds.size}</div>
            <div className="text-xs text-muted-foreground">Excluded</div>
          </div>
        </div>

        {/* Overall Status Alert */}
        {validationResult.validForConversion === 0 ? (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>No Intakes Ready for Conversion</AlertTitle>
            <AlertDescription>
              All selected intakes have validation errors that must be resolved before conversion.
            </AlertDescription>
          </Alert>
        ) : validationResult.requiresReview > 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Review Required</AlertTitle>
            <AlertDescription>
              Some intakes have warnings or potential issues. You can proceed, but review is recommended.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600">All Intakes Valid</AlertTitle>
            <AlertDescription className="text-green-600">
              All selected intakes passed validation and are ready for conversion.
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Detailed Intake List */}
        <div>
          <h3 className="font-semibold mb-3">Detailed Validation Results</h3>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {validationResult.validatedIntakes.map((intake, index) => {
                const isExcluded = excludedIds.has(intake.id);
                return (
                <Card 
                  key={intake.id} 
                  className={`transition-opacity ${
                    intake.canConvert ? "" : "border-destructive"
                  } ${isExcluded ? "opacity-50" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      {onToggleExclude && intake.canConvert && (
                        <Checkbox
                          checked={!isExcluded}
                          onCheckedChange={() => onToggleExclude(intake.id)}
                          className="mt-1"
                        />
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-base">{intake.patient_name}</CardTitle>
                        <CardDescription className="text-xs">
                          Access Code: {intake.access_code}
                        </CardDescription>
                      </div>
                      {getIntakeStatusBadge(intake)}
                    </div>
                  </CardHeader>
                  {intake.issues.length > 0 && (
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {intake.issues.map((issue, issueIndex) => (
                          <div
                            key={issueIndex}
                            className="flex items-start gap-2 text-sm"
                          >
                            {getIssueSeverityIcon(issue.severity)}
                            <div className="flex-1">
                              <span className={getIssueSeverityColor(issue.severity)}>
                                {issue.message}
                              </span>
                              {issue.field && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({issue.field})
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
              })}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
