import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  HeartPulse,
  Users,
  Shield
} from "lucide-react";

const SiteMsk = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Refined, calming gradient */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        {/* Calming gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-200/30 via-transparent to-transparent dark:from-blue-900/20" />
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium backdrop-blur-sm">
              <Activity className="h-4 w-4" />
              Musculoskeletal Care
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              When Imaging Is Normal But You're Still Not Right
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Chronic pain, movement heaviness, and "I just don't feel like myself" aren't 
              imaginary. They're signs of neuromuscular dysfunction that standard tests miss.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="shadow-lg">
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
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Section 2: Symptoms - Does This Sound Like You? */}
      <section className="py-20 lg:py-28 bg-background relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <HeartPulse className="h-4 w-4" />
                Common Experiences
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Does This Sound Like You?
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Pain that doesn't match your imaging results. Movements that feel heavy, slow, or 
                effortful. One side of your body that doesn't work like the other. Fatigue that 
                limits your activity tolerance, even when you're doing everything right.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Strength training that doesn't translate to function. The frustration of having 
                "tried everything" without lasting relief. Performance that declined after injury 
                or illness and never fully returned. Something that feels "off" but you can't 
                quite explain it.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                These aren't signs of weakness or aging. They're signs of neuromuscular dysfunction 
                that needs a different approach—one that looks beyond structure to understand how 
                your nervous system controls movement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Why Imaging Misses It */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                  <Dumbbell className="h-4 w-4" />
                  The Problem
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Why Your MRI Looks "Normal"
                </h2>
                <div className="prose prose-lg dark:prose-invert">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    MRI and X-rays show structure, not function. They can't capture timing 
                    deficits, sequencing errors, or the neural control problems that actually 
                    drive most chronic pain.
                  </p>
                </div>
                <ul className="space-y-4 pt-2">
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">Motor timing happens in milliseconds—invisible to imaging</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">Sequencing errors don't show up on scans</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">Neural control deficits require dynamic assessment</span>
                  </li>
                </ul>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-primary/20 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                <div className="relative p-8 rounded-2xl bg-card border border-border/60 backdrop-blur-sm">
                  <h3 className="font-semibold text-xl mb-6">What We Actually Assess</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:from-blue-500/15 hover:to-blue-500/10 transition-colors duration-300">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                        <Timer className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium pt-2">Motor speed and reaction timing</span>
                    </li>
                    <li className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 hover:from-purple-500/15 hover:to-purple-500/10 transition-colors duration-300">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                        <RotateCcw className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="font-medium pt-2">Movement sequencing and coordination</span>
                    </li>
                    <li className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 hover:from-green-500/15 hover:to-green-500/10 transition-colors duration-300">
                      <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                        <Scale className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="font-medium pt-2">Left/right asymmetry under load</span>
                    </li>
                    <li className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 hover:from-amber-500/15 hover:to-amber-500/10 transition-colors duration-300">
                      <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                        <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="font-medium pt-2">Cerebellar timing and output</span>
                    </li>
                    <li className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 transition-colors duration-300">
                      <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium pt-2">Proprioceptive accuracy and integration</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Neuromuscular Drivers */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Activity className="h-4 w-4" />
                Our Approach
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                The Neuromuscular Drivers of Pain
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Chronic pain often comes from neural control problems—not damaged tissue. 
                Here's what we look for.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center mb-6">
                  <Timer className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Timing Deficits</h3>
                <p className="text-muted-foreground leading-relaxed">
                  When muscles fire too slow or in the wrong order, joints take excessive 
                  load. This causes pain without structural damage.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center mb-6">
                  <Scale className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Asymmetry</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Side-to-side differences in strength, speed, or control create 
                  compensatory patterns that lead to overload injuries.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center mb-6">
                  <RotateCcw className="h-7 w-7 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Sequencing Errors</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Complex movements require muscles to fire in precise order. Disrupted 
                  sequencing makes movement inefficient and painful.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center mb-6">
                  <Activity className="h-7 w-7 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Fatigue Patterns</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Abnormal fatigue curves reveal neural efficiency problems that cause 
                  early exhaustion and performance decline.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center mb-6">
                  <Zap className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Cerebellar Output</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The cerebellum coordinates movement precision. Deficits here affect 
                  all motor control downstream.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Targeted Treatment</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Once we identify which neural control systems are affected, treatment 
                  becomes precise—not just generic "strengthening."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Movement Dysfunction */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <HeartPulse className="h-4 w-4" />
                Understanding Dysfunction
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
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
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-primary/20 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                <div className="relative h-full p-8 rounded-2xl bg-card border border-border/60 backdrop-blur-sm space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-primary/10 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                          className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:from-blue-500/15 hover:to-blue-500/10 transition-colors duration-300"
                        >
                          <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <span className="font-medium">{item.text}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <p className="text-sm text-muted-foreground pt-4 border-t border-border/50">
                    Our approach addresses the root neural control issues, not just 
                    the symptoms they create.
                  </p>
                </div>
              </div>
              
              {/* Right: Signs Grid */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/10 flex items-center justify-center">
                    <HeartPulse className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Common Warning Signs</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Activities that used to be easy now feel hard",
                    "Pain that moves around or changes location",
                    "Stiffness that doesn't respond to stretching",
                    "Favoring one side without realizing it",
                    "Muscles that fatigue faster than expected",
                    "Feeling uncoordinated or clumsy"
                  ].map((sign, index) => (
                    <div 
                      key={index}
                      className="group flex items-start gap-3 p-4 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30"
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm font-medium leading-relaxed">{sign}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Evaluation Process */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Target className="h-4 w-4" />
                The Process
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our MSK Evaluation
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A neuromuscular assessment that reveals what imaging can't show
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Intake Measures", description: "Region-specific outcome measures establish your baseline" },
                { step: "2", title: "Motor Testing", description: "Speed, timing, and asymmetry assessment across movement patterns" },
                { step: "3", title: "Driver Identification", description: "Pinpoint which neural control systems are contributing to your symptoms" },
                { step: "4", title: "Treatment Plan", description: "Targeted interventions to restore proper neural control" }
              ].map((item, index) => (
                <div key={index} className="group p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Who This Helps */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              Who We Help
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              MSK Care for Everyone
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto">
              Neuromuscular dysfunction doesn't discriminate. Our approach helps anyone 
              dealing with chronic pain, movement limitations, or unexplained symptoms.
            </p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {[
                "Active adults with chronic pain",
                "Athletes recovering from injury",
                "Post-surgical patients",
                "Those with 'normal' imaging but ongoing symptoms",
                "People who've tried everything else",
                "Anyone seeking better movement quality"
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/60 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm font-medium text-left">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Related Articles */}
      <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                Deep Dive Resources
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Learn More About MSK Recovery
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our in-depth guides on neuromuscular dysfunction and evidence-based treatment strategies.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Motor Timing Deficits",
                  description: "Why milliseconds matter for joint protection—and how timing errors cause pain without structural damage.",
                  href: "/site/articles/msk/motor-timing",
                  icon: Timer,
                  color: "blue"
                },
                {
                  title: "Movement Asymmetry",
                  description: "How side-to-side differences in strength and control create compensatory patterns that lead to injury.",
                  href: "/site/articles/msk/asymmetry",
                  icon: Scale,
                  color: "teal"
                },
                {
                  title: "Chronic Pain Without Damage",
                  description: "Understanding neuroplastic pain and why your imaging looks normal but you still hurt.",
                  href: "/site/articles/msk/chronic-pain",
                  icon: Activity,
                  color: "indigo"
                }
              ].map((article, index) => {
                const IconComponent = article.icon;
                return (
                  <Link 
                    key={index}
                    to={article.href}
                    className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                      <IconComponent className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <span>Read Article</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
            
            <div className="flex justify-center mt-12">
              <Link 
                to="/site/articles" 
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full border border-border/60 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <span className="font-semibold">Browse All Resources</span>
                <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight">
              Ready for a Different Approach?
            </h2>
            <p className="text-xl text-primary-foreground/90 leading-relaxed max-w-2xl mx-auto">
              Stop chasing symptoms. Schedule your neuromuscular evaluation and 
              discover what's really driving your pain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" asChild className="shadow-xl">
                <Link to="/patient/concierge">
                  Schedule Evaluation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/patient/self-tests/msk">Take Self-Assessment</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteMsk;
