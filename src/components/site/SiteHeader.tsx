import { memo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Brain, Sparkles, Activity, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className="relative px-3 py-2 text-sm font-medium text-foreground/70 transition-all duration-300 hover:text-foreground group"
  >
    <span className="relative z-10">{children}</span>
    <span className="absolute inset-0 rounded-lg bg-accent/0 transition-all duration-300 group-hover:bg-accent/60" />
    <span className="absolute bottom-1 left-3 right-3 h-[2px] scale-x-0 bg-gradient-to-r from-primary/60 to-primary transition-transform duration-300 group-hover:scale-x-100" />
  </Link>
);

const SiteHeader = memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = useCallback(() => setMobileMenuOpen(prev => !prev), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Ambient glow effect */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Main header with enhanced glassmorphism */}
      <div className="relative bg-background/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/50 border-b border-border/40">
        {/* Top gradient line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        {/* Bottom gradient line */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        
        <div className="container mx-auto flex h-16 lg:h-[72px] items-center justify-between px-4 lg:px-8">
          {/* Logo */}
          <Link 
            to="/site/home" 
            className="group flex items-center gap-3.5 transition-all duration-300"
          >
            <div className="relative">
              {/* MSK Activity logo */}
              <div className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-primary/25 via-primary/15 to-primary/5 flex items-center justify-center transition-all duration-500 group-hover:from-primary/35 group-hover:via-primary/20 group-hover:to-primary/10 group-hover:shadow-xl group-hover:shadow-primary/20 border border-primary/10 group-hover:border-primary/25">
                <Activity className="h-6 w-6 text-primary transition-all duration-500 group-hover:scale-110" />
              </div>
              {/* Pulse glow effect */}
              <div className="absolute inset-0 -z-10 rounded-xl bg-primary/30 blur-2xl scale-150 opacity-0 transition-all duration-500 group-hover:opacity-50" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight lg:text-[17px] text-foreground">
                Pittsford Performance Care
              </span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/70 lg:block">
                Neurologic Rehabilitation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-10 px-4 bg-transparent text-sm font-medium text-foreground/70 transition-all duration-300 hover:text-foreground hover:bg-accent/50 data-[state=open]:text-foreground data-[state=open]:bg-accent/60 rounded-lg">
                    Conditions
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[480px] p-2">
                      <div className="grid gap-1.5">
                        {[
                          { to: "/site/concussion", title: "Concussion Care", desc: "Specialized neurologic evaluation for persistent post-concussion symptoms", icon: Brain, color: "from-blue-500/20 to-blue-600/10" },
                          { to: "/site/msk", title: "Musculoskeletal Care", desc: "Neuromuscular-driven approach to chronic pain and movement dysfunction", icon: Activity, color: "from-emerald-500/20 to-emerald-600/10" },
                          { to: "/site/performance", title: "Performance & Athletic Care", desc: "Neurologic readiness, recovery, and confident return-to-play for athletes", icon: Sparkles, color: "from-amber-500/20 to-amber-600/10" },
                        ].map((item) => (
                          <NavigationMenuLink key={item.to} asChild>
                            <Link
                              to={item.to}
                              className="group flex items-start gap-4 select-none rounded-xl p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-accent/70 focus:bg-accent border border-transparent hover:border-border/50"
                            >
                              <div className={cn(
                                "h-11 w-11 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg",
                                item.color
                              )}>
                                <item.icon className="h-5 w-5 text-foreground/80" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                                    {item.title}
                                  </span>
                                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0" />
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                  {item.desc}
                                </p>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-10 px-4 bg-transparent text-sm font-medium text-foreground/70 transition-all duration-300 hover:text-foreground hover:bg-accent/50 data-[state=open]:text-foreground data-[state=open]:bg-accent/60 rounded-lg">
                    Resources
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[320px] p-2">
                      <div className="grid gap-1">
                        {[
                          { to: "/site/articles", title: "Articles & Guides", desc: "Educational content and recovery insights" },
                          { to: "/resources/clinician-guides", title: "Clinician Guides", desc: "Professional clinical resources" },
                          { to: "/site/works-cited", title: "Works Cited", desc: "Clinical and research references" },
                        ].map((item) => (
                          <NavigationMenuLink key={item.to} asChild>
                            <Link
                              to={item.to}
                              className="group block select-none space-y-1 rounded-lg p-3.5 leading-none no-underline outline-none transition-all duration-300 hover:bg-accent/70 focus:bg-accent"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                                  {item.title}
                                </span>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0" />
                              </div>
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {item.desc}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                        {/* Gated Professional Portal */}
                        <div className="mt-1 pt-1 border-t border-border/30">
                          <NavigationMenuLink asChild>
                            <Link
                              to="/resources/professional-outcomes"
                              className="group block select-none space-y-1 rounded-lg p-3.5 leading-none no-underline outline-none transition-all duration-300 hover:bg-accent/70 focus:bg-accent"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                                  Professional Outcomes Portal
                                </span>
                                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded">
                                  Request Access
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                Aggregate clinical outcomes for referring clinicians
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-10 px-4 bg-transparent text-sm font-medium text-foreground/70 transition-all duration-300 hover:text-foreground hover:bg-accent/50 data-[state=open]:text-foreground data-[state=open]:bg-accent/60 rounded-lg">
                    About
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[320px] p-2">
                      <div className="grid gap-1">
                        {[
                          { to: "/site/about", title: "About PPC", desc: "Our philosophy and approach" },
                          { to: "/site/registry", title: "Outcome Registry", desc: "Clarity through measurable recovery" },
                          { to: "/site/wcsd-partnership", title: "WCSD Partnership", desc: "Clinic to classroom collaboration" },
                        ].map((item) => (
                          <NavigationMenuLink key={item.to} asChild>
                            <Link
                              to={item.to}
                              className="group block select-none space-y-1 rounded-lg p-3.5 leading-none no-underline outline-none transition-all duration-300 hover:bg-accent/70 focus:bg-accent"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                                  {item.title}
                                </span>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0" />
                              </div>
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {item.desc}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <NavLink to="/site/providers">Providers</NavLink>
            <NavLink to="/site/contact">Contact</NavLink>
            
            {/* Vertical divider */}
            <div className="mx-3 h-6 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
            
            <Link
              to="/patient-auth"
              className="flex items-center gap-1.5 text-sm font-medium text-primary/80 transition-all duration-300 hover:text-primary px-2"
            >
              <User className="h-4 w-4" />
              Patient Portal
            </Link>
            
            <Link
              to="/staff-login"
              className="text-sm font-medium text-muted-foreground/50 transition-all duration-300 hover:text-foreground px-2"
            >
              Staff
            </Link>

            {/* CTA Group */}
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border/30">
              <Link
                to="/patient/intake/referral"
                className="text-sm font-medium text-foreground/50 transition-all duration-300 hover:text-primary"
              >
                Physician Referral
              </Link>
              <Button 
                asChild 
                size="sm" 
                className="h-10 px-6 rounded-lg shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.03] hover:-translate-y-0.5"
              >
                <Link to="/patient/concierge">Schedule Evaluation</Link>
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden relative p-2.5 rounded-lg transition-all duration-300 hover:bg-accent/80 active:scale-95 overflow-hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <div className="relative w-5 h-5">
              <span className={cn(
                "absolute left-0 w-5 h-0.5 bg-foreground rounded-full transition-all duration-300",
                mobileMenuOpen ? "top-[9px] rotate-45" : "top-1"
              )} />
              <span className={cn(
                "absolute left-0 top-[9px] w-5 h-0.5 bg-foreground rounded-full transition-all duration-300",
                mobileMenuOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
              )} />
              <span className={cn(
                "absolute left-0 w-5 h-0.5 bg-foreground rounded-full transition-all duration-300",
                mobileMenuOpen ? "top-[9px] -rotate-45" : "top-[17px]"
              )} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden bg-background/98 backdrop-blur-2xl overflow-hidden transition-all duration-500 ease-out border-b border-border/40",
          mobileMenuOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0 border-b-0"
        )}
      >
        <nav className="container mx-auto px-4 py-5 flex flex-col gap-1.5">
          {/* Conditions Section */}
          <div className="pb-4 mb-3 border-b border-border/20">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 mb-3 px-3">
              Conditions
            </p>
            {[
              { to: "/site/concussion", label: "Concussion Care", icon: Brain },
              { to: "/site/msk", label: "Musculoskeletal Care", icon: Activity },
              { to: "/site/performance", label: "Performance & Athletic Care", icon: Sparkles },
            ].map((item, index) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 py-3 px-3 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-accent/60"
                onClick={() => setMobileMenuOpen(false)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <item.icon className="h-4 w-4 text-primary/70" />
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Main Links */}
          <div className="pb-4 mb-3 border-b border-border/20">
            {[
              { to: "/site/articles", label: "Articles & Guides" },
              { to: "/resources/clinician-guides", label: "Clinician Guides" },
              { to: "/site/works-cited", label: "Works Cited" },
              { to: "/site/about", label: "About PPC" },
              { to: "/site/registry", label: "Outcome Registry" },
              { to: "/site/wcsd-partnership", label: "WCSD Partnership" },
              { to: "/site/providers", label: "Providers" },
              { to: "/site/contact", label: "Contact" },
            ].map((item, index) => (
              <Link
                key={item.to}
                to={item.to}
                className="block py-3 px-3 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-accent/60"
                onClick={() => setMobileMenuOpen(false)}
                style={{ animationDelay: `${(index + 3) * 50}ms` }}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Actions */}
          <div className="space-y-3 pt-2">
            {/* Patient Portal Button - Prominent for mobile */}
            <Button asChild variant="outline" className="w-full h-12 rounded-lg border-primary/30 text-primary hover:bg-primary/10">
              <Link to="/patient-auth" onClick={() => setMobileMenuOpen(false)}>
                <User className="mr-2 h-4 w-4" />
                Patient Portal
              </Link>
            </Button>
            
            <div className="flex gap-2.5">
              <Link
                to="/staff-login"
                className="flex-1 py-3 px-4 text-sm font-medium text-center text-muted-foreground rounded-lg border border-border/40 transition-all duration-300 hover:bg-accent/60 hover:border-border/60"
                onClick={() => setMobileMenuOpen(false)}
              >
                Staff Login
              </Link>
              <Link
                to="/patient/intake/referral"
                className="flex-1 py-3 px-4 text-sm font-medium text-center text-muted-foreground rounded-lg border border-border/40 transition-all duration-300 hover:bg-accent/60 hover:border-border/60"
                onClick={() => setMobileMenuOpen(false)}
              >
                Physician Referral
              </Link>
            </div>
            <Button asChild className="w-full h-12 rounded-lg shadow-lg text-base">
              <Link to="/patient/concierge" onClick={() => setMobileMenuOpen(false)}>
                Schedule Evaluation
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
});

SiteHeader.displayName = "SiteHeader";

export default SiteHeader;
