import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
import { 
  Brain, 
  Eye, 
  Ear, 
  Heart,
  Zap,
  ArrowRight, 
  CheckCircle2,
  Battery,
  Activity,
  Target,
  Shield,
  Gauge,
  Hand,
  Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/card";

const SiteConcussion = () => {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Concussion Recovery | Neurologic & Musculoskeletal Care | Pittsford Performance Care</title>
        <meta name="description" content="Persistent post-concussion symptoms require domain-based neurologic evaluation. PPC identifies which neurologic domains are limiting your recovery." />
        <link rel="canonical" href="https://pittsfordperformancecare.com/site/concussion" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        {/* Calming light blue gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-blue-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-200/30 via-transparent to-transparent dark:from-blue-900/20" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Brain className="h-4 w-4" />
              Concussion Care Division
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Still Struggling Months After Your Concussion?
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Persistent post-concussion symptoms aren't just "in your head." They're real 
              neurologic deficits that require a domain-based evaluation—not just rest and time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link to="/patient/concierge">
                  Schedule Neurologic Evaluation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/patient/self-tests/concussion">Take Self-Assessment</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bottom vignette */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Symptoms Section */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Activity className="h-4 w-4" />
                Common Experiences
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Do These Symptoms Sound Familiar?
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Persistent headaches that won't go away. Brain fog and difficulty concentrating. 
                Dizziness when moving your head. Sensitivity to light and sound that makes normal 
                environments overwhelming.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Feeling off-balance or unsteady. Fatigue that limits daily activities, no matter 
                how much you rest. Trouble with screens and reading. Anxiety or mood changes that 
                weren't there before your injury.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                These aren't signs of weakness or imagination. They're signs of underlying 
                neurologic dysfunction that won't resolve with rest alone—dysfunction that 
                requires a different approach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Neurologic Integration Process Section */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Understanding Recovery
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Concussion Recovery Is a Neurologic Integration Process
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Concussion recovery does not fail randomly. Symptoms persist when one or more 
                neurologic domains fail to reintegrate after injury—forcing other domains to 
                compensate. Over time, these compensations fatigue, amplify symptoms, and stall recovery.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At PPC, concussion evaluation focuses on identifying which neurologic domain is 
                primary, which domains are compensating, and where the dysfunction cascade is unfolding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Neurologic Domain Map */}
      <section className="py-24 lg:py-32 relative overflow-hidden" id="domain-model">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-background to-slate-50 dark:from-slate-900 dark:via-background dark:to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Brain className="h-4 w-4" />
                Domain-Based Evaluation
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Neurologic Domains Involved After Concussion
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Our evaluation identifies which domain is primary and which are compensating.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              {/* Brainstem Domain */}
              <Link 
                to="/site/articles/concussion/brainstem-function"
                className="group relative p-5 rounded-xl border border-border/40 bg-card hover:bg-card/80 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">Brainstem</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      Arousal, sensory filtering, baseline energy
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/30">
                  <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                    <span className="font-medium text-foreground/70">Signs:</span> Light sensitivity, fatigue, overwhelm
                  </p>
                </div>
                <ArrowRight className="absolute top-5 right-4 h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Vestibular Domain */}
              <Link 
                to="/site/articles/concussion/visual-vestibular-mismatch"
                className="group relative p-5 rounded-xl border border-border/40 bg-card hover:bg-card/80 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center shrink-0">
                    <Ear className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">Vestibular</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      Balance, spatial orientation, motion tolerance
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/30">
                  <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                    <span className="font-medium text-foreground/70">Signs:</span> Dizziness, motion sensitivity, disorientation
                  </p>
                </div>
                <ArrowRight className="absolute top-5 right-4 h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Proprioceptive Domain */}
              <Link 
                to="/site/articles/concussion/cervical-proprioception"
                className="group relative p-5 rounded-xl border border-border/40 bg-card hover:bg-card/80 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center shrink-0">
                    <Hand className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">Proprioceptive</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      Body awareness, load distribution, asymmetry
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/30">
                  <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                    <span className="font-medium text-foreground/70">Signs:</span> Neck tension, clumsiness, postural fatigue
                  </p>
                </div>
                <ArrowRight className="absolute top-5 right-4 h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Cerebellar Domain */}
              <Link 
                to="/site/articles/concussion/cerebellar-timing-and-coordination"
                className="group relative p-5 rounded-xl border border-border/40 bg-card hover:bg-card/80 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center shrink-0">
                    <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">Cerebellar</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      Timing, coordination, efficiency, automation
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/30">
                  <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                    <span className="font-medium text-foreground/70">Signs:</span> Slowed processing, coordination issues
                  </p>
                </div>
                <ArrowRight className="absolute top-5 right-4 h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Autonomic Domain */}
              <Link 
                to="/site/articles/concussion/autonomic-nervous-system-flow"
                className="group relative p-5 rounded-xl border border-border/40 bg-card hover:bg-card/80 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-rose-500/5 flex items-center justify-center shrink-0">
                    <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">Autonomic</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      Stress response, endurance, recovery capacity
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/30">
                  <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                    <span className="font-medium text-foreground/70">Signs:</span> Exercise intolerance, poor sleep
                  </p>
                </div>
                <ArrowRight className="absolute top-5 right-4 h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Limbic-Prefrontal Domain */}
              <Link 
                to="/site/articles/concussion/limbic-prefrontal-regulation"
                className="group relative p-5 rounded-xl border border-border/40 bg-card hover:bg-card/80 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">Limbic–Prefrontal</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      Threat detection, emotional regulation
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/30">
                  <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                    <span className="font-medium text-foreground/70">Signs:</span> Anxiety, irritability, startle response
                  </p>
                </div>
                <ArrowRight className="absolute top-5 right-4 h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Visual-Oculomotor Domain */}
              <Link 
                to="/site/articles/concussion/visual-vestibular-mismatch"
                className="group relative p-5 rounded-xl border border-border/40 bg-card hover:bg-card/80 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center shrink-0">
                    <Eye className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">Visual–Oculomotor</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      Eye movements, tracking, focus control
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/30">
                  <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                    <span className="font-medium text-foreground/70">Signs:</span> Screen intolerance, reading difficulty
                  </p>
                </div>
                <ArrowRight className="absolute top-5 right-4 h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Frontal (Executive) Domain */}
              <Link 
                to="/site/articles/concussion/frontal-executive-function"
                className="group relative p-5 rounded-xl border border-border/40 bg-card hover:bg-card/80 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 flex items-center justify-center shrink-0">
                    <Gauge className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">Frontal (Executive)</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      Attention, working memory, mental endurance
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/30">
                  <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                    <span className="font-medium text-foreground/70">Signs:</span> Brain fog, difficulty multitasking
                  </p>
                </div>
                <ArrowRight className="absolute top-5 right-4 h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Domain Cascade Explanation */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                How Domain Dysfunction Cascades After Concussion
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Symptoms often appear downstream from the original disruption. The symptom you 
                notice may not be the domain where the problem started.
              </p>
            </div>
            
            <div className="space-y-4 mb-10">
              <Card className="p-5 rounded-xl border border-border/60 bg-card/50">
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Vestibular instability</span> → 
                  visual strain → frontal fatigue → headaches
                </p>
              </Card>
              <Card className="p-5 rounded-xl border border-border/60 bg-card/50">
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Cerebellar timing delay</span> → 
                  proprioceptive overload → asymmetry → pain
                </p>
              </Card>
              <Card className="p-5 rounded-xl border border-border/60 bg-card/50">
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Brainstem inefficiency</span> → 
                  autonomic dysregulation → exercise intolerance
                </p>
              </Card>
              <Card className="p-5 rounded-xl border border-border/60 bg-card/50">
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Limbic hyperactivation</span> → 
                  frontal suppression → brain fog → mood changes
                </p>
              </Card>
            </div>
            
            <p className="text-lg text-center text-muted-foreground leading-relaxed font-medium">
              Treating the endpoint of the cascade rarely works. Identifying the primary domain does.
            </p>
          </div>
        </div>
      </section>

      {/* Why Domain-Based Evaluation Matters */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Target className="h-4 w-4" />
                Clinical Precision
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why PPC's Domain-Based Evaluation Matters
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our clinician-led evaluation is designed to distinguish between primary domain 
                dysfunction and secondary compensation. This distinction determines the treatment 
                sequence—because addressing a compensating domain first often makes symptoms worse.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                PPC focuses on neurologic integration, not isolated symptoms. Rather than treating 
                headaches, dizziness, or fatigue as separate problems, we trace each symptom back 
                to the domain-level dysfunction driving it.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Progress is measured by readiness—not timelines. We use validated outcome measures 
                to track meaningful change and determine when each domain is ready for increased 
                demand, avoiding premature loading that prolongs recovery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Energy Crisis */}
      <section className="py-20 lg:py-28 relative overflow-hidden" id="energy-crisis">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Battery className="h-4 w-4" />
                Understanding Fatigue
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                The Post-Concussion Energy Crisis
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                After a concussion, your brain's energy metabolism is disrupted—normal activities 
                now require more neural resources than you have available.
              </p>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                The metabolic disruption after concussion creates an energy mismatch. Your brain 
                needs more fuel but can produce less. This leads to fatigue, brain fog, and symptom 
                flares when you push too hard. Reduced mitochondrial efficiency in affected areas. 
                Increased metabolic demand for routine tasks. Threshold symptoms when energy reserves deplete.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                You might notice symptoms that worsen later in the day. Crashes after cognitive or 
                physical exertion. A constant need for rest breaks. The inability to return to normal 
                activity levels. Sleep that doesn't fully restore your energy. Mental exhaustion from 
                tasks that used to feel simple.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our approach includes carefully dosed neurologic exercise to rebuild capacity without 
                triggering symptom flares—restoring your brain's ability to meet the demands of daily life.
              </p>
            </div>
            
            <div className="flex justify-center mt-10">
              <Link 
                to="/site/articles/concussion/concussion-energy-crisis-and-recovery"
                className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Learn more about the energy crisis
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Evaluation Process */}
      <section className="py-20 lg:py-28 bg-background" id="evaluation">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                The Process
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Neurologic Evaluation
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                A comprehensive assessment that goes far beyond standard concussion protocols
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Intake Measures</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Validated outcome measures establish your baseline and track progress
                </p>
              </div>
              
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Domain Exam</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Detailed testing of all neurologic domains to identify primary dysfunction
                </p>
              </div>
              
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Finding Report</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Clear explanation of which domains are affected and why you have symptoms
                </p>
              </div>
              
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Treatment Plan</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Targeted interventions for your specific domain deficits
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-28 lg:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                <Brain className="h-4 w-4" />
                Deep Dive Resources
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Learn More About Concussion Recovery
              </h2>
              <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed tracking-wide">
                Explore our in-depth guides on specific post-concussion challenges and evidence-based recovery strategies.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10 lg:gap-12">
              <Link 
                to="/site/articles/concussion/visual-vestibular-mismatch"
                className="group flex flex-col p-10 lg:p-12 rounded-3xl border border-border/40 bg-card/30 backdrop-blur-sm hover:border-primary/40 hover:bg-card/60 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-8">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-5 leading-snug">
                  Visual-Vestibular Mismatch
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed tracking-wide flex-1">
                  Understanding why your eyes and inner ear aren't working together—and what targeted treatment looks like.
                </p>
                <div className="mt-8 pt-6 border-t border-border/30">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all duration-300">
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
              
              <Link 
                to="/site/articles/concussion/autonomic-nervous-system-flow"
                className="group flex flex-col p-10 lg:p-12 rounded-3xl border border-border/40 bg-card/30 backdrop-blur-sm hover:border-primary/40 hover:bg-card/60 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-8">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-5 leading-snug">
                  Autonomic Nervous System
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed tracking-wide flex-1">
                  How ANS dysregulation causes fatigue, anxiety, and exercise intolerance after concussion.
                </p>
                <div className="mt-8 pt-6 border-t border-border/30">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all duration-300">
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
              
              <Link 
                to="/site/articles/concussion/cerebellar-timing-and-coordination"
                className="group flex flex-col p-10 lg:p-12 rounded-3xl border border-border/40 bg-card/30 backdrop-blur-sm hover:border-primary/40 hover:bg-card/60 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-8">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-5 leading-snug">
                  Cerebellar Timing
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed tracking-wide flex-1">
                  When your brain's master clock is disrupted and recovery feels impossible to achieve.
                </p>
                <div className="mt-8 pt-6 border-t border-border/30">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all duration-300">
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </div>
            
            <div className="flex justify-center mt-16">
              <Link 
                to="/site/articles" 
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full border border-border/40 bg-card/30 hover:border-primary/40 hover:bg-card/60 hover:shadow-xl transition-all duration-500"
              >
                <span className="text-sm font-semibold tracking-wide">Browse All Resources</span>
                <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical & Research Foundations */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-10 text-center">
              Clinical & Research Foundations
            </h3>
            
            <div className="space-y-6 mb-10">
              <p className="text-lg text-muted-foreground leading-relaxed">
                PPC's approach to concussion care is informed by established research in clinical 
                neuroscience and rehabilitation medicine. Our methodology is designed to address 
                neurologic dysfunction—not symptom suppression—and is grounded in the understanding 
                that concussion represents a physiologic and metabolic injury requiring targeted, 
                domain-based intervention.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Validated outcome measures are integrated throughout our concussion care process. 
                Progression and treatment decisions are guided by objective change over time, not 
                symptom resolution alone. This approach ensures that clinical decision-making is 
                based on measured neurologic and functional response—tracking longitudinal 
                recovery rather than subjective improvement.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Pittsford Performance Care actively engages in translational neuroscience research 
                conducted under Institutional Review Board (IRB) oversight. The purpose of this 
                work is to improve how neurologic dysfunction is identified, monitored, and supported 
                in real-world clinical and educational environments—contributing responsibly to 
                the broader understanding of concussion recovery while maintaining the highest 
                standards of patient care and ethical governance.
              </p>
            </div>
            
            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span className="text-muted-foreground leading-relaxed">
                  Berlin Consensus Statement on Concussion in Sport
                </span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span className="text-muted-foreground leading-relaxed">
                  Evidence describing autonomic nervous system dysfunction following mild traumatic brain injury
                </span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span className="text-muted-foreground leading-relaxed">
                  Research demonstrating persistent metabolic and cerebral blood-flow disruption after concussion
                </span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span className="text-muted-foreground leading-relaxed">
                  Clinical literature supporting graded aerobic exercise as an active component of concussion recovery
                </span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span className="text-muted-foreground leading-relaxed">
                  Validated outcome measures and MCID thresholds for tracking meaningful clinical improvement
                </span>
              </li>
            </ul>
            
            <div className="mt-10 pt-8 border-t border-border/40">
              <p className="text-muted-foreground leading-relaxed">
                All supporting evidence referenced throughout our concussion content is maintained 
                in a centralized Works Cited resource. This reference library is actively curated 
                and continues to evolve as the science of concussion recovery advances—reflecting 
                PPC's commitment to transparency, accountability, and continuous learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Soft Diagnostic CTA */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="p-10 md:p-14 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-6">
                Not Sure Which Neurologic Domain Is Limiting Your Recovery?
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
                A clinician-led neurologic and musculoskeletal evaluation can help identify 
                where the cascade began—and what to address first.
              </p>
              <Button size="lg" asChild>
                <Link to="/patient/concierge">
                  Schedule a Concussion Evaluation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight">
              Ready to Find Answers?
            </h2>
            <p className="text-xl text-primary-foreground/90 leading-relaxed max-w-2xl mx-auto">
              Stop waiting for symptoms to resolve on their own. Schedule your 
              comprehensive neurologic evaluation today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" asChild className="shadow-xl">
                <Link to="/patient/concierge">
                  Schedule Evaluation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/50 bg-white/10 text-white hover:bg-white/20" asChild>
                <Link to="/patient/self-tests/concussion">Take Self-Assessment</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteConcussion;
