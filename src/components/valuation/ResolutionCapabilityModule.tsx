import { NarrativeModule } from "./NarrativeModule";

export function ResolutionCapabilityModule() {
  return (
    <NarrativeModule
      moduleNumber={2}
      title="Resolution as a System Capability"
      purpose="Explain why resolution rates are meaningful."
      crossReference={{
        phase6aModule: "Module B (Resolution & Completion)",
        phase5View: "analytics_care_target_outcomes (discharge_reason)",
      }}
      guardrail="Do not imply universal effectiveness."
    >
      <div className="space-y-4">
        <h4 className="font-semibold text-foreground">Resolution Patterns, Not Success Rates</h4>
        <p>
          PPC tracks <strong>resolution patterns</strong> rather than claiming "success rates." 
          Each care target discharge is coded with a specific reason, providing transparency 
          into how complaints concluded.
        </p>
        
        <h4 className="font-semibold text-foreground">Discharge Reason Coding</h4>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Goals Met:</strong> Patient achieved documented functional goals</li>
          <li><strong>Plateau:</strong> Maximum improvement reached; no further gains expected</li>
          <li><strong>Referral:</strong> Care transitioned to appropriate specialist</li>
          <li><strong>Patient Choice:</strong> Patient elected to discontinue care</li>
        </ul>
        
        <h4 className="font-semibold text-foreground">What This Demonstrates</h4>
        <p>
          Discharge reason distribution reveals system capability: the proportion of 
          care targets reaching goals versus those requiring alternative pathways. 
          This is a <strong>descriptive measure of throughput quality</strong>, not 
          a claim of universal effectiveness.
        </p>
      </div>
    </NarrativeModule>
  );
}
