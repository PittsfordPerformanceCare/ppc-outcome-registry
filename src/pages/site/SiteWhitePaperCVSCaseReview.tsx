import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Separator } from "@/components/ui/separator";
import { MedicalWebPageSchema, BreadcrumbSchema } from "@/components/site/StructuredData";

const SiteWhitePaperCVSCaseReview = () => {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Refractory Cyclic Vomiting Syndrome Case Review | Pittsford Performance Care</title>
        <meta 
          name="description" 
          content="Educational clinical case review examining refractory cyclic vomiting syndrome in an adult patient, focusing on neuro-autonomic assessment and targeted rehabilitation strategies." 
        />
        <link rel="canonical" href="https://www.pittsfordperformancecare.com/site/white-papers/refractory-cyclic-vomiting-syndrome-case-review" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <MedicalWebPageSchema
        name="Refractory Cyclic Vomiting Syndrome in an Adult Patient"
        description="Educational clinical case review examining refractory cyclic vomiting syndrome in an adult patient, focusing on neuro-autonomic assessment and targeted rehabilitation strategies."
        url="https://www.pittsfordperformancecare.com/site/white-papers/refractory-cyclic-vomiting-syndrome-case-review"
        about={[
          "Cyclic Vomiting Syndrome",
          "Neuro-Autonomic Dysregulation",
          "Functional Neurological Assessment",
          "Autonomic Rehabilitation",
          "Brain-Gut Communication",
          "Traumatic Brain Injury"
        ]}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.pittsfordperformancecare.com/site/home" },
          { name: "White Paper Series", url: "https://www.pittsfordperformancecare.com/site/white-papers" },
          { name: "Refractory Cyclic Vomiting Syndrome Case Review", url: "https://www.pittsfordperformancecare.com/site/white-papers/refractory-cyclic-vomiting-syndrome-case-review" }
        ]}
      />

      {/* Header Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-slate-50 to-background dark:from-slate-900 dark:to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Publication Classification */}
            <div className="mb-8 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
              <p className="text-sm font-medium text-foreground mb-2">Publication Classification</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Educational Clinical Case Review</li>
                <li>• De-identified retrospective observation</li>
                <li>• Not a clinical trial</li>
                <li>• Not intended to establish generalizable clinical evidence</li>
              </ul>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Refractory Cyclic Vomiting Syndrome in an Adult Patient
            </h1>
            <h2 className="text-xl md:text-2xl font-medium text-muted-foreground mb-6">
              Clinical Case Review
            </h2>
            <div className="text-muted-foreground space-y-1">
              <p>C. Robert Luckey, DC</p>
              <p>Clinic Director, Pittsford Performance Care</p>
              <p>Pittsford, New York, USA</p>
              <p className="pt-2 text-sm">Web Version. Clinical Case Review. 2025.</p>
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

            {/* Clinical Context */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Clinical Context</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cyclic vomiting syndrome is a debilitating functional gastrointestinal disorder characterized 
                by recurrent episodes of severe nausea and vomiting separated by periods of relative symptom 
                stability. In adults, the condition is frequently underdiagnosed and often resistant to 
                conventional medical management, leading to prolonged patient suffering and repeated hospital 
                utilization.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Emerging evidence suggests that cyclic vomiting syndrome may involve dysregulation of cortical, 
                brainstem, and autonomic pathways governing visceral function and stress response. This case 
                review describes an adult patient with long-standing, refractory cyclic vomiting syndrome and 
                explores how functional neurological assessment and targeted neuro-autonomic rehabilitation 
                informed clinical decision making in the absence of structural pathology.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Patient Presentation */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Patient Presentation</h2>
              <p className="text-muted-foreground leading-relaxed">
                A 57-year-old female presented with a 13-year history of cyclic vomiting syndrome marked by 
                recurrent episodes of intense nausea followed by forceful vomiting occurring three to eight 
                times per hour. Individual episodes lasted between 12 and 30 hours and were associated with 
                profound dehydration, acute malnutrition, and persistent hiccups.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Episodes occurred every two to four weeks and were largely unpredictable, resulting in 
                significant functional impairment and reduced quality of life. The patient had undergone 
                extensive gastrointestinal evaluation, including advanced imaging and metabolic screening, 
                without identification of a structural cause. She was under the care of a cyclic vomiting 
                syndrome specialist and previously completed a comprehensive diagnostic evaluation at a 
                tertiary referral center.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Relevant medical history included a high-impact motor vehicle accident in 2006 resulting in 
                traumatic brain injury and left-sided hemothorax. Although acute injuries resolved, 
                post-concussive symptoms persisted for several months following the event.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Assessment Framework */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Assessment Framework</h2>
              <p className="text-muted-foreground leading-relaxed">
                Given the absence of structural gastrointestinal pathology, evaluation focused on functional 
                neurological and autonomic domains. A comprehensive examination assessed oculomotor control, 
                vestibular integration, gait under cognitive load, autonomic regulation, and cervical spine 
                contribution.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Findings included asymmetric smooth pursuit, delayed optokinetic responses, dysmetric saccades, 
                gait instability during dual-task challenge, inter-arm blood pressure asymmetry, peripheral 
                signs of autonomic instability, and reduced parasympathetic tone on heart rate variability 
                assessment. Cervical spine examination revealed segmental fixation with reduced motion.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The constellation of findings suggested impaired cortical and subcortical integration 
                influencing autonomic and visceral regulation rather than isolated gastrointestinal pathology.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Clinical Impression */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Clinical Impression</h2>
              <p className="text-muted-foreground leading-relaxed">
                The patient was assessed as having refractory cyclic vomiting syndrome with contributing 
                neuro-autonomic dysregulation, likely influenced by prior traumatic brain injury and 
                persistent imbalance between sympathetic and parasympathetic control. This framework 
                provided a unifying explanation for symptom persistence and resistance to conventional 
                treatment approaches.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Care Strategy */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Care Strategy</h2>
              <p className="text-muted-foreground leading-relaxed">
                A three-week, individualized neuro-rehabilitation program was implemented, designed to 
                influence cortical, cerebellar, and autonomic pathways through multimodal sensory and 
                motor input. Care emphasized adaptability and frequent reassessment rather than rigid 
                protocol application.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Intervention principles included vestibulo-ocular rehabilitation, autonomic retraining 
                with biofeedback, targeted manual therapy to support vagal outflow, neuroplasticity-based 
                cognitive-motor integration tasks, and lifestyle strategies addressing hydration, nutrition, 
                and environmental stress modulation. Nutraceutical support was incorporated to support 
                mitochondrial and autonomic function.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Observed Outcomes */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Observed Outcomes</h2>
              <p className="text-muted-foreground leading-relaxed">
                Following completion of care, the patient reported absence of vomiting episodes for a 
                12-week observation period. When prodromal symptoms occurred, their intensity was reduced 
                and recovery time following episodes shortened from several days to less than 24 hours.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Objective findings demonstrated improvement in autonomic balance, with reduced inter-arm 
                blood pressure asymmetry and improved heart rate variability markers consistent with 
                enhanced parasympathetic tone. The patient also reported improvements in sleep quality, 
                emotional resilience, and overall quality of life.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Clinical Insights */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Clinical Insights</h2>
              <p className="text-muted-foreground leading-relaxed">
                This case illustrates the potential role of neuro-autonomic dysregulation in refractory 
                cyclic vomiting syndrome, particularly in patients with a history of traumatic brain injury. 
                Functional neurological findings may persist long after structural healing and contribute 
                to visceral symptom expression through altered brain–gut communication.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Assessment and rehabilitation strategies that address cortical, brainstem, and autonomic 
                integration may offer clinically meaningful insight in complex functional syndromes where 
                standard diagnostic pathways fail to explain symptom persistence.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Limitations */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Limitations</h2>
              <p className="text-muted-foreground leading-relaxed">
                This publication describes a single observational case and does not establish causality 
                or generalizable treatment efficacy. Outcomes reflect an individual response to care and 
                should not be interpreted as predictive for all patients with cyclic vomiting syndrome 
                or related conditions.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Practice Integration */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Practice Integration</h2>
              <p className="text-muted-foreground leading-relaxed">
                This case aligns with the clinical philosophy of Pittsford Performance Care, which 
                emphasizes individualized neurological assessment, integration of autonomic and cortical 
                function, and outcome-guided clinical reasoning. It reinforces the value of functional 
                evaluation in complex visceral syndromes resistant to conventional care pathways.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Patient Perspective */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Patient Perspective</h2>
              <p className="text-muted-foreground leading-relaxed">
                The patient reported that the structured, neurologically informed approach provided clarity 
                after years of uncertainty and ineffective treatment. She emphasized improved predictability 
                of symptoms, faster recovery following episodes, and a meaningful improvement in daily 
                functioning and quality of life.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Disclosure */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed">
                This case review is provided for educational purposes only. It does not constitute medical 
                advice, clinical guidelines, or treatment recommendations. Content reflects a de-identified 
                retrospective observation from clinical practice and is not intended to establish 
                generalizable clinical evidence.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                No external funding was received for the development of this material.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Back Link */}
            <div className="pt-4">
              <Link 
                to="/site/white-papers" 
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                ← Back to White Paper Series
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteWhitePaperCVSCaseReview;
