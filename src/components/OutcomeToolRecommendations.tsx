import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { OutcomeToolRecommendation } from "@/lib/outcomeToolRecommendations";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface OutcomeToolRecommendationsProps {
  recommendations: OutcomeToolRecommendation[];
  selectedTools?: string[];
}

export function OutcomeToolRecommendations({ 
  recommendations,
  selectedTools = []
}: OutcomeToolRecommendationsProps) {
  const getConfidenceBadge = (confidence: "high" | "medium" | "low") => {
    const variants = {
      high: { variant: "default" as const, label: "Highly Recommended", icon: CheckCircle2 },
      medium: { variant: "secondary" as const, label: "Recommended", icon: Info },
      low: { variant: "outline" as const, label: "Optional", icon: AlertCircle }
    };
    
    const config = variants[confidence];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (recommendations.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No outcome tool recommendations available</p>
            <p className="text-xs mt-1">Please select a region first</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Recommended Outcome Measures
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                Recommendations are based on current evidence-based practice and 
                the patient's presenting region and diagnosis.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {recommendations.map((rec) => {
        const isSelected = selectedTools.includes(rec.tool);
        
        return (
          <Card 
            key={rec.tool}
            className={`transition-all ${
              isSelected 
                ? "border-primary bg-primary/5" 
                : rec.confidence === "high"
                ? "border-green-500/50 bg-green-500/5"
                : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-base">
                      {rec.toolName}
                      {isSelected && (
                        <CheckCircle2 className="inline-block ml-2 h-4 w-4 text-primary" />
                      )}
                    </h4>
                  </div>
                  <Badge variant="outline" className="text-xs mb-2">
                    {rec.targetArea}
                  </Badge>
                </div>
                {getConfidenceBadge(rec.confidence)}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {rec.description}
              </p>
              
              <div className="flex items-start gap-2 text-xs text-primary mt-2 p-2 bg-primary/5 rounded">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{rec.reason}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
