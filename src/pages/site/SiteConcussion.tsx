import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
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
  Shield,
  Gauge,
  Hand,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { MedicalConditionSchema, BreadcrumbSchema } from "@/components/site/StructuredData";
import LexiconTerm from "@/components/patient/LexiconTerm";
import { getLexiconByTerm } from "@/data/patientLexicon";

const SiteConcussion = () => {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Concussion Recovery | Neurologic & Musculoskeletal Care | Pittsford Performance Care</title>
        <meta name="description" content="Persistent post concussion symptoms require domain based neurologic evaluation. PPC identifies which neurologic domains are limiting your recovery." />
        <link rel="canonical" href="https://muse-meadow-app.lovable.app/site/concussion" />
      </Helmet>
      <MedicalConditionSchema
        name="Post Concussion Syndrome"
        description="Persistent symptoms following concussion or mild traumatic brain injury, including headaches, dizziness, cognitive difficulties, and visual disturbances."
        url="https://muse-meadow-app.lovable.app/site/concussion"
        signOrSymptom={[
          "Persistent headaches",
          "Dizziness and balance problems",
          "Visual disturbances",
          "Cognitive fog and difficulty concentrating",
          "Fatigue and sleep disturbances",
          "Sensitivity to light and sound"
        ]}
        possibleTreatment={[
          "Vestibular rehabilitation",
          "Oculomotor therapy",
          "Autonomic nervous system regulation",
          "Cognitive rehabilitation",
          "Cervical spine treatment"
        ]}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://muse-meadow-app.lovable.app/site/home" },
          { name: "Concussion Care", url: "https://muse-meadow-app.lovable.app/site/concussion" }
        ]}
      />

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
              Persistent post concussion symptoms aren't just "in your head." They're real 
              neurologic deficits that require a{" "}
              <LexiconTerm 
                term={getLexiconByTerm("neurologic evaluation")?.label || "Neurologic Evaluation"} 
                definition={getLexiconByTerm("neurologic evaluation")?.definition || ""}
              >
                neurologic evaluation
              </LexiconTerm>
              , not just rest and time.
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

      {/* Symptoms Section */}
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
                Feeling off balance or unsteady. Fatigue that limits daily activities, no matter 
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

      {/* NEW: Neurologic Integration Process Section */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Understanding Recovery
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Concussion Recovery Is a Neurologic Integration Process
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Concussion recovery does not fail randomly. Symptoms persist when one or more 
                neurologic domains fail to reintegrate after injury, forcing other domains to 
                compensate. This often creates{" "}
                <LexiconTerm 
                  term={getLexiconByTerm("sensory mismatch")?.label || "Sensory Mismatch"} 
                  definition={getLexiconByTerm("sensory mismatch")?.definition || ""}
                >
                  sensory mismatch
                </LexiconTerm>
                —where conflicting signals amplify symptoms and stall recovery.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At PPC, concussion evaluation focuses on identifying which neurologic domain is 
                primary, which domains are compensating, and where the dysfunction cascade is unfolding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Neurologic Domain Map in Concussion Recovery */}
      <section className="py-24 lg:py-32 relative" id="domain-model">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Neurologic Domain Map in Concussion Recovery
              </h2>
              <div className="max-w-3xl mx-auto space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  A concussion does not injure a single part of the brain. It disrupts how multiple 
                  neurologic systems integrate sensory input, regulate energy, and coordinate response to demand.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  At Pittsford Performance Care, concussion recovery is approached through the same 
                  domain based neurologic framework used across all conditions, with emphasis on 
                  restoring tolerance, integration, and efficiency across systems—including the{" "}
                  <LexiconTerm 
                    term={getLexiconByTerm("vestibular system")?.label || "Vestibular System"} 
                    definition={getLexiconByTerm("vestibular system")?.definition || ""}
                  >
                    vestibular system
                  </LexiconTerm>
                  {" "}and{" "}
                  <LexiconTerm 
                    term={getLexiconByTerm("autonomic nervous system")?.label || "Autonomic Nervous System"} 
                    definition={getLexiconByTerm("autonomic nervous system")?.definition || ""}
                  >
                    autonomic nervous system
                  </LexiconTerm>
                  —rather than chasing isolated symptoms.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
              <Link 
                to="/site/articles/concussion/visual-vestibular-mismatch"
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">Visual Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                  Processes visual motion, focus, and spatial accuracy, commonly contributing to headaches, dizziness, and screen intolerance after concussion.
                </p>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Visual Dysfunction After Concussion →
                </span>
              </Link>

              <Link 
                to="/site/articles/concussion/visual-vestibular-mismatch"
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <Ear className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">Vestibular Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                  Regulates balance, orientation, and motion sensing, often driving dizziness, nausea, and movement sensitivity.
                </p>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Vestibular Dysfunction After Concussion →
                </span>
              </Link>

              <Link 
                to="/site/articles/concussion/cerebellar-timing-and-coordination"
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">Cerebellar Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                  Coordinates timing, sequencing, and motor prediction, contributing to clumsiness, slowed performance, and exertional fatigue.
                </p>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Cerebellar Timing Deficits After Concussion →
                </span>
              </Link>

              <Link 
                to="/site/articles/concussion/autonomic-nervous-system-flow"
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">Autonomic Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                  Controls energy regulation, heart rate, and recovery capacity, commonly underlying exercise intolerance and symptom flares.
                </p>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Autonomic Dysfunction After Concussion →
                </span>
              </Link>

              <Link 
                to="/site/articles/concussion/frontal-system-fog-after-concussion"
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <Gauge className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">Frontal / Executive Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                  Supports attention, inhibition, and cognitive motor control, often involved in brain fog, overwhelm, and decision fatigue.
                </p>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Executive Dysfunction After Concussion →
                </span>
              </Link>

              <Link 
                to="/site/articles/concussion/concussion-energy-crisis-and-recovery"
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">Brainstem Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                  Establishes baseline regulation and sensory gating, influencing sleep, light sensitivity, and symptom volatility.
                </p>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Brainstem Dysfunction After Concussion →
                </span>
              </Link>

              <Link 
                to="/site/articles/concussion/proprioceptive-dysfunction-after-concussion"
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <Hand className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">Proprioceptive Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                  Integrates body position and movement feedback, contributing to disorientation, clumsiness, and movement insecurity.
                </p>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Proprioceptive Dysfunction After Concussion →
                </span>
              </Link>

              <Link 
                to="/site/articles/concussion/limbic-overload-after-concussion"
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">Limbic Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                  Modulates threat perception and protective responses, influencing symptom persistence, anxiety, and pain amplification.
                </p>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Limbic Dysregulation After Concussion →
                </span>
              </Link>
            </div>

            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Concussion symptoms often reflect interaction between multiple domains rather than a single deficit. 
                Identifying which systems are primary, and which are compensating, is essential for restoring 
                tolerance, integration, and meaningful recovery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Domain Cascade Explanation */}
      <section className="relative overflow-hidden">
        {/* Smooth transition gradient from light to dark */}
        <div className="h-24 lg:h-32 bg-gradient-to-b from-background via-slate-100/50 dark:via-slate-800/50 to-slate-900" />
        
        <div className="bg-slate-900 pb-24 lg:pb-32 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/80 via-transparent to-transparent opacity-60" />
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16 pt-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium mb-6">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Understanding the Cascade
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                  How Symptoms Spread Between Domains
                </h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                  Symptoms often appear downstream from the original disruption. The symptom you 
                  notice may not be the domain where the problem started.
                </p>
              </div>
            
            {/* Cascade Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
              {/* Vestibular Cascade */}
              <div className="group relative">
                <div className="absolute left-6 top-14 bottom-4 w-px bg-gradient-to-b from-amber-500 via-amber-500/50 to-red-500/80 group-hover:via-amber-400 transition-all duration-500" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative z-10 h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Ear className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Vestibular Cascade</h3>
                </div>
                <div className="space-y-0 pl-4">
                  <div className="flex items-center gap-4 py-3 group/step">
                    <div className="relative z-10 h-5 w-5 rounded-full bg-amber-500 border-2 border-slate-900 shadow-md shadow-amber-500/20 group-hover/step:scale-125 transition-transform" />
                    <span className="text-amber-400 font-semibold">Vestibular instability</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Primary</span>
                  </div>
                  <div className="flex items-center gap-4 py-3 group/step">
                    <div className="relative z-10 h-4 w-4 rounded-full bg-amber-500/70 border-2 border-slate-900 group-hover/step:scale-125 transition-transform" />
                    <span className="text-slate-300">Visual strain & tracking difficulty</span>
                  </div>
                  <div className="flex items-center gap-4 py-3 group/step">
                    <div className="relative z-10 h-4 w-4 rounded-full bg-amber-500/50 border-2 border-slate-900 group-hover/step:scale-125 transition-transform" />
                    <span className="text-slate-400">Frontal fatigue & overwhelm</span>
                  </div>
                  <div className="flex items-center gap-4 py-3 group/step">
                    <div className="relative z-10 h-5 w-5 rounded-full bg-red-500 border-2 border-slate-900 shadow-md shadow-red-500/20 group-hover/step:scale-125 transition-transform" />
                    <span className="text-red-400 font-semibold">Persistent headaches</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Symptom</span>
                  </div>
                </div>
              </div>

              {/* Cerebellar Cascade */}
              <div className="group relative">
                <div className="absolute left-6 top-14 bottom-4 w-px bg-gradient-to-b from-blue-500 via-blue-500/50 to-red-500/80 group-hover:via-blue-400 transition-all duration-500" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative z-10 h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Cerebellar Cascade</h3>
                </div>
                <div className="space-y-0 pl-4">
                  <div className="flex items-center gap-4 py-3 group/step">
                    <div className="relative z-10 h-5 w-5 rounded-full bg-blue-500 border-2 border-slate-900 shadow-md shadow-blue-500/20 group-hover/step:scale-125 transition-transform" />
                    <span className="text-blue-400 font-semibold">Cerebellar timing delay</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Primary</span>
                  </div>
                  <div className="flex items-center gap-4 py-3 group/step">
                    <div className="relative z-10 h-4 w-4 rounded-full bg-blue-500/70 border-2 border-slate-900 group-hover/step:scale-125 transition-transform" />
                    <span className="text-slate-300">Proprioceptive overload</span>
                  </div>
                  <div className="flex items-center gap-4 py-3 group/step">
                    <div className="relative z-10 h-4 w-4 rounded-full bg-blue-500/50 border-2 border-slate-900 group-hover/step:scale-125 transition-transform" />
                    <span className="text-slate-400">Movement asymmetry</span>
                  </div>
                  <div className="flex items-center gap-4 py-3 group/step">
                    <div className="relative z-10 h-5 w-5 rounded-full bg-red-500 border-2 border-slate-900 shadow-md shadow-red-500/20 group-hover/step:scale-125 transition-transform" />
                    <span className="text-red-400 font-semibold">Chronic pain patterns</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Symptom</span>
                  </div>
                </div>
              </div>

              {/* Brainstem Cascade */}
              <div className="group relative">
                <div className="absolute left-6 top-14 bottom-4 w-px bg-gradient-to-b from-purple-500 via-purple-500/50 to-red-500/80 group-hover:via-purple-400 transition-all duration-500" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative z-10 h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Brainstem Cascade</h3>
                </div>
                <div className="space-y-0 pl-4">
                  <div className="flex items-center gap-4 py-3 group/step">
                    <div className="relative z-10 h-5 w-5 rounded-full bg-purple-500 border-2 border-slate-900 shadow-md shadow-purple-500/20 group-hover/step:scale-125 transition-transform" />
                    <span className="text-purple-400 font-semibold">Brainstem inefficiency</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Primary</span>
                  </div>
                  <div className="flex items-center gap-4 py-3 group/step">
                    <div className="relative z-10 h-4 w-4 rounded-full bg-purple-500/70 border-2 border-slate-900 group-hover/step:scale-125 transition-transform" />
                    <span className="text-slate-300">Autonomic dysregulation</span>
                  </div>
                  <div className="flex items-center gap-4 py-3 group/step">
                    <div className="relative z-10 h-4 w-4 rounded-full bg-purple-500/50 border-2 border-slate-900 group-hover/step:scale-125 transition-transform" />
                    <span className="text-slate-400">Heart rate variability disruption</span>
                  </div>
                  <div className="flex items-center gap-4 py-3 group/step">
                    <div className="relative z-10 h-5 w-5 rounded-full bg-red-500 border-2 border-slate-900 shadow-md shadow-red-500/20 group-hover/step:scale-125 transition-transform" />
                    <span className="text-red-400 font-semibold">Exercise intolerance</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Symptom</span>
                  </div>
                </div>
              </div>

              {/* Limbic Cascade */}
              <div className="group relative">
                <div className="absolute left-6 top-14 bottom-4 w-px bg-gradient-to-b from-emerald-500 via-emerald-500/50 to-red-500/80 group-hover:via-emerald-400 transition-all duration-500" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative z-10 h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Limbic Cascade</h3>
                </div>
                <div className="space-y-0 pl-4">
                  <div className="flex items-center gap-4 py-3 group/step">
                    <div className="relative z-10 h-5 w-5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-md shadow-emerald-500/20 group-hover/step:scale-125 transition-transform" />
                    <span className="text-emerald-400 font-semibold">Limbic hyperactivation</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Primary</span>
                  </div>
                  <div className="flex items-center gap-4 py-3 group/step">
                    <div className="relative z-10 h-4 w-4 rounded-full bg-emerald-500/70 border-2 border-slate-900 group-hover/step:scale-125 transition-transform" />
                    <span className="text-slate-300">Frontal suppression</span>
                  </div>
                  <div className="flex items-center gap-4 py-3 group/step">
                    <div className="relative z-10 h-4 w-4 rounded-full bg-emerald-500/50 border-2 border-slate-900 group-hover/step:scale-125 transition-transform" />
                    <span className="text-slate-400">Cognitive fog & overwhelm</span>
                  </div>
                  <div className="flex items-center gap-4 py-3 group/step">
                    <div className="relative z-10 h-5 w-5 rounded-full bg-red-500 border-2 border-slate-900 shadow-md shadow-red-500/20 group-hover/step:scale-125 transition-transform" />
                    <span className="text-red-400 font-semibold">Mood & anxiety changes</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Symptom</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom callout */}
            <div className="max-w-3xl mx-auto">
              <div className="relative p-8 rounded-2xl bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg">
                    Key Insight
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <Target className="h-8 w-8 text-primary shrink-0" />
                  <p className="text-lg md:text-xl font-medium text-white">
                    Treating the endpoint of the cascade rarely works. <span className="text-primary">Identifying the primary domain does.</span>
                  </p>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
        
        {/* Smooth transition gradient from dark to light */}
        <div className="h-24 lg:h-32 bg-gradient-to-b from-slate-900 via-slate-800/50 dark:via-slate-800/50 to-background" />
      </section>

      {/* Why Domain Based Evaluation Matters */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Target className="h-4 w-4" />
                Clinical Precision
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Domain Based Evaluation Matters at PPC
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our clinician led evaluation is designed to distinguish between primary domain 
                dysfunction and secondary compensation. This distinction determines the treatment 
                sequence, because addressing a compensating domain first often makes symptoms worse.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                PPC focuses on neurologic integration, not isolated symptoms. Rather than treating 
                headaches, dizziness, or fatigue as separate problems, we trace each symptom back 
                to the domain level dysfunction driving it.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Progress is measured by readiness, not timelines. We use validated outcome measures 
                to track meaningful change and determine when each domain is ready for increased 
                demand, avoiding premature loading that prolongs recovery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Energy Crisis */}
      <section className="py-20 lg:py-28 relative overflow-hidden" id="energy-crisis">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Battery className="h-4 w-4" />
                Understanding Fatigue
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                The Post Concussion Energy Crisis
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                After a concussion, your brain's energy metabolism is disrupted. Normal activities 
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
                triggering symptom flares, restoring your brain's ability to meet the demands of daily life.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-6">
                Clinical reference:{" "}
                <Link 
                  to="/site/white-papers/persistent-neurologic-symptoms-after-covid-19" 
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Persistent Neurologic Symptoms After COVID-19
                </Link>
                , PPC Clinical White Paper Series.
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
      <section className="py-20 lg:py-28 bg-background" id="evaluation">
        <div className="container mx-auto px-4">
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
                <h3 className="text-lg font-semibold mb-3">Domain Exam</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Detailed testing of all neurologic domains to identify primary dysfunction
                </p>
              </div>
              
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Finding Report</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Clear explanation of which domains are affected and why you have symptoms
                </p>
              </div>
              
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Treatment Plan</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Targeted interventions for your specific domain deficits
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-28 lg:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                <Brain className="h-4 w-4" />
                Deep Dive Resources
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Learn More About Concussion Recovery
              </h2>
              <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed tracking-wide">
                Explore our in-depth guides on specific post-concussion challenges and evidence-based recovery strategies.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10 lg:gap-12">
              <Link 
                to="/site/articles/concussion/visual-vestibular-mismatch"
                className="group flex flex-col p-10 lg:p-12 rounded-3xl border border-border/40 bg-card/30 backdrop-blur-sm hover:border-primary/40 hover:bg-card/60 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-8">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-5 leading-snug">
                  Visual Vestibular Mismatch
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed tracking-wide flex-1">
                  Understanding why your eyes and inner ear aren't working together, and what targeted treatment looks like.
                </p>
                <div className="mt-8 pt-6 border-t border-border/30">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all duration-300">
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
              
              <Link 
                to="/site/articles/concussion/autonomic-nervous-system-flow"
                className="group flex flex-col p-10 lg:p-12 rounded-3xl border border-border/40 bg-card/30 backdrop-blur-sm hover:border-primary/40 hover:bg-card/60 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-8">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-5 leading-snug">
                  Autonomic Nervous System
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed tracking-wide flex-1">
                  How ANS dysregulation causes fatigue, anxiety, and exercise intolerance after concussion.
                </p>
                <div className="mt-8 pt-6 border-t border-border/30">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all duration-300">
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
              
              <Link 
                to="/site/articles/concussion/cerebellar-timing-and-coordination"
                className="group flex flex-col p-10 lg:p-12 rounded-3xl border border-border/40 bg-card/30 backdrop-blur-sm hover:border-primary/40 hover:bg-card/60 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-8">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-5 leading-snug">
                  Cerebellar Timing
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed tracking-wide flex-1">
                  When your brain's master clock is disrupted and recovery feels impossible to achieve.
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
                PPC's approach to concussion care is informed by established research in clinical 
                neuroscience and rehabilitation medicine. Our methodology is designed to address 
                neurologic dysfunction—not symptom suppression—and is grounded in the understanding 
                that concussion represents a physiologic and metabolic injury requiring targeted, 
                domain based intervention.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Validated outcome measures are integrated throughout our concussion care process. 
                Progression and treatment decisions are guided by objective change over time, not 
                symptom resolution alone. This approach ensures that clinical decision making is 
                based on measured neurologic and functional response—tracking longitudinal 
                recovery rather than subjective improvement.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Pittsford Performance Care actively engages in translational neuroscience research 
                conducted under Institutional Review Board (IRB) oversight. The purpose of this 
                work is to improve how neurologic dysfunction is identified, monitored, and supported 
                in real-world clinical and educational environments—contributing responsibly to 
                the broader understanding of concussion recovery while maintaining the highest 
                standards of patient care and ethical governance.
              </p>
            </div>
            
            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span className="text-muted-foreground leading-relaxed">
                  Berlin Consensus Statement on Concussion in Sport
                </span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span className="text-muted-foreground leading-relaxed">
                  Evidence describing autonomic nervous system dysfunction following mild traumatic brain injury
                </span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span className="text-muted-foreground leading-relaxed">
                  Research demonstrating persistent metabolic and cerebral blood flow disruption after concussion
                </span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span className="text-muted-foreground leading-relaxed">
                  Clinical literature supporting graded aerobic exercise as an active component of concussion recovery
                </span>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                <span className="text-muted-foreground leading-relaxed">
                  Validated outcome measures and MCID thresholds for tracking meaningful clinical improvement
                </span>
              </li>
            </ul>
            
            <div className="mt-10 pt-8 border-t border-border/40">
              <p className="text-muted-foreground leading-relaxed">
                All supporting evidence referenced throughout our concussion content is maintained 
                in a centralized Works Cited resource. This reference library is actively curated 
                and continues to evolve as the science of concussion recovery advances—reflecting 
                PPC's commitment to transparency, accountability, and continuous learning.
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
                Not Sure Which Neurologic Domain Is Limiting Your Recovery?
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
                A clinician led neurologic and musculoskeletal evaluation can help identify 
                where the cascade began—and what to address first.
              </p>
              <Button size="lg" asChild>
                <Link to="/patient/concierge">
                  Schedule a Concussion Evaluation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
