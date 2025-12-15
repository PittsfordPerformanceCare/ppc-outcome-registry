import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Brain, 
  Activity, 
  BookOpen,
  Search,
  Users,
  Trophy,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { articleCategories, ArticleData } from "@/data/siteArticles";

// Icon mapping for categories
const categoryIcons: Record<string, React.ElementType> = {
  concussion: Brain,
  pediatric: Users,
  athlete: Trophy,
  msk: Activity
};

const SiteArticles = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter articles based on search
  const filteredCategories = articleCategories.map(category => ({
    ...category,
    articles: category.articles.filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0 || searchQuery === "");

  // Check if article is a placeholder
  const isPlaceholder = (article: ArticleData) => article.sections.length === 0;

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Educational Resources | Concussion & MSK Articles | Pittsford Performance Care</title>
        <meta name="description" content="In-depth articles on concussion recovery, musculoskeletal care, and neurologic rehabilitation from Pittsford Performance Care." />
        <link rel="canonical" href="https://muse-meadow-app.lovable.app/site/articles" />
      </Helmet>
      {/* Hero Section */}
      <section className="relative py-28 lg:py-36 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              Educational Resources
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Learn About Your Condition
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              In-depth articles on concussion recovery, movement dysfunction, 
              and the neurologic systems driving your symptoms. Written by our clinical team 
              to help you understand what's happening and what comes next.
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto pt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 mt-2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search articles by topic or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base rounded-xl border-border/60 bg-card/50 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories and Articles */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-20">
            {filteredCategories.map((category) => {
              const CategoryIcon = categoryIcons[category.slug] || Brain;
              
              return (
                <div key={category.slug}>
                  {/* Category Header */}
                  <div className="flex items-start gap-5 mb-10">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <CategoryIcon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-2">{category.name}</h2>
                      <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  {/* Articles Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.articles.map((article) => (
                      <Link 
                        key={article.slug}
                        to={`/site/articles/${category.slug}/${article.slug}`}
                        className="group"
                      >
                        <Card className={`h-full p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 ${isPlaceholder(article) ? 'opacity-60' : ''}`}>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-muted-foreground">
                              {article.readTime}
                            </span>
                            {isPlaceholder(article) && (
                              <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                                Coming Soon
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          
                          <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                            {article.excerpt}
                          </p>
                          
                          <div className="pt-4 border-t border-border/40">
                            <span className="text-sm font-medium text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
                              Read Article <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredCategories.length === 0 && (
              <div className="text-center py-16">
                <div className="h-14 w-14 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-lg text-muted-foreground">
                  No articles found matching "{searchQuery}"
                </p>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search terms or browse all categories below.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pillar Navigation */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Explore Further
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Care Pillars</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Dive deeper into the specialized areas of care we offer, each grounded in 
                neurologic evaluation and measurable outcomes.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Link to="/site/concussion" className="group">
                <Card className="h-full p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Brain className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        Concussion Care
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Comprehensive neurologic evaluation and treatment for persistent 
                        post-concussion symptoms. We identify which systems are affected 
                        and target treatment accordingly.
                      </p>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-primary mt-4 group-hover:gap-3 transition-all">
                        Learn More <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
              
              <Link to="/site/msk" className="group">
                <Card className="h-full p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Activity className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        MSK Care
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Neuromuscular assessment and treatment for chronic pain and 
                        movement dysfunction. We evaluate the neurologic drivers behind 
                        persistent musculoskeletal issues.
                      </p>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-primary mt-4 group-hover:gap-3 transition-all">
                        Learn More <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <BookOpen className="h-4 w-4" />
              Get Personalized Guidance
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Can't Find What You're Looking For?
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              Our clinical team is happy to answer your questions directly. 
              Schedule a consultation to discuss your specific situation and learn 
              how our approach might help you recover.
            </p>
            
            <Button asChild size="lg" className="h-12 px-8 text-base rounded-xl">
              <Link to="/patient/concierge">
                Schedule a Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteArticles;
