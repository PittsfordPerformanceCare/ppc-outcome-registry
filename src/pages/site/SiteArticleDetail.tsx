import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Brain, Activity, Users, Trophy } from "lucide-react";
import { getArticleBySlug, getRelatedArticles, ArticleSection } from "@/data/siteArticles";
import { ArticleCTA, SymptomCallout, RelatedArticles } from "@/components/site/ArticleCTA";
import { ArticleSchema } from "@/components/site/StructuredData";
import { processTextWithLexicon, resetArticleLexiconTracking, getArticleLexiconTerms } from "@/utils/lexiconTextProcessor";
import { useEffect } from "react";

// Category icon mapping
const categoryIcons: Record<string, React.ElementType> = {
  concussion: Brain,
  pediatric: Users,
  athlete: Trophy,
  msk: Activity
};

// Render article section based on type
const renderSection = (section: ArticleSection, index: number, primaryRoute: string, articleSlug?: string) => {
  // Check if this article has lexicon terms enabled
  const hasLexiconTerms = articleSlug && getArticleLexiconTerms(articleSlug).length > 0;
  
  switch (section.type) {
    case "heading":
      return (
        <h2 key={index} className="text-2xl font-bold mt-10 mb-4 text-foreground">
          {section.content}
        </h2>
      );
    
    case "paragraph":
      return (
        <p key={index} className="text-muted-foreground leading-relaxed mb-4">
          {hasLexiconTerms ? processTextWithLexicon(section.content, articleSlug) : section.content}
        </p>
      );
    
    case "list":
      return (
        <ul key={index} className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
          {section.items?.map((item, i) => (
            <li key={i} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      );
    
    case "callout":
      return (
        <SymptomCallout 
          key={index} 
          content={section.content} 
          variant={section.variant || "info"} 
        />
      );
    
    case "inline-cta":
      return (
        <div key={index} className="bg-muted/50 border-l-4 border-primary rounded-r-lg p-6 my-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-foreground">{section.content}</p>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link to={primaryRoute}>
                Learn More →
              </Link>
            </Button>
          </div>
        </div>
      );
    
    default:
      return null;
  }
};

const SiteArticleDetail = () => {
  const { category, slug } = useParams();
  const article = category && slug ? getArticleBySlug(category, slug) : undefined;
  const relatedArticles = article ? getRelatedArticles(article) : [];

  // Reset lexicon tracking when article changes
  useEffect(() => {
    resetArticleLexiconTracking();
  }, [slug]);

  // Not found state
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

  // Check if this is a placeholder article (MSK articles for now)
  const isPlaceholder = article.sections.length === 0;

  if (isPlaceholder) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Link 
            to="/site/articles"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Link>
          <h1 className="text-3xl font-bold">{article.title}</h1>
          <p className="text-muted-foreground">
            This is the placeholder for this MSK cluster article.
          </p>
          <p className="text-muted-foreground">
            Full content coming in Phase 2c.
          </p>
          <Button asChild className="mt-6">
            <Link to="/patient/concierge">
              Schedule MSK Evaluation
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const CategoryIcon = categoryIcons[article.category] || Brain;
  const canonicalUrl = `https://muse-meadow-app.lovable.app/site/articles/${category}/${slug}`;

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>{article.title} | Pittsford Performance Care</title>
        <meta name="description" content={article.excerpt} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <ArticleSchema
        headline={article.title}
        description={article.excerpt}
        url={canonicalUrl}
        datePublished="2025-01-01"
        author="Dr. C. Robert Luckey, DC"
      />
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
                <span className="capitalize px-3 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-2">
                  <CategoryIcon className="h-4 w-4" />
                  {article.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {article.readTime}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                {article.title}
              </h1>
              
              {/* Author Attribution */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <span>By</span>
                <span className="font-medium text-foreground">Dr. C. Robert Luckey, DC</span>
                <span className="text-muted-foreground">—</span>
                <span>Pittsford Performance Care, Pittsford, NY</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Content */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg md:text-xl text-foreground leading-relaxed font-medium">
              {article.heroContent}
            </p>
          </div>
        </div>
      </section>

      {/* Hero CTA */}
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <ArticleCTA 
            variant="hero" 
            primaryCTA={article.primaryCTA}
            secondaryCTA={article.secondaryCTA}
          />
        </div>
      </div>

      {/* Article Content */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto">
            {article.sections.map((section, index) => 
              renderSection(section, index, article.primaryCTA.route, slug)
            )}
          </article>
        </div>
      </section>

      {/* Related Articles */}
      <RelatedArticles articles={relatedArticles} />

      {/* Bottom CTA */}
      <ArticleCTA 
        variant="bottom" 
        primaryCTA={article.primaryCTA}
        secondaryCTA={article.secondaryCTA}
        category={article.category}
      />

      {/* Author Note */}
      <section className="py-8 bg-background border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-muted-foreground leading-relaxed">
              This article was written by <span className="font-medium text-foreground">Dr. C. Robert Luckey, DC</span>, 
              a clinician specializing in functional neurology and clinical neuroscience at Pittsford Performance Care 
              in Pittsford, NY. For questions about your specific situation, please{" "}
              <Link to="/site/contact" className="text-primary hover:underline">
                contact our office
              </Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Internal Links Section */}
      <section className="py-12 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg font-bold mb-4">Explore More</h3>
            <div className="flex flex-wrap gap-4">
              {article.category === "concussion" || article.category === "pediatric" || article.category === "athlete" ? (
                <Link 
                  to="/site/concussion" 
                  className="text-primary hover:underline text-sm"
                >
                  ← Return to Concussion Care Overview
                </Link>
              ) : (
                <Link 
                  to="/site/msk" 
                  className="text-primary hover:underline text-sm"
                >
                  ← Return to MSK Care Overview
                </Link>
              )}
              <Link 
                to="/site/articles" 
                className="text-primary hover:underline text-sm"
              >
                Browse All Resources
              </Link>
              <Link 
                to="/site/contact" 
                className="text-primary hover:underline text-sm"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteArticleDetail;
