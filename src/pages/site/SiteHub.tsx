import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Brain, 
  Activity, 
  Target, 
  ArrowRight, 
  CheckCircle2,
  BarChart3,
  Users,
  Sparkles,
  Network
} from "lucide-react";

const SiteHub = () => {
  return (
    <div className="flex flex-col">
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
              and treat persistent symptoms across concussion recovery and chronic musculoskeletal 
              conditions. When imaging is normal but symptoms persist, domain specific dysfunction 
              is often the cause.
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

      {/* Domain Map Framework Section */}
      <section className="py-16 lg:py-20 bg-background border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              The Neurologic Domain Map
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Every patient is evaluated through the same neurologic framework. Our domain mapped 
              evaluation identifies which of six core neurologic domains are impaired, how they 
              interact, and which domain should be treated first.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Visual",
                "Vestibular", 
                "Cerebellar",
                "Autonomic",
                "Proprioceptive / Cervical",
                "Frontal / Executive Integration"
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

      {/* Two Pillars */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Target className="h-4 w-4" />
                Two Clinical Pillars
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Choose Your Entry Point</h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Patients enter through one of two clinical pillars, but every evaluation uses 
                the same neurologic domain map. Whether symptoms began with a head injury or 
                developed over time, domain specific dysfunction drives persistent problems.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Concussion Pillar */}
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Brain className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Concussion and Post Concussion Care</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Persistent post concussion symptoms occur when neurologic domains fail to 
                  reintegrate after injury. Our domain mapped evaluation determines which 
                  domains are impaired and how they interact.
                </p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Visual and vestibular domain testing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Cerebellar timing and coordination</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Autonomic regulation assessment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Frontal executive integration</span>
                  </li>
                </ul>
                
                <Button asChild className="w-full h-12 text-base rounded-xl">
                  <Link to="/site/concussion">
                    Explore Concussion Care
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </Card>

              {/* MSK Pillar */}
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Activity className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Musculoskeletal and Chronic Pain Care</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Persistent pain despite normal imaging often reflects domain specific 
                  dysfunction in proprioceptive, cerebellar, or autonomic systems. The same 
                  neurologic framework applies.
                </p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Proprioceptive and cervical domain mapping</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Motor timing and sequencing analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Compensation and asymmetry detection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Functional integration testing</span>
                  </li>
                </ul>
                
                <Button asChild className="w-full h-12 text-base rounded-xl">
                  <Link to="/site/msk">
                    Explore MSK Care
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Outcome Registry Advantage */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                    <BarChart3 className="h-4 w-4" />
                    Registry Advantage
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Measured Outcomes, Not Just Reported Improvement
                  </h2>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our PPC Outcome Registry tracks validated clinical measures from intake 
                  through discharge. This means we can prove your progress with objective data, 
                  not just subjective reports. You always know whether treatment is working.
                </p>
                
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">MCID tracked outcomes</span>
                      <p className="text-muted-foreground text-sm mt-1">
                        Every episode measured for clinically meaningful improvement
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Live analytics</span>
                      <p className="text-muted-foreground text-sm mt-1">
                        Track your recovery trajectory with objective data
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Transparent results</span>
                      <p className="text-muted-foreground text-sm mt-1">
                        Shared with you and your care team for coordinated care
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <Card className="text-center p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="text-4xl font-bold text-primary mb-2">92%</div>
                  <p className="text-muted-foreground leading-relaxed">
                    Patients achieve meaningful improvement
                  </p>
                </Card>
                <Card className="text-center p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="text-4xl font-bold text-primary mb-2">6.2</div>
                  <p className="text-muted-foreground leading-relaxed">
                    Average visits to resolution
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
                    Outcomes transparently tracked
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Get Started */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Your Path Forward
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">How Domain Mapped Care Works</h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Recovery begins with understanding which neurologic domains are impaired. 
                Our evaluation identifies the source. Treatment follows the map.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Schedule Online</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Describe your symptoms through our concierge. We match you with the 
                  right clinician based on your clinical pillar.
                </p>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Domain Mapped Evaluation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Complete validated outcome measures and undergo neurologic domain 
                  testing. We identify which domains are impaired and how they interact.
                </p>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Targeted Domain Treatment</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Receive care targeted to your specific domain deficits. Track 
                  recovery with validated outcome measures throughout your episode.
                </p>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Button size="lg" asChild className="h-12 px-8 text-base rounded-xl">
                <Link to="/patient/concierge">
                  Start Your Evaluation
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
              Educational Resources
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Learn More About Your Condition</h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              Explore our resource library for in-depth articles on concussion recovery, 
              movement dysfunction, and the neurologic systems driving your symptoms.
            </p>
            
            <Button size="lg" asChild className="h-12 px-8 text-base rounded-xl">
              <Link to="/site/articles">
                Browse Resources
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
