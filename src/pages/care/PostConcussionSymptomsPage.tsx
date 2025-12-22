import { memo } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const PostConcussionSymptomsPage = memo(() => {
  return (
    <>
      <Helmet>
        <title>Post-Concussion Symptoms: Why They Persist &amp; How We Help</title>
        <meta 
          name="description" 
          content="Ongoing concussion symptoms can be confusing. Learn why they persist and how a neurologically informed evaluation approaches recovery." 
        />
        <link rel="canonical" href="https://pittsfordperformancecare.com/care/post-concussion-symptoms" />
      </Helmet>

      <article className="bg-background">
        {/* Hero Section */}
        <header className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Post-Concussion Symptoms: Why They Persist and How We Approach Recovery
            </h1>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            
            {/* Section 1 — When symptoms don't resolve as expected */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                When symptoms don't resolve as expected
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you've experienced a concussion and find that symptoms haven't resolved as expected, 
                you're not alone. Many people feel frustrated when headaches, dizziness, or mental fog 
                continue weeks or even months after the initial injury.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                It's important to know that lingering symptoms are more common than many realize. 
                This doesn't mean something is permanently wrong — it often means that certain aspects 
                of recovery haven't yet been addressed.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Common symptoms that can persist include:
              </p>
              <ul className="text-muted-foreground mt-3 space-y-2">
                <li>Headaches or head pressure</li>
                <li>Dizziness or balance difficulties</li>
                <li>Visual strain or discomfort</li>
                <li>Fatigue that doesn't improve with rest</li>
                <li>Cognitive fog or difficulty concentrating</li>
                <li>Sensitivity to sound or light</li>
              </ul>
            </section>

            {/* Section 2 — Why post-concussion symptoms can persist */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Why post-concussion symptoms can persist
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The brain relies on the coordinated function of multiple systems — visual processing, 
                balance and spatial orientation, and the body's ability to regulate its own internal state. 
                After a concussion, any of these systems may not be working together as smoothly as before.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This is why imaging studies are often normal even when symptoms are clearly present. 
                Standard imaging looks for structural changes, but post-concussion symptoms usually 
                reflect functional coordination issues — how the systems work together, not whether 
                they appear intact.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The nervous system may also have difficulty regulating how much activity it can 
                comfortably tolerate. Tasks that were once easy — reading, working at a computer, 
                exercising — can become overwhelming because the system's capacity to manage 
                sensory and cognitive load has temporarily decreased.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                These are coordination and regulation challenges, not signs of permanent damage.
              </p>
            </section>

            {/* Section 3 — How we evaluate persistent post-concussion symptoms */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                How we evaluate persistent post-concussion symptoms
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Understanding why symptoms persist requires a detailed evaluation that looks beyond 
                standard assessments. Our approach examines the functional systems most commonly 
                affected after concussion:
              </p>
              <ul className="text-muted-foreground space-y-3">
                <li>
                  <strong className="text-foreground">Symptom and history review:</strong>{" "}
                  Understanding the timeline, triggers, and patterns of your symptoms.
                </li>
                <li>
                  <strong className="text-foreground">Eye movement and visual processing:</strong>{" "}
                  Assessing how well the visual system tracks, focuses, and coordinates with balance.
                </li>
                <li>
                  <strong className="text-foreground">Balance and coordination testing:</strong>{" "}
                  Evaluating how the vestibular and motor systems work together.
                </li>
                <li>
                  <strong className="text-foreground">Autonomic regulation and load tolerance:</strong>{" "}
                  Understanding how well the nervous system manages physical and cognitive demands.
                </li>
                <li>
                  <strong className="text-foreground">Neck and movement contributors:</strong>{" "}
                  Considering whether cervical involvement may be adding to symptoms.
                </li>
              </ul>
            </section>

            {/* Section 4 — What recovery actually looks like */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                What recovery actually looks like
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Recovery from persistent post-concussion symptoms is rarely a straight line. 
                Progress often happens in stages, with periods of improvement followed by plateaus 
                as the system adapts to new demands.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Early in recovery, the focus is typically on helping the nervous system regulate 
                more effectively — reducing the intensity of symptoms and improving tolerance 
                for daily activities. This foundation is essential before progressing to more 
                demanding work.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                As regulation improves, activities and demands are gradually reintroduced. 
                This staged approach allows the system to build capacity without being overwhelmed, 
                which can set back progress.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The goal is not simply to reduce symptoms, but to restore the functional 
                coordination that allows for sustainable return to normal activities.
              </p>
            </section>

            {/* Section 5 — How progress is measured over time */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                How progress is measured over time
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Meaningful recovery requires more than asking "do you feel better?" 
                We track progress by establishing a clear baseline understanding of 
                symptoms and functional limitations at the start of care.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Over time, we monitor changes in how well you tolerate activities, 
                how quickly you recover from exertion, and how consistently you can 
                perform tasks that were previously difficult.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Before transitioning out of active care, we re-evaluate to confirm 
                that improvements are stable and sustainable — not just temporary relief.
              </p>
            </section>

            {/* Section 6 — When this approach may be helpful */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                When this approach may be helpful
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This evaluation and treatment approach is often appropriate for people who:
              </p>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>Have experienced a concussion and symptoms have not fully resolved</li>
                <li>Have been told imaging is normal but symptoms persist</li>
                <li>Notice symptoms are triggered by specific activities like reading, screens, or exercise</li>
                <li>Feel that previous treatments haven't addressed the underlying issues</li>
                <li>Want a structured, evidence-informed approach to recovery</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This approach may not be the best fit for everyone. It may not be appropriate for:
              </p>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>Symptoms that suggest a need for emergency medical evaluation</li>
                <li>Situations where other medical conditions need to be ruled out first</li>
                <li>Individuals who are not yet ready to engage in an active treatment process</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                If you're unsure whether this approach is right for your situation, 
                a conversation can help clarify next steps.
              </p>
            </section>

            {/* Section 7 — Taking the next step */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Taking the next step
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                If you've been dealing with symptoms that haven't resolved and want to 
                understand what might be contributing to them, we're happy to discuss 
                whether an evaluation would be helpful for your situation.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                There's no obligation — just an opportunity to get clarity on your 
                options and make an informed decision about your care.
              </p>
              <div className="mt-8">
                <Button asChild size="lg" className="group">
                  <Link to="/patient/concierge">
                    Schedule a Conversation
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </section>

          </div>
        </div>
      </article>
    </>
  );
});

PostConcussionSymptomsPage.displayName = "PostConcussionSymptomsPage";

export default PostConcussionSymptomsPage;
