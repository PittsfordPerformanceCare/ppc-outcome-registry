import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOutcomeToolRecommendations, getPrimaryOutcomeTool, getMCIDValue } from "@/lib/outcomeToolRecommendations";
import { OutcomeToolRecommendations } from "@/components/OutcomeToolRecommendations";
import { IndexType } from "@/lib/ppcConfig";
import { Sparkles, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SmartOutcomeMeasureSelectorProps {
  region: string;
  diagnosis?: string;
  onRecommendationAccepted?: (tool: IndexType) => void;
  showFullDetails?: boolean;
}

export function SmartOutcomeMeasureSelector({ 
  region, 
  diagnosis,
  onRecommendationAccepted,
  showFullDetails = false
}: SmartOutcomeMeasureSelectorProps) {
  const [recommendations, setRecommendations] = useState<ReturnType<typeof getOutcomeToolRecommendations>>([]);
  const [primaryTool, setPrimaryTool] = useState<IndexType | null>(null);

  useEffect(() => {
    if (region) {
      const recs = getOutcomeToolRecommendations(region, diagnosis);
      setRecommendations(recs);
      setPrimaryTool(getPrimaryOutcomeTool(region, diagnosis));
    } else {
      setRecommendations([]);
      setPrimaryTool(null);
    }
  }, [region, diagnosis]);

  if (!region || recommendations.length === 0) {
    return null;
  }

  const handleAcceptRecommendation = () => {
    if (primaryTool && onRecommendationAccepted) {
      onRecommendationAccepted(primaryTool);
    }
  };

  if (!showFullDetails && primaryTool) {
    // Compact view - show just the primary recommendation
    const primary = recommendations[0];
    
    return (
      <Alert className="border-primary/50 bg-primary/5">
        <Sparkles className="h-4 w-4 text-primary" />
        <AlertTitle className="flex items-center gap-2">
          Smart Recommendation
          <Badge variant="default" className="text-xs">
            {primary.confidence === "high" ? "Highly Recommended" : "Recommended"}
          </Badge>
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <div>
            <span className="font-semibold text-foreground">{primary.toolName}</span>
            <span className="text-muted-foreground"> is recommended for {region} conditions</span>
          </div>
          <div className="text-xs text-muted-foreground">
            MCID: {getMCIDValue(primaryTool)} points • {primary.description}
          </div>
          {onRecommendationAccepted && (
            <Button 
              size="sm" 
              variant="default" 
              onClick={handleAcceptRecommendation}
              className="mt-2"
            >
              Use {primary.toolName}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Full details view
  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-primary" />
          Smart Outcome Measure Selection
        </CardTitle>
        <CardDescription>
          AI-powered recommendations based on evidence-based practice guidelines
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <OutcomeToolRecommendations 
          recommendations={recommendations}
          selectedTools={primaryTool ? [primaryTool] : []}
        />
        
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground mb-1">About MCID (Minimal Clinically Important Difference)</p>
              <p>
                MCID represents the smallest change in score that patients perceive as beneficial. 
                Changes exceeding MCID indicate clinically meaningful improvement.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
