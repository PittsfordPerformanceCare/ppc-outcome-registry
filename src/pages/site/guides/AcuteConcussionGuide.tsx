import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUp, AlertTriangle, Info, BookOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MedicalWebPageSchema, BreadcrumbSchema } from "@/components/site/StructuredData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AcuteConcussionGuide = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>Acute Concussion Guide: Early Recovery (First 24 Hours & First Week) | Pittsford Performance Care</title>
        <meta 
          name="description" 
          content="A calm, medically grounded acute concussion guide covering the first 24 hours and first week: energy management, visual/vestibular protection, red flags vs yellow flags, and when imaging may be needed." 
        />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <link rel="canonical" href="https://www.pittsfordperformancecare.com/site/guides/concussion/acute-concussion-guide" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Acute Concussion Guide: Early Recovery (First 24 Hours & First Week)" />
        <meta property="og:description" content="What to do in the first 24 hours and first week after a suspected concussion, including red flags, yellow flags, and energy-based recovery guidance." />
        <meta property="og:url" content="https://www.pittsfordperformancecare.com/site/guides/concussion/acute-concussion-guide" />
        <meta property="og:site_name" content="Pittsford Performance Care" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Acute Concussion Guide: Early Recovery" />
        <meta name="twitter:description" content="First 24 hours + first week concussion guidance: reduce visual/vestibular demand, manage energy, know red flags, and consider evaluation if symptoms persist." />
      </Helmet>

      <MedicalWebPageSchema
        name="Acute Concussion Guide: Early Recovery (First 24 Hours & First Week)"
        description="A patient education guide for suspected concussion covering early recovery, red flags, yellow flags, and when imaging may be indicated."
        url="https://www.pittsfordperformancecare.com/site/guides/concussion/acute-concussion-guide"
        datePublished="2025-12-21"
        dateModified="2025-12-21"
        about={["Concussion", "Brain Injury", "Head Injury Recovery"]}
      />

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.pittsfordperformancecare.com" },
          { name: "Guides", url: "https://www.pittsfordperformancecare.com/site/guides" },
          { name: "Concussion", url: "https://www.pittsfordperformancecare.com/site/guides/concussion" },
          { name: "Acute Concussion Guide", url: "https://www.pittsfordperformancecare.com/site/guides/concussion/acute-concussion-guide" },
        ]}
      />

      <article className="container mx-auto py-10 px-4 max-w-3xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-8 flex flex-wrap items-center gap-1">
          <Link to="/site" className="hover:text-foreground transition-colors">Home</Link>
          <span>›</span>
          <span>Guides</span>
          <span>›</span>
          <span>Concussion</span>
          <span>›</span>
          <span className="text-foreground">Acute Concussion Guide</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Acute Concussion Guide: Early Recovery
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            The First 24 Hours and the First Week
          </p>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-medium">Author:</span> Dr. C. Robert Luckey, Pittsford Performance Care, Pittsford, NY
              <span className="mx-2">•</span>
              <span className="font-medium">Category:</span> Patient Education Guide
              <span className="mx-2">•</span>
              <span className="font-medium">Version:</span> v1.0
            </p>
            <p>Last updated: December 21, 2025</p>
          </div>
        </header>

        <Separator className="mb-8" />

        {/* Safety Alert */}
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-200 font-medium">
            Safety note: If any emergency red flags are present (listed below), seek immediate emergency care.
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="bg-muted/50 rounded-lg p-6 mb-10">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            In this guide
          </h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#what-is-concussion" className="text-primary hover:underline">What a concussion is (and is not)</a></li>
            <li><a href="#core-principles" className="text-primary hover:underline">Core recovery principles</a></li>
            <li><a href="#first-24-hours" className="text-primary hover:underline">The first 24 hours</a></li>
            <li><a href="#emergency-evaluation" className="text-primary hover:underline">Emergency evaluation and imaging</a></li>
            <li><a href="#first-week" className="text-primary hover:underline">Days 2–7: the first week</a></li>
            <li><a href="#neurological-evaluation" className="text-primary hover:underline">When a neurological evaluation helps</a></li>
            <li><a href="#closing" className="text-primary hover:underline">Closing reassurance</a></li>
            <li><a href="#faq" className="text-primary hover:underline">Common questions</a></li>
          </ul>
        </nav>

        {/* What a concussion is */}
        <section id="what-is-concussion" className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">What a concussion is (and is not)</h2>
          <p className="text-muted-foreground mb-4">
            This guide is provided immediately after a head impact or suspected concussion. Its role is to help stabilize recovery early,
            reduce avoidable setbacks, and clarify when emergency care or further evaluation is appropriate.
          </p>
          <p className="text-muted-foreground">
            A concussion is a functional neurologic injury. In most cases, the brain is not structurally damaged.
            Early recovery depends less on time passing and more on how well neurologic energy is managed and vulnerable systems are protected.
          </p>
        </section>

        <Separator className="mb-10" />

        {/* Core recovery principles */}
        <section id="core-principles" className="mb-10">
          <h2 className="text-2xl font-semibold mb-6">Core recovery principles</h2>

          <div className="space-y-6">
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-lg font-medium mb-3">1) Manage energy, not time</h3>
              <p className="text-muted-foreground mb-4">
                After a concussion, the brain operates with a temporarily reduced energy capacity. Think of recovery as managing an
                invisible fuel tank.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                <li>The tank is smaller than normal early on.</li>
                <li>Visual, vestibular, cognitive, emotional, and physical demands all draw from it.</li>
                <li>When the tank is exceeded, symptoms often spike later rather than immediately.</li>
              </ul>
              <p className="text-muted-foreground mb-3">
                Exceeding available energy can trigger neurogenic inflammation, leading to delayed symptom flares such as headache,
                dizziness, fog, nausea, or emotional volatility.
              </p>
              <p className="font-medium text-foreground">
                Key rule: Stop activity before symptoms escalate, not after.
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-lg font-medium mb-3">2) Protect vulnerable systems early</h3>
              <p className="text-muted-foreground mb-4">
                After impact, the visual and vestibular systems commonly harbor vulnerability.
                Early overload can prolong recovery, even when symptoms feel mild in the moment.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Visual:</strong> eye movements, focusing, screens, busy environments</li>
                <li><strong>Vestibular:</strong> balance, head movement, motion tolerance</li>
              </ul>
            </div>
          </div>
        </section>

        <Separator className="mb-10" />

        {/* First 24 hours */}
        <section id="first-24-hours" className="mb-10">
          <h2 className="text-2xl font-semibold mb-2">The first 24 hours</h2>
          <p className="text-lg text-muted-foreground mb-6">Stabilize. Reduce load. Observe.</p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Relative rest (not shutdown)</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Avoid strenuous physical activity.</li>
                <li>Keep environments calm and predictable.</li>
                <li>Light daily movement is acceptable if it does not worsen symptoms.</li>
              </ul>
              <p className="text-muted-foreground mt-2 italic">
                Avoid pushing simply because time is available.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Visual and vestibular protection</h3>
              <p className="text-muted-foreground mb-2">Limit or avoid:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Phone, tablet, and computer screens</li>
                <li>Scrolling or rapid visual movement</li>
                <li>Busy visual environments (stores, crowds, sports venues)</li>
                <li>Fast head turns or frequent position changes</li>
                <li>Long car rides</li>
              </ul>
              <p className="text-muted-foreground mt-2 italic">
                Symptoms from these systems often lag, appearing hours later.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Energy, nutrition, and inflammation</h3>
              <p className="text-muted-foreground mb-4">
                The post-concussion brain is sensitive to inflammatory load. Nutrition choices can either support stabilization or increase symptom volatility.
              </p>
              <p className="font-medium text-foreground mb-3">
                Guiding principle: Eat if you are hungry. Do not force food if you are not. Hydration remains important.
              </p>
              
              <p className="text-muted-foreground mb-2">When eating, prioritize foods that support neurologic recovery and reduce inflammation:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                <li>Higher protein intake to support repair processes</li>
                <li>Healthy fats to support neural membranes and energy stability</li>
                <li>Simple, whole foods with minimal processing</li>
              </ul>

              <p className="text-muted-foreground mb-2">Commonly helpful supplementation (when appropriate):</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                <li>Glutathione support</li>
                <li>Magnesium</li>
                <li>Omega-3 fatty acids</li>
              </ul>
              <p className="text-xs text-muted-foreground/80 mb-4 italic">Supplementation should be individualized and not forced.</p>

              <p className="text-muted-foreground mb-2">Avoid or strictly limit early on:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                <li>Simple sugars</li>
                <li>Simple/refined carbohydrates</li>
                <li>Energy drinks or stimulant beverages</li>
                <li>Highly processed foods</li>
                <li>Known inflammatory foods, especially with food allergies or sensitivities</li>
              </ul>
              <p className="text-muted-foreground italic">
                Alcohol and recreational substances should be avoided during early recovery.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Sleep is therapeutic</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Sleep is safe and beneficial.</li>
                <li>Short naps are acceptable.</li>
                <li>Aim to maintain a normal sleep–wake rhythm.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Symptom relief</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
                <li>Quiet, low-light environments</li>
                <li>Cold application to the front of the neck (10–15 minutes)</li>
                <li>Gentle breathing or relaxation</li>
              </ul>
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Cold to the front of the neck is often more effective than the back. A large proportion of cerebral blood flow
                  travels through vessels at the front of the neck, and cooling this area can help reduce neurogenic inflammation and symptom intensity.
                  Apply gently and avoid excessive or prolonged cold.
                </p>
              </div>
              <p className="text-muted-foreground mt-3 italic">
                Avoid masking symptoms with unnecessary medications unless directed by a clinician.
              </p>
            </div>
          </div>
        </section>

        <Separator className="mb-10" />

        {/* Emergency evaluation */}
        <section id="emergency-evaluation" className="mb-10">
          <h2 className="text-2xl font-semibold mb-6">Emergency evaluation and imaging</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">When a brain scan is indicated</h3>
              <p className="text-muted-foreground mb-3">
                Most concussions do not require imaging. Brain scans are used to rule out bleeding or structural injury, not to diagnose concussion.
              </p>
              <p className="text-muted-foreground mb-2">Emergency imaging (typically CT) is considered when there is concern for:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Intracranial bleeding</li>
                <li>Skull fracture</li>
                <li>Progressive neurologic deterioration</li>
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-5">
              <h3 className="text-lg font-medium mb-3 text-red-800 dark:text-red-200 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Red flags: seek immediate emergency care
              </h3>
              <ul className="list-disc list-inside text-red-800 dark:text-red-200 space-y-1 text-sm">
                <li>Loss of consciousness at the time of injury or afterward</li>
                <li>Repeated vomiting</li>
                <li>Worsening or severe headache that does not improve</li>
                <li>Increasing confusion, agitation, or disorientation</li>
                <li>Slurred speech or difficulty speaking</li>
                <li>Weakness, numbness, or tingling in the face, arms, or legs</li>
                <li>Unequal pupil size or visual field loss</li>
                <li>Seizure activity</li>
                <li>Clear fluid or blood leaking from the nose or ears</li>
                <li>Significant drowsiness or inability to stay awake</li>
                <li>Rapid decline in behavior or responsiveness</li>
              </ul>
              <p className="font-semibold text-red-800 dark:text-red-200 mt-4">
                If any red flag appears, do not wait. Go to the emergency department or call emergency services.
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-5">
              <h3 className="text-lg font-medium mb-3 text-yellow-800 dark:text-yellow-200">
                Yellow flags: symptoms to monitor closely
              </h3>
              <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-3">
                These symptoms are common after concussion but should be monitored for progression:
              </p>
              <ul className="list-disc list-inside text-yellow-800 dark:text-yellow-200 space-y-1 text-sm">
                <li>Headache that fluctuates but does not steadily worsen</li>
                <li>Dizziness or imbalance</li>
                <li>Sensitivity to light or sound</li>
                <li>Visual strain or difficulty focusing</li>
                <li>Nausea without repeated vomiting</li>
                <li>Fatigue or sleep disruption</li>
                <li>Brain fog or slowed thinking</li>
                <li>Irritability, emotional lability, or anxiety</li>
                <li>Neck pain or stiffness</li>
              </ul>
              <p className="text-yellow-800 dark:text-yellow-200 text-sm mt-4 italic">
                Yellow flags do not require emergency imaging on their own, but persistent or escalating patterns warrant formal concussion evaluation.
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-lg font-medium mb-3">Important perspective</h3>
              <p className="text-muted-foreground mb-3">
                A concussion is diagnosed clinically. A normal brain scan does not mean symptoms are imagined — it simply means there is no bleeding or fracture.
              </p>
              <p className="text-muted-foreground">
                Early identification of red flags protects safety. Monitoring yellow flags helps guide appropriate next steps without unnecessary emergency visits.
              </p>
            </div>
          </div>
        </section>

        <Separator className="mb-10" />

        {/* First week */}
        <section id="first-week" className="mb-10">
          <h2 className="text-2xl font-semibold mb-2">Days 2–7: the first week</h2>
          <p className="text-lg text-muted-foreground mb-6">Guided reactivation — not avoidance, not pushing.</p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Gradual activity reintroduction</h3>
              <p className="text-muted-foreground mb-2">If symptoms are stable:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-2">
                <li>Light walking</li>
                <li>Basic daily tasks</li>
                <li>Brief, calm social interaction</li>
              </ul>
              <p className="text-muted-foreground italic">
                Activity should not significantly worsen symptoms during or after.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Screens and cognitive load</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-2">
                <li>Short, intentional exposure only</li>
                <li>Reduce brightness</li>
                <li>Take frequent breaks</li>
                <li>Stop before symptoms escalate</li>
              </ul>
              <p className="text-muted-foreground italic">
                Screens are one of the largest early energy drains.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">School, work, and thinking tasks</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Modified attendance or workload may be appropriate.</li>
                <li>Cognitive fatigue is a neurologic signal, not a weakness.</li>
                <li>Early accommodations often shorten total recovery time.</li>
              </ul>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-lg font-medium mb-3">Common mistakes to avoid</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Waiting it out without guidance</li>
                <li>Returning to sport or intense exercise too early</li>
                <li>Ignoring neck involvement</li>
                <li>Pushing through because symptoms are tolerable</li>
              </ul>
            </div>
          </div>
        </section>

        <Separator className="mb-10" />

        {/* When neurological evaluation helps */}
        <section id="neurological-evaluation" className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">When a neurological evaluation helps</h2>
          <p className="text-muted-foreground mb-4">
            Most concussive events heal on their own with appropriate early care. If symptoms are persisting, it does not mean something has gone wrong
            or that healing is not occurring. It usually means certain neurologic systems need clearer guidance.
          </p>
          <p className="text-muted-foreground mb-6">
            A comprehensive neurological evaluation can identify which systems are under stress and define a clear, individualized recovery pathway.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <p className="font-medium text-foreground mb-4">
              Next step: If symptoms are persisting or you have questions, a comprehensive neurological evaluation can help identify a clear recovery pathway.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/site/contact">Request an evaluation</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/site/concussion">Explore concussion resources</Link>
              </Button>
            </div>
          </div>
        </section>

        <Separator className="mb-10" />

        {/* Closing */}
        <section id="closing" className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Closing reassurance</h2>
          <p className="text-muted-foreground mb-4">
            Recovery is rarely about doing more. It is about stopping a little sooner than you think you need to — and progressing with intention rather than force.
          </p>
          <p className="text-muted-foreground">
            Early guidance reduces uncertainty, shortens recovery, and prevents avoidable setbacks.
          </p>
        </section>

        <Separator className="mb-10" />

        {/* FAQ */}
        <section id="faq" className="mb-10">
          <h2 className="text-2xl font-semibold mb-6">Common questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                What should I do in the first 24 hours after a concussion?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Focus on relative rest, reduce visual and vestibular demand, prioritize sleep, hydrate, and manage activity by energy capacity.
                Seek emergency care if any red flags are present.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                When does a concussion require a CT scan or brain imaging?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Imaging is used to rule out bleeding or structural injury. It may be indicated when red flags suggest possible intracranial bleeding,
                skull fracture, or progressive neurologic deterioration.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Why do concussion symptoms sometimes get worse later?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Visual, vestibular, and cognitive demands can exceed the brain's early energy capacity, triggering delayed symptom flares.
                Managing energy and stopping before escalation helps prevent setbacks.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                What if symptoms persist beyond several days?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Persistent symptoms often indicate that specific neurologic systems need clearer guidance.
                A comprehensive neurological evaluation can identify what is under stress and define a clear recovery pathway.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <Separator className="mb-10" />

        {/* Footer */}
        <footer className="text-center space-y-4">
          <p className="text-xs text-muted-foreground/70">
            Clinical governance: This guide is educational and does not replace emergency medical evaluation.
            If emergency red flags are present, seek immediate emergency care.
          </p>
          <div className="text-sm text-muted-foreground space-x-2">
            <span>Related PPC resources:</span>
            <Link to="/site/articles" className="text-primary hover:underline">Concussion articles</Link>
            <span>•</span>
            <Link to="/site/contact" className="text-primary hover:underline">Contact / request evaluation</Link>
            <span>•</span>
            <Link to="/site/clinical-governance" className="text-primary hover:underline">Clinical governance & outcomes</Link>
          </div>
          <p className="text-xs text-muted-foreground/60">
            © Pittsford Performance Care. All rights reserved.
          </p>
        </footer>

        {/* Back to top */}
        <div className="mt-10 text-center">
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ArrowUp className="h-4 w-4" />
            Back to top
          </button>
        </div>

        {/* Back link */}
        <div className="mt-8">
          <Link 
            to="/site/concussion" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Concussion Resources
          </Link>
        </div>
      </article>
    </>
  );
};

export default AcuteConcussionGuide;
