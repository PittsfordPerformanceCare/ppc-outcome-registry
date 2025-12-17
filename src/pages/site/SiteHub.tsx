import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Brain, 
  Activity, 
  Target, 
  ArrowRight, 
  BarChart3,
  Users,
  Sparkles,
  Network
} from "lucide-react";
import LexiconTerm from "@/components/patient/LexiconTerm";
import { getLexiconByTerm } from "@/data/patientLexicon";

const SiteHub = () => {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Our Approach | Domain-Based Neurologic Care | Pittsford Performance Care</title>
        <meta name="description" content="One neurologic framework for concussion and MSK care. PPC uses domain-based evaluation to identify dysfunction and track outcomes." />
        <link rel="canonical" href="https://muse-meadow-app.lovable.app/site/hub" />
      </Helmet>
      {/* Hero Section */}
      <section className="relative py-28 lg:py-36 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Network className="h-4 w-4" />
              Domain Mapped Neurologic Care
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              One Neurologic Framework.
              <span className="text-primary block mt-2">Two Clinical Pillars.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              At Pittsford Performance Care, we use a single neurologic domain map to evaluate 
              and treat symptoms across concussion recovery and chronic musculoskeletal 
              conditions. Whether you're recovering from a recent injury or stuck with persistent 
              symptoms others couldn't resolve—our{" "}
              <LexiconTerm 
                term={getLexiconByTerm("neuro-based care")?.label || "Neuro-Based Care"} 
                definition={getLexiconByTerm("neuro-based care")?.definition || ""}
              >
                neuro-based approach
              </LexiconTerm>{" "}
              finds what's wrong and fixes it.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="h-12 px-8 text-base rounded-xl">
                <Link to="/patient/concierge">
                  Schedule Your Evaluation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base rounded-xl">
                <Link to="/site/about">Learn Our Approach</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Help */}
      <section className="py-16 lg:py-20 bg-background border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                We Help Patients at Every Stage
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From acute injuries to cases others couldn't solve—our domain-based evaluation 
                identifies dysfunction that standard tests miss.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-2">New Injuries & Acute Recovery</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Get the right evaluation from day one. Our domain-mapped approach accelerates 
                  recovery and prevents symptoms from becoming chronic. Most patients recover 
                  in just 6 visits.
                </p>
              </div>
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-2">Complex & Persistent Cases</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your MRI was normal but symptoms persist? We specialize in finding what others 
                  overlook. If previous treatment didn't work, you're in the right place.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {[
                "Vision & Eye Movement",
                "Balance & Inner Ear", 
                "Coordination & Timing",
                "Heart Rate & Energy",
                "Neck & Body Awareness",
                "Focus & Processing"
              ].map((domain) => (
                <span 
                  key={domain}
                  className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
                >
                  {domain}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Two Pillars - Which Path Is Right For You */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Target className="h-4 w-4" />
                Find Your Path
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Which Sounds Like You?</h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Whether your symptoms started with a head injury or developed gradually, 
                we use the same advanced evaluation to find what's really going on. 
                Choose the path that fits your story.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Concussion Pillar */}
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Brain className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Concussion & Post-Concussion</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Your CT or MRI was normal, but the headaches, brain fog, and dizziness 
                  haven't gone away. You've been told to "just rest"—but rest isn't working.
                </p>
                
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6">
                  <p className="text-sm font-medium text-foreground mb-2">You're in the right place if:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Symptoms persist weeks or months after injury</li>
                    <li>• Screen time, crowds, or stores make symptoms worse</li>
                    <li>• You feel "off" but can't explain exactly how</li>
                    <li>• Previous treatment hasn't helped</li>
                  </ul>
                </div>
                
                <Button asChild className="w-full h-12 text-base rounded-xl">
                  <Link to="/site/concussion">
                    Learn How We Help Concussion Patients
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </Card>

              {/* MSK Pillar */}
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Activity className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Chronic Pain & Movement Issues</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The pain keeps coming back. Physical therapy helped temporarily, but 
                  it didn't stick. You're starting to wonder if anyone can actually fix this.
                </p>
                
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6">
                  <p className="text-sm font-medium text-foreground mb-2">You're in the right place if:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Pain persists despite "normal" imaging</li>
                    <li>• Traditional PT provided only temporary relief</li>
                    <li>• Pain moves around or affects multiple areas</li>
                    <li>• You've been dealing with this for months or years</li>
                  </ul>
                </div>
                
                <Button asChild className="w-full h-12 text-base rounded-xl">
                  <Link to="/site/msk">
                    Learn How We Treat Chronic Pain
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </Card>
            </div>

            <p className="text-center text-muted-foreground mt-10 text-sm italic">
              Not sure which applies to you? That's okay—we'll figure it out together during your evaluation.
            </p>
          </div>
        </div>
      </section>

      {/* We Track Results - No Guessing */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                    <BarChart3 className="h-4 w-4" />
                    Proof, Not Promises
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    We Measure Everything—So You Know It's Working
                  </h2>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Tired of hearing "you should feel better" without any proof? Our{" "}
                  <LexiconTerm 
                    term={getLexiconByTerm("outcome registry")?.label || "Outcome Registry"} 
                    definition={getLexiconByTerm("outcome registry")?.definition || ""}
                  >
                    outcome registry
                  </LexiconTerm>{" "}
                  tracks your progress with validated clinical measures from day one. You'll see exactly 
                  how much you've improved—not just how you feel on a good day.
                </p>
                
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Meaningful improvement measured</span>
                      <p className="text-muted-foreground text-sm mt-1">
                        We don't guess—we use clinical standards to prove you're getting better
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">See your progress in real time</span>
                      <p className="text-muted-foreground text-sm mt-1">
                        Track your recovery with objective data, not just how you feel
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Share with your other doctors</span>
                      <p className="text-muted-foreground text-sm mt-1">
                        We keep your care team in the loop with clear progress reports
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <Card className="text-center p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="text-4xl font-bold text-primary mb-2">92%</div>
                  <p className="text-muted-foreground leading-relaxed">
                    Of patients get meaningfully better
                  </p>
                </Card>
                <Card className="text-center p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="text-4xl font-bold text-primary mb-2">6</div>
                  <p className="text-muted-foreground leading-relaxed">
                    Average visits to feel like yourself again
                  </p>
                </Card>
                <Card className="text-center p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="text-4xl font-bold text-primary mb-2">4.8★</div>
                  <p className="text-muted-foreground leading-relaxed">
                    Patient satisfaction rating
                  </p>
                </Card>
                <Card className="text-center p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="text-4xl font-bold text-primary mb-2">100%</div>
                  <p className="text-muted-foreground leading-relaxed">
                    Of outcomes tracked transparently
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simple Steps */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Getting Started Is Easy
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">What Happens Next</h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                You've tried enough things that didn't work. Here's exactly what to expect 
                when you come see us—no surprises, no runaround.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Tell Us Your Story</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Fill out a quick form about your symptoms. We actually read it—and 
                  we'll match you with the right specialist for your situation.
                </p>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Get a Real Evaluation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We test things other providers don't look at. You'll leave your 
                  first visit understanding exactly what's wrong and what to do about it.
                </p>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Start Getting Better</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Targeted treatment for your specific problem—not a generic protocol. 
                  You'll see measurable progress, not just hope things improve.
                </p>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Button size="lg" asChild className="h-12 px-8 text-base rounded-xl">
                <Link to="/patient/concierge">
                  Ready to Feel Better? Let's Talk
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Resources CTA */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Brain className="h-4 w-4" />
              Want to Learn More?
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Understand What's Happening in Your Body</h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              We believe you should understand your own condition. Explore our articles 
              on concussion recovery, chronic pain, and why traditional approaches often fall short.
            </p>
            
            <Button size="lg" asChild className="h-12 px-8 text-base rounded-xl">
              <Link to="/site/articles">
                Read Our Articles
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteHub;
