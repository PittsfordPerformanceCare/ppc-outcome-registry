import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Shield, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface DomainSummary {
  name: string;
  slug: string;
  description: string;
  keywords: string[];
}

const DOMAINS: DomainSummary[] = [
  {
    name: "Frontal",
    slug: "frontal",
    description: "Functions often associated with planning, organization, working memory, and the regulation of attention and behavior.",
    keywords: ["Executive Function", "Working Memory", "Planning", "Attention Regulation"],
  },
  {
    name: "Temporal",
    slug: "temporal",
    description: "Functions associated with auditory processing, language comprehension, and aspects of memory formation.",
    keywords: ["Auditory Processing", "Language", "Phonological Processing", "Verbal Memory"],
  },
  {
    name: "Parietal",
    slug: "parietal",
    description: "Functions associated with spatial processing, sensory integration, attention orientation, and numerical cognition.",
    keywords: ["Spatial Processing", "Sensory Integration", "Attention", "Number Sense"],
  },
  {
    name: "Limbic",
    slug: "limbic",
    description: "Functions associated with emotional processing, motivation, stress responses, and memory encoding.",
    keywords: ["Emotional Processing", "Motivation", "Stress Response", "Memory"],
  },
  {
    name: "Limbic–Prefrontal",
    slug: "limbic-prefrontal",
    description: "Functions associated with the integration of emotion and cognition, emotional regulation, stress response modulation, and motivation.",
    keywords: ["Emotional Regulation", "Stress Response", "Motivation", "Emotion-Cognition Integration"],
  },
  {
    name: "Cerebellar",
    slug: "cerebellar",
    description: "Functions associated with motor coordination, procedural learning, timing, and the automatization of skills.",
    keywords: ["Motor Coordination", "Procedural Learning", "Timing", "Automatization"],
  },
  {
    name: "Vestibular",
    slug: "vestibular",
    description: "Functions associated with balance, spatial orientation, and the integration of movement with other sensory information.",
    keywords: ["Balance", "Spatial Orientation", "Movement Integration", "Postural Control"],
  },
  {
    name: "Proprioceptive",
    slug: "proprioceptive",
    description: "Functions associated with body awareness, position sense, force modulation, and motor feedback during movement.",
    keywords: ["Body Awareness", "Position Sense", "Force Modulation", "Motor Feedback"],
  },
  {
    name: "Brainstem",
    slug: "brainstem",
    description: "Functions associated with arousal, alertness, and basic regulatory processes that support engagement.",
    keywords: ["Arousal", "Alertness", "Regulation", "Wakefulness"],
  },
];

export function NeuroscienceDomainIndex() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge variant="outline" className="text-xs font-mono">
          PSOF-Safe Reference Library
        </Badge>
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          Educational Neuroscience Domains
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Professional reference content for educational reflection. 
          Informational only—non-diagnostic, non-prescriptive, non-directive.
        </p>
      </div>

      {/* Governance Notice */}
      <Alert className="bg-amber-500/10 border-amber-500/20">
        <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-sm text-amber-700 dark:text-amber-300">
          All content complies with PPC Educational Neuroscience Reference Policy and PSOF Governance Charter. 
          This library is optional, creates no records, and does not influence PSOF data.
        </AlertDescription>
      </Alert>

      {/* Domain Cards */}
      <div className="grid gap-4">
        {DOMAINS.map((domain) => (
          <Link 
            key={domain.slug} 
            to={`/neuroscience/${domain.slug}`}
            className="block"
          >
            <Card className="border-l-4 border-l-primary hover:bg-accent/50 transition-colors cursor-pointer group">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    {domain.name} Domain
                  </CardTitle>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardDescription className="text-sm">
                  {domain.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {domain.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Information Footer */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Educational neuroscience provides perspectives that may enrich professional 
              reflection—never replace it.
            </p>
            <p className="text-sm font-medium text-primary">
              "Knowledge informs reflection — never direction."
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
