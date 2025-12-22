import { NarrativeModule } from "./NarrativeModule";

export function TimeEfficiencyModule() {
  return (
    <NarrativeModule
      moduleNumber={3}
      title="Time-to-Resolution as Operational Efficiency"
      purpose="Translate time metrics into operational value."
      crossReference={{
        phase6aModule: "Module C (Time-to-Resolution)",
        phase5View: "analytics_care_target_outcomes (duration_to_resolution_days)",
      }}
      guardrail="No absolute benchmarks or guarantees."
    >
      <div className="space-y-4">
        <h4 className="font-semibold text-foreground">Median Time-to-Resolution</h4>
        <p>
          PPC measures time-to-resolution at the <strong>care target level</strong>, 
          tracking days from baseline assessment to discharge. Median is used as the 
          primary measure to avoid skew from outliers.
        </p>
        
        <h4 className="font-semibold text-foreground">Predictability Through Distribution</h4>
        <p>
          The interquartile range (IQR) provides visibility into resolution predictability. 
          A narrow IQR indicates consistent resolution timelines; a wide IQR suggests 
          natural variation based on complaint complexity.
        </p>
        
        <h4 className="font-semibold text-foreground">Efficiency, Not Speed</h4>
        <p>
          Time metrics demonstrate <strong>operational efficiency</strong>—the ability to 
          resolve complaints in a reasonable, predictable timeframe. This is not a claim 
          of "fastest care" but evidence of system throughput capability.
        </p>
        
        <h4 className="font-semibold text-foreground">Domain Breakdown</h4>
        <p>
          Resolution times are segmented by domain (MSK, Neuro) and body region where 
          available, allowing appropriate context for different complaint types.
        </p>
      </div>
    </NarrativeModule>
  );
}
