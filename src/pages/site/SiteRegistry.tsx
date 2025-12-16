import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowRight,
  CheckCircle2,
  Shield,
  Eye,
  Target,
  Users,
  Heart,
  GraduationCap,
  BarChart3,
  Sparkles,
  ClipboardList,
  TrendingUp,
  Activity,
  Clock,
  Brain,
  FileCheck,
  MessageSquare
} from "lucide-react";

const SiteRegistry = () => {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>PPC Outcome Registry | Clinical Outcome Tracking | Pittsford Performance Care</title>
        <meta name="description" content="Track your recovery with PPC's clinical outcome registry. Validated measures, transparent results, and evidence-based care." />
        <link rel="canonical" href="https://muse-meadow-app.lovable.app/site/registry" />
      </Helmet>
      {/* Hero Section */}
      <section className="relative py-28 lg:py-36 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <BarChart3 className="h-4 w-4" />
              Outcome Driven Care
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              PPC Outcome Registry
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Clarity Through Measurable Recovery. Every patient deserves to know whether 
              they're getting better—objective data helps contextualize recovery over time.
            </p>
          </div>
        </div>
      </section>

      {/* Section 1 — Intro / Purpose */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Registry data is used to support clinical understanding and shared discussion, 
              not to define eligibility, limit care, or replace individualized medical judgment.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Recovery should not feel confusing. When patients are uncertain about 
              whether they're improving, or why, it erodes confidence and delays healing. 
              Too often, traditional care leaves people wondering if they're on the right path.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Patients deserve clarity and transparency at every stage of their care. 
              That's why Pittsford Performance Care built the Outcome Registry: to replace 
              guesswork with understanding, and to ensure that every patient's recovery 
              journey is grounded in structure and honesty.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              The Registry reflects who we are as clinicians. It represents our commitment 
              to clinical care driven by data, our belief that patients should never be left 
              in the dark, and our philosophy that measurable recovery is the foundation 
              of meaningful care.
            </p>
          </div>
        </div>
      </section>

      {/* NEW: Why an Outcome Registry Matters in Neurologic Care */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Brain className="h-4 w-4" />
              Neurologic Context
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Why an Outcome Registry Matters in Neurologic Care</h2>
            
            <div className="space-y-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                In concussion recovery and neurologic musculoskeletal care, symptoms alone 
                do not tell the full story. A patient may report feeling better while underlying 
                neurologic function remains compromised. Conversely, residual symptoms may 
                persist even after meaningful functional recovery has occurred. Relying 
                solely on how someone feels can lead to premature clearance or unnecessarily 
                prolonged restriction.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                An outcome registry addresses this gap by capturing objective, validated 
                measures of function over time. It allows clinicians to observe patterns 
                that extend beyond the surface, tracking neurologic readiness rather than 
                symptom resolution alone. This longitudinal perspective is essential for 
                making informed decisions about return to activity, school, sport, or work.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                For patients recovering from concussion or complex neurologic conditions, 
                the registry is not a convenience. It is a clinical necessity, a structured 
                framework that ensures recovery is observed with the depth and rigor these 
                conditions require.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: How the PPC Outcome Registry Works */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <ClipboardList className="h-4 w-4" />
                How It Works
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">How the PPC Outcome Registry Works</h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                The registry operates within our episode based care model, capturing 
                structured data at key clinical moments to build a complete picture of 
                each patient's recovery.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-bold mb-2">Baseline Capture</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  At the start of each episode, validated outcome measures establish 
                  a clear starting point for comparison.
                </p>
              </Card>
              
              <Card className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-bold mb-2">Interval Monitoring</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Throughout care, periodic reassessments track functional change 
                  and identify when adjustments are needed.
                </p>
              </Card>
              
              <Card className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-bold mb-2">Trend Analysis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Data is reviewed to identify patterns, guiding clinical decisions 
                  based on trajectory rather than isolated snapshots.
                </p>
              </Card>
              
              <Card className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-bold mb-2">Discharge Summary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  At episode close, final outcomes document the complete recovery 
                  journey and inform future care if needed.
                </p>
              </Card>
            </div>
            
            <div className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-muted-foreground leading-relaxed text-center">
                <span className="font-semibold text-foreground">Episode based care</span> means 
                every condition is tracked as a distinct clinical episode with a defined beginning, 
                structured observation, and documented resolution. This approach ensures continuity 
                and prevents gaps in the recovery record.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: What Makes the PPC Outcome Registry Different */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Target className="h-4 w-4" />
              Operational Difference
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-8">What Makes the PPC Outcome Registry Different</h2>
            
            <div className="space-y-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Many clinics collect outcome data. Fewer actually use it. The difference 
                at Pittsford Performance Care is that registry data is integrated into day-to-day 
                clinical decision support—informing reassessment and shared discussion 
                throughout the episode of care, not just at discharge or for retrospective review.
              </p>
              
              <div className="grid gap-6">
                <Card className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">Responsive Clinical Adjustment</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        When progress stalls or trends in an unexpected direction, data 
                        informs clinical reassessment and shared discussion, guided by 
                        clinical judgment and patient response.
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">Support for Informed Return Decisions</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Return to learn, return to play, and return to performance decisions 
                        are supported by objective functional data alongside clinical judgment 
                        and patient presentation.
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">Consistency Across Providers</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Every clinician follows the same structured observation framework, 
                        ensuring patients receive consistent care regardless of who they see.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                This approach transforms the registry from a passive record into a clinical 
                support tool—one that informs care as it unfolds, rather than simply 
                summarizing it afterward. All care decisions remain grounded in individualized 
                clinical judgment, patient presentation, and shared decision-making.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section — Why We Built the Registry (Original) */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Our Purpose
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Why We Built the Registry</h2>
            
            <div className="space-y-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                In traditional care, progress is often unclear. Patients leave appointments 
                wondering if they're actually getting better or just going through the motions. 
                Clinicians may rely on memory or intuition rather than structured observation. 
                Families are left without answers when they ask, "Is this working?"
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                We built the Outcome Registry because we believe care should never feel like 
                guesswork. Patients deserve to know where they started, how far they've come, 
                and what's next. Clinicians need a framework for reflection and internal clinical consistency. 
                Families should be able to trust that recovery is being tracked, not assumed.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                The Registry exists to close these gaps—not by adding complexity, but by 
                bringing structure and clarity to every episode of care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section — What the Registry Represents (Original) */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Target className="h-4 w-4" />
                Clinical Standard
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">What the Registry Represents</h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                The PPC Outcome Registry is more than a record keeping system. It is a 
                clinical standard, a commitment we make to every patient who walks through 
                our doors. It is the foundation upon which we build trust, guide treatment, 
                and define what success looks like.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Eye className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Transparency</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Recovery is visible and understandable to everyone involved: patients, 
                  families, and referring providers alike.
                </p>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Precision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Care is guided by observation and structure, not assumption. 
                  Every decision is grounded in measurable clinical data.
                </p>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Consistency</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every patient receives the same level of structured attention, 
                  regardless of their condition or complexity.
                </p>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Transparency & Consistency</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Clinicians maintain the standards they set for themselves. 
                  Structured observation supports internal clinical reflection and consistency.
                </p>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Patient Understanding</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Patients are empowered with knowledge about their own progress. 
                  You're never left in the dark about your recovery.
                </p>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <GraduationCap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Research Readiness</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Data collected with rigor supports future clinical insight and 
                  contributes to advancing the science of recovery.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Section — How the Registry Brings Clarity to Recovery (Original) */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Eye className="h-4 w-4" />
              Clarity in Recovery
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-8">How the Registry Brings Clarity to Recovery</h2>
            
            <div className="space-y-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Recovery is rarely straightforward. Neurologic healing, in particular, 
                does not follow a linear path. Some weeks bring breakthroughs; others 
                bring setbacks. Without context, these fluctuations can feel confusing 
                or discouraging.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                The Outcome Registry provides that context. By capturing a structured, 
                longitudinal view of recovery, it allows both clinicians and patients to 
                see patterns over time, patterns that would be invisible in isolated snapshots. 
                This perspective transforms uncertainty into understanding.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                When patients and clinicians share a clear picture of where recovery has 
                been and where it is heading, decisions become more confident, communication 
                becomes more meaningful, and care becomes more effective.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Clinical & Research Foundations */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <GraduationCap className="h-4 w-4" />
              Evidence Base
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Clinical & Research Foundations</h2>
            
            <div className="space-y-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Evidence based practice is not simply a phrase. It is a commitment to 
                grounding clinical decisions in the best available science. The PPC 
                Outcome Registry is built on principles recognized across neurologic 
                rehabilitation, concussion management, and musculoskeletal care.
              </p>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-6">Foundational Principles</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Validated Outcome Measures</span>
                      <p className="text-muted-foreground mt-1">
                        We use standardized, peer-reviewed assessment tools that have been 
                        tested for reliability and validity in clinical populations.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Minimal Clinically Important Difference (MCID)</span>
                      <p className="text-muted-foreground mt-1">
                        Change is evaluated against established thresholds that distinguish 
                        meaningful improvement from statistical noise or measurement error.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Longitudinal Tracking</span>
                      <p className="text-muted-foreground mt-1">
                        Recovery is observed over time, recognizing that neurologic and 
                        functional improvement often unfolds across weeks or months.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Symptom Resolution ≠ Neurologic Recovery</span>
                      <p className="text-muted-foreground mt-1">
                        Consensus guidelines in concussion and neurologic care emphasize 
                        that feeling better does not guarantee the brain or nervous system 
                        has fully recovered. Objective measures help bridge this gap.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Return to Activity Frameworks</span>
                      <p className="text-muted-foreground mt-1">
                        Decisions around return to learn, return to play, and return to performance 
                        are guided by stepwise protocols aligned with international consensus statements.
                      </p>
                    </div>
                  </li>
                </ul>
              </Card>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                These principles inform every aspect of how the registry functions, ensuring 
                that our clinical observations are not only consistent but also aligned with 
                the standards of care recognized by the broader medical community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section — A Foundation for Clinical Excellence and Research (Original) */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <GraduationCap className="h-4 w-4" />
              Clinical Excellence
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-8">A Foundation for Clinical Excellence and Research</h2>
            
            <div className="space-y-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                The Registry is not only a tool for individual patient care. It is a 
                commitment to the broader pursuit of clinical excellence. By maintaining 
                consistency and rigor in how we observe recovery, we create a foundation 
                for reflection, improvement, and scientific contribution.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                This commitment extends beyond our clinic walls. Pittsford Performance 
                Care is proud to collaborate with Webster Central School District on 
                community-embedded initiatives aimed at supporting student athlete health. 
                Through this partnership, we are contributing to the validation of a 
                patented school based screening tool, work that reflects our belief that 
                clinical responsibility includes giving back to the community.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                The Registry aligns with the standards of scientific rigor, ensuring that 
                our observations can support ethical research and community benefit for 
                years to come.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section — Why It Matters (Original) */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Heart className="h-4 w-4" />
                Impact
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why It Matters</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                    <Heart className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">For Patients</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Confidence that recovery is being observed and understood. Clarity 
                      about progress. A sense of partnership in their own care. No more 
                      wondering if treatment is working.
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                    <Target className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">For Clinicians</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      A framework for consistent observation and thoughtful decision-making. 
                      The ability to see patterns that inform better care and guide treatment 
                      adjustments.
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                    <Shield className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">For Athletes</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Structured support for return to activity decisions. Safety grounded 
                      in observation, not guesswork. Clear criteria for when it's safe 
                      to return to play.
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">For the Community</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Trust that a local provider is committed to transparency, responsibility, 
                      and giving back through research and education. A clinic that leads 
                      by example.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: What This Enables for Our Patients */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <MessageSquare className="h-4 w-4" />
              Patient Benefits
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-8">What This Enables for Our Patients</h2>
            
            <div className="space-y-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                The registry is not an abstraction. It translates directly into tangible 
                benefits for the patients and families who trust us with their care.
              </p>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <Card className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Transparency in Every Conversation</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Patients and families can see the data that informs their care: no 
                    hidden judgments, no unexplained decisions.
                  </p>
                </Card>
                
                <Card className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Safer Return to Activity Decisions</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Whether returning to school, sport, or work, decisions are grounded 
                    in documented recovery rather than subjective readiness.
                  </p>
                </Card>
                
                <Card className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Clearer Communication</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    When schools, coaches, or employers need updates, families have 
                    objective information to share, not just reassurance.
                  </p>
                </Card>
                
                <Card className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Accountability You Can Trust</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The registry holds us accountable to the outcomes we promise. 
                    If progress stalls, we adjust, and the data proves it.
                  </p>
                </Card>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                This is what outcome driven care looks like in practice: not claims, 
                but structure; not promises, but documentation; not hope, but clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section — Closing + CTA */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Take the Next Step
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Recovery Without Mystery
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              At Pittsford Performance Care, we believe that recovery should never be 
              a mystery. The Outcome Registry is how we deliver on that promise, bringing 
              clarity, trust, and measurable progress to every patient we serve.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              If you're ready to experience care built on transparency and patient first 
              values, we invite you to take the next step.
            </p>
            
            <Button size="lg" asChild className="h-12 px-8 text-base rounded-xl">
              <Link to="/patient/concierge">
                Begin Your Intake
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteRegistry;
