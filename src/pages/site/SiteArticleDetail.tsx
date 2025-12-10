import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Calendar, Clock, User } from "lucide-react";

// Placeholder article content - would come from CMS/database in production
const getArticleContent = (category: string, slug: string) => {
  const articles: Record<string, Record<string, { title: string; content: string; readTime: string }>> = {
    concussion: {
      "visual-vestibular-mismatch": {
        title: "Visual-Vestibular Mismatch: When Your Eyes and Inner Ear Disagree",
        readTime: "8 min read",
        content: `
          <p class="lead">One of the most common—and most frustrating—patterns we see in persistent post-concussion syndrome is visual-vestibular mismatch. This occurs when the information from your eyes doesn't match the information from your inner ear, creating a sensory conflict that your brain struggles to resolve.</p>
          
          <h2>What Is Visual-Vestibular Mismatch?</h2>
          <p>Your brain relies on three systems to know where you are in space: your visual system (eyes), your vestibular system (inner ear), and your proprioceptive system (body position sensors). After a concussion, these systems can become "miscalibrated," sending conflicting information to your brain.</p>
          
          <h2>Common Symptoms</h2>
          <ul>
            <li>Dizziness in busy visual environments (grocery stores, crowds)</li>
            <li>Nausea when scrolling on screens</li>
            <li>Difficulty with moving backgrounds (car passenger, escalators)</li>
            <li>Feeling "off" but unable to explain why</li>
            <li>Fatigue after visual tasks</li>
          </ul>
          
          <h2>Why Standard Tests Miss It</h2>
          <p>Traditional vestibular testing often comes back normal because it tests each system in isolation. The problem isn't with any single system—it's with how they work together. Our evaluation specifically looks for these integration failures.</p>
          
          <h2>Treatment Approach</h2>
          <p>Treatment involves carefully dosed exercises that retrain your brain to properly integrate visual and vestibular information. This must be done gradually to avoid triggering symptom flares.</p>
        `
      },
      "autonomic-dysfunction": {
        title: "Autonomic Dysfunction After Concussion",
        readTime: "7 min read",
        content: `
          <p class="lead">The autonomic nervous system controls everything your body does "automatically"—heart rate, blood pressure, digestion, temperature regulation. After a concussion, this system can become dysregulated, leading to a cascade of symptoms that seem unrelated to a head injury.</p>
          
          <h2>Signs of Autonomic Dysfunction</h2>
          <ul>
            <li>Exercise intolerance and rapid fatigue</li>
            <li>Dizziness when standing up</li>
            <li>Heart rate changes with minimal exertion</li>
            <li>Difficulty regulating body temperature</li>
            <li>Digestive changes</li>
            <li>Anxiety and panic-like symptoms</li>
          </ul>
          
          <h2>The Connection to Concussion</h2>
          <p>The brain regions that control autonomic function can be affected by the metabolic disruption that occurs after concussion. This creates a state where your body's "automatic pilot" isn't working correctly.</p>
          
          <h2>Assessment and Treatment</h2>
          <p>We assess autonomic function through heart rate variability testing, orthostatic testing, and symptom provocation protocols. Treatment involves gradually rebuilding autonomic capacity through structured exercise progressions.</p>
        `
      }
    },
    msk: {
      "motor-timing": {
        title: "Motor Timing Deficits: Why Milliseconds Matter",
        readTime: "6 min read",
        content: `
          <p class="lead">When you move, your muscles need to fire in precisely the right order, at precisely the right time. A delay of just 20-30 milliseconds can mean the difference between smooth, protected movement and joint stress that leads to pain.</p>
          
          <h2>What Is Motor Timing?</h2>
          <p>Motor timing refers to how quickly your nervous system can activate a muscle after receiving a signal. This includes both reaction time (how fast you respond to a stimulus) and rate of force development (how quickly you can generate power).</p>
          
          <h2>Why Timing Matters for Pain</h2>
          <p>Your joints are protected by muscles that act as dynamic stabilizers. If these muscles fire too slowly, the joint takes excessive load before the muscles can respond. Over time, this creates tissue stress and pain—even though the joint structure looks normal on imaging.</p>
          
          <h2>What Causes Timing Deficits?</h2>
          <ul>
            <li>Previous injury (even if "healed")</li>
            <li>Neurologic conditions</li>
            <li>Deconditioning</li>
            <li>Cerebellar dysfunction</li>
            <li>Proprioceptive deficits</li>
          </ul>
          
          <h2>How We Assess Timing</h2>
          <p>Our evaluation includes reaction time testing, rate of force development assessment, and dynamic stability testing to identify where timing deficits exist.</p>
        `
      }
    }
  };

  return articles[category]?.[slug] || null;
};

const SiteArticleDetail = () => {
  const { category, slug } = useParams();
  const article = category && slug ? getArticleContent(category, slug) : null;

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">Article Not Found</h1>
          <p className="text-muted-foreground">
            This article is coming soon or the URL may be incorrect.
          </p>
          <Button asChild>
            <Link to="/site/articles">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resources
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Article Header */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link 
              to="/site/articles"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Resources
            </Link>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="capitalize px-2 py-1 rounded bg-primary/10 text-primary">
                  {category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {article.readTime}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">
                {article.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <article 
            className="max-w-3xl mx-auto prose prose-slate dark:prose-invert
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-li:text-muted-foreground
              prose-lead:text-lg prose-lead:text-foreground
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-2xl font-bold">Ready to Address Your Symptoms?</h2>
            <p className="text-muted-foreground">
              Schedule a comprehensive neurologic evaluation to identify 
              what's driving your condition.
            </p>
            <Button size="lg" asChild>
              <Link to="/patient/concierge">
                Schedule Evaluation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteArticleDetail;
