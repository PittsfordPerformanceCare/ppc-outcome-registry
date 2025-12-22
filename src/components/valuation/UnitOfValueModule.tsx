import { NarrativeModule } from "./NarrativeModule";

export function UnitOfValueModule() {
  return (
    <NarrativeModule
      moduleNumber={1}
      title="What PPC Actually Measures (Unit of Value)"
      purpose="Reframe the business from 'episodes completed' to problems resolved."
      crossReference={{
        phase6aModule: "Module A (Volume & Throughput) — Care Targets Discharged",
        phase5View: "analytics_care_target_outcomes",
      }}
      guardrail="No claims of superiority without data reference."
    >
      <div className="space-y-4">
        <h4 className="font-semibold text-foreground">Care Target as Primary Analytic Unit</h4>
        <p>
          PPC measures outcomes at the <strong>care target level</strong>, not the episode level. 
          Each care target represents a specific patient complaint or functional limitation 
          tracked from baseline assessment through discharge.
        </p>
        
        <h4 className="font-semibold text-foreground">Why This Matters</h4>
        <p>
          Traditional episode-based systems aggregate multiple complaints into a single 
          outcome measure, obscuring which problems actually improved. PPC's care-target 
          architecture provides granular visibility into resolution at the complaint level.
        </p>
        
        <h4 className="font-semibold text-foreground">Measurement Methodology</h4>
        <p>
          Outcomes are measured <strong>baseline → discharge per complaint</strong> using 
          validated instruments (NDI, ODI, QuickDASH, LEFS). Each care target maintains 
          its own outcome trajectory, enabling precise attribution of improvement.
        </p>
      </div>
    </NarrativeModule>
  );
}
