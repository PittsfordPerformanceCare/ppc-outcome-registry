import { Helmet } from "react-helmet";
import { BookOpen, FileText, Brain, Heart, Eye, Activity, Target, Shield } from "lucide-react";

const SiteWorksCited = () => {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Works Cited | Pittsford Performance Care</title>
        <meta name="description" content="A centralized reference library supporting the clinical methodology and educational content of Pittsford Performance Care." />
        <link rel="canonical" href="https://muse-meadow-app.lovable.app/site/works-cited" />
      </Helmet>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              Reference Library
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Works Cited
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              A centralized, living reference library supporting the clinical methodology and 
              educational content of Pittsford Performance Care.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Purpose Section */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                PPC's clinical model is grounded in established research across clinical neuroscience, 
                rehabilitation medicine, and motor control science. This page exists to centralize 
                the supporting literature referenced throughout the site.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Dense citations have been intentionally separated from patient-facing content to 
                preserve clarity and readability, while maintaining full transparency for those 
                seeking foundational evidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4 mb-8">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">How to Use This Resource</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                    <span>References are organized by clinical domain for easy navigation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                    <span>They reflect foundational concepts and consensus frameworks, not experimental protocols</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                    <span>This page is curated, maintained, and updated as the literature evolves</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                    <span>This resource supports patients, families, clinicians, educators, and referring professionals</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reference Sections */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-16">
            
            {/* Concussion & mTBI */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold">Concussion & Mild Traumatic Brain Injury (mTBI)</h3>
              </div>
              <ul className="space-y-3 pl-16">
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2.5 shrink-0" />
                  <span>International consensus statements on concussion in sport</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2.5 shrink-0" />
                  <span>Autonomic dysfunction following mild traumatic brain injury</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2.5 shrink-0" />
                  <span>Persistent metabolic and cerebral blood flow disruption after concussion</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2.5 shrink-0" />
                  <span>Graded aerobic exercise as an active component of concussion recovery</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2.5 shrink-0" />
                  <span>Limitations of symptom only or time based return to play models</span>
                </li>
              </ul>
            </div>

            {/* Autonomic Nervous System */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-600/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-xl font-bold">Autonomic Nervous System & Physiologic Regulation</h3>
              </div>
              <ul className="space-y-3 pl-16">
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2.5 shrink-0" />
                  <span>Autonomic dysregulation after neurologic injury</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2.5 shrink-0" />
                  <span>Heart rate variability and autonomic balance in recovery</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2.5 shrink-0" />
                  <span>Exercise intolerance and orthostatic symptoms in post injury states</span>
                </li>
              </ul>
            </div>

            {/* Visual Vestibular & Balance */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-xl font-bold">Visual Vestibular & Balance Systems</h3>
              </div>
              <ul className="space-y-3 pl-16">
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500 mt-2.5 shrink-0" />
                  <span>Visual vestibular integration and mismatch after concussion</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500 mt-2.5 shrink-0" />
                  <span>Vestibular system contributions to balance and spatial orientation</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500 mt-2.5 shrink-0" />
                  <span>Clinical guidelines supporting targeted vestibular rehabilitation</span>
                </li>
              </ul>
            </div>

            {/* Cerebellar Function */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold">Cerebellar Function, Timing, & Motor Coordination</h3>
              </div>
              <ul className="space-y-3 pl-16">
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2.5 shrink-0" />
                  <span>Cerebellar contributions to motor timing and coordination</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2.5 shrink-0" />
                  <span>Links between cerebellar dysfunction, processing speed, and movement efficiency</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2.5 shrink-0" />
                  <span>Coordination deficits following neurologic injury</span>
                </li>
              </ul>
            </div>

            {/* Musculoskeletal Pain */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">Musculoskeletal Pain, Motor Control, & Performance</h3>
              </div>
              <ul className="space-y-3 pl-16">
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
                  <span>Neuromuscular control and motor timing deficits in chronic pain</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
                  <span>Central nervous system contributions to persistent musculoskeletal symptoms</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
                  <span>Fatigue, load tolerance, and injury recurrence</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
                  <span>Limitations of structural imaging in functional pain syndromes</span>
                </li>
              </ul>
            </div>

            {/* Outcome Measurement */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold">Outcome Measurement & Clinical Decision Making</h3>
              </div>
              <ul className="space-y-3 pl-16">
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 mt-2.5 shrink-0" />
                  <span>Use of validated patient-reported outcome measures</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 mt-2.5 shrink-0" />
                  <span>Minimal Clinically Important Difference (MCID) concepts</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 mt-2.5 shrink-0" />
                  <span>Importance of longitudinal outcome tracking</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 mt-2.5 shrink-0" />
                  <span>Evidence that symptom resolution does not equal full neurologic recovery</span>
                </li>
              </ul>
            </div>

            {/* Translational Neuroscience */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Translational Neuroscience & Research Governance</h3>
              </div>
              <ul className="space-y-3 pl-16">
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                  <span>Principles of translational neuroscience research</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                  <span>Ethical and governance frameworks for IRB supervised research</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                  <span>Responsible integration of research methods into real world clinical care</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Living Reference Statement */}
      <section className="py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h3 className="text-xl font-bold">A Living Reference Library</h3>
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-muted-foreground leading-relaxed">
                This Works Cited page is a living reference library. It will continue to evolve 
                as the science of neurologic rehabilitation advances. PPC is committed to 
                transparency, accountability, and continuous learning.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteWorksCited;
