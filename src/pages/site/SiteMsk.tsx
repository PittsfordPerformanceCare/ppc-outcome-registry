import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  Zap, 
  Target,
  ArrowRight, 
  CheckCircle2,
  AlertTriangle,
  Scale,
  Timer,
  RotateCcw
} from "lucide-react";

const SiteMsk = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Activity className="h-4 w-4" />
              Musculoskeletal Care Division
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              When Imaging Is Normal But You're Still Not Right
            </h1>
            <p className="text-xl text-muted-foreground">
              Chronic pain, movement heaviness, and "I just don't feel like myself" aren't 
              imaginary. They're signs of neuromuscular dysfunction that standard tests miss.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link to="/patient/concierge">
                  Schedule MSK Evaluation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/patient/self-tests/msk">Take Self-Assessment</Link>
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
              Does This Sound Like You?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Pain that doesn't match your imaging results",
                "Movements feel heavy, slow, or effortful",
                "One side of your body doesn't work like the other",
                "Fatigue that limits your activity tolerance",
                "Strength training doesn't translate to function",
                "You've 'tried everything' without lasting relief",
                "Performance declined after injury or illness",
                "Something feels 'off' but you can't explain it"
              ].map((symptom, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <span>{symptom}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-8">
              These aren't signs of weakness or aging—they're signs of neuromuscular 
              dysfunction that needs a different approach.
            </p>
          </div>
        </div>
      </section>

      {/* Why Imaging Misses It */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">
                  Why Your MRI Looks "Normal"
                </h2>
                <p className="text-muted-foreground">
                  MRI and X-rays show structure, not function. They can't capture timing 
                  deficits, sequencing errors, or the neural control problems that actually 
                  drive most chronic pain.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Motor timing happens in milliseconds—invisible to imaging</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Sequencing errors don't show up on scans</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Neural control deficits require dynamic assessment</span>
                  </li>
                </ul>
                <p className="text-muted-foreground">
                  Our evaluation looks at how your nervous system controls movement—
                  not just whether your joints and muscles look intact.
                </p>
              </div>
              <div className="bg-background rounded-lg p-8 border">
                <h3 className="font-semibold mb-4">What We Actually Assess:</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Timer className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Motor speed and reaction timing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RotateCcw className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Movement sequencing and coordination</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Scale className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Left/right asymmetry under load</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Cerebellar timing and output</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Proprioceptive accuracy and integration</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Neuromuscular Drivers */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The Neuromuscular Drivers of Pain</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Chronic pain often comes from neural control problems—not damaged tissue. 
              Here's what we look for.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
                  <Timer className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-lg">Timing Deficits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  When muscles fire too slow or in the wrong order, joints take excessive 
                  load. This causes pain without structural damage.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2">
                  <Scale className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle className="text-lg">Asymmetry</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Side-to-side differences in strength, speed, or control create 
                  compensatory patterns that lead to overload injuries.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-2">
                  <RotateCcw className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-lg">Sequencing Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Complex movements require muscles to fire in precise order. Disrupted 
                  sequencing makes movement inefficient and painful.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-2">
                  <Activity className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle className="text-lg">Fatigue Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Abnormal fatigue curves reveal neural efficiency problems that cause 
                  early exhaustion and performance decline.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-2">
                  <Zap className="h-6 w-6 text-amber-500" />
                </div>
                <CardTitle className="text-lg">Cerebellar Output</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The cerebellum coordinates movement precision. Deficits here affect 
                  all motor control downstream.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Targeted Treatment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Once we identify which neural control systems are affected, treatment 
                  becomes precise—not just generic "strengthening."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Evaluation Process */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our MSK Evaluation</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A neuromuscular assessment that reveals what imaging can't show
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold">Intake Measures</h3>
              <p className="text-sm text-muted-foreground">
                Region-specific outcome measures establish your baseline
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold">Motor Testing</h3>
              <p className="text-sm text-muted-foreground">
                Speed, timing, and asymmetry assessment across movement patterns
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold">Driver Identification</h3>
              <p className="text-sm text-muted-foreground">
                Pinpoint which neural control systems are contributing to your symptoms
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="font-semibold">Treatment Plan</h3>
              <p className="text-sm text-muted-foreground">
                Targeted interventions to restore proper neural control
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Learn More About MSK Recovery</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link 
                to="/site/articles/msk/motor-timing"
                className="p-6 rounded-lg border hover:border-primary/50 transition-colors group"
              >
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  Motor Timing Deficits
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Why milliseconds matter for joint protection
                </p>
              </Link>
              <Link 
                to="/site/articles/msk/asymmetry"
                className="p-6 rounded-lg border hover:border-primary/50 transition-colors group"
              >
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  Movement Asymmetry
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  How side-to-side differences create pain
                </p>
              </Link>
              <Link 
                to="/site/articles/msk/chronic-pain"
                className="p-6 rounded-lg border hover:border-primary/50 transition-colors group"
              >
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  Chronic Pain Without Damage
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Understanding neuroplastic pain
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready for a Different Approach?</h2>
          <p className="mb-6 opacity-90 max-w-xl mx-auto">
            Stop chasing symptoms. Schedule your neuromuscular evaluation and 
            discover what's really driving your pain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/patient/concierge">Schedule Evaluation</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/patient/self-tests/msk">Take Self-Assessment</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteMsk;
