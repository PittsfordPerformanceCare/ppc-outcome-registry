import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
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
  Shield,
  Brain,
  Eye,
  Ear,
  Heart,
  Hand,
  Gauge,
  AlertTriangle
} from "lucide-react";
import { Card } from "@/components/ui/card";

const SiteMsk = () => {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Musculoskeletal Care | Neurologic & MSK Care | Pittsford Performance Care</title>
        <meta name="description" content="Chronic pain with normal imaging? MSK dysfunction is often a control and load problem. PPC identifies which neurologic domains are failing to manage movement." />
        <link rel="canonical" href="https://pittsfordperformancecare.com/site/msk" />
      </Helmet>

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
                effortful, like your body isn't responding the way it used to. One side that doesn't 
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
                of neuromuscular dysfunction, problems with how your nervous system controls movement 
                that require a different approach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Control and Load Problem Section */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Musculoskeletal Pain Is Often a Control and Load Problem
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Musculoskeletal pain does not always reflect tissue damage. Pain often persists 
                when the nervous system cannot properly time, coordinate, or distribute load, even 
                when strength and imaging appear normal.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At PPC, musculoskeletal evaluation focuses on identifying which neurologic domains 
                are failing to control movement and load, and how compensatory patterns are driving 
                pain or performance decline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Neurologic Domain Map for Musculoskeletal Pain */}
      <section className="py-24 lg:py-32 relative" id="domain-model">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Neurologic Domain Map for Musculoskeletal Pain
              </h2>
              <div className="prose prose-lg dark:prose-invert mx-auto max-w-3xl">
                <p className="text-muted-foreground leading-relaxed">
                  Musculoskeletal pain does not arise from a single structure or tissue. It reflects 
                  how multiple neurologic control systems manage load, timing, stability, energy, 
                  and perception during movement.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  At Pittsford Performance Care, chronic and recurrent MSK pain is evaluated through 
                  a domain based neurologic model. Each domain below represents a specific control 
                  system that can independently, or collectively, contribute to pain, inefficiency, 
                  and compensation when function is disrupted.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              <Link 
                to="/site/articles/msk/proprioceptive-dysfunction-and-chronic-pain"
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Hand className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-base group-hover:text-blue-600 transition-colors">Proprioceptive Domain</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Controls the brain's awareness of joint position, force grading, and load distribution during movement.
                </p>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:underline mt-auto">
                  → Proprioceptive Dysfunction and Chronic Pain
                </span>
              </Link>

              <Link 
                to="/site/articles/msk/cerebellar-timing-deficits-and-chronic-pain"
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-base group-hover:text-blue-600 transition-colors">Cerebellar Domain</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Coordinates timing, sequencing, and prediction of movement to reduce effort and prevent overload.
                </p>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:underline mt-auto">
                  → Cerebellar Timing Deficits and Chronic Pain
                </span>
              </Link>

              <Link 
                to="/site/articles/msk/vestibular-dysfunction-and-chronic-pain"
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Ear className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-base group-hover:text-blue-600 transition-colors">Vestibular Domain</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Stabilizes posture and movement by regulating balance, orientation, and motion sensing.
                </p>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:underline mt-auto">
                  → Vestibular Dysfunction and Chronic Pain
                </span>
              </Link>

              <Link 
                to="/site/articles/msk/autonomic-dysfunction-and-chronic-pain"
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-base group-hover:text-blue-600 transition-colors">Autonomic Domain</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Regulates energy availability, recovery capacity, and stress response during physical demand.
                </p>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:underline mt-auto">
                  → Autonomic Dysfunction and Chronic Pain
                </span>
              </Link>

              <Link 
                to="/site/articles/msk/frontal-control-dysfunction-and-chronic-pain"
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Gauge className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-base group-hover:text-blue-600 transition-colors">Frontal / Executive Domain</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Organizes motor planning, inhibition, and efficiency of voluntary movement.
                </p>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:underline mt-auto">
                  → Frontal Control Dysfunction and Chronic Pain
                </span>
              </Link>

              <Link 
                to="/site/articles/msk/brainstem-dysfunction-and-chronic-pain"
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-base group-hover:text-blue-600 transition-colors">Brainstem Domain</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Establishes baseline tone, reflex stability, and nervous system readiness for movement.
                </p>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:underline mt-auto">
                  → Brainstem Dysfunction and Chronic Pain
                </span>
              </Link>

              <Link 
                to="/site/articles/msk/visual-processing-dysfunction-and-chronic-pain"
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-base group-hover:text-blue-600 transition-colors">Visual Domain</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Provides spatial accuracy and movement guidance through visual-motor integration.
                </p>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:underline mt-auto">
                  → Visual Processing Dysfunction and Chronic Pain
                </span>
              </Link>

              <Link 
                to="/site/articles/msk/limbic-modulation-and-chronic-pain"
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-base group-hover:text-blue-600 transition-colors">Limbic Domain</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Modulates threat perception, protection responses, and pain amplification over time.
                </p>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:underline mt-auto">
                  → Limbic Modulation and Chronic Pain
                </span>
              </Link>
            </div>

            <p className="text-center text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Pain often reflects interaction between multiple domains rather than a single failing 
              structure. Identifying which control systems are primary, and which are compensating, 
              is essential for restoring efficient movement and resolving persistent symptoms.
            </p>
          </div>
        </div>
      </section>

      {/* Load & Compensation Cascade Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-medium mb-6">
                <AlertTriangle className="h-4 w-4" />
                The Cascade Effect
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                How Neurologic Dysfunction Creates Pain Cascades
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Pain often develops downstream from control failure. The location of your pain 
                may not be where the problem started.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
              <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-bold text-lg mb-3 text-foreground">Cerebellar Cascade</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Cerebellar timing delay</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  <span>late muscle firing</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  <span>joint overload</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium text-foreground">chronic pain</span>
                </div>
              </div>

              <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
                  <Hand className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-bold text-lg mb-3 text-foreground">Proprioceptive Cascade</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Proprioceptive asymmetry</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  <span>uneven force absorption</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium text-foreground">tissue irritation</span>
                </div>
              </div>

              <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-bold text-lg mb-3 text-foreground">Brainstem Cascade</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Brainstem/autonomic inefficiency</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  <span>poor recovery</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium text-foreground">reduced tissue tolerance</span>
                </div>
              </div>

              <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-bold text-lg mb-3 text-foreground">Limbic Cascade</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Limbic overactivation</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  <span>guarding</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  <span>altered movement</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium text-foreground">persistent pain</span>
                </div>
              </div>
            </div>
            
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg">
                <Target className="h-5 w-5 text-primary shrink-0" />
                <p className="text-base font-medium text-foreground">
                  Treating pain at the tissue level alone rarely resolves the underlying control problem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why PPC's Neurologic MSK Model Matters */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Target className="h-4 w-4" />
                Clinical Precision
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why PPC's Neurologic MSK Model Matters
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our clinician led evaluation focuses on how movement is controlled, not just where 
                pain is felt. This distinction determines treatment sequence, because addressing 
                compensatory patterns before primary dysfunction often makes symptoms worse.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                PPC identifies primary versus compensatory domain involvement. We restore timing, 
                load distribution, and movement efficiency, not just strength or flexibility. Care 
                progresses based on readiness, not symptom suppression alone.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We use validated outcome measures to track meaningful change across each episode 
                of care, ensuring treatment adapts to how your nervous system actually responds 
                to increasing demand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Why Imaging Misses It */}
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
                in milliseconds, invisible to any imaging technology.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                This is why so many people receive imaging that looks relatively normal despite 
                significant symptoms. The problem isn't structural, it's functional. Sequencing 
                errors don't show up on scans. Neural control deficits require dynamic assessment, 
                not static pictures.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our evaluation focuses on what imaging misses: motor speed and reaction timing, 
                movement sequencing and coordination, left/right asymmetry under load, cerebellar 
                timing and output, and proprioceptive accuracy and integration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Evaluation Process */}
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
                A neurologic and musculoskeletal assessment that reveals what imaging can't show
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
                <h3 className="font-semibold text-lg mb-3">Domain Exam</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Testing across neurologic domains to identify control deficits
                </p>
              </div>
              
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold text-lg mb-3">Driver Identification</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pinpoint which domains are primary versus compensating
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

      {/* Section: Who This Helps */}
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
                with chronic pain, athletes recovering from injury, and anyone whose outcomes 
                haven't matched expectations despite doing everything right.
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

      {/* Section: Related Articles */}
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
                  Why milliseconds matter for joint protection, and how timing errors cause pain without structural damage.
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
                relying solely on structural findings, grounded in the understanding that persistent 
                pain and performance loss often reflect deficits in timing, coordination, load 
                tolerance, or central regulation.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Validated outcome measures and functional indicators are integrated throughout 
                our musculoskeletal care. Treatment progression is guided by objective change over 
                time, not pain reports alone. Care adapts based on how the nervous system responds 
                to load, movement demand, and fatigue.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Pittsford Performance Care actively engages in translational neuroscience research 
                relevant to musculoskeletal and performance related conditions under Institutional 
                Review Board (IRB) oversight, contributing responsibly to broader understanding 
                while maintaining the highest standards of patient care.
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
                All supporting evidence is maintained in a centralized Works Cited resource, 
                actively curated as the science of motor control, pain, and rehabilitation 
                advances, reflecting PPC's commitment to transparency and continuous learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Soft Diagnostic CTA */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="p-10 md:p-14 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-6">
                If Pain Persists Despite Rest, Strength Work, or Normal Imaging
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
                A clinician led neurologic and musculoskeletal evaluation can identify which 
                domain is failing to manage load, and what to address first.
              </p>
              <Button size="lg" asChild>
                <Link to="/patient/concierge">
                  Schedule an MSK Evaluation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
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
              Stop chasing symptoms. Schedule your neurologic and musculoskeletal evaluation 
              and discover what's really driving your pain.
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
