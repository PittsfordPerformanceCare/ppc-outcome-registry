import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  Zap, 
  Target,
  ArrowRight, 
  CheckCircle2,
  Scale,
  Timer,
  RotateCcw,
  Dumbbell,
  HeartPulse
} from "lucide-react";

const SiteMsk = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Calming light blue gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-blue-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Activity className="h-4 w-4" />
              Musculoskeletal Care Division
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
              When Imaging Is Normal But You're Still Not Right
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Chronic pain, movement heaviness, and "I just don't feel like myself" aren't 
              imaginary. They're signs of neuromuscular dysfunction that standard tests miss.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
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
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                Does This Sound Like You?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                These aren't signs of weakness or aging—they're signs of neuromuscular 
                dysfunction that needs a different approach.
              </p>
            </div>
            
            {/* Clinical Symptom List */}
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
                <div 
                  key={index} 
                  className="flex items-center gap-4 p-5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                >
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  <p className="text-slate-700 dark:text-slate-300 font-medium">{symptom}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Imaging Misses It */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2">
                  <Dumbbell className="h-4 w-4" />
                  <span className="text-sm font-semibold tracking-wide">The Problem</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                  Why Your MRI Looks "Normal"
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  MRI and X-rays show structure, not function. They can't capture timing 
                  deficits, sequencing errors, or the neural control problems that actually 
                  drive most chronic pain.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Motor timing happens in milliseconds—invisible to imaging</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Sequencing errors don't show up on scans</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Neural control deficits require dynamic assessment</span>
                  </li>
                </ul>
                <p className="text-slate-600 dark:text-slate-400">
                  Our evaluation looks at how your nervous system controls movement—
                  not just whether your joints and muscles look intact.
                </p>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-primary/30 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                <div className="relative p-8 rounded-xl bg-card border border-border/60 backdrop-blur-sm">
                  <h3 className="font-semibold text-lg mb-6">What We Actually Assess:</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 transition-colors duration-300">
                      <Timer className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                      <span className="font-medium">Motor speed and reaction timing</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-xl bg-purple-500/5 hover:bg-purple-500/10 transition-colors duration-300">
                      <RotateCcw className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                      <span className="font-medium">Movement sequencing and coordination</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 hover:bg-green-500/10 transition-colors duration-300">
                      <Scale className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="font-medium">Left/right asymmetry under load</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 transition-colors duration-300">
                      <Zap className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                      <span className="font-medium">Cerebellar timing and output</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors duration-300">
                      <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="font-medium">Proprioceptive accuracy and integration</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Neuromuscular Drivers */}
      <section className="py-24 bg-white dark:bg-slate-900" id="neuromuscular-drivers">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide">Our Approach</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">The Neuromuscular Drivers of Pain</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
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

      {/* Movement Dysfunction Section - Similar to Energy Crisis */}
      <section className="py-24 relative overflow-hidden" id="movement-dysfunction">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-background to-primary/5" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-primary/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 mb-6">
                <HeartPulse className="h-4 w-4" />
                <span className="text-sm font-semibold tracking-wide">Understanding Dysfunction</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
                The Hidden Cost of Movement Dysfunction
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                When your nervous system can't properly control movement, every activity 
                costs more energy and causes more wear on your joints.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-10 items-stretch">
              {/* Left: What's Happening */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-primary/30 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                <div className="relative h-full p-8 rounded-2xl bg-card border border-border/60 backdrop-blur-sm space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-primary/10 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold">What's Really Happening</h3>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    Neural control problems don't always cause immediate pain—but they create 
                    inefficiency that accumulates over time, leading to chronic symptoms that 
                    seem to appear "out of nowhere."
                  </p>
                  
                  <div className="space-y-4 pt-2">
                    {[
                      { text: "Compensatory patterns overload specific tissues", icon: Activity },
                      { text: "Inefficient movement depletes energy reserves", icon: Zap },
                      { text: "Protective guarding limits natural motion", icon: Scale }
                    ].map((item, index) => {
                      const IconComponent = item.icon;
                      return (
                        <div 
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 transition-colors duration-300"
                        >
                          <IconComponent className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                          <span className="text-sm font-medium">{item.text}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <p className="text-sm text-muted-foreground pt-2 border-t border-border/50">
                    Our approach addresses the root neural control issues, not just 
                    the symptoms they create.
                  </p>
                </div>
              </div>
              
              {/* Right: Signs Grid */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/10 flex items-center justify-center">
                    <HeartPulse className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Common Warning Signs</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { sign: "Activities that used to be easy now feel hard", color: "from-blue-500/20 to-blue-500/5", borderColor: "hover:border-blue-500/40" },
                    { sign: "Pain that moves around or changes location", color: "from-sky-500/20 to-sky-500/5", borderColor: "hover:border-sky-500/40" },
                    { sign: "Stiffness that doesn't respond to stretching", color: "from-cyan-500/20 to-cyan-500/5", borderColor: "hover:border-cyan-500/40" },
                    { sign: "Favoring one side without realizing it", color: "from-teal-500/20 to-teal-500/5", borderColor: "hover:border-teal-500/40" },
                    { sign: "Muscles that fatigue faster than expected", color: "from-primary/20 to-primary/5", borderColor: "hover:border-primary/40" },
                    { sign: "Feeling uncoordinated or clumsy", color: "from-indigo-500/20 to-indigo-500/5", borderColor: "hover:border-indigo-500/40" }
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className={`group relative p-4 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${item.borderColor} animate-fade-in`}
                      style={{ animationDelay: `${index * 75}ms`, animationFillMode: 'backwards' }}
                    >
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      <div className="relative flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-primary mt-2 shrink-0" />
                        <span className="text-sm font-medium leading-relaxed">{item.sign}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* CTA */}
                <div className="pt-4">
                  <Link 
                    to="/site/articles/msk/motor-timing"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Learn more about motor timing deficits
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Evaluation Process */}
      <section className="py-20 bg-muted/30" id="evaluation">
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
