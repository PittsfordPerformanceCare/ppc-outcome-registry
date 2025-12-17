import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Separator } from "@/components/ui/separator";

const SiteClinicalGovernance = () => {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Clinical Governance & Outcomes | Pittsford Performance Care</title>
        <meta 
          name="description" 
          content="Clinical governance, episode-based care, and outcome tracking framework used by Pittsford Performance Care to support medical necessity, utilization integrity, and audit defensibility." 
        />
        <link rel="canonical" href="https://muse-meadow-app.lovable.app/site/clinical-governance" />
      </Helmet>

      {/* Header Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-slate-50 to-background dark:from-slate-900 dark:to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Clinical Governance & Outcomes
            </h1>
            <p className="text-lg text-muted-foreground">
              Pittsford Performance Care
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-12">
            
            {/* Care Model Overview */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Care Model Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pittsford Performance Care delivers neurologic-driven concussion and musculoskeletal care 
                within a structured, episode-based clinical model designed to support medical necessity, 
                utilization integrity, and audit defensibility.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Care is time-bounded, clinician-owned, and outcome-guided rather than open-ended.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Episode Ownership & Documentation */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Episode Ownership & Documentation</h2>
              <p className="text-muted-foreground leading-relaxed">
                All patient care occurs within defined clinical episodes that include:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>A documented clinical indication</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Assigned clinician ownership</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Periodic reassessment checkpoints</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Objective outcome tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Clear discharge or care-coordination criteria</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Clinical documentation follows standard EHR practices. In parallel, Pittsford Performance Care 
                maintains an internal outcomes registry used for quality assurance, clinical decision support, 
                and aggregated outcome analysis.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The registry does not replace or modify the medical record and is maintained separately to 
                support care quality and reporting.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Clinical Governance */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Clinical Governance</h2>
              <p className="text-muted-foreground leading-relaxed">
                Access to clinical data is governed by role-based access controls, assignment-restricted 
                documentation privileges, and least-privilege administrative oversight.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Only clinicians assigned to an episode may author or modify clinical records, preserving 
                attribution and accountability.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Objective Outcomes & Utilization Discipline */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Objective Outcomes & Utilization Discipline</h2>
              <p className="text-muted-foreground leading-relaxed">
                Patient progress is tracked using validated outcome instruments selected based on clinical 
                presentation. These may include RPQ, ODI, QuickDASH, LEFS, and system-specific neurologic measures.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Care progression is guided by objective response to intervention, functional improvement, 
                and clinical reassessment findings.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Care is adjusted, concluded, or coordinated when outcomes plateau or goals are met, 
                supporting appropriate utilization.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Neurologic Domain-Based Care */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Neurologic Domain-Based Care</h2>
              <p className="text-muted-foreground leading-relaxed">
                Care is guided by a domain-based neurologic framework that identifies the primary system 
                driving symptoms, improving efficiency and avoiding symptom-only treatment.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The eight neurologic domains evaluated within this framework include:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Visual</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Vestibular</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Cerebellar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Autonomic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Frontal / Executive</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Parietal / Sensory Integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Brainstem</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Musculoskeletal Integration</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                This approach supports targeted care delivery, reduces unnecessary services, and improves 
                clinical clarity across the episode of care.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Data Stewardship */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Data Stewardship</h2>
              <p className="text-muted-foreground leading-relaxed">
                Patient data is protected through encrypted connections, role-restricted access, and 
                documented governance practices.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Clinical data is not sold or used outside patient care, quality improvement, or approved 
                research activities.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Closing Statement */}
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Pittsford Performance Care is committed to delivering neurologic care that is clinically 
                appropriate, outcome-driven, and responsibly utilized within the healthcare system.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Internal Links */}
            <div className="space-y-3 pt-4">
              <p className="text-sm text-muted-foreground">Related pages:</p>
              <div className="flex flex-col gap-2">
                <Link 
                  to="/resources/professional-outcomes/sample-review" 
                  className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  Professional Clinical Outcomes Review
                </Link>
                <Link 
                  to="/site/concussion" 
                  className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  Concussion Care
                </Link>
                <Link 
                  to="/site/msk" 
                  className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  Musculoskeletal Care
                </Link>
                <Link 
                  to="/site/about" 
                  className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  About Pittsford Performance Care
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteClinicalGovernance;
