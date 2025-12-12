import { Helmet } from "react-helmet";
import { 
  GraduationCap, 
  Users, 
  Brain, 
  Shield, 
  Heart, 
  Target,
  BookOpen,
  Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/card";

const SiteWcsdPartnership = () => {
  return (
    <>
      <Helmet>
        <title>From Clinic to Classroom | Pittsford Performance Care & Webster Central School District</title>
        <meta 
          name="description" 
          content="A community partnership advancing student readiness through applied neuroscience. Pittsford Performance Care collaborates with Webster Central School District to translate clinical insight into the educational environment." 
        />
        <link rel="canonical" href="https://pittsfordperformancecare.com/site/wcsd-partnership" />
      </Helmet>

      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative py-28 lg:py-36 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <GraduationCap className="h-4 w-4" />
                Community Partnership
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                From Clinic to Classroom
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                A Community Partnership Advancing Student Readiness Through Applied Neuroscience. 
                Webster Central School District and Pittsford Performance Care collaborate to 
                translate clinical insight into the educational environment.
              </p>
            </div>
          </div>
        </section>

        {/* Section 1 — Opening Context */}
        <section className="py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Learning readiness is complex. Every child arrives in the classroom shaped by 
                their own developmental history, neurologic profile, and lived experience. 
                When a student struggles to meet expectations, educators face a difficult 
                question: how do we understand what is truly driving the challenge?
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Accurate, early understanding matters. Not for the sake of labeling, but 
                because clarity creates the conditions for appropriate support. Without it, 
                students may be misunderstood, interventions may miss the mark, and families 
                may endure years of uncertainty.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Webster Central School District has long been recognized as a district that 
                prioritizes innovation, student success, and responsible stewardship. It is 
                within this spirit of inquiry and care that a new collaboration has taken shape. 
                This partnership is grounded in community, informed by research, and guided by the belief that 
                meaningful insight must be earned through rigorous, ethical work.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 — District-Led Commitment */}
        <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Users className="h-4 w-4" />
                District Leadership
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
                A District-Led Commitment to Student Readiness
              </h2>
              
              <div className="space-y-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Webster Central School District has demonstrated consistent leadership in 
                  exploring how responsible innovation can support student outcomes. This 
                  commitment reflects a deeper belief: that the whole learner, including cognitive, 
                  emotional, and physical dimensions, deserves thoughtful attention.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Bringing new forms of insight into the educational environment requires more 
                  than interest. It requires caution, collaboration, and respect for the 
                  complexity of child development. The district's willingness to explore this 
                  work carefully, without rushing toward conclusions, reflects the kind of 
                  leadership that protects students while opening doors to meaningful progress.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  This partnership exists because Webster Central School District chose to lead.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 — Translating Applied Neuroscience */}
        <section className="py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Brain className="h-4 w-4" />
                Applied Neuroscience
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
                Translating Applied Neuroscience Into the Educational Environment
              </h2>
              
              <div className="space-y-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  For years, applied neuroscience has informed clinical care, helping providers 
                  understand the neurologic systems that influence function, recovery, and 
                  development. Pittsford Performance Care has built its practice on this 
                  foundation, supporting patients through structured evaluation and validated 
                  outcome tracking.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  This partnership asks a different question: can the insights developed in 
                  clinical settings be translated into the educational environment in a way that 
                  supports students and educators alike?
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Translation is not experimentation. It is the careful work of adapting what 
                  has been learned in one context, the clinic, and determining whether it can 
                  responsibly inform another, the classroom. This work must be educator-friendly, 
                  ethically applied, and grounded in scientific rigor.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 — Research-Driven, Ethical Approach */}
        <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                Ethical Standards
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
                A Research-Driven, Ethical Approach
              </h2>
              
              <div className="space-y-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  This initiative is not a pilot program or an experiment. It is a multi-phase, 
                  validation-focused effort designed to meet high scientific standards while 
                  protecting all participants, including students, educators, and families.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  The work is embedded within real classrooms, not laboratories, because 
                  authenticity matters. Findings must reflect the conditions educators and 
                  students actually experience. And yet, the same rigor expected in clinical 
                  research applies here: structured methodology, transparent processes, and a 
                  commitment to honest reporting of results, whatever they may be.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  At the heart of this effort is a patented school-based screening tool currently 
                  undergoing validation. Its purpose is to support early understanding of student 
                  readiness. While validation continues, no claims are made about its outcomes. 
                  The goal is truth, not marketing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 — Supporting Educators */}
        <section className="py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <BookOpen className="h-4 w-4" />
                Educator Support
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
                Supporting Educators Without Replacing Their Expertise
              </h2>
              
              <div className="space-y-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Teachers spend more time with students than nearly anyone outside their 
                  families. Their observations are irreplaceable. No tool, framework, or 
                  clinical insight can substitute for what an experienced educator sees in 
                  their classroom every day.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  This initiative is designed to support, and never override, educator judgment. 
                  The goal is to offer additional clarity when uncertainty exists, not to 
                  impose conclusions or replace professional insight with clinical directive.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  The focus is readiness, not diagnosis. Clarity, not labeling. The aim is to 
                  help educators and families understand what a child may need, so that the 
                  right support can be offered at the right time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 — Community Impact */}
        <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                  <Heart className="h-4 w-4" />
                  Long-Term Vision
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  Community Impact and Long-Term Vision
                </h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-3">For Families</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Earlier insight into their child's development, reducing years of 
                    uncertainty and enabling timely, appropriate support.
                  </p>
                </Card>
                
                <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                    <BookOpen className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-3">For Educators</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Additional context that may inform their approach, without replacing 
                    their professional judgment or classroom expertise.
                  </p>
                </Card>
                
                <Card className="p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                    <Heart className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-3">For the Community</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    A school system committed to thoughtful, evidence-based innovation 
                    that strengthens the entire community.
                  </p>
                </Card>
              </div>
              
              <div className="max-w-4xl mx-auto space-y-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Equity is embedded in this vision. Earlier understanding should not be a 
                  privilege. When insight is accessible to all students, regardless of background 
                  or resources, entire communities become stronger.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  If this work proves valid, it may responsibly inform future collaborations, 
                  not through promotional claims, but through demonstrated value and earned trust.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7 — A Shared Responsibility */}
        <section className="py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Target className="h-4 w-4" />
                Shared Commitment
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
                A Shared Responsibility
              </h2>
              
              <div className="space-y-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  This partnership is built on mutual respect between clinical and educational 
                  professionals. Both sides bring expertise. Both sides carry responsibility.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Transparency guides the work. Processes are documented. Questions are welcomed. 
                  And the commitment to scientific integrity means that findings will be reported 
                  honestly, whether they confirm expectations or challenge them.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Above all, student wellbeing remains central. Every decision is weighed against 
                  a simple question: does this serve the child?
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  This is not promotion. It is stewardship: of children, of community trust, and 
                  of the careful work required to bring meaningful insight into education.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8 — Closing Statement */}
        <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                <Sparkles className="h-4 w-4" />
                Guiding Principle
              </div>
              
              <p className="text-2xl md:text-3xl text-foreground leading-relaxed italic font-medium">
                "Academic readiness is neurologic before it's academic."
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SiteWcsdPartnership;
