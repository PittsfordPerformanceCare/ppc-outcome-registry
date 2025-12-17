import { Separator } from "@/components/ui/separator";

interface Timepoint {
  label: string;
  date: string;
  score: number;
  context: string;
  clinically_indicated?: boolean;
}

interface Instrument {
  instrument_key: string;
  instrument_name: string;
  domain: string;
  timepoints: Timepoint[];
}

interface OutcomeAnalyticsMultiInstrumentLayerProps {
  episode_id?: string;
  is_sample?: boolean;
  instruments: Instrument[];
}

const InstrumentSection = ({ instrument }: { instrument: Instrument }) => {
  // Filter timepoints: intake and discharge are required, interim is optional
  const intakeTimepoint = instrument.timepoints.find(
    t => t.label.toLowerCase().includes("intake") || t.label.toLowerCase().includes("baseline")
  );
  const dischargeTimepoint = instrument.timepoints.find(
    t => t.label.toLowerCase().includes("discharge")
  );
  const interimTimepoint = instrument.timepoints.find(
    t => t.label.toLowerCase().includes("interim") && t.clinically_indicated
  );

  // Build display timepoints in order
  const displayTimepoints: Timepoint[] = [];
  if (intakeTimepoint) displayTimepoints.push(intakeTimepoint);
  if (interimTimepoint) displayTimepoints.push(interimTimepoint);
  if (dischargeTimepoint) displayTimepoints.push(dischargeTimepoint);

  return (
    <div className="mb-10">
      {/* Instrument Header */}
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        {instrument.instrument_name}
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        Domain: {instrument.domain}
      </p>

      {/* Instrument Overview */}
      <p className="text-slate-700 leading-relaxed mb-4 text-sm">
        This instrument is used to observe change in condition-specific symptom burden or functional limitation across the episode of care. Scores are interpreted in clinical context and are not used as thresholds for clearance, discharge, or continuation of care.
      </p>

      {/* Analytics Table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border border-slate-200 rounded-lg">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b border-slate-200">Timepoint</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b border-slate-200">Score</th>
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

      {/* Instrument-Specific Interpretation Boundary */}
      <p className="text-slate-600 text-xs leading-relaxed">
        Observed changes reflect patient-reported or functional status at specific timepoints and are interpreted alongside clinical examination and functional tolerance.
      </p>
    </div>
  );
};

const OutcomeAnalytics_MultiInstrumentLayer = ({ 
  instruments, 
  is_sample = false 
}: OutcomeAnalyticsMultiInstrumentLayerProps) => {
  const hasMultipleInstruments = instruments.length > 1;

  return (
    <section className="mb-10">
      {/* Section Header */}
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Outcome Analytics – Episode Overview
      </h2>

      {/* Introductory Framing */}
      <div className="mb-8">
        <p className="text-slate-700 leading-relaxed mb-4">
          This section provides episode-level outcome analytics using validated clinical instruments.
        </p>
        <p className="text-slate-700 leading-relaxed mb-4">
          Outcome measures are collected at clinically meaningful milestones — most commonly at intake and discharge — with interim reassessment performed only when recovery trajectory is unclear or deviates from expectations.
        </p>
        <p className="text-slate-700 leading-relaxed">
          Outcome data is used to contextualize recovery and support clinical discussion. It does not replace individualized clinical judgment or define care decisions.
        </p>
      </div>

      <Separator className="my-8" />

      {/* Instrument Sections */}
      {instruments.map((instrument, index) => (
        <div key={instrument.instrument_key}>
          <InstrumentSection instrument={instrument} />
          {index < instruments.length - 1 && <Separator className="my-8" />}
        </div>
      ))}

      {/* Cross-Instrument Interpretation Block (only if multiple instruments) */}
      {hasMultipleInstruments && (
        <>
          <Separator className="my-8" />
          <div className="mb-8">
            <h3 className="text-base font-semibold text-slate-900 mb-3">
              Integrated Clinical Context
            </h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              When multiple outcome instruments are used within an episode, they are interpreted together to provide a broader view of recovery across symptom, functional, and neurologic domains.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Differences in recovery timing between instruments are expected and do not imply incomplete recovery or readiness in isolation.
            </p>
          </div>
        </>
      )}

      {/* Functional Readiness Boundary */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-slate-900 mb-3">
          Relation to Functional Readiness
        </h3>
        <p className="text-slate-700 leading-relaxed">
          Outcome analytics may precede, follow, or occur independently of functional readiness. Decisions regarding return to learn, return to play, return to work, or discharge are based on clinical presentation, functional tolerance, and shared decision-making — not outcome scores alone.
        </p>
      </div>

      {/* Footer Interpretation Safeguard */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50/50">
        <h3 className="text-base font-semibold text-slate-900 mb-3">
          Important Interpretation Note
        </h3>
        <p className="text-slate-700 leading-relaxed mb-4">
          Outcome analytics are descriptive and contextual. They are not predictive, comparative, or prescriptive.
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

export default OutcomeAnalytics_MultiInstrumentLayer;
