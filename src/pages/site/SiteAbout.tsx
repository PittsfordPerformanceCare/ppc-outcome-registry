import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from "react-helmet";
import { 
  Brain, 
  Target, 
  BarChart3, 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Heart,
  Eye,
  Ear,
  Zap,
  Hand,
  Shield,
  Gauge,
  AlertTriangle,
  Activity
} from "lucide-react";

const SiteAbout = () => {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>About PPC | Domain-Based Neurologic & Musculoskeletal Care | Pittsford Performance Care</title>
        <meta name="description" content="Pittsford Performance Care uses a domain-based neurologic model to identify dysfunction across visual, vestibular, cerebellar, autonomic, and other systems. Outcomes tracked. Results measured." />
        <link rel="canonical" href="https://muse-meadow-app.lovable.app/site/about" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Brain className="h-4 w-4" />
              Domain-Based Neurologic Care
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              One Neurologic Framework for Concussion, Pain, and Performance
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Whether dysfunction originates from concussion (top-down) or musculoskeletal 
              injury (bottom-up), the neurologic domains respond the same way: they compensate, 
              fatigue, and cascade into symptoms. PPC's clinician-led evaluation identifies 
              the primary domain driving dysfunction—not just the symptom endpoint.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
              PPC treats both acute and chronic musculoskeletal injuries — including ankle, knee, hip, 
              neck, back, and shoulder pain — alongside advanced concussion and neurologic care.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* The Domain Model */}
      <section className="py-24 lg:py-32 relative" id="domain-model">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                The PPC Framework
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                The Neurologic Domain Model
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Eight neurologic domains govern how your body controls movement, manages load, 
                regulates energy, and processes sensation. Dysfunction in any domain can cascade 
                into symptoms that appear elsewhere.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
              <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">Visual Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Processes visual motion, focus, and spatial accuracy. Dysfunction drives headaches, dizziness, and screen intolerance.
                </p>
              </div>

              <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <Ear className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">Vestibular Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Regulates balance, orientation, and motion sensing. Dysfunction causes dizziness, nausea, and movement sensitivity.
                </p>
              </div>

              <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">Cerebellar Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Coordinates timing, sequencing, and motor prediction. Dysfunction leads to clumsiness and exertional fatigue.
                </p>
              </div>

              <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">Autonomic Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Controls energy regulation, heart rate, and recovery capacity. Dysfunction underlies exercise intolerance.
                </p>
              </div>

              <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <Gauge className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">Frontal / Executive Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Supports attention, inhibition, and cognitive motor control. Dysfunction causes brain fog and decision fatigue.
                </p>
              </div>

              <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">Brainstem Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Establishes baseline regulation and sensory gating. Dysfunction influences sleep and symptom volatility.
                </p>
              </div>

              <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <Hand className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">Proprioceptive Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Integrates body position and movement feedback. Dysfunction contributes to disorientation and movement insecurity.
                </p>
              </div>

              <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">Limbic Domain</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Modulates threat perception and protective responses. Dysfunction drives anxiety and pain amplification.
                </p>
              </div>
            </div>

            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Symptoms often reflect interaction between multiple domains rather than a single deficit. 
                PPC's clinician-led evaluation identifies which domains are primary and which are compensating.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Cascade Effect - Enhanced with Top-Down and Bottom-Up */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-medium mb-6">
                <AlertTriangle className="h-4 w-4" />
                The Cascade Effect
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Symptoms Persist Despite Normal Imaging
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                When a foundational neurologic domain fails to integrate, other domains compensate. 
                Over time, those compensations fatigue and become symptoms. This explains why 
                rest and time often fail—and why treating symptom endpoints rarely resolves 
                the underlying dysfunction.
              </p>
            </div>

            {/* Concussion-Driven Cascades */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Concussion-Driven Cascades</h3>
                  <p className="text-sm text-muted-foreground">Top-Down Neurologic Disruption</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6 max-w-3xl">
                Concussion disrupts cortical and subcortical integration. The injury affects how the brain 
                processes, coordinates, and regulates—not the structure itself. This functional integration 
                failure cascades across domains.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                    <Ear className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-bold text-base mb-3 text-foreground">Vestibular Cascade</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Vestibular instability</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span>visual strain</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span>frontal fatigue</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium text-foreground">headaches</span>
                  </div>
                </div>

                <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                    <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-bold text-base mb-3 text-foreground">Cerebellar Cascade</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Timing disruption</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span>motor prediction failure</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium text-foreground">exertional fatigue</span>
                  </div>
                </div>

                <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                    <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-bold text-base mb-3 text-foreground">Autonomic Cascade</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Autonomic dysregulation</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span>poor recovery capacity</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium text-foreground">exercise intolerance</span>
                  </div>
                </div>

                <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-bold text-base mb-3 text-foreground">Limbic Cascade</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Limbic hyperactivation</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span>frontal suppression</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium text-foreground">brain fog, anxiety</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MSK-Driven Cascades */}
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                  <Hand className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Musculoskeletal-Driven Cascades</h3>
                  <p className="text-sm text-muted-foreground">Bottom-Up Neurologic Disruption</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6 max-w-3xl">
                Peripheral dysfunction alters how the brain controls movement, manages load, and regulates 
                energy. When proprioceptive input is distorted, the brain compensates—and those compensations 
                cascade. This explains why pain persists despite structurally normal imaging.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
                    <Hand className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h4 className="font-bold text-base mb-3 text-foreground">Proprioceptive Cascade</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">Joint dysfunction</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span>distorted afferent input</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span>motor control failure</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium text-foreground">pain</span>
                  </div>
                </div>

                <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
                    <Brain className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h4 className="font-bold text-base mb-3 text-foreground">Cerebellar Compensation</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">Afferent mismatch</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span>cerebellar overload</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium text-foreground">asymmetry, clumsiness</span>
                  </div>
                </div>

                <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
                    <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h4 className="font-bold text-base mb-3 text-foreground">Autonomic Overlay</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">Chronic pain signaling</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span>autonomic stress</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium text-foreground">poor recovery</span>
                  </div>
                </div>

                <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
                    <Gauge className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h4 className="font-bold text-base mb-3 text-foreground">Frontal Fatigue</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">Persistent compensation</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span>executive drain</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium text-foreground">decision fatigue</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-primary/5 to-amber-500/5 border border-primary/20 shadow-lg">
                <Target className="h-5 w-5 text-primary shrink-0" />
                <p className="text-base font-medium text-foreground">
                  Treating the endpoint of the cascade rarely works. Identifying and restoring the primary domain does.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                    <Heart className="h-4 w-4" />
                    Our Story
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Why We Exist</h2>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Too many patients fall through the cracks of traditional healthcare. 
                  They're told their imaging is "normal," their symptoms are "just stress," 
                  or they need to "wait it out." Meanwhile, they continue to struggle with 
                  very real problems that impact their daily lives.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We started Pittsford Performance Care because we knew there had to be a better way. 
                  By focusing on the neurologic domains that actually control function—not just the 
                  structures that show up on scans—we help patients who've tried everything 
                  else finally find answers and a path forward.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our approach combines domain-based neurologic evaluation with validated 
                  outcome tracking. This means you're never left guessing. Every step 
                  of the way, you have objective data showing whether treatment is working.
                </p>
              </div>
              
              <div className="space-y-6">
                <Card className="p-8 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Brain className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">Domain-Based Evaluation</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        We evaluate all eight neurologic domains to identify which 
                        are primary and which are compensating. This reveals 
                        dysfunction that traditional approaches miss.
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-8 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                      <BarChart3 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">Registry-Tracked Outcomes</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Every episode is tracked with validated clinical measures 
                        so you can see your progress objectively. No guessing, just 
                        clear data on what's working.
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-8 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Target className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">Integration Over Isolation</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        We restore domain integration and efficiency, 
                        not just isolated strength or flexibility. This means 
                        faster recovery and more lasting results.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Target className="h-4 w-4" />
                Clinical Approach
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">What Makes PPC Different</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Three foundational pillars define our approach to care, each designed 
                to ensure you receive focused, effective, and measurable treatment.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="group flex flex-col p-8 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
                <div className="h-14 w-14 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-4">Domain-Based Evaluation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We evaluate all neurologic domains that could be contributing: visual, 
                  vestibular, cerebellar, autonomic, frontal, brainstem, proprioceptive, 
                  and limbic. This comprehensive view reveals dysfunction that focused exams miss.
                </p>
              </div>
              
              <div className="group flex flex-col p-8 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
                <div className="h-14 w-14 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-4">Registry-Tracked Outcomes</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every patient's progress is tracked in our Outcome Registry using 
                  validated clinical measures. We don't guess—we prove improvement 
                  with data. This accountability benefits both you and your referring providers.
                </p>
              </div>
              
              <div className="group flex flex-col p-8 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
                <div className="h-14 w-14 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                  <Activity className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-4">Episode-Based Care</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Each complaint is its own episode with clear intake, treatment, 
                  and discharge criteria. No endless treatment plans—just focused 
                  interventions with defined endpoints. You know what to expect from day one.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registry Section */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-5">
                  <div className="text-center p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="text-3xl font-bold text-primary mb-2">MCID</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Minimal Clinically Important Difference tracking
                    </p>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="text-3xl font-bold text-primary mb-2">NDI</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Neck Disability Index
                    </p>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="text-3xl font-bold text-primary mb-2">LEFS</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Lower Extremity Function Scale
                    </p>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="text-3xl font-bold text-primary mb-2">RPQ</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Rivermead Post-Concussion Questionnaire
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2 space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                    <BarChart3 className="h-4 w-4" />
                    Outcome-Driven Care
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">The PPC Outcome Registry</h2>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our proprietary registry tracks every episode from intake through 
                  discharge using validated clinical outcome measures. This isn't 
                  just for our records—it's for you, your family, and any providers 
                  coordinating your care.
                </p>
                
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-lg text-muted-foreground leading-relaxed">
                      Objective proof of domain integration and improvement
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-lg text-muted-foreground leading-relaxed">
                      MCID-tracked outcomes for clinical significance
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-lg text-muted-foreground leading-relaxed">
                      Transparent reporting to you and your care team
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-lg text-muted-foreground leading-relaxed">
                      Treatment adjustments driven by data, not guesswork
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* One Framework Applied Consistently */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                One Framework
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Applied Consistently Across Conditions
              </h2>
            </div>
            
            <div className="space-y-6 mb-10">
              <p className="text-lg text-muted-foreground leading-relaxed">
                PPC does not treat diagnoses in isolation. Whether the origin is concussion, 
                musculoskeletal injury, performance limitation, or developmental challenge, 
                the same domain-based neurologic framework applies. Cascades differ based on 
                the origin of dysfunction—not the diagnostic label.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                This unified approach explains why traditional treatments often fail:
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Recovery stalls despite time and rest</span>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Pain persists despite normal imaging</span>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Performance declines after medical clearance</span>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Symptoms recur despite endpoint treatment</span>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                PPC's clinician-led evaluations identify the <span className="font-medium text-foreground">primary domain</span>, 
                the <span className="font-medium text-foreground">compensating domains</span>, and the 
                <span className="font-medium text-foreground"> intervention targets</span> that restore efficiency, 
                regulation, and readiness.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" asChild className="rounded-xl">
                <Link to="/site/concussion">
                  Concussion Recovery
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="rounded-xl">
                <Link to="/site/msk">
                  Musculoskeletal Care
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="rounded-xl">
                <Link to="/site/performance">
                  Athletic Performance
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical & Research Foundations */}
      <section className="py-20 lg:py-28 bg-background border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <CheckCircle2 className="h-4 w-4" />
                Evidence-Based
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Clinical & Research Foundations
              </h2>
            </div>
            
            <div className="space-y-6 mb-10">
              <p className="text-lg text-muted-foreground leading-relaxed">
                At PPC, validated outcome measurements are integrated directly into active care, not 
                collected retrospectively or for administrative purposes alone. Real-time objective 
                data informs treatment progression, guides clinical decision-making, and ensures that 
                patient recovery is tracked against meaningful thresholds.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our treatment methodology is grounded in established clinical neuroscience. 
                From visual-vestibular rehabilitation to autonomic reconditioning 
                and cerebellar timing protocols, each intervention reflects current understanding 
                of neurologic domain function and recovery.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                PPC is actively engaged in translational neuroscience research conducted under 
                Institutional Review Board (IRB) oversight. This commitment ensures that our clinical 
                observations contribute responsibly to the broader scientific understanding of 
                neurologic rehabilitation.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our <Link to="/site/clinical-governance" className="underline hover:text-foreground transition-colors">clinical governance and outcomes framework</Link> is available for professional and payor review.
              </p>
            </div>
            
            <ul className="space-y-3 mb-10">
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
            
            <div className="flex justify-center">
              <Button variant="outline" asChild className="rounded-xl">
                <Link to="/site/works-cited">
                  View Works Cited
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Not Physical Therapy Link */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40 transition-all duration-300">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Brain className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Is PPC the Same as Physical Therapy?</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Understand the distinction between our domain-based neurologic model 
                    and traditional approaches, and why this difference matters for your outcomes.
                  </p>
                </div>
                <Button asChild className="rounded-full shrink-0">
                  <Link to="/site/why-not-physical-therapy">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Take the Next Step
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience Domain-Based Care?
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              Schedule your comprehensive neurologic evaluation. Our clinician-led 
              assessment identifies which domains are primary, which are compensating, 
              and where intervention will be most effective.
            </p>
            
            <Button size="lg" asChild className="h-12 px-8 text-base rounded-xl shadow-lg">
              <Link to="/patient/concierge">
                Schedule Evaluation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteAbout;
