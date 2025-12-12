import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfessionalAccess } from "@/hooks/useProfessionalAccess";
import { getConditionBySlug } from "@/data/professionalOutcomes";
import {
  MetricCard,
  SuppressedMetric,
  TrajectoryChart,
  InterpretationBlock,
  GovernanceNote,
  DispositionChart,
} from "@/components/professional-portal";

const ProfessionalConditionView = () => {
  const { conditionSlug } = useParams<{ conditionSlug: string }>();
  const { isVerifiedProfessional, isAuthenticated, loading } = useProfessionalAccess();

  const condition = conditionSlug ? getConditionBySlug(conditionSlug) : null;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-10 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Access control: redirect unauthenticated or unverified users
  if (!isAuthenticated || !isVerifiedProfessional) {
    return (
      <Navigate
        to="/resources/professional-outcomes"
        state={{ accessDenied: true }}
        replace
      />
    );
  }

  // Condition not found
  if (!condition) {
    return (
      <Navigate to="/resources/professional-outcomes" replace />
    );
  }

  const { registrySnapshot, minCellSize } = condition;

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>{condition.name} | Professional Outcomes Portal | Pittsford Performance Care</title>
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-slate-200">
          <div className="container mx-auto px-4 py-6 lg:px-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/site/home" className="text-slate-500 hover:text-slate-700">
                      Home
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/resources/professional-outcomes" className="text-slate-500 hover:text-slate-700">
                      Professional Outcomes Portal
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-slate-900">{condition.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-8">
              <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight">
                {condition.name}
              </h1>
              <p className="mt-2 text-slate-500 text-sm">
                Aggregate outcomes derived from the PPC Outcome Registry
              </p>

              {/* Metadata Row */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                <span className="text-slate-600">
                  <span className="font-medium">{registrySnapshot.episodesIncluded}</span> episodes included
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">{condition.dataWindow}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">Updated {condition.lastUpdated}</span>
                <Badge variant="outline" className="text-xs font-normal text-slate-500 border-slate-300">
                  View-only
                </Badge>
                <Badge variant="outline" className="text-xs font-normal text-slate-500 border-slate-300">
                  Descriptive, not predictive
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-10 lg:px-8 lg:py-14">
          <div className="max-w-4xl mx-auto">
            {/* 1. Clinical Overview */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Clinical Overview
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {condition.clinicalSummary}
              </p>
              <div className="mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Scope Note
                </p>
                <p className="text-sm text-slate-600">
                  This view summarizes observed outcomes in PPC's clinical population. It does not predict individual patient results.
                </p>
              </div>
            </section>

            <Separator className="my-10" />

            {/* 2. Common Referral Scenarios */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Common Referral Scenarios
              </h2>
              <ul className="space-y-2">
                {condition.commonReferralScenarios.map((scenario, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>{scenario}</span>
                  </li>
                ))}
              </ul>
            </section>

            <Separator className="my-10" />

            {/* 3. Registry Snapshot */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Registry Snapshot
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                  label="Episodes Included"
                  value={registrySnapshot.episodesIncluded}
                  subtext="Sample Data"
                />
                {registrySnapshot.mcidAchievementRate !== null && registrySnapshot.episodesIncluded >= minCellSize ? (
                  <MetricCard
                    label="Achieved MCID"
                    value={`${registrySnapshot.mcidAchievementRate}%`}
                    subtext="Primary measure(s)"
                  />
                ) : (
                  <SuppressedMetric label="Achieved MCID" minCellSize={minCellSize} />
                )}
                {registrySnapshot.medianVisitsToImprovement !== null ? (
                  <MetricCard
                    label="Median Visits to Improvement"
                    value={registrySnapshot.medianVisitsToImprovement}
                    subtext={registrySnapshot.visitsIQR ? `IQR: ${registrySnapshot.visitsIQR.p25}–${registrySnapshot.visitsIQR.p75}` : undefined}
                  />
                ) : (
                  <SuppressedMetric label="Median Visits" minCellSize={minCellSize} />
                )}
                {registrySnapshot.medianPrimaryMeasureChange !== null ? (
                  <MetricCard
                    label="Median Primary Measure Change"
                    value={registrySnapshot.medianPrimaryMeasureChange}
                    subtext="Points (lower = better)"
                  />
                ) : (
                  <MetricCard label="Median Primary Measure Change" value={null} />
                )}
                {registrySnapshot.returnToActivityRate !== null ? (
                  <MetricCard
                    label="Return to Activity"
                    value={`${registrySnapshot.returnToActivityRate}%`}
                    subtext="Discharged ready"
                  />
                ) : (
                  <MetricCard label="Return to Activity" value={null} />
                )}
              </div>
            </section>

            <Separator className="my-10" />

            {/* 4. Outcome Trajectories */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Outcome Trajectories
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Proportion of episodes achieving meaningful improvement by visit count or time window.
              </p>
              <TrajectoryChart
                byVisit={condition.trajectorySeries.byVisit}
                byTime={condition.trajectorySeries.byTime}
                minCellSize={minCellSize}
              />
            </section>

            <Separator className="my-10" />

            {/* 5. Measures Included */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Measures Included
              </h2>
              <ul className="space-y-2 mb-4">
                {condition.measuresIncluded.map((measure, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>{measure}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-slate-600 leading-relaxed">
                MCID (Minimal Clinically Important Difference) represents the smallest change in a validated measure that patients perceive as meaningful. It varies by measure and population. Achieving MCID indicates real-world functional improvement, not just statistical change.
              </p>
            </section>

            <Separator className="my-10" />

            {/* 6. Disposition Patterns */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Disposition Patterns
              </h2>
              <DispositionChart
                items={condition.dispositionBreakdown}
                minCellSize={minCellSize}
              />
            </section>

            <Separator className="my-10" />

            {/* 7. How to Interpret This Data */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                How to Interpret This Data
              </h2>
              <InterpretationBlock sections={condition.interpretationGuidance} />
            </section>

            <Separator className="my-10" />

            {/* 8. Governance & Limitations */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Governance & Limitations
              </h2>
              <GovernanceNote notes={condition.governanceNotes} />
            </section>

            <Separator className="my-10" />

            {/* 9. Professional Collaboration CTA */}
            <section className="border border-slate-200 rounded-lg p-6 lg:p-8 bg-slate-50/30">
              <h3 className="text-base font-semibold text-slate-800 mb-3">
                For Referring Clinicians
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                If you have patients who may benefit from specialized neurologic or performance-focused care, we welcome collaborative referral conversations. There is no obligation to refer, and we aim to complement rather than replace existing care relationships.
              </p>
              <Link
                to="/patient/intake/referral"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 hover:border-slate-400 transition-colors"
              >
                Request Physician Referral Information
              </Link>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfessionalConditionView;
