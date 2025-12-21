import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Separator } from "@/components/ui/separator";
import { MedicalWebPageSchema, BreadcrumbSchema } from "@/components/site/StructuredData";

const SiteWhitePaperPCSCaseReview = () => {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Persistent Post Concussion Syndrome Case Review | Pittsford Performance Care</title>
        <meta 
          name="description" 
          content="Educational clinical case review examining persistent post concussion syndrome five years following injury, focusing on functional neurological assessment and adaptive care strategies." 
        />
        <link rel="canonical" href="https://www.pittsfordperformancecare.com/site/white-papers/persistent-post-concussion-syndrome-case-review" />
      </Helmet>
      <MedicalWebPageSchema
        name="Persistent Post Concussion Syndrome Five Years Post Injury"
        description="Educational clinical case review examining persistent post concussion syndrome five years following injury, focusing on functional neurological assessment and adaptive care strategies."
        url="https://www.pittsfordperformancecare.com/site/white-papers/persistent-post-concussion-syndrome-case-review"
        about={[
          "Post Concussion Syndrome",
          "Chronic Concussion Symptoms",
          "Functional Neurological Assessment",
          "Vestibular Dysfunction",
          "Neurogenic Inflammation",
          "Neurological Rehabilitation"
        ]}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.pittsfordperformancecare.com/site/home" },
          { name: "White Paper Series", url: "https://www.pittsfordperformancecare.com/site/white-papers" },
          { name: "Persistent Post Concussion Syndrome Case Review", url: "https://www.pittsfordperformancecare.com/site/white-papers/persistent-post-concussion-syndrome-case-review" }
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
              Persistent Post Concussion Syndrome Five Years Post Injury
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
                Persistent post concussion symptoms represent a significant clinical challenge, particularly 
                when symptoms extend years beyond the initial injury despite extensive medical evaluation and 
                treatment. While acute concussion management pathways are well established, post acute and 
                chronic presentations often lack clear guidance once imaging and standard neurological testing 
                appear normal.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This case review describes a patient presenting five years after a concussive and whiplash 
                injury with persistent cognitive, affective, vestibular, and musculoskeletal symptoms. The 
                case highlights how functional neurological assessment may reveal clinically meaningful deficits 
                in the absence of structural pathology and how targeted, adaptive care may influence symptom 
                trajectory even years after injury.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Patient Presentation */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Patient Presentation</h2>
              <p className="text-muted-foreground leading-relaxed">
                A 28-year-old female presented for evaluation seeking relief from chronic muscle tightness and 
                pain. Further consultation revealed a history of a concussive and whiplash injury sustained 
                after falling down stairs approximately five years prior. The initial impact was described as 
                occurring at the tailbone with force transmission through the spine, followed by cervical 
                acceleration and deceleration.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Following the injury, the patient developed progressive and persistent symptoms including 
                decreased drive, apathy, daily headache, neck pain, back pain, head pressure, mental fog, 
                severe fatigue, and impaired short-term recall. Over the ensuing five years, she underwent 
                multiple pharmacological and non-pharmacological interventions without meaningful or sustained 
                improvement. At presentation, frustration was high and the patient expressed concern that full 
                recovery was no longer attainable.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Assessment Framework */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Assessment Framework</h2>
              <p className="text-muted-foreground leading-relaxed">
                Initial imaging performed following the injury was unremarkable, and no pathological 
                neurological signs were documented during acute care. As a result, evaluation emphasized 
                functional neurological assessment rather than structural pathology.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                A comprehensive bedside neurological examination was conducted with focus on cortical, 
                subcortical, vestibular, cerebellar, and autonomic domains. Findings demonstrated multiple 
                soft neurological deficits suggestive of reduced activation and coordination across distributed 
                neural pathways. These included vestibulo-ocular reflex dysfunction, asymmetric cerebellar 
                coordination, bradykinetic upper extremity movement patterns, and signs consistent with 
                increased sympathetic tone.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The pattern of findings did not align with a single focal neuroanatomical lesion, supporting 
                the clinical impression of a centrally mediated functional suppression process, potentially 
                influenced by ongoing neurogenic inflammation.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Clinical Impression */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Clinical Impression</h2>
              <p className="text-muted-foreground leading-relaxed">
                Based on clinical history and examination findings, the patient was assessed as having 
                persistent post concussion syndrome complicated by centrally mediated vestibular dysfunction 
                and suspected neurogenic inflammation. This framework provided a unifying explanation for 
                the patient's cognitive, affective, vestibular, and musculoskeletal symptoms rather than 
                treating each complaint in isolation.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Care Strategy */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Care Strategy</h2>
              <p className="text-muted-foreground leading-relaxed">
                A three-week, multimodal neurological rehabilitation program was initiated and delivered 
                on site. Care was receptor-driven and designed to influence cortical and subcortical 
                activation patterns through targeted sensory and motor inputs.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Treatment emphasis was placed on adaptability rather than rigid protocol application. 
                Frequent reassessment was performed to monitor neurological response and guide progression 
                of care. Nutritional and dietary recommendations were also provided to support systemic 
                recovery and reduce inflammatory burden.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Observed Outcomes */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Observed Outcomes</h2>
              <p className="text-muted-foreground leading-relaxed">
                At re-examination following completion of care, previously observed functional neurological 
                deficits demonstrated marked improvement. Vestibulo-ocular reflex performance normalized, 
                cerebellar coordination became symmetric, and bradykinesia resolved.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From a patient-reported perspective, the individual described near-complete resolution of 
                primary symptoms including headache, head pressure, cognitive fog, fatigue, affective 
                flattening, musculoskeletal pain, and tremors. Improvements were reported as sustained at 
                follow-up and accompanied by restoration of confidence in daily function and quality of life.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Clinical Insights */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Clinical Insights</h2>
              <p className="text-muted-foreground leading-relaxed">
                This case illustrates that persistent post concussion symptoms may reflect functional 
                suppression within neural networks rather than irreversible structural injury. In such 
                cases, absence of pathological findings does not necessarily indicate neurological normalcy.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Functional neurological assessment can provide clinically actionable insight even years 
                after injury, and adaptive care strategies may require frequent modification as neural 
                metabolic capacity improves. This underscores the importance of individualized assessment 
                and outcome-guided decision making in complex post acute neurological presentations.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Limitations */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Limitations</h2>
              <p className="text-muted-foreground leading-relaxed">
                This publication describes a single observational case and does not establish generalizable 
                treatment efficacy. Outcomes reflect an individual response to care and should not be 
                interpreted as predictive for all patients with similar clinical presentations.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Practice Integration */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Practice Integration</h2>
              <p className="text-muted-foreground leading-relaxed">
                This case aligns with the clinical philosophy of Pittsford Performance Care, which 
                emphasizes individualized neurological assessment, adaptability of care delivery, and 
                outcome-driven clinical reasoning. It reinforces the value of functional evaluation in 
                patients with persistent symptoms following concussion when standard diagnostic pathways 
                fail to explain ongoing impairment.
              </p>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Patient Perspective */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Patient Perspective</h2>
              <p className="text-muted-foreground leading-relaxed">
                The patient described her experience at Pittsford Performance Care as highly supportive 
                and structured after years of unsuccessful treatment attempts elsewhere. She emphasized 
                clear communication, careful monitoring of her responses to care, and appreciation for 
                understanding the rationale behind each phase of treatment. The patient reported a 
                meaningful restoration of quality of life following completion of care.
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

export default SiteWhitePaperPCSCaseReview;