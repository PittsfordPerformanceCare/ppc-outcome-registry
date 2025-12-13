import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { User, Users, Stethoscope, ChevronRight, Shield, LogIn } from "lucide-react";
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gradient-to-b from-background via-background to-muted/20">
      <div className="w-full max-w-md py-10 lg:py-14 animate-fade-in">
        {/* Simple header */}
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-primary/70 mb-3 tracking-wide uppercase">
            Getting Started
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Let's Get You Started
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Select who you are so we can guide you to the right intake form.
          </p>
        </div>

        {/* Pathway selection */}
        <div className="space-y-3 mb-10">
          {pathways.map((pathway, index) => (
            <button
              key={pathway.id}
              onClick={() => navigate(getRouteWithParams(pathway.route))}
              className="w-full flex items-center gap-4 p-5 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:bg-card hover:shadow-md transition-all duration-300 text-left group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                <pathway.icon className="h-5 w-5 text-primary/70 group-hover:text-primary transition-colors duration-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                  {pathway.label}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {pathway.sublabel}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300" />
            </button>
          ))}
        </div>

        {/* Existing patient sign in */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-center text-sm text-muted-foreground mb-3">
            Already a patient?
          </p>
          <Link
            to="/patient-auth"
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 text-primary font-medium"
          >
            <LogIn className="h-4 w-4" />
            Sign in to view your care
          </Link>
        </div>

        {/* Reassurance */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mt-8">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
            Takes just a few minutes
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-primary/50" />
            Secure & private
          </span>
        </div>
      </div>
    </div>
  );
};

export default PatientConcierge;
