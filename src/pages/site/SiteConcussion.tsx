import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Eye, 
  Ear, 
  Heart,
  Zap,
  ArrowRight, 
  CheckCircle2,
  Battery,
  Activity,
  Target,
  Shield
} from "lucide-react";

const SiteConcussion = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        {/* Calming light blue gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-blue-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-200/30 via-transparent to-transparent dark:from-blue-900/20" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Brain className="h-4 w-4" />
              Concussion Care Division
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Still Struggling Months After Your Concussion?
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
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
        
        {/* Bottom vignette */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Symptoms Section - Converted to flowing text */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Activity className="h-4 w-4" />
                Common Experiences
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Do These Symptoms Sound Familiar?
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Persistent headaches that won't go away. Brain fog and difficulty concentrating. 
                Dizziness when moving your head. Sensitivity to light and sound that makes normal 
                environments overwhelming.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Feeling off-balance or unsteady. Fatigue that limits daily activities, no matter 
                how much you rest. Trouble with screens and reading. Anxiety or mood changes that 
                weren't there before your injury.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                These aren't signs of weakness or imagination. They're signs of underlying 
                neurologic dysfunction that won't resolve with rest alone—dysfunction that 
                requires a different approach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Five-System Model */}
      <section className="py-20 lg:py-28 relative overflow-hidden" id="five-system-model">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Brain className="h-4 w-4" />
                Our Approach
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                The Five-System Concussion Model
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Concussions rarely affect just one system. Our comprehensive evaluation 
                examines all five neurologic systems that can be disrupted by brain injury.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center mb-6">
                  <Eye className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Visual System</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Eye tracking, convergence, accommodation, and visual processing 
                  deficits that cause reading difficulty and screen intolerance.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center mb-6">
                  <Ear className="h-7 w-7 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Vestibular System</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Balance, spatial orientation, and gaze stability. Dysfunction here 
                  causes dizziness, motion sensitivity, and disorientation.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center mb-6">
                  <Brain className="h-7 w-7 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Cerebellar System</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Timing, coordination, and motor sequencing. Cerebellar deficits 
                  affect movement precision and cognitive processing speed.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center mb-6">
                  <Heart className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Autonomic System</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Heart rate variability, blood pressure regulation, and stress response. 
                  ANS dysfunction causes fatigue, exercise intolerance, and anxiety.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center mb-6">
                  <Zap className="h-7 w-7 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Cervical System</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Neck proprioception and cervicogenic contributions to headache, 
                  dizziness, and visual disturbance often overlooked after injury.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Why It Matters</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Targeting the wrong system wastes time. Our evaluation identifies 
                  exactly which systems are affected so treatment is precise.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Energy Crisis - Converted to flowing prose */}
      <section className="py-20 lg:py-28 bg-background" id="energy-crisis">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Battery className="h-4 w-4" />
                Understanding Fatigue
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                The Post-Concussion Energy Crisis
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                After a concussion, your brain's energy metabolism is disrupted—normal activities 
                now require more neural resources than you have available.
              </p>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                The metabolic disruption after concussion creates an energy mismatch. Your brain 
                needs more fuel but can produce less. This leads to fatigue, brain fog, and symptom 
                flares when you push too hard. Reduced mitochondrial efficiency in affected areas. 
                Increased metabolic demand for routine tasks. Threshold symptoms when energy reserves deplete.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                You might notice symptoms that worsen later in the day. Crashes after cognitive or 
                physical exertion. A constant need for rest breaks. The inability to return to normal 
                activity levels. Sleep that doesn't fully restore your energy. Mental exhaustion from 
                tasks that used to feel simple.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our approach includes carefully dosed neurologic exercise to rebuild capacity without 
                triggering symptom flares—restoring your brain's ability to meet the demands of daily life.
              </p>
            </div>
            
            <div className="flex justify-center mt-10">
              <Link 
                to="/site/articles/concussion/concussion-energy-crisis-and-recovery"
                className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Learn more about the energy crisis
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Evaluation Process */}
      <section className="py-20 lg:py-28 relative overflow-hidden" id="evaluation">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                The Process
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Neurologic Evaluation
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                A comprehensive assessment that goes far beyond standard concussion protocols
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Intake Measures</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Validated outcome measures establish your baseline and track progress
                </p>
              </div>
              
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Systems Exam</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Detailed testing of all five concussion systems to identify deficits
                </p>
              </div>
              
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Finding Report</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Clear explanation of which systems are affected and why you have symptoms
                </p>
              </div>
              
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Treatment Plan</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Targeted interventions for your specific system deficits
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Brain className="h-4 w-4" />
                Deep Dive Resources
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Learn More About Concussion Recovery
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Explore our in-depth guides on specific post-concussion challenges and evidence-based recovery strategies.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Link 
                to="/site/articles/concussion/visual-vestibular-mismatch"
                className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Eye className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Visual-Vestibular Mismatch</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Understanding why your eyes and inner ear aren't working together—and what targeted treatment looks like.
                </p>
              </Link>
              
              <Link 
                to="/site/articles/concussion/autonomic-nervous-system-flow"
                className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Heart className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Autonomic Nervous System</h3>
                <p className="text-muted-foreground leading-relaxed">
                  How ANS dysregulation causes fatigue, anxiety, and exercise intolerance after concussion.
                </p>
              </Link>
              
              <Link 
                to="/site/articles/concussion/cerebellar-timing-and-coordination"
                className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Brain className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Cerebellar Timing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  When your brain's master clock is disrupted and recovery feels impossible to achieve.
                </p>
              </Link>
            </div>
            
            <div className="flex justify-center mt-12">
              <Link 
                to="/site/articles" 
                className="group inline-flex items-center gap-3 px-6 py-3 rounded-full border border-border/60 bg-card/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <span className="font-medium">Browse All Resources</span>
                <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight">
              Ready to Find Answers?
            </h2>
            <p className="text-xl text-primary-foreground/90 leading-relaxed max-w-2xl mx-auto">
              Stop waiting for symptoms to resolve on their own. Schedule your 
              comprehensive neurologic evaluation today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" asChild className="shadow-xl">
                <Link to="/patient/concierge">
                  Schedule Evaluation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/50 bg-white/10 text-white hover:bg-white/20" asChild>
                <Link to="/patient/self-tests/concussion">Take Self-Assessment</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteConcussion;
