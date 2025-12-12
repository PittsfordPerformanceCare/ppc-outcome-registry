import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Users, Stethoscope, ChevronRight } from "lucide-react";
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
      label: "I am the patient",
      sublabel: "Adult seeking care for myself",
      icon: User,
      route: "/patient/intake/adult",
    },
    {
      id: "pediatric",
      label: "I am the parent of a patient",
      sublabel: "My child needs evaluation",
      icon: Users,
      route: "/patient/intake/pediatric",
    },
    {
      id: "referral",
      label: "I am a referring provider",
      sublabel: "Physician or healthcare provider",
      icon: Stethoscope,
      route: "/patient/intake/referral",
    },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md py-10 lg:py-14">
        {/* Simple header */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-2">Getting Started</p>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">
            Let's Get You Started
          </h1>
          <p className="text-base text-muted-foreground">
            Select who you are so we can guide you to the right intake form.
          </p>
        </div>

        {/* Simple pathway selection - no cards */}
        <div className="space-y-3 mb-8">
          {pathways.map((pathway) => (
            <button
              key={pathway.id}
              onClick={() => navigate(getRouteWithParams(pathway.route))}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-border/60 bg-background hover:border-primary/40 hover:bg-muted/30 transition-colors text-left group"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
                <pathway.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{pathway.label}</p>
                <p className="text-sm text-muted-foreground">{pathway.sublabel}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>

        {/* Reassurance */}
        <p className="text-center text-sm text-muted-foreground">
          Takes just a few minutes · Your information is secure
        </p>
      </div>
    </div>
  );
};

export default PatientConcierge;
