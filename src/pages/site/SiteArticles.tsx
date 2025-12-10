import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Brain, 
  Activity, 
  BookOpen,
  Search,
  Users,
  Trophy,
  ArrowRight
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
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              Resources
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Learn About Your Condition
            </h1>
            <p className="text-xl text-muted-foreground">
              In-depth articles on concussion recovery, movement dysfunction, 
              and the neurologic systems driving your symptoms.
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto pt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 mt-2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories and Articles */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-16">
            {filteredCategories.map((category) => {
              const CategoryIcon = categoryIcons[category.slug] || Brain;
              
              return (
                <div key={category.slug}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CategoryIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{category.name}</h2>
                      <p className="text-muted-foreground">{category.description}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.articles.map((article) => (
                      <Link 
                        key={article.slug}
                        to={`/site/articles/${category.slug}/${article.slug}`}
                        className="group"
                      >
                        <Card className={`h-full hover:border-primary/50 transition-colors ${isPlaceholder(article) ? 'opacity-60' : ''}`}>
                          <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-muted-foreground">
                                {article.readTime}
                              </span>
                              {isPlaceholder(article) && (
                                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                  Coming Soon
                                </span>
                              )}
                            </div>
                            <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
                              {article.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {article.excerpt}
                            </p>
                            <p className="text-sm text-primary mt-3 flex items-center gap-1 group-hover:gap-2 transition-all">
                              Read more <ArrowRight className="h-3 w-3" />
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No articles found matching "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pillar Navigation */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-center mb-8">Explore Our Care Pillars</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/site/concussion" className="group">
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold group-hover:text-primary transition-colors">
                        Concussion Care
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Comprehensive neurologic evaluation and treatment for persistent 
                        post-concussion symptoms.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/site/msk" className="group">
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold group-hover:text-primary transition-colors">
                        MSK Care
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Neuromuscular assessment and treatment for chronic pain and 
                        movement dysfunction.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Can't Find What You're Looking For?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Our clinical team is happy to answer your questions directly. 
            Schedule a consultation to discuss your specific situation.
          </p>
          <Button asChild size="lg">
            <Link to="/patient/concierge">
              Schedule a Consultation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default SiteArticles;
