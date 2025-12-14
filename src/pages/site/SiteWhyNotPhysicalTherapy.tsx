import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain, 
  Target, 
  BarChart3, 
  ArrowRight,
  CheckCircle2,
  Activity,
  Eye,
  Layers,
  Users
} from "lucide-react";

const SiteWhyNotPhysicalTherapy = () => {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Why PPC Is Not Physical Therapy | Pittsford Performance Care</title>
        <meta 
          name="description" 
          content="Understand the distinction between Pittsford Performance Care's neurologic & musculoskeletal care model and traditional physical therapy. Clinician-led, system-based, outcomes-driven." 
        />
        <link rel="canonical" href="https://pittsfordperformancecare.com/site/why-not-physical-therapy" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Brain className="h-4 w-4" />
              Clinical Positioning
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Why Pittsford Performance Care Is Not Physical Therapy
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              A clear explanation of our neurologic & musculoskeletal care model—and why this distinction matters for your outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* TL;DR Summary Block */}
      <section className="py-8 bg-primary/5 border-y border-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 rounded-xl border-primary/20 bg-card/80">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">TL;DR</h2>
                  <p className="text-muted-foreground leading-relaxed">
61:                     Pittsford Performance Care (PPC) is a clinician led neurologic & musculoskeletal care practice, not a physical therapy clinic. 
62:                     We evaluate and treat the neurologic systems that control movement and function, then prescribe targeted interventions based on 
63:                     those findings. This system based approach identifies dysfunction that traditional structural exams often miss, leading to more 
                    precise care and measurable outcomes.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Opening Context */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">A Common Question</h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Many people who learn about PPC ask the same question: "Is this physical therapy?"
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              The answer is <strong className="text-foreground">no</strong>, and understanding why matters clinically. 
              While physical therapy is a respected profession that helps many patients, PPC operates from a 
              fundamentally different clinical framework. This distinction affects how we evaluate patients, 
              what we identify as the source of symptoms, and how we design treatment.
            </p>
          </div>
        </div>
      </section>

      {/* Conceptual Contrast */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Understanding the Difference</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A comparison of clinical frameworks, not a critique, but a clarification.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50">
                <h3 className="text-xl font-bold mb-4 text-muted-foreground">Traditional Approaches</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 mt-2.5 shrink-0" />
                    <span className="text-muted-foreground">Focus on movement, strength, and mobility</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 mt-2.5 shrink-0" />
                    <span className="text-muted-foreground">Evaluation centered on the symptomatic region</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 mt-2.5 shrink-0" />
                    <span className="text-muted-foreground">Protocol based exercise progressions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 mt-2.5 shrink-0" />
                    <span className="text-muted-foreground">Structural and mechanical emphasis</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-8 rounded-2xl border border-primary/30 bg-card/50">
                <h3 className="text-xl font-bold mb-4 text-primary">PPC's Neurologic Model</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">Neurologic systems evaluation as the foundation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">Comprehensive assessment beyond the pain site</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">Interventions prescribed based on neurologic readiness</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">System-based and outcome-driven emphasis</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* PPC's Care Model */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                    <Activity className="h-4 w-4" />
                    Our Approach
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">System Based Evaluation</h2>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  PPC integrates neurologic and musculoskeletal assessment into a unified clinical model. 
                  Rather than focusing solely on where symptoms appear, we evaluate the systems that 
                  control function, identifying dysfunction at its source.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our evaluation encompasses visual, vestibular, cerebellar, autonomic, postural, and 
                  motor sequencing systems. This comprehensive view often reveals patterns that 
                  localized exams miss entirely.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  The result is more efficient care, more durable outcomes, and clinical precision 
                  that patients can feel in their recovery trajectory.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 rounded-xl border border-border/60 bg-card/50 hover:border-primary/30 transition-colors">
                  <Eye className="h-8 w-8 text-primary mb-4" />
                  <h4 className="font-semibold mb-2">Visual System</h4>
                  <p className="text-sm text-muted-foreground">Oculomotor control, gaze stability, visual processing</p>
                </Card>
                
                <Card className="p-6 rounded-xl border border-border/60 bg-card/50 hover:border-primary/30 transition-colors">
                  <Activity className="h-8 w-8 text-primary mb-4" />
                  <h4 className="font-semibold mb-2">Vestibular System</h4>
                  <p className="text-sm text-muted-foreground">Balance, spatial orientation, motion processing</p>
                </Card>
                
                <Card className="p-6 rounded-xl border border-border/60 bg-card/50 hover:border-primary/30 transition-colors">
                  <Brain className="h-8 w-8 text-primary mb-4" />
                  <h4 className="font-semibold mb-2">Cerebellar Function</h4>
                  <p className="text-sm text-muted-foreground">Timing, coordination, motor learning</p>
                </Card>
                
                <Card className="p-6 rounded-xl border border-border/60 bg-card/50 hover:border-primary/30 transition-colors">
                  <Target className="h-8 w-8 text-primary mb-4" />
                  <h4 className="font-semibold mb-2">Autonomic Regulation</h4>
                  <p className="text-sm text-muted-foreground">Heart rate variability, stress response, recovery</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters Clinically */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Why This Matters Clinically</h2>
              <p className="text-lg text-muted-foreground">
                Neurologic limitations often present as musculoskeletal symptoms.
              </p>
            </div>

            <div className="space-y-6">
              <Card className="p-6 rounded-xl border border-border/60 bg-card/50">
                <h3 className="font-semibold mb-2">Concussion & Post Concussion Symptoms</h3>
                <p className="text-muted-foreground">
                  Persistent symptoms after head injury often stem from visual vestibular mismatch, 
                  autonomic dysregulation, or cerebellar timing deficits, not structural damage. 
                  Traditional imaging is typically normal because the problem is functional, not anatomical.
                </p>
              </Card>
              
              <Card className="p-6 rounded-xl border border-border/60 bg-card/50">
                <h3 className="font-semibold mb-2">Persistent Symptoms with Normal Imaging</h3>
                <p className="text-muted-foreground">
                  Many patients are told "everything looks fine" despite real, limiting symptoms. 
                  When neurologic systems aren't evaluated, the actual source of dysfunction 
                  remains hidden—and unaddressed.
                </p>
              </Card>
              
              <Card className="p-6 rounded-xl border border-border/60 bg-card/50">
                <h3 className="font-semibold mb-2">Performance Decline</h3>
                <p className="text-muted-foreground">
                  Athletes experiencing unexplained performance drops often have subtle neurologic 
                  inefficiencies affecting reaction time, coordination, or motor sequencing—limitations 
                  that standard strength assessments won't reveal.
                </p>
              </Card>
              
              <Card className="p-6 rounded-xl border border-border/60 bg-card/50">
                <h3 className="font-semibold mb-2">Chronic or Unexplained Pain</h3>
                <p className="text-muted-foreground">
                  Pain that doesn't respond to conventional treatment may be driven by central 
                  sensitization, autonomic dysfunction, or motor control deficits—all of which 
                  require neurologic assessment to identify and address effectively.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Exercises as Output, Not Identity */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">Exercises Are an Output, Not an Identity</h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              At PPC, exercise prescription is the <em>result</em> of neurologic evaluation, not the 
              definition of our care. We do not start with generic protocols; we start with a 
              comprehensive systems assessment.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Only after understanding which neurologic systems are contributing to symptoms do we 
              prescribe specific interventions. This means exercises are targeted, purposeful, and 
              matched to your neurologic readiness—not your diagnosis code.
            </p>
            
            <Card className="p-6 rounded-xl border border-primary/20 bg-primary/5">
              <p className="text-foreground font-medium">
                "Exercises are prescribed based on neurologic system performance, not as a default 
                starting point for care."
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Clinician-Led, Outcome-Driven Care */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                    <BarChart3 className="h-4 w-4" />
                    Accountability
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">Clinician Led, Outcome Driven Care</h2>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Every patient at PPC is managed within an <strong className="text-foreground">episode based care model</strong>. 
                  Each episode has defined intake criteria, treatment milestones, and discharge endpoints.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Progress is tracked using validated clinical outcome measures, not subjective impressions. 
                  Our Outcome Registry and Companion App provide transparent data on whether care is working, 
                  both for you and for any providers coordinating your treatment.
                </p>
                
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Episode based care with clear endpoints</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Validated outcome tracking at every stage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Neurologic readiness assessment before discharge</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Transparent reporting to patients and care teams</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-card rounded-2xl border border-border/60 p-8">
                <h3 className="text-xl font-bold mb-6">The PPC Companion App</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Patients can track their progress, complete outcome measures, and view their 
                  recovery trajectory—all from their phone. Neurologic & Musculoskeletal Care, 
                  with visibility into outcomes and readiness.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span>Progress Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span>Outcome Measures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Readiness Status</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Model Is For */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Users className="h-4 w-4" />
                Who We Serve
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Who This Model Is For</h2>
              <p className="text-lg text-muted-foreground">
                PPC's neurologic & musculoskeletal care model serves a wide range of patients.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="p-5 rounded-xl border border-border/60 bg-card/50 hover:border-primary/30 transition-colors">
                <p className="font-medium">Athletes at all levels seeking performance optimization or injury recovery</p>
              </Card>
              <Card className="p-5 rounded-xl border border-border/60 bg-card/50 hover:border-primary/30 transition-colors">
                <p className="font-medium">Students managing concussion recovery and return to learn protocols</p>
              </Card>
              <Card className="p-5 rounded-xl border border-border/60 bg-card/50 hover:border-primary/30 transition-colors">
                <p className="font-medium">Adults with persistent symptoms that haven't responded to conventional care</p>
              </Card>
              <Card className="p-5 rounded-xl border border-border/60 bg-card/50 hover:border-primary/30 transition-colors">
                <p className="font-medium">Patients referred by physicians for specialized neurologic assessment</p>
              </Card>
              <Card className="p-5 rounded-xl border border-border/60 bg-card/50 hover:border-primary/30 transition-colors">
                <p className="font-medium">Complex cases involving multiple systems or unclear etiology</p>
              </Card>
              <Card className="p-5 rounded-xl border border-border/60 bg-card/50 hover:border-primary/30 transition-colors">
                <p className="font-medium">Anyone seeking outcome verified, clinician led care with clear accountability</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold">Clear, Calm, Confident</h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Pittsford Performance Care is not physical therapy. We are a clinician led neurologic 
              & musculoskeletal care practice that evaluates the systems controlling function, 
              tracks outcomes with validated measures, and provides care designed for efficiency 
              and durability.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              If you are looking for care that goes beyond symptom management to address the 
              neurologic foundations of your condition, with clear data to prove it is working, you are 
              in the right place.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/site/about">
                  Learn More About PPC
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                <Link to="/site/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteWhyNotPhysicalTherapy;
