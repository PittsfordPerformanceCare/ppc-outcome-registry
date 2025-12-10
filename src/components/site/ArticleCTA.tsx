import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Stethoscope, ClipboardCheck } from "lucide-react";
import { CTAConfig } from "@/data/siteArticles";

interface ArticleCTAProps {
  variant: "hero" | "inline" | "bottom";
  primaryCTA: CTAConfig;
  secondaryCTA?: CTAConfig;
  category?: string;
}

export const ArticleCTA = ({ variant, primaryCTA, secondaryCTA, category }: ArticleCTAProps) => {
  if (variant === "hero") {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <p className="font-medium text-foreground mb-1">Ready to get answers?</p>
            <p className="text-sm text-muted-foreground">
              {primaryCTA.description || "Schedule your comprehensive neurologic evaluation."}
            </p>
          </div>
          <Button asChild size="lg">
            <Link to={primaryCTA.route}>
              <Stethoscope className="mr-2 h-4 w-4" />
              {primaryCTA.label}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="bg-muted/50 border-l-4 border-primary rounded-r-lg p-6 my-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-foreground font-medium">
              If this sounds familiar, we can help.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              A comprehensive neurologic evaluation can identify exactly what's driving your symptoms.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link to={primaryCTA.route}>
              Begin Your Intake
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Bottom CTA - Full section
  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to Address Your Symptoms?
          </h2>
          <p className="text-muted-foreground text-lg">
            Stop wondering what's wrong. Get a comprehensive neurologic evaluation 
            that identifies exactly what's driving your symptoms—and what can be done about it.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link to={primaryCTA.route}>
                <Stethoscope className="mr-2 h-5 w-5" />
                {primaryCTA.label}
              </Link>
            </Button>
            
            {secondaryCTA && (
              <Button size="lg" variant="outline" asChild>
                <Link to={secondaryCTA.route}>
                  <ClipboardCheck className="mr-2 h-5 w-5" />
                  {secondaryCTA.label}
                </Link>
              </Button>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground pt-2">
            Our intake process takes about 10 minutes and helps us understand your situation before your evaluation.
          </p>
        </div>
      </div>
    </section>
  );
};

// Symptom Callout Box Component
interface SymptomCalloutProps {
  content: string;
  variant?: "info" | "warning" | "symptom" | "insight";
}

export const SymptomCallout = ({ content, variant = "info" }: SymptomCalloutProps) => {
  const variantStyles = {
    info: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    warning: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    symptom: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800",
    insight: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
  };

  return (
    <div className={`border rounded-lg p-4 my-6 ${variantStyles[variant]}`}>
      <p className="text-foreground font-medium">{content}</p>
    </div>
  );
};

// Related Articles Component
interface RelatedArticlesProps {
  articles: Array<{
    slug: string;
    title: string;
    category: string;
    excerpt: string;
  }>;
}

export const RelatedArticles = ({ articles }: RelatedArticlesProps) => {
  if (articles.length === 0) return null;

  return (
    <section className="py-12 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-bold mb-6">Related Articles</h3>
          <div className="grid gap-4">
            {articles.map((article) => (
              <Link
                key={article.slug}
                to={`/site/articles/${article.category}/${article.slug}`}
                className="group block p-4 bg-background border rounded-lg hover:border-primary/50 transition-colors"
              >
                <h4 className="font-medium group-hover:text-primary transition-colors">
                  {article.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {article.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
