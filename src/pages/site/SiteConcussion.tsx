import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  Eye, 
  Ear, 
  Heart,
  Zap,
  Clock,
  ArrowRight, 
  CheckCircle2,
  CloudFog,
  Compass,
  Sun,
  Scale,
  Battery,
  Monitor,
  HeartPulse
} from "lucide-react";

const SiteConcussion = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Brain className="h-4 w-4" />
              Concussion Care Division
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Still Struggling Months After Your Concussion?
            </h1>
            <p className="text-xl text-muted-foreground">
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
      </section>

      {/* Symptoms Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-warning-soft/30 to-background" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-warning/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-warning/20 to-warning/10 border border-warning/20 text-warning dark:text-warning mb-6">
                <Brain className="h-4 w-4" />
                <span className="text-sm font-semibold tracking-wide">Recognize the Signs</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                Do These Symptoms Sound Familiar?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Persistent post-concussion symptoms indicate underlying neurologic dysfunction 
                that won't resolve with rest alone.
              </p>
            </div>
            
            {/* Symptom Cards - Bento Grid Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {[
                { symptom: "Persistent headaches that won't go away", icon: Brain, color: "from-rose-500/20 to-rose-500/5", iconColor: "text-rose-500", borderColor: "hover:border-rose-500/40" },
                { symptom: "Brain fog and difficulty concentrating", icon: CloudFog, color: "from-violet-500/20 to-violet-500/5", iconColor: "text-violet-500", borderColor: "hover:border-violet-500/40" },
                { symptom: "Dizziness when moving your head", icon: Compass, color: "from-amber-500/20 to-amber-500/5", iconColor: "text-amber-500", borderColor: "hover:border-amber-500/40" },
                { symptom: "Sensitivity to light and sound", icon: Sun, color: "from-yellow-500/20 to-yellow-500/5", iconColor: "text-yellow-500", borderColor: "hover:border-yellow-500/40" },
                { symptom: "Feeling off-balance or unsteady", icon: Scale, color: "from-teal-500/20 to-teal-500/5", iconColor: "text-teal-500", borderColor: "hover:border-teal-500/40" },
                { symptom: "Fatigue that limits daily activities", icon: Battery, color: "from-orange-500/20 to-orange-500/5", iconColor: "text-orange-500", borderColor: "hover:border-orange-500/40" },
                { symptom: "Trouble with screens and reading", icon: Monitor, color: "from-blue-500/20 to-blue-500/5", iconColor: "text-blue-500", borderColor: "hover:border-blue-500/40" },
                { symptom: "Anxiety or mood changes since injury", icon: HeartPulse, color: "from-pink-500/20 to-pink-500/5", iconColor: "text-pink-500", borderColor: "hover:border-pink-500/40" }
              ].map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={index} 
                    className={`group relative p-6 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${item.borderColor} animate-fade-in`}
                    style={{ animationDelay: `${index * 75}ms`, animationFillMode: 'backwards' }}
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Icon */}
                    <div className={`relative mb-4 h-12 w-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`h-6 w-6 ${item.iconColor}`} />
                    </div>
                    
                    {/* Text */}
                    <p className="relative text-sm font-medium leading-relaxed text-foreground/90">{item.symptom}</p>
                  </div>
                );
              })}
            </div>
            
            {/* Bottom CTA */}
            <div className="mt-16 flex justify-center">
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-warning/50 to-primary/50 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                
                <div className="relative flex flex-col sm:flex-row items-center gap-6 p-8 rounded-2xl bg-card border border-border/50 shadow-lg">
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-lg font-medium text-foreground mb-1">
                      Tired of waiting for symptoms to resolve?
                    </p>
                    <p className="text-muted-foreground">
                      It's time for a <span className="text-primary font-semibold">different approach</span>.
                    </p>
                  </div>
                  <Button size="lg" className="shrink-0 shadow-lg" asChild>
                    <Link to="/patient/concierge">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Five-System Model */}
      <section className="py-20 bg-muted/30" id="five-system-model">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The Five-System Concussion Model</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Concussions rarely affect just one system. Our comprehensive evaluation 
              examines all five neurologic systems that can be disrupted by brain injury.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
                  <Eye className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-lg">Visual System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Eye tracking, convergence, accommodation, and visual processing 
                  deficits that cause reading difficulty and screen intolerance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2">
                  <Ear className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle className="text-lg">Vestibular System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Balance, spatial orientation, and gaze stability. Dysfunction here 
                  causes dizziness, motion sensitivity, and disorientation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-2">
                  <Brain className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-lg">Cerebellar System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Timing, coordination, and motor sequencing. Cerebellar deficits 
                  affect movement precision and cognitive processing speed.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-2">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle className="text-lg">Autonomic System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Heart rate variability, blood pressure regulation, and stress response. 
                  ANS dysfunction causes fatigue, exercise intolerance, and anxiety.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-2">
                  <Zap className="h-6 w-6 text-amber-500" />
                </div>
                <CardTitle className="text-lg">Cervical System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Neck proprioception and cervicogenic contributions to headache, 
                  dizziness, and visual disturbance often overlooked after injury.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Why It Matters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Targeting the wrong system wastes time. Our evaluation identifies 
                  exactly which systems are affected so treatment is precise.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Energy Crisis */}
      <section className="py-24 relative overflow-hidden" id="energy-crisis">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-background to-primary/5" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-primary/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 mb-6">
                <Battery className="h-4 w-4" />
                <span className="text-sm font-semibold tracking-wide">Understanding Fatigue</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
                The Post-Concussion Energy Crisis
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                After a concussion, your brain's energy metabolism is disrupted—normal activities 
                now require more neural resources than you have available.
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
                    <h3 className="text-xl font-bold">What's Happening</h3>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    The metabolic disruption after concussion creates an energy mismatch—your brain 
                    needs more fuel but can produce less. This leads to fatigue, brain fog, and symptom 
                    flares when you push too hard.
                  </p>
                  
                  <div className="space-y-4 pt-2">
                    {[
                      { text: "Reduced mitochondrial efficiency in affected areas", icon: Battery },
                      { text: "Increased metabolic demand for routine tasks", icon: Zap },
                      { text: "Threshold symptoms when energy reserves deplete", icon: Brain }
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
                    Our approach includes carefully dosed neurologic exercise to rebuild 
                    capacity without triggering symptom flares.
                  </p>
                </div>
              </div>
              
              {/* Right: Signs Grid */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/10 flex items-center justify-center">
                    <HeartPulse className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Common Energy Crisis Signs</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { sign: "Worse symptoms later in the day", color: "from-blue-500/20 to-blue-500/5", borderColor: "hover:border-blue-500/40" },
                    { sign: "Crashes after cognitive or physical exertion", color: "from-sky-500/20 to-sky-500/5", borderColor: "hover:border-sky-500/40" },
                    { sign: "Need for frequent rest breaks", color: "from-cyan-500/20 to-cyan-500/5", borderColor: "hover:border-cyan-500/40" },
                    { sign: "Inability to return to normal activity levels", color: "from-teal-500/20 to-teal-500/5", borderColor: "hover:border-teal-500/40" },
                    { sign: "Sleep doesn't fully restore energy", color: "from-primary/20 to-primary/5", borderColor: "hover:border-primary/40" },
                    { sign: "Mental exhaustion from simple tasks", color: "from-indigo-500/20 to-indigo-500/5", borderColor: "hover:border-indigo-500/40" }
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
                    to="/site/articles/concussion/concussion-energy-crisis-and-recovery"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Learn more about the energy crisis
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
            <h2 className="text-3xl font-bold mb-4">Our Neurologic Evaluation</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive assessment that goes far beyond standard concussion protocols
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold">Intake Measures</h3>
              <p className="text-sm text-muted-foreground">
                Validated outcome measures establish your baseline and track progress
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold">Systems Exam</h3>
              <p className="text-sm text-muted-foreground">
                Detailed testing of all five concussion systems to identify deficits
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold">Finding Report</h3>
              <p className="text-sm text-muted-foreground">
                Clear explanation of which systems are affected and why you have symptoms
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="font-semibold">Treatment Plan</h3>
              <p className="text-sm text-muted-foreground">
                Targeted interventions for your specific system deficits
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-24 relative overflow-hidden">
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-blue-50/30 dark:via-blue-950/20 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-card shadow-md border border-border/50 mb-8">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-semibold text-foreground tracking-wide">Deep Dive Resources</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Learn More About <br className="hidden sm:block" />
                <span className="text-primary">Concussion Recovery</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Explore our in-depth guides on specific post-concussion challenges and evidence-based recovery strategies.
              </p>
            </div>
            
            {/* Article cards - Larger, more spacious design */}
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Visual-Vestibular Mismatch",
                  description: "Understanding why your eyes and inner ear aren't working together—and what targeted treatment looks like.",
                  href: "/site/articles/concussion/visual-vestibular-mismatch",
                  icon: Eye,
                  accentColor: "bg-blue-500",
                  lightBg: "bg-blue-50 dark:bg-blue-950/40",
                  iconColor: "text-blue-600 dark:text-blue-400"
                },
                {
                  title: "Autonomic Nervous System",
                  description: "How ANS dysregulation causes fatigue, anxiety, and exercise intolerance after concussion.",
                  href: "/site/articles/concussion/autonomic-nervous-system-flow",
                  icon: Heart,
                  accentColor: "bg-teal-500",
                  lightBg: "bg-teal-50 dark:bg-teal-950/40",
                  iconColor: "text-teal-600 dark:text-teal-400"
                },
                {
                  title: "Cerebellar Timing",
                  description: "When your brain's master clock is disrupted and recovery feels impossible to achieve.",
                  href: "/site/articles/concussion/cerebellar-timing-and-coordination",
                  icon: Brain,
                  accentColor: "bg-indigo-500",
                  lightBg: "bg-indigo-50 dark:bg-indigo-950/40",
                  iconColor: "text-indigo-600 dark:text-indigo-400"
                }
              ].map((article, index) => {
                const IconComponent = article.icon;
                return (
                  <Link 
                    key={index}
                    to={article.href}
                    className="group relative flex flex-col bg-white dark:bg-card rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
                  >
                    {/* Top accent bar */}
                    <div className={`h-1.5 w-full ${article.accentColor}`} />
                    
                    {/* Icon area with generous padding */}
                    <div className={`${article.lightBg} px-8 pt-10 pb-8`}>
                      <div className="w-24 h-24 rounded-3xl bg-white dark:bg-card shadow-md flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        <IconComponent className={`h-12 w-12 ${article.iconColor}`} />
                      </div>
                    </div>
                    
                    {/* Content area */}
                    <div className="flex-1 p-8 pt-6 flex flex-col">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed flex-1">
                        {article.description}
                      </p>
                      
                      {/* Read more link */}
                      <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">Read Article</span>
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          <ArrowRight className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {/* Browse all link */}
            <div className="flex justify-center mt-14">
              <Link 
                to="/site/articles" 
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white dark:bg-card shadow-lg border border-border/50 hover:border-primary/50 hover:shadow-xl transition-all duration-300"
              >
                <span className="font-semibold">Browse All Resources</span>
                <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Find Answers?</h2>
          <p className="mb-6 opacity-90 max-w-xl mx-auto">
            Stop waiting for symptoms to resolve on their own. Schedule your 
            comprehensive neurologic evaluation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/patient/concierge">Schedule Evaluation</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/50 bg-white/10 text-white hover:bg-white/20" asChild>
              <Link to="/patient/self-tests/concussion">Take Self-Assessment</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteConcussion;
