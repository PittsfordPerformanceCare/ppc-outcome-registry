import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
import { 
  Activity, 
  Brain,
  Target,
  Users,
  ArrowRight,
  Zap,
  Clock,
  Shield,
  LineChart,
  Stethoscope,
  GraduationCap,
  Heart
} from "lucide-react";

const SiteSpeedOfRecovery = () => {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Why Speed of Recovery Is a Performance Metric | Pittsford Performance Care</title>
        <meta 
          name="description" 
          content="Learn why recovery speed reflects neurologic performance, how early system identification reduces recovery friction, and how Pittsford Performance Care tracks time to readiness through its outcome registry." 
        />
        <link rel="canonical" href="https://pittsfordperformancecare.com/performance/speed-of-recovery-as-a-performance-metric" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium backdrop-blur-sm">
              <Activity className="h-4 w-4" />
              Performance Pillar
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
              Why Speed of Recovery Is a Performance Metric
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              How neurologic readiness, not timelines, determines how quickly patients return to confidence and capacity
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Core Thesis Block */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary uppercase tracking-wide">Core Thesis</span>
              </div>
              <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                <p className="text-lg font-medium text-slate-900 dark:text-white">
                  Performance is not defined by how fast care is delivered.
                </p>
                <p className="text-lg font-medium text-slate-900 dark:text-white">
                  Performance is defined by how efficiently the nervous system is restored to readiness.
                </p>
                <p>
                  When the correct neurologic systems are identified and supported early, recovery progresses 
                  with less friction, fewer compensations, and greater confidence. This often occurs in less 
                  time than traditional care pathways.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Reframing Recovery */}
      <section className="py-16 lg:py-20 bg-slate-50 dark:bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Reframing Recovery</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
              Traditional Recovery Models Miss the Point
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Traditional recovery models focus on pain resolution, structural healing, and visit completion. 
                These are important markers, but they do not capture what matters most: whether the nervous 
                system is ready to support confident, coordinated function.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                At Pittsford Performance Care, we approach recovery differently. Recovery speed reflects 
                neurologic organization. Delays often result from unidentified system bottlenecks, not 
                injury severity. When the correct systems are prioritized early, recovery unfolds more 
                efficiently and with greater clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Recovery Speed as Performance Variable */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Performance Variable</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
              Why Recovery Speed Is a Performance Variable
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Performance applies to recovery as much as it applies to competition. Athletes, families, 
                and referring professionals all share a common concern: how quickly can confidence and 
                capacity return without cutting corners or masking symptoms?
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Time to functional confidence matters. Every additional week of uncertainty affects 
                training, competition schedules, academic participation, and family planning. Recovery 
                velocity reflects how well the nervous system is integrating sensory, motor, and cognitive 
                inputs, not just whether pain has subsided.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This is why we treat recovery efficiency as a meaningful clinical variable, not a marketing 
                claim.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: The Acute Window */}
      <section className="py-16 lg:py-20 bg-slate-50 dark:bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Timing Matters</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
              The Acute Window Matters
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                The early post injury period represents a unique neuroplastic opportunity. During this 
                window, the nervous system is highly responsive to targeted input. Autonomic instability 
                is common. Sensory integration is fragile. The systems that will ultimately determine 
                recovery trajectory are being established.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                When intervention is delayed or generic, compensatory patterns develop. The nervous 
                system adapts around dysfunction rather than resolving it. These patterns become 
                entrenched and require more effort to correct later.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This does not mean rushing care. It means prioritizing precision during the period 
                when precision matters most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: PPC's Recovery Model */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Our Approach</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
              Performance Oriented Recovery at PPC
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Pittsford Performance Care's recovery model is built around early neurologic system 
                identification. Rather than addressing symptoms in isolation, we identify which systems 
                are limiting progress and prioritize accordingly.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Care is structured around defined episodes. Each episode includes continuous outcome 
                tracking, allowing us to monitor trajectory, adjust priorities, and confirm readiness 
                with objective data rather than assumptions.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This approach does not guarantee faster healing. But it does reduce the friction that 
                causes recovery to stall: unidentified bottlenecks, misallocated effort, and uncertainty 
                about what to address next.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Outcome Registry */}
      <section className="py-16 lg:py-20 bg-slate-50 dark:bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <LineChart className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Outcome Tracking</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
              Outcome Registry Integration
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                PPC's internal Outcome Registry tracks trends in time to functional readiness across 
                neurologic and musculoskeletal cases. This registry supports internal quality control, 
                clinical accountability, and transparent reporting to referring professionals.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Observed patterns across the registry reflect a consistent trend toward earlier 
                functional confidence, reduced recovery friction, and more efficient progression 
                toward readiness. These are descriptive observations, not guarantees.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The registry allows us to identify which approaches are associated with more efficient 
                recovery and to continuously refine our clinical model based on real world experience.
              </p>
            </div>

            <div className="mt-8 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
              <p className="text-sm text-muted-foreground">
                For more information about how PPC tracks and reports outcomes, visit the{" "}
                <Link to="/site/registry" className="text-primary hover:underline font-medium">
                  Outcome Registry overview
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Why This Matters to Different Audiences */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Relevance</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-10 text-foreground">
              Why This Matters
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Athletes */}
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">For Athletes</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Recovery efficiency means less time in uncertainty and more time training with 
                  confidence. Knowing that your care is targeted to the systems that matter most 
                  allows you to focus on what you can control.
                </p>
              </div>

              {/* Parents */}
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">For Parents</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Clarity reduces anxiety. Understanding which systems are being addressed and 
                  how progress is being tracked provides confidence that recovery is moving 
                  in the right direction, even when it feels slow.
                </p>
              </div>

              {/* Professionals */}
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">For Referring Professionals</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Efficient recovery supports coordinated care. Outcome visibility and clear 
                  communication reduce back and forth and allow you to focus on your role 
                  in the patient's broader care plan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Closing - Performance Without Rushing */}
      <section className="py-16 lg:py-20 bg-slate-50 dark:bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Philosophy</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
              Performance Without Rushing
            </h2>
            <div className="prose prose-lg dark:prose-invert mx-auto space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Performance is not about rushing recovery. It is about removing the reasons recovery stalls.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                At Pittsford Performance Care, we prioritize readiness over timelines, precision over volume, 
                and confidence over guesswork. This philosophy shapes every episode of care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Internal Links Section */}
      <section className="py-12 lg:py-16 bg-background border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold mb-6 text-foreground">Related Reading</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link 
                to="/site/performance" 
                className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-primary/50 transition-colors group"
              >
                <span className="text-sm text-primary font-medium">Performance Pillar</span>
                <p className="text-sm text-muted-foreground mt-1">
                  Overview of neurologic readiness and athletic care
                </p>
              </Link>
              <Link 
                to="/site/registry" 
                className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-primary/50 transition-colors group"
              >
                <span className="text-sm text-primary font-medium">Outcome Registry</span>
                <p className="text-sm text-muted-foreground mt-1">
                  How PPC tracks and reports clinical outcomes
                </p>
              </Link>
              <Link 
                to="/site/articles/concussion/concussion-energy-crisis-and-recovery" 
                className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-primary/50 transition-colors group"
              >
                <span className="text-sm text-primary font-medium">Concussion Energy Crisis</span>
                <p className="text-sm text-muted-foreground mt-1">
                  Understanding metabolic demands in recovery
                </p>
              </Link>
              <Link 
                to="/site/articles/msk/movement-efficiency-and-injury-prevention" 
                className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-primary/50 transition-colors group"
              >
                <span className="text-sm text-primary font-medium">Movement Efficiency</span>
                <p className="text-sm text-muted-foreground mt-1">
                  How neurologic clarity supports injury prevention
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Begin Your Intake
            </h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Ready to experience performance oriented recovery? Start with our guided intake 
              process to help us understand your situation.
            </p>
            <Button size="lg" asChild className="bg-white text-slate-900 hover:bg-white/90">
              <Link to="/patient/concierge">
                Start Intake
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteSpeedOfRecovery;
