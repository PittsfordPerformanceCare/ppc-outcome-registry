import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Separator } from "@/components/ui/separator";
import { MedicalWebPageSchema, BreadcrumbSchema } from "@/components/site/StructuredData";

const SiteWhitePaperNeuroCovidWeb = () => {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Persistent Neurologic Symptoms After COVID-19 | Pittsford Performance Care</title>
        <meta 
          name="description" 
          content="A clinical overview of Long COVID and Neuro COVID, summarizing current evidence and clinical context related to persistent neurologic symptoms following SARS-CoV-2 infection." 
        />
        <link rel="canonical" href="https://muse-meadow-app.lovable.app/site/white-papers/persistent-neurologic-symptoms-after-covid-19" />
      </Helmet>
      <MedicalWebPageSchema
        name="Persistent Neurologic Symptoms After COVID-19"
        description="A clinical overview of Long COVID and Neuro COVID, summarizing current evidence and clinical context related to persistent neurologic symptoms following SARS-CoV-2 infection."
        url="https://muse-meadow-app.lovable.app/site/white-papers/persistent-neurologic-symptoms-after-covid-19"
        about={[
          "Long COVID",
          "Neuro COVID",
          "Post Acute Sequelae of SARS-CoV-2",
          "Neurologic Dysfunction",
          "Dysautonomia",
          "Post Viral Syndromes"
        ]}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://muse-meadow-app.lovable.app/site/home" },
          { name: "White Paper Series", url: "https://muse-meadow-app.lovable.app/site/white-papers" },
          { name: "Persistent Neurologic Symptoms After COVID-19", url: "https://muse-meadow-app.lovable.app/site/white-papers/persistent-neurologic-symptoms-after-covid-19" }
        ]}
      />

      {/* Header Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-slate-50 to-background dark:from-slate-900 dark:to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Persistent Neurologic Symptoms After COVID-19
            </h1>
            <h2 className="text-xl md:text-2xl font-medium text-muted-foreground mb-6">
              A Clinical Overview of Long COVID and Neuro COVID
            </h2>
            <div className="text-muted-foreground space-y-1">
              <p>C. Robert Luckey, DC</p>
              <p>Clinic Director, Pittsford Performance Care</p>
              <p>Pittsford, New York, USA</p>
              <p className="pt-2 text-sm">Web Version. White Paper. 2025.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-10">

            {/* Download Section */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Download</p>
              <p className="text-sm text-muted-foreground italic">PDF coming soon</p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Abstract */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Abstract</h2>
              <p className="text-muted-foreground leading-relaxed">
                Persistent neurologic symptoms following SARS-CoV-2 infection have emerged as a significant clinical 
                concern. A subset of individuals experience prolonged cognitive, autonomic, sensory, and energy 
                regulation disturbances that extend well beyond the acute phase of illness, a condition commonly 
                referred to as Long COVID or Neuro COVID. This white paper provides a clinically grounded overview 
                of current evidence related to post COVID neurologic dysfunction, emphasizing functional disruption 
                rather than structural pathology. Drawing from large cohort studies, neuroimaging research, and 
                autonomic literature, the paper outlines common symptom patterns, proposed mechanisms, and the 
                clinical relevance of systems based neurologic assessment. The purpose of this document is to 
                synthesize current evidence and observations to support informed clinical evaluation and ongoing 
                research, rather than to propose specific treatment protocols.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Keywords */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Keywords</h2>
              <p className="text-muted-foreground leading-relaxed">
                Long COVID; Neuro COVID; post acute sequelae of SARS-CoV-2; neurologic dysfunction; dysautonomia; 
                post viral syndromes
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Background and Clinical Context */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Background and Clinical Context</h2>
              <p className="text-muted-foreground leading-relaxed">
                As global exposure to SARS-CoV-2 has increased, attention has shifted toward the long term 
                consequences experienced by a subset of patients following infection. While most individuals 
                recover uneventfully, growing evidence confirms that post acute sequelae of COVID-19 frequently 
                involve the nervous system, even among patients who initially experienced mild or moderate 
                disease severity.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Large observational studies and patient led cohorts have demonstrated that neurologic symptoms 
                may persist for months or longer, contributing to functional impairment and reduced quality of 
                life. These findings have reframed Long COVID as a distinct post viral condition, rather than 
                a prolonged convalescent phase, and have highlighted the need for neurologically informed models 
                of evaluation and recovery.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Defining Neuro COVID */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Defining Neuro COVID</h2>
              <p className="text-muted-foreground leading-relaxed">
                Neuro COVID refers to persistent functional disruption within the nervous system following 
                SARS-CoV-2 infection, often occurring in the absence of identifiable structural abnormalities 
                on conventional imaging or routine laboratory testing.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Current evidence suggests that neurologic involvement may affect multiple interconnected systems, 
                including:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Central nervous system integration, influencing cognition, attention, and processing speed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Autonomic nervous system regulation, affecting cardiovascular stability, energy availability, and recovery capacity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Sensory and perceptual integration, particularly visual and vestibular processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Fatigue and exertional tolerance, reflecting impaired neurologic adaptation to stress</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Several studies have reported that neurologic symptoms persist despite viral clearance and 
                normalization of inflammatory markers, supporting the hypothesis that functional neurologic 
                dysregulation plays a central role in ongoing symptomatology.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Commonly Observed Symptom Patterns */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Commonly Observed Symptom Patterns</h2>
              <p className="text-muted-foreground leading-relaxed">
                Across multiple cohorts, patients with Long COVID or suspected Neuro COVID frequently report 
                overlapping clusters of neurologic symptoms. Commonly observed patterns include:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Short term memory impairment and reduced executive efficiency</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Cognitive fatigue or brain fog, particularly under sustained mental demand</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Intermittent dizziness or orthostatic lightheadedness</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Visual fatigue, blurred vision, or reduced visual endurance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Sleep disturbance or non restorative sleep</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Appetite suppression and altered gastrointestinal function</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Generalized physical fatigue and post exertional symptom exacerbation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Muscular heaviness and decreased stamina</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Symptom expression is heterogeneous and often fluctuates based on cognitive load, physical 
                exertion, sensory demand, or environmental stressors. These patterns resemble those documented 
                in other post viral and post concussive conditions, where neurologic regulation rather than 
                tissue injury is the primary limiting factor.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Clinical Significance */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Clinical Significance of Post Viral Neurologic Change</h2>
              <p className="text-muted-foreground leading-relaxed">
                From a clinical standpoint, the temporal association between COVID-19 infection and symptom 
                onset carries diagnostic importance. When neurologic symptoms emerge for the first time 
                following infection, this pattern raises concern for a post viral neurologic cascade involving 
                impaired autonomic regulation, altered sensory integration, and reduced cortical efficiency.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Autonomic testing in Long COVID populations has demonstrated abnormalities consistent with 
                dysautonomia, including features overlapping with postural orthostatic tachycardia syndrome 
                and orthostatic intolerance. These dysfunctions may not be detected through structural imaging 
                or standard laboratory evaluation, underscoring the limitations of conventional diagnostic 
                pathways in this population.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Systems Based Framework */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">A Systems Based Neurologic Framework</h2>
              <p className="text-muted-foreground leading-relaxed">
                Emerging literature supports the use of systems based neurologic models to understand persistent 
                post COVID symptoms. Rather than evaluating isolated complaints, this framework examines how 
                neurologic domains interact, compensate, and destabilize under stress.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Functional neuroimaging studies have identified altered network connectivity and changes in 
                cortical organization in individuals with post COVID cognitive symptoms. Such findings suggest 
                that recovery may depend on restoring efficient neurologic integration rather than resolving 
                focal pathology.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This conceptual approach aligns with established neurologic principles applied in the evaluation 
                of concussion, vestibular disorders, autonomic imbalance, and other post infectious neurologic 
                syndromes.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Clinical Implications */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Clinical Implications</h2>
              <p className="text-muted-foreground leading-relaxed">
                The recognition of Neuro COVID has several important clinical implications:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Persistent neurologic symptoms should not be dismissed solely due to normal imaging or laboratory findings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Functional neurologic assessment may provide insight into symptom persistence and variability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Symptom fluctuation with cognitive, physical, or sensory stress suggests impaired regulatory capacity rather than deconditioning alone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>Heterogeneity of presentation reinforces the need for individualized evaluation strategies</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                These considerations support a cautious, mechanism informed approach to post COVID neurologic 
                complaints while research continues to evolve.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Limitations */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Limitations and Evolving Evidence</h2>
              <p className="text-muted-foreground leading-relaxed">
                Despite substantial progress, important limitations remain in the current understanding of 
                Neuro COVID. Diagnostic criteria continue to evolve, validated biomarkers are limited, and 
                long term outcome data are still emerging. Symptom heterogeneity across populations further 
                complicates standardization of evaluation and management strategies.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Ongoing longitudinal studies, interdisciplinary collaboration, and outcome tracking will be 
                essential to refine diagnostic frameworks and clarify recovery mechanisms.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Conclusion */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Conclusion</h2>
              <p className="text-muted-foreground leading-relaxed">
                Persistent neurologic symptoms following COVID-19 represent a legitimate and increasingly 
                recognized clinical phenomenon. Current evidence supports the concept of Neuro COVID as a 
                disorder of neurologic regulation and integration rather than structural injury alone. A 
                systems based neurologic framework provides a coherent lens through which these complex 
                symptom patterns may be understood while research continues to advance.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Disclosure */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Disclosure and Scope</h2>
              <p className="text-muted-foreground leading-relaxed">
                This white paper is provided for educational purposes only. It reflects current peer reviewed 
                evidence and clinical observations related to post COVID neurologic symptoms. It is not 
                intended as medical advice, a treatment guideline, or a substitute for individualized clinical 
                evaluation. No external funding was received for the preparation of this document.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* References */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">References</h2>
              <ol className="space-y-2 text-muted-foreground ml-6 list-decimal list-outside">
                <li className="pl-2">Nalbandian A, et al. Post acute COVID-19 syndrome. Nature Medicine. 2021.</li>
                <li className="pl-2">Davis HE, et al. Long COVID: major findings, mechanisms and recommendations. Nature Reviews Microbiology. 2023.</li>
                <li className="pl-2">Yong SJ. Persistent brainstem dysfunction in long COVID. Nature Reviews Neurology. 2021.</li>
                <li className="pl-2">Gupta A, et al. Extrapulmonary manifestations of COVID-19. The Lancet. 2022.</li>
                <li className="pl-2">Blitshteyn S, Whitelaw S. Postural orthostatic tachycardia syndrome following COVID-19. Autonomic Neuroscience. 2021.</li>
                <li className="pl-2">Hosp JA, et al. Cognitive impairment and altered brain connectivity in COVID-19 survivors. Brain. 2021.</li>
                <li className="pl-2">Douaud G, et al. SARS-CoV-2 is associated with changes in brain structure. Nature. 2022.</li>
                <li className="pl-2">Novak P, et al. Multisystem involvement in post COVID dysautonomia. Neurology. 2022.</li>
              </ol>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Series Link */}
            <div className="space-y-2 pt-4">
              <p className="text-sm font-medium text-foreground">Series</p>
              <Link 
                to="/site/white-papers"
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                Back to PPC Clinical White Paper Series
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteWhitePaperNeuroCovidWeb;
