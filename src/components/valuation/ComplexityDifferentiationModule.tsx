import { NarrativeModule } from "./NarrativeModule";

export function ComplexityDifferentiationModule() {
  return (
    <NarrativeModule
      moduleNumber={4}
      title="Complexity as Differentiation"
      purpose="Turn complexity into an asset."
      crossReference={{
        phase6aModule: "Module E (Multi-Complaint Complexity)",
        phase5View: "analytics_episode_summary (staggered_resolution, number_of_care_targets)",
      }}
      guardrail="Descriptive only; no performance grading."
    >
      <div className="space-y-4">
        <h4 className="font-semibold text-foreground">Multi-Care-Target Episodes</h4>
        <p>
          A significant portion of PPC episodes involve <strong>multiple care targets</strong>—
          patients presenting with more than one complaint or functional limitation. This 
          reflects real-world patient complexity.
        </p>
        
        <h4 className="font-semibold text-foreground">Staggered Resolution as Intelligence</h4>
        <p>
          Multi-target episodes often exhibit <strong>staggered resolution</strong>: care 
          targets discharge at different times based on individual improvement trajectories. 
          This is not a system limitation—it's evidence of intelligent, complaint-specific 
          management.
        </p>
        
        <h4 className="font-semibold text-foreground">Independent Problem Resolution</h4>
        <p>
          PPC's architecture enables each complaint within an episode to be:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Tracked with its own outcome instrument</li>
          <li>Discharged when appropriate (not forced to wait for other targets)</li>
          <li>Analyzed independently without signal contamination</li>
        </ul>
        
        <h4 className="font-semibold text-foreground">Why This Is Valuable</h4>
        <p>
          Systems that collapse multi-complaint episodes into single scores lose visibility 
          into partial success. PPC preserves this granularity, making complex cases 
          <strong>analytically tractable</strong> rather than opaque.
        </p>
      </div>
    </NarrativeModule>
  );
}
