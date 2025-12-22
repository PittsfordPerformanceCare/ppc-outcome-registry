import { NarrativeModule } from "./NarrativeModule";

export function ScalabilityModule() {
  return (
    <NarrativeModule
      moduleNumber={6}
      title="Why This Scales (Without Workflow Inflation)"
      purpose="Tie analytics rigor to scalability."
      crossReference={{
        phase6aModule: "All Modules (Read-Only Enforcement)",
        phase5View: "All Phase 5 Views (Derived Post-Hoc)",
      }}
      guardrail="Do not claim automation beyond what exists."
    >
      <div className="space-y-4">
        <h4 className="font-semibold text-foreground">No Added Clinician Burden</h4>
        <p>
          PPC's analytics layer is <strong>read-only and non-mutating</strong>. Clinicians 
          interact with the clinical workflow; analytics are derived post-hoc from governed 
          lifecycle events. There is no additional documentation burden.
        </p>
        
        <h4 className="font-semibold text-foreground">No Patient-Facing Complexity</h4>
        <p>
          All Phase 5 and Phase 6 analytics are <strong>internal only</strong>. Patients 
          experience the care workflow; they do not see or interact with registry views 
          or leadership dashboards.
        </p>
        
        <h4 className="font-semibold text-foreground">Analytics Derived from Governed Lifecycle</h4>
        <p>
          Every metric in the dashboard traces back to governed lifecycle events:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Care target creation</li>
          <li>Baseline assessment capture</li>
          <li>Discharge events with reason coding</li>
          <li>Discharge assessment capture</li>
        </ul>
        
        <h4 className="font-semibold text-foreground">Scalability Through Architecture</h4>
        <p>
          Because analytics are derived rather than manually reported, the system scales 
          with volume. More episodes produce more data without proportional administrative 
          overhead. The governance framework ensures data quality remains consistent 
          regardless of scale.
        </p>
        
        <h4 className="font-semibold text-foreground">Research Packaging Ready</h4>
        <p>
          This architecture positions the registry for future research packaging (Phase 7) 
          without requiring data restructuring or backfilling.
        </p>
      </div>
    </NarrativeModule>
  );
}
