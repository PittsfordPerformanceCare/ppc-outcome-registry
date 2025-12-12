import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain, 
  Target, 
  BarChart3, 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Heart
} from "lucide-react";

const SiteAbout = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-28 lg:py-36 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Heart className="h-4 w-4" />
              Our Philosophy
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              A Different Kind of Care
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              At Pittsford Performance Care, we don't just treat symptoms—we identify 
              and address the neurologic systems driving your condition. Our approach 
              combines advanced clinical evaluation with validated outcome tracking, 
              ensuring you always know whether you're actually getting better.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                    <Sparkles className="h-4 w-4" />
                    Our Story
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Why We Exist</h2>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Too many patients fall through the cracks of traditional healthcare. 
                  They're told their imaging is "normal," their symptoms are "just stress," 
                  or they need to "wait it out." Meanwhile, they continue to struggle with 
                  very real problems that impact their daily lives.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We started Pittsford Performance Care because we knew there had to be a better way. 
                  By focusing on the neurologic systems that actually control function—not just the 
                  structures that show up on scans—we help patients who've tried everything 
                  else finally find answers and a path forward.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our approach combines advanced neurologic evaluation with validated 
                  outcome tracking. This means you're never left guessing. Every step 
                  of the way, you have objective data showing whether treatment is working.
                </p>
              </div>
              
              <div className="space-y-6">
                <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Brain className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">Neurologic Focus</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        We evaluate the systems that control function, not just 
                        the structures that show up on imaging. This reveals 
                        dysfunction that traditional approaches often miss.
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <BarChart3 className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">Measured Outcomes</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Every episode is tracked with validated clinical measures 
                        so you can see your progress objectively. No guessing—just 
                        clear data on what's working.
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
                      <h3 className="text-lg font-bold mb-2">Targeted Treatment</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        We treat the specific systems causing your symptoms—
                        not just generic protocols. This means faster recovery 
                        and more lasting results.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Target className="h-4 w-4" />
                Clinical Approach
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">What Makes PPC Different</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Three foundational pillars define our approach to care—each designed 
                to ensure you receive focused, effective, and measurable treatment.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Systems-Based Evaluation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We don't just look at where it hurts. We evaluate all the neurologic 
                  systems that could be contributing—visual, vestibular, cerebellar, 
                  autonomic, and proprioceptive. This comprehensive view reveals 
                  dysfunction that focused exams often miss.
                </p>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Registry-Tracked Outcomes</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every patient's progress is tracked in our Outcome Registry using 
                  validated clinical measures. We don't guess—we prove improvement 
                  with data. This accountability benefits both you and your referring 
                  providers.
                </p>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Episode-Based Care</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Each complaint is its own episode with clear intake, treatment, 
                  and discharge criteria. No endless treatment plans—just focused 
                  interventions with defined endpoints. You know what to expect 
                  from day one.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Registry Section */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="text-center p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <div className="text-3xl font-bold text-primary mb-2">MCID</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Minimal Clinically Important Difference tracking
                    </p>
                  </Card>
                  <Card className="text-center p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <div className="text-3xl font-bold text-primary mb-2">NDI</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Neck Disability Index
                    </p>
                  </Card>
                  <Card className="text-center p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <div className="text-3xl font-bold text-primary mb-2">LEFS</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Lower Extremity Function Scale
                    </p>
                  </Card>
                  <Card className="text-center p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <div className="text-3xl font-bold text-primary mb-2">RPQ</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Rivermead Post-Concussion Questionnaire
                    </p>
                  </Card>
                </div>
              </div>
              
              <div className="order-1 lg:order-2 space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                    <BarChart3 className="h-4 w-4" />
                    Outcome-Driven Care
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">The PPC Outcome Registry</h2>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our proprietary registry tracks every episode from intake through 
                  discharge using validated clinical outcome measures. This isn't 
                  just for our records—it's for you, your family, and any providers 
                  coordinating your care.
                </p>
                
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-lg text-muted-foreground leading-relaxed">
                      Objective proof of improvement (or lack thereof)
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-lg text-muted-foreground leading-relaxed">
                      MCID-tracked outcomes for clinical significance
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-lg text-muted-foreground leading-relaxed">
                      Transparent reporting to you and your care team
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-lg text-muted-foreground leading-relaxed">
                      Data-driven treatment adjustments when needed
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical & Research Foundations */}
      <section className="py-20 lg:py-28 bg-background border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">
              Clinical & Research Foundations
            </h3>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              PPC's clinical methodology is informed by consensus guidelines, peer-reviewed 
              research, and established best practices in neurologic rehabilitation. Our 
              systems-based approach reflects the current understanding of how the brain 
              and nervous system recover from injury and dysfunction.
            </p>
            
            <ul className="space-y-4">
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
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Take the Next Step
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience the Difference?
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              Schedule your comprehensive neurologic evaluation and see what 
              systems-based care can do for you. Our team is ready to help 
              you find answers and build a path toward recovery.
            </p>
            
            <Button size="lg" asChild className="h-12 px-8 text-base rounded-xl">
              <Link to="/patient/concierge">
                Schedule Evaluation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteAbout;
