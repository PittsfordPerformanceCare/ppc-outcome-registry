import { Separator } from "@/components/ui/separator";

interface Timepoint {
  label: string;
  date: string;
  score: number;
  context: string;
  clinically_indicated?: boolean;
}

interface OutcomeAnalyticsRPQProps {
  episode_id?: string;
  timepoints: Timepoint[];
  is_sample?: boolean;
}

const OutcomeAnalytics_RPQ = ({ timepoints, is_sample = false }: OutcomeAnalyticsRPQProps) => {
  // Filter timepoints: intake and discharge are required, interim is optional
  const intakeTimepoint = timepoints.find(t => t.label.toLowerCase().includes("intake") || t.label.toLowerCase().includes("baseline"));
  const dischargeTimepoint = timepoints.find(t => t.label.toLowerCase().includes("discharge"));
  const interimTimepoint = timepoints.find(t => t.label.toLowerCase().includes("interim") && t.clinically_indicated);

  // Build display timepoints in order
  const displayTimepoints: Timepoint[] = [];
  if (intakeTimepoint) displayTimepoints.push(intakeTimepoint);
  if (interimTimepoint) displayTimepoints.push(interimTimepoint);
  if (dischargeTimepoint) displayTimepoints.push(dischargeTimepoint);

  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-slate-900 mb-2">
        Outcome Analytics
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        Rivermead Post-Concussion Symptoms Questionnaire (RPQ)
      </p>

      {/* Outcome Measure Overview */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-slate-900 mb-3">Outcome Measure Overview</h3>
        <p className="text-slate-700 leading-relaxed mb-4">
          The Rivermead Post-Concussion Symptoms Questionnaire (RPQ) is a validated patient-reported outcome measure used to characterize post-concussive symptom burden across physical, cognitive, and emotional domains.
        </p>
        <p className="text-slate-700 leading-relaxed">
          Within PPC's episode-based concussion care framework, RPQ data is used to contextualize symptom trajectory over time, not to determine eligibility, clearance, or care duration.
        </p>
      </div>

      {/* Outcome Assessment Cadence */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-slate-900 mb-3">Outcome Assessment Cadence</h3>
        <p className="text-slate-700 leading-relaxed mb-4">
          Outcome measures are collected at clinically meaningful milestones within an episode of care, most commonly at intake and discharge.
        </p>
        <p className="text-slate-700 leading-relaxed">
          Interim reassessment may be performed only when recovery trajectory is unclear, plateaus, or deviates from expectations. Outcome measures are not collected at every visit.
        </p>
      </div>

      {/* Analytics Display Table */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-slate-900 mb-3">RPQ Tracking Across Episode of Care</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-200 rounded-lg">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b border-slate-200">Timepoint</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b border-slate-200">RPQ Total Score</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b border-slate-200">Clinical Context</th>
              </tr>
            </thead>
            <tbody>
              {displayTimepoints.map((timepoint, index) => {
                const isInterim = timepoint.label.toLowerCase().includes("interim");
                const isLast = index === displayTimepoints.length - 1;
                
                return (
                  <tr 
                    key={timepoint.label} 
                    className={`${!isLast ? 'border-b border-slate-100' : ''} ${isInterim ? 'bg-slate-50/50' : ''}`}
                  >
                    <td className="px-4 py-3 text-slate-700">
                      {timepoint.label}
                      {isInterim && timepoint.clinically_indicated && (
                        <span className="block text-xs text-slate-500">(clinically indicated)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{timepoint.score}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{timepoint.context}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {is_sample && (
          <p className="text-xs text-slate-500 mt-3">
            Scores shown are example data for illustrative purposes only.
          </p>
        )}
      </div>

      {/* Observed Trend Interpretation */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-slate-900 mb-3">Observed Trend Interpretation</h3>
        <p className="text-slate-700 leading-relaxed mb-4">
          Across this episode, RPQ scores reflect change in overall symptom burden between intake and discharge.
        </p>
        <p className="text-slate-700 leading-relaxed mb-4">
          Interim reassessment, when performed, is used to clarify recovery trajectory and support clinical understanding, not to gate care or define thresholds.
        </p>
        <p className="text-slate-700 leading-relaxed">
          RPQ data is interpreted alongside clinical examination, functional tolerance, and patient presentation, and does not replace individualized clinical judgment.
        </p>
      </div>

      {/* Relation to Functional Readiness */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-slate-900 mb-3">Relation to Functional Readiness</h3>
        <p className="text-slate-700 leading-relaxed mb-4">
          Changes in RPQ score may precede, follow, or occur independently of functional readiness.
        </p>
        <p className="text-slate-700 leading-relaxed">
          Return-to-learn and return-to-play decisions are based on clinical presentation, functional tolerance, and shared decision-making. Outcome data informs discussion but does not determine clearance.
        </p>
      </div>

      {/* Interpretation Boundary Footer */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50/50">
        <h3 className="text-base font-semibold text-slate-900 mb-3">Important Interpretation Note</h3>
        <p className="text-slate-700 leading-relaxed mb-4">
          RPQ scores are descriptive and contextual. They are not predictive and are not intended to serve as thresholds, benchmarks, or clearance criteria.
        </p>
        {is_sample && (
          <p className="text-slate-600 leading-relaxed text-sm">
            Sample shown is illustrative only. No patient-identifiable data are included.
          </p>
        )}
      </div>
    </section>
  );
};

export default OutcomeAnalytics_RPQ;
