import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InterpretationSafetyPanel } from "@/components/valuation/InterpretationSafetyPanel";
import { UnitOfValueModule } from "@/components/valuation/UnitOfValueModule";
import { ResolutionCapabilityModule } from "@/components/valuation/ResolutionCapabilityModule";
import { TimeEfficiencyModule } from "@/components/valuation/TimeEfficiencyModule";
import { ComplexityDifferentiationModule } from "@/components/valuation/ComplexityDifferentiationModule";
import { DataIntegrityAssetModule } from "@/components/valuation/DataIntegrityAssetModule";
import { ScalabilityModule } from "@/components/valuation/ScalabilityModule";
import { Shield, FileText, Lock } from "lucide-react";

export default function ValuationNarrativePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Phase 6C — Valuation Narrative Framework
              </h1>
              <p className="text-muted-foreground">
                Care-Target Intelligence • Governance-Aligned • Analytics-Backed
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              Internal Only
            </Badge>
            <Badge variant="outline">Read-Only</Badge>
            <Badge variant="outline">Non-Promotional</Badge>
            <Badge variant="outline">Evidence-Bound</Badge>
          </div>
        </div>

        <InterpretationSafetyPanel />

        <Separator />

        {/* Purpose Statement */}
        <div className="bg-muted/30 rounded-lg p-6 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Framework Purpose</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            This framework translates PPC's verified analytics into defensible strategic 
            claims for valuation, diligence, and payer conversations. Every claim maps 
            directly to Phase 6A dashboard modules and Phase 5 registry views.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Use cases:</strong> Leadership briefings, investor conversations, 
            payer negotiations, strategic planning, research packaging preparation.
          </p>
        </div>

        {/* Narrative Modules */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Narrative Modules
            <Badge variant="outline" className="text-xs">6 Modules</Badge>
          </h2>
          
          <div className="space-y-6">
            <UnitOfValueModule />
            <ResolutionCapabilityModule />
            <TimeEfficiencyModule />
            <ComplexityDifferentiationModule />
            <DataIntegrityAssetModule />
            <ScalabilityModule />
          </div>
        </div>

        <Separator />

        {/* Governance Alignment */}
        <div className="bg-primary/5 rounded-lg p-6 space-y-4">
          <h2 className="font-semibold">Governance Alignment</h2>
          <p className="text-sm text-muted-foreground">
            Phase 6C aligns with the following canonical governance documents:
          </p>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>• PPC Care Targets & Multi-Complaint Governance</li>
            <li>• PPC Care Target ↔ Outcome Association Rules</li>
            <li>• Phase 3 & Phase 4 Guardrail Enforcement</li>
            <li>• Phase 5 Analytics & Registry Governance</li>
            <li>• Phase 6A Leadership Dashboard Acceptance Criteria</li>
          </ul>
        </div>

        {/* Success Criteria */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold">Success Criteria</h2>
          <p className="text-sm text-muted-foreground">
            Phase 6C is successful if leadership can clearly articulate:
          </p>
          <ul className="text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              <span>What PPC resolves (and how it's measured)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span>Why care-target analytics matter economically</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span>How complexity becomes leverage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">4.</span>
              <span>Why the data is diligence-ready</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">5.</span>
              <span>How research packaging can follow without rework</span>
            </li>
          </ul>
        </div>

        {/* Footer Notice */}
        <div className="text-center text-xs text-muted-foreground py-4">
          <p>Phase 6C — Canonical / Locked</p>
          <p>This framework is preparatory and internal. No external publishing permitted.</p>
        </div>
      </div>
    </div>
  );
}
