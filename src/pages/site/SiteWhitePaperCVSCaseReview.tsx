import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { MedicalWebPageSchema, BreadcrumbSchema } from "@/components/site/StructuredData";

const SiteWhitePaperCVSCaseReview = () => {
  const breadcrumbItems = [
    { name: "Home", url: "https://www.pittsfordperformancecare.com" },
    { name: "White Paper Series", url: "https://www.pittsfordperformancecare.com/site/white-papers" },
    { name: "Refractory Cyclic Vomiting Syndrome Case Review", url: "https://www.pittsfordperformancecare.com/site/white-papers/refractory-cyclic-vomiting-syndrome-case-review" }
  ];

  return (
    <div className="min-h-screen bg-background">
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
        name="Refractory Cyclic Vomiting Syndrome in an Adult Patient - Clinical Case Review"
        description="Educational clinical case review examining refractory cyclic vomiting syndrome in an adult patient, focusing on neuro-autonomic assessment and targeted rehabilitation strategies."
        url="https://www.pittsfordperformancecare.com/site/white-papers/refractory-cyclic-vomiting-syndrome-case-review"
      />

      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Back Link */}
        <Link 
          to="/site/white-papers" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to White Paper Series
        </Link>

        {/* Publication Classification */}
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-8">
          <p className="text-sm font-medium text-foreground mb-2">Publication Classification</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Educational Clinical Case Review</li>
            <li>• De-identified retrospective observation</li>
            <li>• Not a clinical trial</li>
            <li>• Not intended to establish generalizable clinical evidence</li>
          </ul>
        </div>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
            Refractory Cyclic Vomiting Syndrome in an Adult Patient
          </h1>
          <p className="text-xl text-muted-foreground mb-4">Clinical Case Review</p>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">C. Robert Luckey, DC</p>
            <p>Clinic Director, Pittsford Performance Care</p>
          </div>
        </header>

        <Separator className="my-8" />

        {/* Clinical Context */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">Clinical Context</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Cyclic vomiting syndrome is a debilitating functional gastrointestinal disorder characterized by recurrent episodes of severe nausea and vomiting separated by periods of relative symptom stability. In adults, the condition is frequently underdiagnosed and often resistant to conventional medical management, leading to prolonged patient suffering and repeated hospital utilization.
            </p>
            <p>
              Emerging evidence suggests that cyclic vomiting syndrome may involve dysregulation of cortical, brainstem, and autonomic pathways governing visceral function and stress response. This case review describes an adult patient with long-standing, refractory cyclic vomiting syndrome and explores how functional neurological assessment and targeted neuro-autonomic rehabilitation informed clinical decision making in the absence of structural pathology.
            </p>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Patient Presentation */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">Patient Presentation</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              A 57-year-old female presented with a 13-year history of cyclic vomiting syndrome marked by recurrent episodes of intense nausea followed by forceful vomiting occurring three to eight times per hour. Individual episodes lasted between 12 and 30 hours and were associated with profound dehydration, acute malnutrition, and persistent hiccups.
            </p>
            <p>
              Episodes occurred every two to four weeks and were largely unpredictable, resulting in significant functional impairment and reduced quality of life. The patient had undergone extensive gastrointestinal evaluation, including advanced imaging and metabolic screening, without identification of a structural cause. She was under the care of a cyclic vomiting syndrome specialist and previously completed a comprehensive diagnostic evaluation at a tertiary referral center.
            </p>
            <p>
              Relevant medical history included a high-impact motor vehicle accident in 2006 resulting in traumatic brain injury and left-sided hemothorax. Although acute injuries resolved, post-concussive symptoms persisted for several months following the event.
            </p>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Assessment Framework */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">Assessment Framework</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Given the absence of structural gastrointestinal pathology, evaluation focused on functional neurological and autonomic domains. A comprehensive examination assessed oculomotor control, vestibular integration, gait under cognitive load, autonomic regulation, and cervical spine contribution.
            </p>
            <p>
              Findings included asymmetric smooth pursuit, delayed optokinetic responses, dysmetric saccades, gait instability during dual-task challenge, inter-arm blood pressure asymmetry, peripheral signs of autonomic instability, and reduced parasympathetic tone on heart rate variability assessment. Cervical spine examination revealed segmental fixation with reduced motion.
            </p>
            <p>
              The constellation of findings suggested impaired cortical and subcortical integration influencing autonomic and visceral regulation rather than isolated gastrointestinal pathology.
            </p>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Clinical Impression */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">Clinical Impression</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The patient was assessed as having refractory cyclic vomiting syndrome with contributing neuro-autonomic dysregulation, likely influenced by prior traumatic brain injury and persistent imbalance between sympathetic and parasympathetic control. This framework provided a unifying explanation for symptom persistence and resistance to conventional treatment approaches.
            </p>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Care Strategy */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">Care Strategy</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              A three-week, individualized neuro-rehabilitation program was implemented, designed to influence cortical, cerebellar, and autonomic pathways through multimodal sensory and motor input. Care emphasized adaptability and frequent reassessment rather than rigid protocol application.
            </p>
            <p>
              Intervention principles included vestibulo-ocular rehabilitation, autonomic retraining with biofeedback, targeted manual therapy to support vagal outflow, neuroplasticity-based cognitive-motor integration tasks, and lifestyle strategies addressing hydration, nutrition, and environmental stress modulation. Nutraceutical support was incorporated to support mitochondrial and autonomic function.
            </p>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Observed Outcomes */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">Observed Outcomes</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Following completion of care, the patient reported absence of vomiting episodes for a 12-week observation period. When prodromal symptoms occurred, their intensity was reduced and recovery time following episodes shortened from several days to less than 24 hours.
            </p>
            <p>
              Objective findings demonstrated improvement in autonomic balance, with reduced inter-arm blood pressure asymmetry and improved heart rate variability markers consistent with enhanced parasympathetic tone. The patient also reported improvements in sleep quality, emotional resilience, and overall quality of life.
            </p>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Clinical Insights */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">Clinical Insights</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              This case illustrates the potential role of neuro-autonomic dysregulation in refractory cyclic vomiting syndrome, particularly in patients with a history of traumatic brain injury. Functional neurological findings may persist long after structural healing and contribute to visceral symptom expression through altered brain–gut communication.
            </p>
            <p>
              Assessment and rehabilitation strategies that address cortical, brainstem, and autonomic integration may offer clinically meaningful insight in complex functional syndromes where standard diagnostic pathways fail to explain symptom persistence.
            </p>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Limitations */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">Limitations</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              This publication describes a single observational case and does not establish causality or generalizable treatment efficacy. Outcomes reflect an individual response to care and should not be interpreted as predictive for all patients with cyclic vomiting syndrome or related conditions.
            </p>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Practice Integration */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">Practice Integration</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              This case aligns with the clinical philosophy of Pittsford Performance Care, which emphasizes individualized neurological assessment, integration of autonomic and cortical function, and outcome-guided clinical reasoning. It reinforces the value of functional evaluation in complex visceral syndromes resistant to conventional care pathways.
            </p>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Patient Perspective */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">Patient Perspective</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The patient reported that the structured, neurologically informed approach provided clarity after years of uncertainty and ineffective treatment. She emphasized improved predictability of symptoms, faster recovery following episodes, and a meaningful improvement in daily functioning and quality of life.
            </p>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Disclosure */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">Disclosure</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              This case review reflects a de-identified clinical observation and is presented for educational purposes only. No conflicts of interest are reported. This publication does not constitute medical advice and should not be used to guide clinical decision making without appropriate professional consultation.
            </p>
          </div>
        </section>

        <Separator className="my-8" />

        {/* PDF Download */}
        <div className="bg-muted/30 border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">Download PDF Version</span>
          </div>
          <p className="text-sm text-muted-foreground">
            A PDF version of this case review will be available for download. The HTML version above serves as the canonical source.
          </p>
        </div>

        {/* Back Link */}
        <Link 
          to="/site/white-papers" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to White Paper Series
        </Link>
      </div>
    </div>
  );
};

export default SiteWhitePaperCVSCaseReview;
