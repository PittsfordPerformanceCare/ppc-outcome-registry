import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { User, Users, Stethoscope, ChevronRight, Shield, LogIn, Sparkles, Clock } from "lucide-react";
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
      gradient: "from-primary/20 via-primary/10 to-transparent",
    },
    {
      id: "pediatric",
      label: "I am the parent of a patient",
      sublabel: "My child needs evaluation",
      icon: Users,
      route: "/patient/intake/pediatric",
      gradient: "from-accent/20 via-accent/10 to-transparent",
    },
    {
      id: "referral",
      label: "I am a referring provider",
      sublabel: "Physician or healthcare provider",
      icon: Stethoscope,
      route: "/patient/intake/referral",
      gradient: "from-info/20 via-info/10 to-transparent",
    },
  ];

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/8 to-primary/3 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-accent/8 to-accent/3 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-primary/5 to-transparent opacity-50" />
      </div>

      <div className="w-full max-w-md py-8 lg:py-14 relative z-10">
        {/* Header with enhanced styling */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Getting Started
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Let's Get You Started
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-sm mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
            Select who you are so we can guide you to the right intake form.
          </p>
        </div>

        {/* Pathway selection with enhanced cards */}
        <div className="space-y-4 mb-10">
          {pathways.map((pathway, index) => (
            <button
              key={pathway.id}
              onClick={() => navigate(getRouteWithParams(pathway.route))}
              className="w-full flex items-center gap-4 p-5 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 text-left group relative overflow-hidden animate-fade-in"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${pathway.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center group-hover:from-primary/25 group-hover:to-primary/10 group-hover:scale-105 transition-all duration-300 relative shadow-sm">
                <pathway.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex-1 min-w-0 relative">
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  {pathway.label}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {pathway.sublabel}
                </p>
              </div>
              <div className="relative flex items-center justify-center h-10 w-10 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-all duration-300">
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300" />
              </div>
            </button>
          ))}
        </div>

        {/* Existing patient sign in - enhanced */}
        <div className="mt-10 pt-8 border-t border-border/40 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <p className="text-center text-sm text-muted-foreground mb-4">
            Already a patient?
          </p>
          <Link
            to="/patient-auth"
            className="w-full flex items-center justify-center gap-2.5 p-4 rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 transition-all duration-300 text-primary font-semibold group"
          >
            <LogIn className="h-4.5 w-4.5 group-hover:scale-110 transition-transform duration-300" />
            Sign in to view your care
          </Link>
        </div>

        {/* Reassurance badges - enhanced */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground mt-10 animate-fade-in" style={{ animationDelay: '700ms' }}>
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/30">
            <Clock className="h-3.5 w-3.5 text-primary/70" />
            <span className="text-xs font-medium">Takes just a few minutes</span>
          </span>
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/30">
            <Shield className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-medium">Secure & private</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PatientConcierge;
