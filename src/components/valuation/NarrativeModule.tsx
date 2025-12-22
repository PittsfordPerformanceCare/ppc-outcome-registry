import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

interface CrossReference {
  phase6aModule: string;
  phase5View: string;
}

interface NarrativeModuleProps {
  moduleNumber: number;
  title: string;
  purpose: string;
  children: ReactNode;
  crossReference: CrossReference;
  guardrail: string;
}

export function NarrativeModule({
  moduleNumber,
  title,
  purpose,
  children,
  crossReference,
  guardrail,
}: NarrativeModuleProps) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs font-mono">
            Module {moduleNumber}
          </Badge>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground italic">{purpose}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none text-foreground">
          {children}
        </div>
        
        <div className="border-t pt-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-muted/50 rounded p-2">
              <span className="font-medium text-muted-foreground">Phase 6A Reference:</span>
              <p className="text-foreground">{crossReference.phase6aModule}</p>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <span className="font-medium text-muted-foreground">Phase 5 Source:</span>
              <p className="text-foreground">{crossReference.phase5View}</p>
            </div>
          </div>
          
          <div className="bg-amber-500/10 border border-amber-500/20 rounded p-2">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Guardrail:</span>
            <p className="text-xs text-amber-700 dark:text-amber-300">{guardrail}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
