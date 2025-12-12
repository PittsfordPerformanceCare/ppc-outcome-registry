import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

const ProfessionalOutcomesPortal = () => {
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

            {/* What This Portal Provides */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                What This Portal Provides
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                This portal is designed to offer transparency into observed clinical trends across common referral conditions managed at PPC, without marketing overlay or selective reporting.
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Aggregate outcomes by condition</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Longitudinal recovery trajectories</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Functional outcome measures interpreted with context</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Clear explanation of how outcomes are measured</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Clinical interpretation guidance for appropriate use</span>
                </li>
              </ul>
            </section>

            <Separator className="my-10" />

            {/* What This Portal Is Not */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                What This Portal Is Not
              </h2>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Not patient-level data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Not predictive of individual outcomes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Not testimonials or case highlights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Not comparative benchmarking against other providers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Not a substitute for clinical judgment</span>
                </li>
              </ul>
            </section>

            <Separator className="my-10" />

            {/* Intended Audience */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Intended Audience
              </h2>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Physicians and physician extenders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Orthopedic and sports medicine specialists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Physical therapists and rehabilitation professionals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Athletic trainers and performance clinicians</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>School-based clinical teams</span>
                </li>
              </ul>
              <p className="text-slate-600 text-sm mt-4">
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
