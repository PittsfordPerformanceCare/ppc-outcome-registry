import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Brain, 
  Activity, 
  BookOpen,
  Search
} from "lucide-react";
import { useState } from "react";

// Placeholder article categories and articles
const categories = [
  {
    slug: "concussion",
    name: "Concussion",
    description: "Understanding persistent post-concussion symptoms and recovery",
    icon: Brain,
    articles: [
      { slug: "visual-vestibular-mismatch", title: "Visual-Vestibular Mismatch: When Your Eyes and Inner Ear Disagree" },
      { slug: "autonomic-dysfunction", title: "Autonomic Dysfunction After Concussion" },
      { slug: "return-to-activity", title: "Safe Return to Activity After Concussion" },
      { slug: "five-system-model", title: "The Five-System Concussion Model Explained" },
      { slug: "energy-crisis", title: "Understanding the Post-Concussion Energy Crisis" }
    ]
  },
  {
    slug: "msk",
    name: "Musculoskeletal",
    description: "Neuromuscular drivers of chronic pain and movement dysfunction",
    icon: Activity,
    articles: [
      { slug: "motor-timing", title: "Motor Timing Deficits: Why Milliseconds Matter" },
      { slug: "asymmetry", title: "Movement Asymmetry and Pain" },
      { slug: "chronic-pain", title: "Chronic Pain Without Structural Damage" },
      { slug: "cerebellar-output", title: "Cerebellar Function and Movement Control" },
      { slug: "fatigue-patterns", title: "Abnormal Fatigue Patterns in Athletes" }
    ]
  }
];

const SiteArticles = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.map(category => ({
    ...category,
    articles: category.articles.filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0 || searchQuery === "");

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
            {filteredCategories.map((category) => (
              <div key={category.slug}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <category.icon className="h-6 w-6 text-primary" />
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
                      <Card className="h-full hover:border-primary/50 transition-colors">
                        <CardHeader>
                          <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Click to read more →
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

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

      {/* More Resources CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Can't Find What You're Looking For?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Our clinical team is happy to answer your questions directly. 
            Schedule a consultation to discuss your specific situation.
          </p>
          <Link 
            to="/patient/concierge"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            Schedule a Consultation →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SiteArticles;
