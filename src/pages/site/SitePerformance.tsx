import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Target,
  Users,
  Shield,
  ArrowRight,
  Zap,
  CheckCircle2,
  Heart
} from "lucide-react";

const SitePerformance = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Darker, immersive */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-700/30 via-transparent to-transparent" />
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium backdrop-blur-sm">
              <Activity className="h-4 w-4" />
              Performance & Athletic Care
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Neurologic Readiness, Recovery, and Confident Return-to-Play
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Athletic performance places unique demands on the nervous system. Recovery and readiness 
              are neurologic before they are physical. Athletes need clarity before returning to play.
            </p>
            <div className="pt-4">
              <Button size="lg" asChild className="bg-white text-slate-900 hover:bg-white/90 shadow-xl">
                <Link to="/patient/concierge">
                  Begin Your Intake
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bottom vignette */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Section 2: Performance Is Neurologic */}
      <section className="py-20 lg:py-28 bg-background relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                The Foundation
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Performance Is Neurologic
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Speed, balance, coordination, timing, and reaction all depend on neurologic readiness. 
                These are not simply physical traits—they emerge from the integration of sensory, motor, 
                and cognitive systems operating in concert.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Injury, illness, or overload can disrupt this readiness in ways that are not always 
                visible or easily measured. Treating symptoms alone is often insufficient for athletes 
                whose demands exceed the threshold of everyday function.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Performance care requires understanding the neurologic substrate of athletic capacity—and 
                addressing the systems that govern it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Unified Clinical Model - Darker section */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Target className="h-4 w-4" />
                One Model, Applied
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                A Unified Clinical Model Applied to Athletic Demand
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Athletes at Pittsford Performance Care receive the same neurologic, outcome-driven care 
                as all patients. There is no separate tier or exclusive program—only an application of 
                the same clinical principles to the unique demands of sport and performance.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The difference is context, not quality. Care is individualized to the athlete's sport, 
                role, training history, and goals. The clinical model remains consistent: identify what 
                is driving dysfunction, address it with precision, and measure progress over time.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The PPC Outcome Registry provides a longitudinal framework for understanding recovery and 
                readiness—giving both clinician and athlete visibility into what is changing and what 
                remains to be addressed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Recovery, Readiness, and Return-to-Play */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Activity className="h-4 w-4" />
                The Process
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Recovery, Readiness, and Return-to-Play
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Timelines alone are insufficient for safe return-to-play. Readiness is not defined 
                by the calendar—it is demonstrated through capacity.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Activity className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Beyond Timelines</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Arbitrary timelines do not account for individual variation in healing, system 
                  involvement, or baseline capacity. Return decisions must be grounded in actual readiness.
                </p>
              </div>
              
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Confidence in Decisions</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Both athlete and care team need clarity. Return-to-play decisions should be made 
                  with confidence—not guesswork—based on observable, measurable progress.
                </p>
              </div>
              
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Structured Insight</h3>
                <p className="text-muted-foreground leading-relaxed">
                  A longitudinal view of recovery provides the structure needed to understand 
                  progression and support safer, more confident return decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Who This Is For - Darker immersive */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm">
              <Users className="h-4 w-4" />
              Athletes We Serve
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
              Who This Is For
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed mb-12 max-w-2xl mx-auto">
              Performance care is not exclusive to one level of competition. It applies wherever 
              neurologic readiness matters—from youth development to adult recreation.
            </p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {[
                "Youth athletes",
                "High school athletes",
                "Collegiate athletes",
                "Competitive adult athletes",
                "Recreational athletes with performance goals",
                "Individuals returning to sport after injury"
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-white/90 text-sm font-medium text-left">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Supporting Performance Without Losing Perspective */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                Our Commitment
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Supporting Performance Without Losing Perspective
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Performance care must prioritize health, longevity, and neurologic integrity. 
                Speed is never a substitute for safety. Pressure to return—whether internal or 
                external—cannot override sound clinical judgment.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our decisions are grounded in readiness. This means being honest about what 
                the data shows, what the athlete is experiencing, and what is genuinely safe. 
                The goal is not a rushed return—it is a confident one.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Athletes and their families can trust that recommendations are made with their 
                long-term wellbeing in mind, not just the next game or season.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: How This Fits Within PPC */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Heart className="h-4 w-4" />
                Part of the Whole
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                How This Fits Within Pittsford Performance Care
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                This page represents one application of Pittsford Performance Care's broader clinical 
                philosophy. The same neurologic, outcome-driven principles that guide concussion care 
                and musculoskeletal care also guide performance readiness.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The PPC Outcome Registry ties these applications together. Whether an athlete is 
                recovering from a concussion, addressing chronic pain, or optimizing function for 
                return to play, the framework remains consistent: identify, address, measure, adapt.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Performance care is not separate. It is an extension of the same commitment to 
                clarity, precision, and individualized care that defines Pittsford Performance Care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Dark, immersive close */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Readiness. Confidence. Clarity.
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Neurologically informed, outcome-driven care tailored to the athlete's needs. 
              No hype. No shortcuts. Just the foundation for confident return.
            </p>
            <div className="pt-4">
              <Button size="lg" asChild className="bg-white text-slate-900 hover:bg-white/90 shadow-xl px-8">
                <Link to="/patient/concierge">
                  Begin Your Intake
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SitePerformance;
