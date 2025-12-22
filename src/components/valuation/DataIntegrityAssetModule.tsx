import { NarrativeModule } from "./NarrativeModule";

export function DataIntegrityAssetModule() {
  return (
    <NarrativeModule
      moduleNumber={5}
      title="Data Integrity as an Asset"
      purpose="Position governance and symmetry as valuation-relevant IP."
      crossReference={{
        phase6aModule: "Module F (Data Quality & Integrity)",
        phase5View: "analytics_care_target_outcomes (outcome_integrity_status)",
      }}
      guardrail="Avoid 'AI' or 'predictive' claims unless explicitly supported."
    >
      <div className="space-y-4">
        <h4 className="font-semibold text-foreground">Outcome Symmetry Requirement</h4>
        <p>
          Every care target in the analytics registry requires <strong>baseline ↔ discharge 
          symmetry</strong>: both a starting assessment and an ending assessment using the 
          same validated instrument. This is a data governance rule, not a clinical judgment.
        </p>
        
        <h4 className="font-semibold text-foreground">Integrity Flags & Override Transparency</h4>
        <p>
          Care targets that cannot achieve full symmetry are flagged with explicit integrity 
          status. Overrides are permitted but documented, ensuring:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Complete auditability of the registry</li>
          <li>Transparency about data quality</li>
          <li>Ability to filter analytics by integrity status</li>
        </ul>
        
        <h4 className="font-semibold text-foreground">Acceptance Verification Process</h4>
        <p>
          Phase 5 and Phase 6A implement formal acceptance criteria that must pass before 
          analytics are considered valid. This includes:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Primary analytic unit verification (care target, not episode)</li>
          <li>Source-of-truth enforcement (Phase 5 views only)</li>
          <li>Filter consistency across dashboard modules</li>
          <li>Export fidelity checks</li>
        </ul>
        
        <h4 className="font-semibold text-foreground">Diligence Readiness</h4>
        <p>
          This governance structure produces data that is <strong>auditable, reproducible, 
          and defensible</strong> for research, payor, and diligence conversations.
        </p>
      </div>
    </NarrativeModule>
  );
}
