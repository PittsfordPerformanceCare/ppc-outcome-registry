import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
import { 
  Activity, 
  Target,
  Users,
  Shield,
  ArrowRight,
  Zap,
  CheckCircle2,
  Heart,
  Brain,
  Eye,
  Ear,
  Gauge,
  Timer,
  Hand,
  Sparkles,
  Focus,
  Battery
} from "lucide-react";

const performanceDomains = [
  {
    name: "Brainstem",
    icon: Brain,
    explanation: "Regulates baseline arousal, energy availability, and systemic consistency under demand.",
    impact: "Inconsistent energy, slow warm-up, variable output across sessions.",
    link: "/site/articles/concussion/concussion-energy-crisis-and-recovery"
  },
  {
    name: "Cerebellar",
    icon: Timer,
    explanation: "Controls timing, coordination, and movement efficiency during complex athletic tasks.",
    impact: "Slower sequencing, reduced power transfer, timing errors under speed.",
    link: "/site/articles/concussion/cerebellar-timing-and-coordination"
  },
  {
    name: "Proprioceptive",
    icon: Hand,
    explanation: "Governs force control, symmetry, and load absorption during movement.",
    impact: "Uneven force output, asymmetric loading, early fatigue or injury risk.",
    link: "/site/articles/concussion/proprioceptive-dysfunction-after-concussion"
  },
  {
    name: "Vestibular",
    icon: Gauge,
    explanation: "Maintains balance, spatial orientation, and dynamic stability during athletic movement.",
    impact: "Unsteadiness at speed, impaired spatial awareness, hesitation on direction changes.",
    link: "/site/articles/concussion/visual-vestibular-mismatch"
  },
  {
    name: "Autonomic",
    icon: Battery,
    explanation: "Regulates endurance capacity, recovery efficiency, and stress tolerance.",
    impact: "Poor recovery between efforts, inconsistent stamina, reduced stress tolerance.",
    link: "/site/articles/concussion/autonomic-nervous-system-flow"
  },
  {
    name: "Visual",
    icon: Eye,
    explanation: "Supports tracking, spatial targeting, and anticipation during dynamic play.",
    impact: "Delayed reaction, misjudged distances, difficulty tracking fast objects.",
    link: "/site/articles/concussion/visual-vestibular-mismatch"
  },
  {
    name: "Limbic and Prefrontal",
    icon: Sparkles,
    explanation: "Modulates confidence, threat response, and composure under competitive pressure.",
    impact: "Hesitation, excessive caution, performance anxiety, loss of competitive edge.",
    link: "/site/articles/concussion/limbic-overload-after-concussion"
  },
  {
    name: "Frontal (Executive)",
    icon: Focus,
    explanation: "Controls decision speed, sustained focus, and cognitive endurance during competition.",
    impact: "Slow decisions, mental fatigue, difficulty maintaining focus late in competition.",
    link: "/site/articles/concussion/frontal-system-fog-after-concussion"
  }
];

const SitePerformance = () => {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Performance & Athletic Care | Neurologic Readiness | Pittsford Performance Care</title>
        <meta name="description" content="Performance care focused on neurologic readiness, timing, and efficiency. Understand why athletes can be cleared but still underperform. Rochester NY." />
      </Helmet>

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
              Neurologic Readiness, Recovery, and Confident Return to Play
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
                These are not simply physical traits. They emerge from the integration of sensory, motor, 
                and cognitive systems operating in concert.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Injury, illness, or overload can disrupt this readiness in ways that are not always 
                visible or easily measured. Treating symptoms alone is often insufficient for athletes 
                whose demands exceed the threshold of everyday function.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Performance care requires understanding the neurologic substrate of athletic capacity, and 
                addressing the systems that govern it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Performance Is a Neurologic Readiness Problem */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Activity className="h-4 w-4" />
                Understanding Performance
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Performance Is a Neurologic Readiness Problem
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Performance does not decline because strength disappears or conditioning suddenly fails. 
                Performance drops when the nervous system cannot time, coordinate, and integrate movement 
                efficiently under speed, load, and fatigue.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At PPC, performance evaluation focuses on identifying which neurologic domains are limiting 
                readiness, and how compensatory patterns reduce output and confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Neurologic Domain Map for Human Performance */}
      <section className="py-24 lg:py-32 bg-background" id="domain-model">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Neurologic Domain Map for Human Performance
              </h2>
              <div className="max-w-3xl mx-auto space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Peak performance is not defined by strength, conditioning, or effort alone. It reflects 
                  how efficiently the nervous system integrates sensory input, regulates energy, coordinates 
                  movement, and maintains precision under increasing demand.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  At Pittsford Performance Care, performance is evaluated through the same domain based 
                  neurologic framework used in injury recovery and concussion care, with emphasis on 
                  readiness, efficiency, and resilience rather than symptom resolution.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
              <Link 
                to="/site/articles/concussion/proprioceptive-dysfunction-after-concussion"
                className="group flex flex-col p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Hand className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Proprioceptive Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                  Supports accurate force grading, joint awareness, and load distribution required for efficient and repeatable movement.
                </p>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Proprioceptive Control and Performance Efficiency →
                </span>
              </Link>

              <Link 
                to="/site/articles/concussion/cerebellar-timing-and-coordination"
                className="group flex flex-col p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Cerebellar Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                  Optimizes timing, sequencing, and motor prediction to reduce effort and increase precision at speed.
                </p>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Cerebellar Timing and Athletic Performance →
                </span>
              </Link>

              <Link 
                to="/site/articles/concussion/visual-vestibular-mismatch"
                className="group flex flex-col p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Ear className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Vestibular Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                  Stabilizes posture, gaze, and movement during acceleration, deceleration, and directional change.
                </p>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Vestibular Stability and Performance Readiness →
                </span>
              </Link>

              <Link 
                to="/site/articles/concussion/autonomic-nervous-system-flow"
                className="group flex flex-col p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Autonomic Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                  Regulates energy availability, recovery capacity, and physiologic resilience under training and competition demand.
                </p>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Autonomic Regulation and Performance Endurance →
                </span>
              </Link>

              <Link 
                to="/site/articles/concussion/frontal-system-fog-after-concussion"
                className="group flex flex-col p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Focus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Frontal / Executive Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                  Coordinates focus, inhibition, and decision-making efficiency under pressure and fatigue.
                </p>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Executive Control and Competitive Performance →
                </span>
              </Link>

              <Link 
                to="/site/articles/concussion/concussion-energy-crisis-and-recovery"
                className="group flex flex-col p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Brainstem Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                  Establishes baseline neurologic readiness, tone, and reflex stability necessary for consistent output.
                </p>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Brainstem Readiness and Performance Consistency →
                </span>
              </Link>

              <Link 
                to="/site/articles/concussion/visual-vestibular-mismatch"
                className="group flex flex-col p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Visual Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                  Provides spatial accuracy, motion tracking, and visual-motor integration essential for precision and reaction.
                </p>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Visual Processing and Performance Accuracy →
                </span>
              </Link>

              <Link 
                to="/site/articles/concussion/limbic-overload-after-concussion"
                className="group flex flex-col p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Limbic Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                  Modulates arousal, threat response, and confidence to support calm, adaptive performance under stress.
                </p>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Limbic Regulation and Performance Under Pressure →
                </span>
              </Link>
            </div>

            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Performance limitations often reflect inefficiencies across multiple neurologic domains 
                rather than a single weakness. Identifying which systems are limiting output, and which 
                are compensating, allows performance gains to occur through integration and efficiency, not increased strain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: How Neurologic Inefficiency Limits Performance */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                Understanding Decline
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                How Neurologic Inefficiency Limits Performance
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto mb-10">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Performance loss often reflects neurologic inefficiency rather than lack of effort 
                or conditioning. When domains underperform, cascades develop:
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {[
                "Cerebellar timing delay → slower sequencing → reduced speed and power",
                "Proprioceptive asymmetry → uneven force output → early fatigue or injury risk",
                "Autonomic inefficiency → poor recovery → inconsistent performance",
                "Limbic overactivation → threat response → hesitation and confidence loss"
              ].map((cascade, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-5 rounded-xl bg-card border border-border/60"
                >
                  <ArrowRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{cascade}</span>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">
                Training harder does not fix a system that cannot coordinate efficiently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Why PPC Evaluates Readiness, Not Just Clearance */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Target className="h-4 w-4" />
                Our Approach
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why PPC Evaluates Readiness, Not Just Clearance
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {[
                {
                  title: "Readiness Under Demand",
                  description: "Evaluates neurologic readiness during speed, load, and fatigue, not just at rest."
                },
                {
                  title: "Primary vs Compensatory",
                  description: "Identifies which domains are primary limitations and which are compensating."
                },
                {
                  title: "Integration and Efficiency",
                  description: "Progresses athletes based on coordination and efficiency, not just strength."
                },
                {
                  title: "Objective Return Decisions",
                  description: "Clears return to play based on demonstrated readiness, not arbitrary timelines."
                }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="p-6 rounded-xl border border-border/60 bg-card/50"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section: Unified Clinical Model */}
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
                Athletes at Pittsford Performance Care receive the same neurologic, outcome driven care 
                as all patients. There is no separate tier or exclusive program. Only an application of
                the same clinical principles to the unique demands of sport and performance.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The difference is context, not quality. Care is individualized to the athlete's sport, 
                role, training history, and goals. The clinical model remains consistent: identify what 
                is driving dysfunction, address it with precision, and measure progress over time.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The PPC Outcome Registry provides a longitudinal framework for understanding recovery and 
                readiness, giving both clinician and athlete visibility into what is changing and what 
                remains to be addressed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Recovery, Readiness, and Return-to-Play */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Activity className="h-4 w-4" />
                The Process
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Recovery, Readiness, and Return to Play
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Timelines alone are insufficient for safe return to play. Readiness is not defined 
                by the calendar. It is demonstrated through capacity.
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
                  Both athlete and care team need clarity. Return to play decisions should be made 
                  with confidence, not guesswork, based on observable, measurable progress.
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

      {/* Section: Who This Is For - Darker immersive */}
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
              neurologic readiness matters, from youth development to adult recreation.
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

      {/* Section: Supporting Performance Without Losing Perspective */}
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
                Speed is never a substitute for safety. Pressure to return, whether internal or 
                external, cannot override sound clinical judgment.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our decisions are grounded in readiness. This means being honest about what 
                the data shows, what the athlete is experiencing, and what is genuinely safe. 
                The goal is not a rushed return. It is a confident one.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Athletes and their families can trust that recommendations are made with their 
                long-term wellbeing in mind, not just the next game or season.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: How This Fits Within PPC */}
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
                philosophy. The same neurologic, outcome driven principles that guide concussion care 
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

      {/* NEW: Soft Performance-Focused CTA */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="p-8 md:p-10 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="text-center space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold">
                  If Performance Feels Inconsistent, Effortful, or "Not the Same"
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  A clinician-led neurologic and musculoskeletal evaluation can identify which domain 
                  is limiting readiness, and what to restore first.
                </p>
                <div className="pt-2">
                  <Button size="lg" asChild>
                    <Link to="/patient/concierge">
                      Schedule a Performance Evaluation
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles Section */}
      <section className="py-20 lg:py-28 bg-background border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                Deep Dive
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Performance Articles</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore the principles behind performance oriented recovery and outcome tracking.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Link 
                to="/site/performance/speed-of-recovery-as-a-performance-metric" 
                className="group flex flex-col p-8 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Timer className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Pillar Article</span>
                <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors">
                  Why Speed of Recovery Is a Performance Metric
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4 flex-1">
                  Discover how neurologic readiness, not timelines, determines how quickly patients return to confidence and capacity. Learn why recovery efficiency matters.
                </p>
                <span className="text-sm text-primary font-medium group-hover:underline flex items-center gap-2">
                  Read Article
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              
              <Link 
                to="/site/registry" 
                className="group flex flex-col p-8 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Outcome Tracking</span>
                <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors">
                  PPC Outcome Registry
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4 flex-1">
                  Understand how PPC tracks clinical outcomes across neurologic and musculoskeletal cases, supporting transparency and clinical accountability.
                </p>
                <span className="text-sm text-primary font-medium group-hover:underline flex items-center gap-2">
                  Learn More
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
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
              Neurologically informed, outcome driven care tailored to the athlete's needs. 
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
