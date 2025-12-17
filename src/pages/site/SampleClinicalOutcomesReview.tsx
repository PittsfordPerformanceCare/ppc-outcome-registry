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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

const SampleClinicalOutcomesReview = () => {
  return (
    <>
      <Helmet>
        <title>Sample Clinical Outcomes Review | Pittsford Performance Care</title>
        <meta 
          name="description" 
          content="Sample Clinical Outcomes Review illustrating how patient-specific updates are communicated to referring professionals for shared patients." 
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
                    <Link to="/resources/professional-outcomes" className="text-slate-500 hover:text-slate-700">
                      Aggregate Clinical Outcomes
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-slate-900">Sample Review</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-8">
              <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight">
                Sample Clinical Outcomes Review
              </h1>
              <p className="mt-2 text-slate-500 text-sm">
                Illustrative Example Only
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-10 lg:px-8 lg:py-14">
          <div className="max-w-3xl mx-auto">
            {/* Example Notice */}
            <Alert className="mb-8 border-slate-200 bg-slate-50">
              <Info className="h-4 w-4 text-slate-600" />
              <AlertDescription className="text-slate-700">
                This is an illustrative example only. No patient-identifiable data are included. This sample demonstrates the format and type of information shared with referring professionals for shared patients.
              </AlertDescription>
            </Alert>

            {/* Introduction */}
            <section className="mb-10">
              <p className="text-slate-700 leading-relaxed">
                Clinical Outcomes Review provides referring professionals with patient-specific, episode-level progress and outcome summaries for shared patients to support coordinated clinical decision-making.
              </p>
              <p className="text-slate-700 leading-relaxed mt-4">
                The review below illustrates the structure and content of a typical communication. Actual reviews are tailored to each patient's episode of care and clinical context.
              </p>
            </section>

            <Separator className="my-10" />

            {/* Sample Review Card */}
            <Card className="border-slate-200 mb-10">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Clinical Outcomes Review
                  </CardTitle>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    EXAMPLE
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Case Context */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Case Context</h3>
                  <div className="text-sm text-slate-700 space-y-1">
                    <p><span className="text-slate-500">Patient:</span> [Initials Redacted]</p>
                    <p><span className="text-slate-500">Condition Cluster:</span> Post-Concussion Syndrome</p>
                    <p><span className="text-slate-500">Episode Phase:</span> Active Care</p>
                    <p><span className="text-slate-500">Episode Duration:</span> 6 weeks</p>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Outcome Signal */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Outcome Signal</h3>
                  <div className="text-sm text-slate-700 space-y-1">
                    <p><span className="text-slate-500">Primary Measure:</span> PCSS (Post-Concussion Symptom Scale)</p>
                    <p><span className="text-slate-500">Baseline Score:</span> 42</p>
                    <p><span className="text-slate-500">Current Score:</span> 18</p>
                    <p><span className="text-slate-500">Change:</span> -24 points</p>
                    <p><span className="text-slate-500">MCID Status:</span> Exceeded (threshold: 12.5)</p>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Trajectory Signal */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Trajectory Signal</h3>
                  <p className="text-sm text-slate-700">
                    Progressive improvement observed across serial assessments. Symptom burden has reduced meaningfully since baseline.
                  </p>
                </div>

                <Separator className="my-4" />

                {/* Clinical Direction */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Clinical Direction</h3>
                  <p className="text-sm text-slate-700">
                    Patient is progressing through graduated return-to-activity protocol. Coordination with referring provider continues as appropriate.
                  </p>
                </div>

                <Separator className="my-4" />

                {/* Governance Footer */}
                <div className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100">
                  <p>
                    This review is provided for coordination purposes only and does not replace independent clinical judgment. All care decisions remain grounded in individualized assessment, patient presentation, and shared decision-making between providers.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Explanation */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                About This Format
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Clinical Outcomes Review summaries are designed to be concise and clinically relevant. Each review includes:
              </p>
              <ul className="list-disc list-inside text-slate-700 leading-relaxed space-y-2 ml-2">
                <li>Case context and episode phase</li>
                <li>Primary outcome measure and observed change</li>
                <li>Minimal Clinically Important Difference (MCID) status where applicable</li>
                <li>Brief trajectory and clinical direction summary</li>
                <li>Governance language preserving clinical judgment</li>
              </ul>
            </section>

            <Separator className="my-10" />

            {/* Back Link */}
            <section className="border-t border-slate-200 pt-10">
              <Link
                to="/resources/professional-outcomes"
                className="text-slate-700 underline hover:text-slate-900 text-sm"
              >
                ← Return to Aggregate Clinical Outcomes
              </Link>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default SampleClinicalOutcomesReview;
