import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const clinicianGuides = [
  {
    slug: "clinical-considerations-motor-timing-deficits",
    title: "Clinical Considerations in Motor Timing Deficits",
    description:
      "Neurologic mechanisms, clinical presentation patterns, assessment considerations, and rehabilitation implications for motor timing dysfunction.",
    category: "MSK",
  },
];

const ClinicianGuidesIndex = () => {
  return (
    <>
      <Helmet>
        <title>Clinician Guides | Pittsford Performance Care</title>
        <meta
          name="description"
          content="Clinician-oriented educational resources on neurologic mechanisms, assessment considerations, and clinical interpretation for musculoskeletal and neurologic rehabilitation."
        />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white">
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
                  <BreadcrumbPage className="text-slate-900">Clinician Guides</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-6">
              <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight">
                Clinician Guides
              </h1>
              <p className="mt-2 text-slate-600 max-w-2xl">
                Professional, clinician-oriented educational resources designed to explain neurologic mechanisms, assessment considerations, and clinical interpretation.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-10 lg:px-8 lg:py-14">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {clinicianGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  to={`/resources/clinician-guides/${guide.slug}`}
                  className="block bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                          {guide.category}
                        </span>
                      </div>
                      <h2 className="text-base font-semibold text-slate-900 mb-1">
                        {guide.title}
                      </h2>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {guide.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Note */}
            <div className="mt-10 pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                These guides are intended for clinical professionals. For patient-facing educational content, visit{" "}
                <Link to="/site/articles" className="underline underline-offset-2 hover:text-slate-700">
                  Articles & Guides
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClinicianGuidesIndex;
