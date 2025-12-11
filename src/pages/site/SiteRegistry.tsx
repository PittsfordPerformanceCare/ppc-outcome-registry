import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight,
  CheckCircle2,
  Shield,
  Eye,
  Target,
  Users,
  Heart,
  GraduationCap
} from "lucide-react";

const SiteRegistry = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              PPC Outcome Registry
            </h1>
            <p className="text-xl text-muted-foreground font-medium">
              Clarity Through Measurable Recovery.
            </p>
          </div>
        </div>
      </section>

      {/* Section 1 — Intro / Purpose */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
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
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Why We Built the Registry</h2>
            <div className="space-y-6">
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
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">What the Registry Represents</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              The PPC Outcome Registry is more than a record-keeping system. It is a 
              clinical standard—a commitment we make to every patient who walks through 
              our doors. It is the foundation upon which we build trust, guide treatment, 
              and define what success looks like.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Transparency</h3>
                  <p className="text-sm text-muted-foreground">
                    Recovery is visible and understandable to everyone involved.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Precision</h3>
                  <p className="text-sm text-muted-foreground">
                    Care is guided by observation and structure, not assumption.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Consistency</h3>
                  <p className="text-sm text-muted-foreground">
                    Every patient receives the same level of structured attention.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Accountability</h3>
                  <p className="text-sm text-muted-foreground">
                    Clinicians are held to the standard they set for themselves.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Patient Understanding</h3>
                  <p className="text-sm text-muted-foreground">
                    Patients are empowered with knowledge about their own progress.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Research Readiness</h3>
                  <p className="text-sm text-muted-foreground">
                    Data collected with rigor supports future clinical insight.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — How the Registry Brings Clarity to Recovery */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">How the Registry Brings Clarity to Recovery</h2>
            <div className="space-y-6">
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
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">A Foundation for Clinical Excellence and Research</h2>
            <div className="space-y-6">
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
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Why It Matters</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Heart className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold text-lg">For Patients</h3>
                </div>
                <p className="text-muted-foreground">
                  Confidence that recovery is being observed and understood. Clarity 
                  about progress. A sense of partnership in their own care.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold text-lg">For Clinicians</h3>
                </div>
                <p className="text-muted-foreground">
                  A framework for consistent observation and thoughtful decision-making. 
                  The ability to see patterns that inform better care.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold text-lg">For Athletes</h3>
                </div>
                <p className="text-muted-foreground">
                  Structured support for return-to-activity decisions. Safety grounded 
                  in observation, not guesswork.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold text-lg">For the Community</h3>
                </div>
                <p className="text-muted-foreground">
                  Trust that a local provider is committed to transparency, responsibility, 
                  and giving back through research and education.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 — Closing + CTA */}
      <section className="py-16 lg:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-lg opacity-90 leading-relaxed">
              At Pittsford Performance Care, we believe that recovery should never be 
              a mystery. The Outcome Registry is how we deliver on that promise—bringing 
              clarity, trust, and measurable progress to every patient we serve.
            </p>
            <p className="text-lg opacity-90 leading-relaxed">
              If you're ready to experience care built on transparency and patient-first 
              values, we invite you to take the next step.
            </p>
            <div className="pt-4">
              <Button size="lg" variant="secondary" asChild>
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

export default SiteRegistry;
