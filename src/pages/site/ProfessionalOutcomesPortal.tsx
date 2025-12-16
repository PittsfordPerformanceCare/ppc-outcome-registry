import { Helmet } from "react-helmet";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAllConditions } from "@/data/professionalOutcomes";
import { useProfessionalAccess } from "@/hooks/useProfessionalAccess";
import { ChevronRight, Lock, AlertCircle } from "lucide-react";

const ProfessionalOutcomesPortal = () => {
  const location = useLocation();
  const { isVerifiedProfessional, isAuthenticated, loading } = useProfessionalAccess();
  const conditions = getAllConditions();

  // Check if user was redirected due to access denial
  const accessDenied = location.state?.accessDenied;

  return (
    <>
      <Helmet>
        <title>PPC Aggregate Clinical Outcomes | Pittsford Performance Care</title>
        <meta 
          name="description" 
          content="Transparency into observed clinical trends. Aggregate, condition specific outcomes from the PPC Outcome Registry for referring professionals." 
        />
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
                    <Link to="/resources/clinician-guides" className="text-slate-500 hover:text-slate-700">
                      Resources
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-slate-900">PPC Aggregate Clinical Outcomes</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-8">
              <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight">
                PPC Aggregate Clinical Outcomes
              </h1>
              <p className="mt-2 text-slate-500 text-sm">
                Transparency Into Observed Clinical Trends
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-10 lg:px-8 lg:py-14">
          <div className="max-w-3xl mx-auto">
            {/* Access Denied Alert */}
            {accessDenied && (
              <Alert className="mb-8 border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Access restricted to verified professionals. Please request access below to view condition specific outcome data.
                </AlertDescription>
              </Alert>
            )}

            {/* Introduction */}
            <section className="mb-12">
              <p className="text-slate-700 leading-relaxed">
                Pittsford Performance Care provides referring professionals with access to aggregate, condition specific clinical outcomes derived from our internal Outcome Registry. These data are presented descriptively and with clinical context to support referral confidence, shared decision making, and professional collaboration.
              </p>
              <p className="text-slate-700 leading-relaxed mt-4">
                This overview reflects observed trends across defined episodes of care using validated outcome measures and longitudinal tracking. It is designed to offer transparency into how patients progress across common referral conditions managed at PPC, without marketing overlay, selective reporting, or comparative claims.
              </p>
              <p className="text-slate-700 leading-relaxed mt-4">
                Aggregate outcomes presented here are derived from defined episodes of care and are intended to provide high-level transparency into observed clinical trends across common referral conditions. These data are not designed to guide individual treatment decisions or predict patient-specific outcomes.
              </p>
              <p className="text-slate-700 leading-relaxed mt-4">
                For patients shared in care, episode-level progress, clinical trajectory, and outcome summaries are communicated separately through PPC's Clinical Outcomes Review, supporting coordinated decision-making between providers.
              </p>
            </section>

            <Separator className="my-10" />

            {/* What This Page Provides */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                What This Page Provides
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                This page offers aggregate clinical insight, including:
              </p>
              <ul className="list-disc list-inside text-slate-700 leading-relaxed space-y-2 ml-2">
                <li>Condition specific outcome distributions</li>
                <li>Longitudinal recovery trajectories across defined care episodes</li>
                <li>Functional outcome measures interpreted with clinical context</li>
                <li>Clear explanations of how outcomes are collected and tracked</li>
                <li>Guidance on appropriate interpretation and use</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                All data are presented in aggregate form and reflect real world clinical experience across a diverse case mix.
              </p>
            </section>

            <Separator className="my-10" />

            {/* What This Page Does Not Provide */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                What This Page Does Not Provide
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                To ensure appropriate use and clarity, this page:
              </p>
              <ul className="list-disc list-inside text-slate-700 leading-relaxed space-y-2 ml-2">
                <li>Does not contain patient level data</li>
                <li>Does not predict individual outcomes</li>
                <li>Does not include testimonials or case highlights</li>
                <li>Does not compare outcomes to other providers</li>
                <li>Does not replace independent clinical judgment</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                Observed trends and distributions are emphasized over averages, recognizing the importance of variability and case complexity.
              </p>
            </section>

            <Separator className="my-10" />

            {/* Differentiation Block */}
            <section className="mb-12 border border-slate-200 rounded-lg p-6 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                For Referring Professionals With Shared Patients
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Patient specific progress, episode level outcomes, and clinical trajectory for shared patients are provided separately through PPC Clinical Outcomes Review.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Clinical Outcomes Review is a complimentary service made available automatically to referring professionals for shared patients to support coordinated care and informed decision making throughout the episode of care.
              </p>
            </section>

            <Separator className="my-10" />

            {/* Condition Views Section */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Condition Specific Outcomes
              </h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                Select a condition to view aggregate outcomes, recovery trajectories, and clinical interpretation guidance.
              </p>
              
              <div className="space-y-3">
                {conditions.map((condition) => {
                  const canAccess = isVerifiedProfessional && isAuthenticated;
                  
                  return canAccess ? (
                    <Link
                      key={condition.slug}
                      to={`/resources/professional-outcomes/conditions/${condition.slug}`}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50/50 transition-colors group"
                    >
                      <span className="text-sm font-medium text-slate-800 group-hover:text-slate-900">
                        {condition.name}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                    </Link>
                  ) : (
                    <div
                      key={condition.slug}
                      className="flex items-center justify-between p-4 border border-slate-200 border-dashed rounded-lg bg-slate-50/30"
                    >
                      <span className="text-sm font-medium text-slate-500">
                        {condition.name}
                      </span>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Lock className="h-3.5 w-3.5" />
                        <span className="text-xs">Requires verification</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isVerifiedProfessional && !loading && (
                <p className="text-xs text-slate-500 mt-4">
                  Condition views require professional verification. Request access below.
                </p>
              )}
            </section>

            <Separator className="my-10" />

            {/* Intended Audience */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Intended Audience
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                This aggregate outcomes overview is intended for:
              </p>
              <ul className="list-disc list-inside text-slate-700 leading-relaxed space-y-2 ml-2">
                <li>Physicians and physician extenders</li>
                <li>Orthopedic and sports medicine specialists</li>
                <li>Physical therapists and rehabilitation professionals</li>
                <li>Athletic trainers and performance clinicians</li>
                <li>School based clinical teams</li>
              </ul>
              <p className="text-slate-600 text-sm mt-4">
                Access is restricted to verified professionals.
              </p>
            </section>

            <Separator className="my-10" />

            {/* Clinical Governance & Data Integrity */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Clinical Governance and Data Integrity
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Aggregate outcomes are derived from PPC's internal Outcome Registry. Outcomes are tracked across defined episodes of care using validated measures and longitudinal tracking protocols designed to support clinical accountability and transparency.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Pittsford Performance Care also engages in translational neuroscience research under Institutional Review Board oversight. While this page reflects real world clinical data, it is designed for professional transparency and collaboration, not research publication or individual prediction.
              </p>
            </section>

            <Separator className="my-10" />

            {/* How to Interpret Aggregate Outcomes */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                How to Interpret Aggregate Outcomes
              </h2>
              <ul className="list-disc list-inside text-slate-700 leading-relaxed space-y-2 ml-2">
                <li>Aggregate outcomes are descriptive, not predictive.</li>
                <li>Distributions and trends matter more than averages.</li>
                <li>Symptom resolution may precede readiness.</li>
                <li>Case mix and referral patterns influence observed outcomes.</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                Each condition view includes interpretation guidance to support appropriate clinical use.
              </p>
            </section>

            <Separator className="my-10" />

            {/* Access Request CTA */}
            <section className="border border-slate-200 rounded-lg p-6 lg:p-8 bg-slate-50/50 mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Review Aggregate Clinical Outcomes
              </h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                Professional verification required.
              </p>
              <div>
                <Link
                  to="/resources/professional-outcomes/request-verification"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 hover:border-slate-400 transition-colors"
                >
                  Request Professional Verification
                </Link>
              </div>
              <p className="text-slate-500 text-xs mt-4">
                Access is view only. No patient identifiable data are displayed. No obligation to refer.
              </p>
            </section>

            {/* Footer CTA - Physician Referral */}
            <section className="border-t border-slate-200 pt-10">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Looking to Refer a Patient?
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Visit our Physician Referral page to initiate coordinated care and access Clinical Outcomes Review for shared patients.
              </p>
              <p className="text-slate-600 text-sm mb-6">
                Referring professionals with shared patients automatically receive access to patient-specific Clinical Outcomes Review summaries.
              </p>
              <div>
                <Link
                  to="/site/physicians"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-slate-900 border border-slate-900 rounded-md hover:bg-slate-800 transition-colors"
                >
                  Physician Referral Page
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfessionalOutcomesPortal;
