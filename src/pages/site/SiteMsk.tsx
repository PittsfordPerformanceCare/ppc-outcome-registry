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
      {/* Hero Section */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-200/30 via-transparent to-transparent dark:from-blue-900/20" />
        
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
        
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Section 2: Symptoms - Does This Sound Like You? */}
      <section className="py-20 lg:py-28 bg-background">
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
                effortful—like your body isn't responding the way it used to. One side that doesn't 
                work quite like the other. Fatigue that limits your activity tolerance, even when 
                you're doing everything right.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Strength training that doesn't translate to function. The frustration of having 
                "tried everything" without lasting relief. Performance that declined after an injury 
                or illness and never fully returned. Something that feels fundamentally "off" but 
                you can't quite explain it to your doctor.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                These aren't signs of weakness or aging. They're not in your head. They're signs 
                of neuromuscular dysfunction—problems with how your nervous system controls movement 
                that require a different approach. One that looks beyond structure to understand the 
                neural control systems that govern how you move.
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
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Dumbbell className="h-4 w-4" />
                The Problem
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Your MRI Looks "Normal"
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                MRI and X-rays show structure, not function. They can capture a torn ligament or 
                a herniated disc, but they can't see timing deficits, sequencing errors, or the 
                neural control problems that actually drive most chronic pain. Motor timing happens 
                in milliseconds—invisible to any imaging technology.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                This is why so many people receive imaging that looks relatively normal despite 
                significant symptoms. The problem isn't structural—it's functional. Sequencing 
                errors don't show up on scans. Neural control deficits require dynamic assessment, 
                not static pictures. And until someone evaluates how your nervous system actually 
                controls movement, the real drivers of your symptoms remain hidden.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our evaluation focuses on what imaging misses: motor speed and reaction timing, 
                movement sequencing and coordination, left/right asymmetry under load, cerebellar 
                timing and output, and proprioceptive accuracy and integration. These are the 
                systems that determine how well you move—and whether movement causes pain.
              </p>
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
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Timer className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Timing Deficits</h3>
                <p className="text-muted-foreground leading-relaxed">
                  When muscles fire too slow or in the wrong order, joints take excessive 
                  load. This causes pain without structural damage.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Scale className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Asymmetry</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Side-to-side differences in strength, speed, or control create 
                  compensatory patterns that lead to overload injuries.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <RotateCcw className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Sequencing Errors</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Complex movements require muscles to fire in precise order. Disrupted 
                  sequencing makes movement inefficient and painful.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Activity className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Fatigue Patterns</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Abnormal fatigue curves reveal neural efficiency problems that cause 
                  early exhaustion and performance decline.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Zap className="h-7 w-7 text-primary" />
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
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <HeartPulse className="h-4 w-4" />
                Understanding Dysfunction
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                The Hidden Cost of Movement Dysfunction
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                When your nervous system can't properly control movement, every activity costs 
                more energy and causes more wear on your joints. Neural control problems don't 
                always cause immediate pain—but they create inefficiency that accumulates over 
                time, leading to chronic symptoms that seem to appear "out of nowhere."
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Compensatory patterns overload specific tissues while others remain underutilized. 
                Inefficient movement depletes your energy reserves faster than it should. Protective 
                guarding—your body's attempt to avoid pain—limits natural motion and creates new 
                problems elsewhere in the kinetic chain.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                You might notice activities that used to be easy now feel hard. Pain that moves 
                around or changes location. Stiffness that doesn't respond to stretching. Favoring 
                one side without even realizing it. Muscles that fatigue faster than expected. 
                Feeling uncoordinated or clumsy in ways you never did before.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our approach addresses the root neural control issues, not just the symptoms 
                they create. By restoring proper timing, sequencing, and coordination, we help 
                your nervous system work efficiently again—reducing pain and restoring function.
              </p>
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
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold text-lg mb-3">Intake Measures</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Region-specific outcome measures establish your baseline
                </p>
              </div>
              
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold text-lg mb-3">Motor Testing</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Speed, timing, and asymmetry assessment across movement patterns
                </p>
              </div>
              
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold text-lg mb-3">Driver Identification</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pinpoint which neural control systems are contributing to your symptoms
                </p>
              </div>
              
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <h3 className="font-semibold text-lg mb-3">Treatment Plan</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Targeted interventions to restore proper neural control
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Who This Helps */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Users className="h-4 w-4" />
                Who We Help
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                MSK Care for Everyone
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto mb-12">
              <p className="text-lg text-muted-foreground leading-relaxed text-center">
                Neuromuscular dysfunction doesn't discriminate. It affects active adults dealing 
                with chronic pain that hasn't responded to conventional treatment. Athletes 
                recovering from injury who can't seem to get back to their previous level. 
                Post-surgical patients whose outcomes haven't matched expectations.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed text-center">
                It affects those with "normal" imaging but ongoing symptoms that no one can 
                explain. People who've tried physical therapy, chiropractic, injections, and 
                more without lasting relief. Anyone seeking better movement quality—whether 
                for sport, work, or simply living without pain.
              </p>
            </div>
            
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
      <section className="py-28 lg:py-36 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                <Shield className="h-4 w-4" />
                Deep Dive Resources
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Learn More About MSK Recovery
              </h2>
              <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed tracking-wide">
                Explore our in-depth guides on neuromuscular dysfunction and evidence-based treatment strategies.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10 lg:gap-12">
              <Link 
                to="/site/articles/msk/motor-timing"
                className="group flex flex-col p-10 lg:p-12 rounded-3xl border border-border/40 bg-card/30 backdrop-blur-sm hover:border-primary/40 hover:bg-card/60 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-8">
                  <Timer className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-5 leading-snug">
                  Motor Timing Deficits
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed tracking-wide flex-1">
                  Why milliseconds matter for joint protection—and how timing errors cause pain without structural damage.
                </p>
                <div className="mt-8 pt-6 border-t border-border/30">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all duration-300">
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
              
              <Link 
                to="/site/articles/msk/asymmetry"
                className="group flex flex-col p-10 lg:p-12 rounded-3xl border border-border/40 bg-card/30 backdrop-blur-sm hover:border-primary/40 hover:bg-card/60 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-8">
                  <Scale className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-5 leading-snug">
                  Movement Asymmetry
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed tracking-wide flex-1">
                  How side-to-side differences in strength and control create compensatory patterns that lead to injury.
                </p>
                <div className="mt-8 pt-6 border-t border-border/30">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all duration-300">
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
              
              <Link 
                to="/site/articles/msk/chronic-pain"
                className="group flex flex-col p-10 lg:p-12 rounded-3xl border border-border/40 bg-card/30 backdrop-blur-sm hover:border-primary/40 hover:bg-card/60 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-8">
                  <Activity className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-5 leading-snug">
                  Chronic Pain Without Damage
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed tracking-wide flex-1">
                  Understanding neuroplastic pain and why your imaging looks normal but you still hurt.
                </p>
                <div className="mt-8 pt-6 border-t border-border/30">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all duration-300">
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </div>
            
            <div className="flex justify-center mt-16">
              <Link 
                to="/site/articles" 
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full border border-border/40 bg-card/30 hover:border-primary/40 hover:bg-card/60 hover:shadow-xl transition-all duration-500"
              >
                <span className="text-sm font-semibold tracking-wide">Browse All Resources</span>
                <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical & Research Foundations */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-10 text-center">
              Clinical & Research Foundations
            </h3>
            
            <div className="space-y-6 mb-10">
              <p className="text-lg text-muted-foreground leading-relaxed">
                PPC's approach to musculoskeletal care is informed by established research in 
                clinical neuroscience, motor control, and rehabilitation medicine. Our methodology 
                focuses on identifying neurologic drivers of pain and dysfunction rather than 
                relying solely on structural findings — grounded in the understanding that persistent 
                pain and performance loss often reflect deficits in timing, coordination, load 
                tolerance, or central regulation.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Validated outcome measures and functional indicators are integrated throughout 
                our musculoskeletal care. Treatment progression is guided by objective change over 
                time — not pain reports alone. Care adapts based on how the nervous system responds 
                to load, movement demand, and fatigue, ensuring that clinical decisions reflect 
                measured neurologic and functional response across longitudinal recovery.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Pittsford Performance Care actively engages in translational neuroscience research 
                relevant to musculoskeletal and performance-related conditions. This work is conducted 
                under Institutional Review Board (IRB) oversight, with the goal of improving how 
                neuromuscular dysfunction, recovery readiness, and injury risk are identified and 
                monitored in real-world clinical and athletic environments — contributing responsibly 
                to broader understanding while maintaining the highest standards of patient care.
              </p>
            </div>
            
            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span className="text-muted-foreground leading-relaxed">
                  Research demonstrating neural control deficits as drivers of chronic musculoskeletal pain
                </span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span className="text-muted-foreground leading-relaxed">
                  Evidence describing motor timing and sequencing dysfunction in recurrent injury
                </span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span className="text-muted-foreground leading-relaxed">
                  Clinical literature on cerebellar contributions to movement precision and coordination
                </span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span className="text-muted-foreground leading-relaxed">
                  Validated outcome measures for tracking functional improvement and recovery readiness
                </span>
              </li>
            </ul>
            
            <div className="mt-10 pt-8 border-t border-border/40">
              <p className="text-muted-foreground leading-relaxed">
                All supporting evidence referenced throughout PPC's musculoskeletal and neurologic 
                content is maintained in a centralized Works Cited resource. This reference library 
                is actively curated and continues to evolve as the science of motor control, pain, 
                and rehabilitation advances — reflecting PPC's commitment to transparency, 
                accountability, and continuous learning.
              </p>
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
