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
        <meta name="robots" content="noindex, nofollow" />
        <title>Professional Outcomes Portal | Pittsford Performance Care</title>
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
                  <BreadcrumbPage className="text-slate-900">Professional Outcomes Portal</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-8">
              <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight">
                Professional Outcomes Portal
              </h1>
              <p className="mt-2 text-slate-500 text-sm">
                Aggregate clinical outcomes for referring professionals
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
                  Access restricted to verified professionals. Please request access below to view condition-specific outcome data.
                </AlertDescription>
              </Alert>
            )}

            {/* Opening Section */}
            <section className="mb-12">
              <p className="text-slate-700 leading-relaxed">
                The Professional Outcomes Portal provides referring clinicians with access to aggregate, condition-specific outcome data derived from the Pittsford Performance Care Outcome Registry.
              </p>
              <p className="text-slate-700 leading-relaxed mt-4">
                These data are presented descriptively and with clinical context to support shared decision-making, referral confidence, and professional collaboration.
              </p>
            </section>

            <Separator className="my-10" />

            {/* Condition Views Section */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Condition-Specific Outcomes
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

            {/* What This Portal Provides */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                What This Portal Provides
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                This portal is designed to offer transparency into observed clinical trends across common referral conditions managed at PPC, without marketing overlay or selective reporting.
              </p>
              <p className="text-slate-700 leading-relaxed">
                It includes aggregate outcomes by condition, longitudinal recovery trajectories, and functional outcome measures interpreted with context. You will also find clear explanations of how outcomes are measured, along with clinical interpretation guidance for appropriate use.
              </p>
            </section>

            <Separator className="my-10" />

            {/* What This Portal Is Not */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                What This Portal Is Not
              </h2>
              <p className="text-slate-700 leading-relaxed">
                This portal does not contain patient-level data and is not predictive of individual outcomes. It does not feature testimonials or case highlights, nor does it provide comparative benchmarking against other providers. It is not a substitute for clinical judgment.
              </p>
            </section>

            <Separator className="my-10" />

            {/* Intended Audience */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Intended Audience
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                This portal is intended for physicians and physician extenders, orthopedic and sports medicine specialists, physical therapists and rehabilitation professionals, athletic trainers and performance clinicians, and school-based clinical teams.
              </p>
              <p className="text-slate-600 text-sm">
                Access is restricted to verified professionals.
              </p>
            </section>

            <Separator className="my-10" />

            {/* Clinical Governance & Data Integrity */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Clinical Governance & Data Integrity
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Data are derived from PPC's internal Outcome Registry. Outcomes are tracked across defined episodes of care using validated measures and longitudinal tracking. Aggregate views are presented with safeguards to protect privacy.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Pittsford Performance Care also engages in translational neuroscience research under Institutional Review Board (IRB) oversight. While the portal reflects real-world clinical data, it is designed for transparency and collaboration—not research publication or individual prediction.
              </p>
            </section>

            <Separator className="my-10" />

            {/* How to Interpret the Data */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                How to Interpret the Data
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Outcomes are descriptive, not prescriptive. Distributions and trends matter more than averages. Symptom resolution may precede readiness. Case mix influences observed outcomes.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Each condition view includes interpretation guidance to support appropriate clinical use.
              </p>
            </section>

            <Separator className="my-10" />

            {/* Access Request CTA */}
            <section className="border border-slate-200 rounded-lg p-6 lg:p-8 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Request Professional Access
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Access to the Professional Outcomes Portal is available to verified clinicians and professional partners.
              </p>
              <p className="text-slate-700 leading-relaxed mb-6">
                If you are interested in reviewing aggregate outcome data to support referral decisions or collaborative care discussions, you may request access below.
              </p>
              <div>
                <Link
                  to="/patient/intake/referral"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 hover:border-slate-400 transition-colors"
                >
                  Request Access to Outcomes Portal
                </Link>
              </div>
              <p className="text-slate-500 text-xs mt-4">
                Access is view-only. No patient-identifiable data are displayed. No obligation to refer.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfessionalOutcomesPortal;
