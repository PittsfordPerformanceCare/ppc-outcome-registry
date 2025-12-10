import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, Stethoscope, Brain, ArrowRight } from "lucide-react";
import { useEffect } from "react";

const PatientConcierge = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Log UTM parameters for lead attribution tracking
  useEffect(() => {
    const utmParams = {
      utm_source: searchParams.get('utm_source'),
      utm_medium: searchParams.get('utm_medium'),
      utm_campaign: searchParams.get('utm_campaign'),
      utm_content: searchParams.get('utm_content'),
      origin_page: document.referrer || searchParams.get('origin_page'),
      origin_cta: searchParams.get('origin_cta'),
    };
    
    // Store in sessionStorage for later use in intake forms
    if (Object.values(utmParams).some(v => v)) {
      sessionStorage.setItem('ppc_lead_tracking', JSON.stringify(utmParams));
    }
  }, [searchParams]);
  
  // Preserve UTM parameters when routing
  const getRouteWithParams = (basePath: string) => {
    const params = searchParams.toString();
    return params ? `${basePath}?${params}` : basePath;
  };

  const pathways = [
    {
      id: "adult",
      title: "I am the patient",
      description: "I'm an adult seeking care for myself",
      icon: User,
      route: "/patient/intake/adult",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      id: "pediatric",
      title: "I am the parent of a patient",
      description: "My child needs neurologic evaluation",
      icon: Users,
      route: "/patient/intake/pediatric",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      id: "referral",
      title: "I am a referring provider",
      description: "I'm a physician, therapist, or healthcare provider",
      icon: Stethoscope,
      route: "/patient/intake/referral",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-12">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          Welcome to Pittsford Performance Care
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          To provide you with the best possible care, we need to understand who you are.
          This helps us guide you to the correct intake pathway.
        </p>
      </div>

      {/* Pathway Selection */}
      <div className="grid gap-6 md:grid-cols-3">
        {pathways.map((pathway) => (
          <Card 
            key={pathway.id}
            className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50"
            onClick={() => navigate(getRouteWithParams(pathway.route))}
          >
            <CardHeader className="text-center pb-2">
              <div className={`w-14 h-14 rounded-full ${pathway.bgColor} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <pathway.icon className={`h-7 w-7 ${pathway.color}`} />
              </div>
              <CardTitle className="text-lg">{pathway.title}</CardTitle>
              <CardDescription>{pathway.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-center">
              <Button 
                variant="ghost" 
                className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Information Section */}
      <div className="mt-12 text-center">
        <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="font-semibold mb-2">What happens next?</h3>
          <p className="text-sm text-muted-foreground">
            After selecting your pathway, you'll complete a brief intake form. 
            Our team will review your information and contact you to schedule your evaluation.
            Most patients are seen within 1-2 weeks.
          </p>
        </div>
      </div>

      {/* Self-Test Option */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Not sure if you need an evaluation?
        </p>
        <Button 
          variant="link" 
          onClick={() => navigate(getRouteWithParams("/patient/self-tests"))}
          className="text-primary"
        >
          Take a quick self-assessment →
        </Button>
      </div>
    </div>
  );
};

export default PatientConcierge;
