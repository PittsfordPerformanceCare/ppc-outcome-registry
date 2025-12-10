import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  Eye, 
  Ear, 
  Heart,
  Zap,
  Clock,
  ArrowRight, 
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

const SiteConcussion = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Brain className="h-4 w-4" />
              Concussion Care Division
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Still Struggling Months After Your Concussion?
            </h1>
            <p className="text-xl text-muted-foreground">
              Persistent post-concussion symptoms aren't just "in your head." They're real 
              neurologic deficits that require a systems-based evaluation—not just rest and time.
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
      </section>

      {/* Symptoms Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Do These Symptoms Sound Familiar?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Persistent headaches that won't go away",
                "Brain fog and difficulty concentrating",
                "Dizziness when moving your head",
                "Sensitivity to light and sound",
                "Feeling off-balance or unsteady",
                "Fatigue that limits your daily activities",
                "Trouble with screens and reading",
                "Anxiety or mood changes since injury"
              ].map((symptom, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <span>{symptom}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-8">
              If you've been told to "wait it out" but aren't improving, it's time for a 
              different approach.
            </p>
          </div>
        </div>
      </section>

      {/* Five-System Model */}
      <section className="py-20 bg-muted/30" id="five-system-model">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The Five-System Concussion Model</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Concussions rarely affect just one system. Our comprehensive evaluation 
              examines all five neurologic systems that can be disrupted by brain injury.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
                  <Eye className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-lg">Visual System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Eye tracking, convergence, accommodation, and visual processing 
                  deficits that cause reading difficulty and screen intolerance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2">
                  <Ear className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle className="text-lg">Vestibular System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Balance, spatial orientation, and gaze stability. Dysfunction here 
                  causes dizziness, motion sensitivity, and disorientation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-2">
                  <Brain className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-lg">Cerebellar System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Timing, coordination, and motor sequencing. Cerebellar deficits 
                  affect movement precision and cognitive processing speed.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-2">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle className="text-lg">Autonomic System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Heart rate variability, blood pressure regulation, and stress response. 
                  ANS dysfunction causes fatigue, exercise intolerance, and anxiety.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-2">
                  <Zap className="h-6 w-6 text-amber-500" />
                </div>
                <CardTitle className="text-lg">Cervical System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Neck proprioception and cervicogenic contributions to headache, 
                  dizziness, and visual disturbance often overlooked after injury.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Why It Matters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Targeting the wrong system wastes time. Our evaluation identifies 
                  exactly which systems are affected so treatment is precise.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Energy Crisis */}
      <section className="py-20 bg-background" id="energy-crisis">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">
                  The Post-Concussion Energy Crisis
                </h2>
                <p className="text-muted-foreground">
                  After a concussion, your brain's energy metabolism is disrupted. 
                  Normal activities now require more neural resources—leading to fatigue, 
                  brain fog, and symptom flares when you push too hard.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Reduced mitochondrial efficiency in affected areas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Increased metabolic demand for routine tasks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Threshold symptoms when energy reserves deplete</span>
                  </li>
                </ul>
                <p className="text-muted-foreground">
                  Our approach includes carefully dosed neurologic exercise to rebuild 
                  capacity without triggering symptom flares.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-8">
                <h3 className="font-semibold mb-4">Common Energy Crisis Signs:</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    <span>Worse symptoms later in the day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    <span>Crashes after cognitive or physical exertion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    <span>Need for frequent rest breaks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    <span>Inability to return to normal activity levels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    <span>Sleep doesn't fully restore energy</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Evaluation Process */}
      <section className="py-20 bg-muted/30" id="evaluation">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Neurologic Evaluation</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive assessment that goes far beyond standard concussion protocols
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold">Intake Measures</h3>
              <p className="text-sm text-muted-foreground">
                Validated outcome measures establish your baseline and track progress
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold">Systems Exam</h3>
              <p className="text-sm text-muted-foreground">
                Detailed testing of all five concussion systems to identify deficits
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold">Finding Report</h3>
              <p className="text-sm text-muted-foreground">
                Clear explanation of which systems are affected and why you have symptoms
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="font-semibold">Treatment Plan</h3>
              <p className="text-sm text-muted-foreground">
                Targeted interventions for your specific system deficits
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Learn More About Concussion Recovery</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link 
                to="/site/articles/concussion/visual-vestibular-mismatch"
                className="p-6 rounded-lg border hover:border-primary/50 transition-colors group"
              >
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  Visual-Vestibular Mismatch
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Why your eyes and inner ear aren't working together
                </p>
              </Link>
              <Link 
                to="/site/articles/concussion/autonomic-dysfunction"
                className="p-6 rounded-lg border hover:border-primary/50 transition-colors group"
              >
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  Autonomic Dysfunction
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  How ANS dysregulation causes fatigue and anxiety
                </p>
              </Link>
              <Link 
                to="/site/articles/concussion/return-to-activity"
                className="p-6 rounded-lg border hover:border-primary/50 transition-colors group"
              >
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  Return to Activity
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Safe progression back to work, school, and sport
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Find Answers?</h2>
          <p className="mb-6 opacity-90 max-w-xl mx-auto">
            Stop waiting for symptoms to resolve on their own. Schedule your 
            comprehensive neurologic evaluation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/patient/concierge">Schedule Evaluation</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/patient/self-tests/concussion">Take Self-Assessment</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteConcussion;
