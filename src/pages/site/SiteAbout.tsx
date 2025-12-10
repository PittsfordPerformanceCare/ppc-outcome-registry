import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain, 
  Target, 
  BarChart3, 
  Users,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const SiteAbout = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              A Different Kind of Care
            </h1>
            <p className="text-xl text-muted-foreground">
              At Pittsford Performance Care, we don't just treat symptoms—we identify 
              and address the neurologic systems driving your condition.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Why We Exist</h2>
                <p className="text-muted-foreground">
                  Too many patients fall through the cracks of traditional healthcare. 
                  They're told their imaging is "normal," their symptoms are "just stress," 
                  or they need to "wait it out."
                </p>
                <p className="text-muted-foreground">
                  We started PPC because we knew there had to be a better way. By focusing 
                  on the neurologic systems that actually control function—not just the 
                  structures that show up on scans—we help patients who've tried everything 
                  else finally find answers.
                </p>
                <p className="text-muted-foreground">
                  Our approach combines advanced neurologic evaluation with validated 
                  outcome tracking, so you always know if you're actually getting better.
                </p>
              </div>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Neurologic Focus</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          We evaluate the systems that control function, not just 
                          the structures that show up on imaging.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Measured Outcomes</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Every episode is tracked with validated measures so you 
                          can see your progress objectively.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Targeted Treatment</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          We treat the specific systems causing your symptoms—
                          not just generic protocols.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Makes PPC Different</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three pillars that define our approach to care
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Systems-Based Evaluation</h3>
              <p className="text-sm text-muted-foreground">
                We don't just look at where it hurts. We evaluate all the neurologic 
                systems that could be contributing—visual, vestibular, cerebellar, 
                autonomic, and proprioceptive.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Registry-Tracked Outcomes</h3>
              <p className="text-sm text-muted-foreground">
                Every patient's progress is tracked in our Outcome Registry using 
                validated clinical measures. We don't guess—we prove improvement 
                with data.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Episode-Based Care</h3>
              <p className="text-sm text-muted-foreground">
                Each complaint is its own episode with clear intake, treatment, 
                and discharge criteria. No endless treatment plans—just focused 
                interventions with defined endpoints.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Registry Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="text-center p-6">
                    <div className="text-3xl font-bold text-primary">MCID</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Minimal Clinically Important Difference tracking
                    </p>
                  </Card>
                  <Card className="text-center p-6">
                    <div className="text-3xl font-bold text-primary">NDI</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Neck Disability Index
                    </p>
                  </Card>
                  <Card className="text-center p-6">
                    <div className="text-3xl font-bold text-primary">LEFS</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Lower Extremity Function Scale
                    </p>
                  </Card>
                  <Card className="text-center p-6">
                    <div className="text-3xl font-bold text-primary">RPQ</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Rivermead Post-Concussion
                    </p>
                  </Card>
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <h2 className="text-3xl font-bold">The PPC Outcome Registry</h2>
                <p className="text-muted-foreground">
                  Our proprietary registry tracks every episode from intake through 
                  discharge using validated clinical outcome measures. This means:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Objective proof of improvement (or lack thereof)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>MCID-tracked outcomes for clinical significance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Transparent reporting to you and your care team</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Data-driven treatment adjustments</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Experience the Difference?</h2>
          <p className="mb-6 opacity-90 max-w-xl mx-auto">
            Schedule your comprehensive neurologic evaluation and see what 
            systems-based care can do for you.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/patient/concierge">
              Schedule Evaluation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default SiteAbout;
