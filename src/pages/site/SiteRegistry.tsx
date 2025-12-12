import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowRight,
  CheckCircle2,
  Shield,
  Eye,
  Target,
  Users,
  Heart,
  GraduationCap,
  BarChart3,
  Sparkles
} from "lucide-react";

const SiteRegistry = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-28 lg:py-36 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <BarChart3 className="h-4 w-4" />
              Outcome-Driven Care
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              PPC Outcome Registry
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Clarity Through Measurable Recovery. Every patient deserves to know whether 
              they're getting better—and we believe the data should prove it.
            </p>
          </div>
        </div>
      </section>

      {/* Section 1 — Intro / Purpose */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Recovery should not feel confusing. When patients are uncertain about 
              whether they're improving—or why—it erodes confidence and delays healing. 
              Too often, traditional care leaves people wondering if they're on the right path.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Patients deserve clarity and transparency at every stage of their care. 
              That's why Pittsford Performance Care built the Outcome Registry: to replace 
              guesswork with understanding, and to ensure that every patient's recovery 
              journey is grounded in structure and honesty.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              The Registry reflects who we are as clinicians. It represents our commitment 
              to data-driven clinical care, our belief that patients should never be left 
              in the dark, and our philosophy that measurable recovery is the foundation 
              of meaningful care.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 — Why We Built the Registry */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Our Purpose
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Why We Built the Registry</h2>
            
            <div className="space-y-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                In traditional care, progress is often unclear. Patients leave appointments 
                wondering if they're actually getting better or just going through the motions. 
                Clinicians may rely on memory or intuition rather than structured observation. 
                Families are left without answers when they ask, "Is this working?"
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                We built the Outcome Registry because we believe care should never feel like 
                guesswork. Patients deserve to know where they started, how far they've come, 
                and what's next. Clinicians need a framework for reflection and accountability. 
                Families should be able to trust that recovery is being tracked, not assumed.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                The Registry exists to close these gaps—not by adding complexity, but by 
                bringing structure and clarity to every episode of care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — What the Registry Represents */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Target className="h-4 w-4" />
                Clinical Standard
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">What the Registry Represents</h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                The PPC Outcome Registry is more than a record-keeping system. It is a 
                clinical standard—a commitment we make to every patient who walks through 
                our doors. It is the foundation upon which we build trust, guide treatment, 
                and define what success looks like.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Eye className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Transparency</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Recovery is visible and understandable to everyone involved—patients, 
                  families, and referring providers alike.
                </p>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Precision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Care is guided by observation and structure, not assumption. 
                  Every decision is grounded in measurable clinical data.
                </p>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Consistency</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every patient receives the same level of structured attention, 
                  regardless of their condition or complexity.
                </p>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Accountability</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Clinicians are held to the standard they set for themselves. 
                  The data holds us accountable to your recovery.
                </p>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Patient Understanding</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Patients are empowered with knowledge about their own progress. 
                  You're never left in the dark about your recovery.
                </p>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <GraduationCap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Research Readiness</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Data collected with rigor supports future clinical insight and 
                  contributes to advancing the science of recovery.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — How the Registry Brings Clarity to Recovery */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Eye className="h-4 w-4" />
              Clarity in Recovery
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-8">How the Registry Brings Clarity to Recovery</h2>
            
            <div className="space-y-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Recovery is rarely straightforward. Neurologic healing, in particular, 
                does not follow a linear path. Some weeks bring breakthroughs; others 
                bring setbacks. Without context, these fluctuations can feel confusing 
                or discouraging.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                The Outcome Registry provides that context. By capturing a structured, 
                longitudinal view of recovery, it allows both clinicians and patients to 
                see patterns over time—patterns that would be invisible in isolated snapshots. 
                This perspective transforms uncertainty into understanding.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                When patients and clinicians share a clear picture of where recovery has 
                been and where it is heading, decisions become more confident, communication 
                becomes more meaningful, and care becomes more effective.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 — A Foundation for Clinical Excellence and Research */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <GraduationCap className="h-4 w-4" />
              Clinical Excellence
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-8">A Foundation for Clinical Excellence and Research</h2>
            
            <div className="space-y-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                The Registry is not only a tool for individual patient care. It is a 
                commitment to the broader pursuit of clinical excellence. By maintaining 
                consistency and rigor in how we observe recovery, we create a foundation 
                for reflection, improvement, and scientific contribution.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                This commitment extends beyond our clinic walls. Pittsford Performance 
                Care is proud to collaborate with Webster Central School District on 
                community-embedded initiatives aimed at supporting student-athlete health. 
                Through this partnership, we are contributing to the validation of a 
                patented school-based screening tool—work that reflects our belief that 
                clinical responsibility includes giving back to the community.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                The Registry aligns with the standards of scientific rigor, ensuring that 
                our observations can support ethical research and community benefit for 
                years to come.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 — Why It Matters */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Heart className="h-4 w-4" />
                Impact
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why It Matters</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                    <Heart className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">For Patients</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Confidence that recovery is being observed and understood. Clarity 
                      about progress. A sense of partnership in their own care. No more 
                      wondering if treatment is working.
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                    <Target className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">For Clinicians</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      A framework for consistent observation and thoughtful decision-making. 
                      The ability to see patterns that inform better care and guide treatment 
                      adjustments.
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                    <Shield className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">For Athletes</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Structured support for return-to-activity decisions. Safety grounded 
                      in observation, not guesswork. Clear criteria for when it's safe 
                      to return to play.
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">For the Community</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Trust that a local provider is committed to transparency, responsibility, 
                      and giving back through research and education. A clinic that leads 
                      by example.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 — Closing + CTA */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Take the Next Step
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Recovery Without Mystery
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              At Pittsford Performance Care, we believe that recovery should never be 
              a mystery. The Outcome Registry is how we deliver on that promise—bringing 
              clarity, trust, and measurable progress to every patient we serve.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              If you're ready to experience care built on transparency and patient-first 
              values, we invite you to take the next step.
            </p>
            
            <Button size="lg" asChild className="h-12 px-8 text-base rounded-xl">
              <Link to="/patient/concierge">
                Begin Your Intake
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteRegistry;
