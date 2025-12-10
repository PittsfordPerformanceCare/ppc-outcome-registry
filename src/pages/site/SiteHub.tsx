import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  Activity, 
  Target, 
  ArrowRight, 
  CheckCircle2,
  BarChart3,
  Users,
  Clock,
  Zap
} from "lucide-react";

const SiteHub = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Neurologic-Driven Care for
              <span className="text-primary block mt-2">Lasting Recovery</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              At Pittsford Performance Care, we go beyond symptom management. 
              Our advanced neurologic evaluations identify the root causes of 
              persistent concussion symptoms and movement dysfunction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link to="/patient/concierge">
                  Schedule Your Evaluation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/site/about">Learn Our Approach</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Two Divisions */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Two Specialized Divisions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you're recovering from a concussion or dealing with chronic pain, 
              our neurologic approach addresses the systems driving your symptoms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Concussion Division */}
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Concussion Care</CardTitle>
                <CardDescription>
                  Persistent post-concussion symptoms require a systems-based approach
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Five-System Concussion Model evaluation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Visual-vestibular mismatch testing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Autonomic nervous system assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Cerebellar timing analysis</span>
                  </li>
                </ul>
                <Button asChild className="w-full mt-4">
                  <Link to="/site/concussion">
                    Explore Concussion Care
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* MSK Division */}
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary" />
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Musculoskeletal Care</CardTitle>
                <CardDescription>
                  When imaging is normal but function isn't, we find the neural drivers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Neuromuscular timing assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Motor sequencing evaluation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Asymmetry and compensation mapping</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Functional movement integration</span>
                  </li>
                </ul>
                <Button asChild className="w-full mt-4">
                  <Link to="/site/msk">
                    Explore MSK Care
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Outcome Registry Advantage */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <BarChart3 className="h-4 w-4" />
                  The Registry Advantage
                </div>
                <h2 className="text-3xl font-bold">
                  Measured Outcomes, Not Just Reported Improvement
                </h2>
                <p className="text-muted-foreground">
                  Our PPC Outcome Registry tracks validated clinical measures from intake 
                  through discharge. This means we can prove your progress with objective data—
                  not just subjective reports.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>MCID-tracked outcomes for every episode</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <BarChart3 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Real-time analytics on your recovery trajectory</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Transparent results shared with your care team</span>
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="text-center p-6">
                  <div className="text-4xl font-bold text-primary">92%</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Patients achieve meaningful improvement
                  </p>
                </Card>
                <Card className="text-center p-6">
                  <div className="text-4xl font-bold text-primary">6.2</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Average visits to resolution
                  </p>
                </Card>
                <Card className="text-center p-6">
                  <div className="text-4xl font-bold text-primary">4.8★</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Patient satisfaction rating
                  </p>
                </Card>
                <Card className="text-center p-6">
                  <div className="text-4xl font-bold text-primary">100%</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Outcomes transparently tracked
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Get Started */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How to Get Started</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your path to recovery begins with a comprehensive neurologic evaluation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold text-lg">Schedule Online</h3>
              <p className="text-sm text-muted-foreground">
                Use our concierge to describe your symptoms and book your evaluation
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold text-lg">Neurologic Evaluation</h3>
              <p className="text-sm text-muted-foreground">
                Complete intake measures and undergo comprehensive systems assessment
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold text-lg">Targeted Treatment</h3>
              <p className="text-sm text-muted-foreground">
                Receive a personalized care plan targeting your specific system deficits
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link to="/patient/concierge">
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Resources CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Learn More About Your Condition</h2>
          <p className="mb-6 opacity-90 max-w-xl mx-auto">
            Explore our resource library for in-depth articles on concussion recovery, 
            movement dysfunction, and the neurologic systems driving your symptoms.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/site/articles">Browse Resources</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default SiteHub;
