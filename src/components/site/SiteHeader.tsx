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
import { Menu, X, Brain, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className="relative text-sm font-medium text-foreground/70 transition-all duration-200 hover:text-foreground after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
  >
    {children}
  </Link>
);

const SiteHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Gradient border effect */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Main header with glassmorphism */}
      <div className="relative bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        {/* Subtle top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <div className="container mx-auto flex h-16 lg:h-18 items-center justify-between px-4 lg:px-8">
          {/* Logo */}
          <Link 
            to="/site/home" 
            className="group flex items-center gap-3 transition-all duration-300 hover:opacity-90"
          >
            <div className="relative">
              {/* Logo container with gradient background */}
              <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center transition-all duration-300 group-hover:from-primary/30 group-hover:to-primary/10 group-hover:shadow-lg group-hover:shadow-primary/10">
                <Brain className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 -z-10 rounded-xl bg-primary/20 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-60" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight lg:text-lg text-foreground">
                Pittsford Performance Care
              </span>
              <span className="hidden text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70 lg:block">
                Neurologic Rehabilitation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9 px-3 bg-transparent text-sm font-medium text-foreground/70 transition-colors hover:text-foreground hover:bg-accent/50 data-[state=open]:text-foreground data-[state=open]:bg-accent/50 rounded-lg">
                    Conditions
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[420px] gap-3 p-5 md:w-[520px] md:grid-cols-2">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/site/concussion"
                            className="group block select-none space-y-1.5 rounded-xl p-4 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/80 focus:bg-accent border border-transparent hover:border-border/50"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary/60" />
                              <span className="text-sm font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                                Concussion Care
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed text-muted-foreground pl-4">
                              Specialized neurologic evaluation for persistent post-concussion symptoms
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/site/msk"
                            className="group block select-none space-y-1.5 rounded-xl p-4 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/80 focus:bg-accent border border-transparent hover:border-border/50"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary/60" />
                              <span className="text-sm font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                                Musculoskeletal Care
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed text-muted-foreground pl-4">
                              Neuromuscular-driven approach to chronic pain and movement dysfunction
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li className="md:col-span-2">
                        <NavigationMenuLink asChild>
                          <Link
                            to="/site/performance"
                            className="group block select-none space-y-1.5 rounded-xl p-4 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/80 focus:bg-accent border border-transparent hover:border-border/50"
                          >
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-primary/70" />
                              <span className="text-sm font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                                Performance & Athletic Care
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed text-muted-foreground pl-6">
                              Neurologic readiness, recovery, and confident return-to-play for athletes
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <NavLink to="/site/articles">Resources</NavLink>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9 px-3 bg-transparent text-sm font-medium text-foreground/70 transition-colors hover:text-foreground hover:bg-accent/50 data-[state=open]:text-foreground data-[state=open]:bg-accent/50 rounded-lg">
                    About
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-2 p-4">
                      {[
                        { to: "/site/about", title: "About PPC", desc: "Our philosophy and approach" },
                        { to: "/site/registry", title: "Outcome Registry", desc: "Clarity through measurable recovery" },
                        { to: "/site/wcsd-partnership", title: "WCSD Partnership", desc: "Clinic to classroom collaboration" },
                      ].map((item) => (
                        <li key={item.to}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.to}
                              className="group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/80 focus:bg-accent"
                            >
                              <div className="text-sm font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                                {item.title}
                              </div>
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {item.desc}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <NavLink to="/site/providers">Providers</NavLink>
            <NavLink to="/site/contact">Contact</NavLink>
            
            {/* Vertical divider */}
            <div className="mx-3 h-5 w-px bg-border/60" />
            
            <Link
              to="/staff-login"
              className="text-sm font-medium text-muted-foreground/60 transition-colors hover:text-foreground px-2"
            >
              Staff
            </Link>

            {/* CTA Group */}
            <div className="flex items-center gap-3 ml-3 pl-3 border-l border-border/40">
              <Link
                to="/patient/intake/referral"
                className="text-sm font-medium text-foreground/60 transition-colors hover:text-primary"
              >
                Physician Referral
              </Link>
              <Button 
                asChild 
                size="sm" 
                className="h-9 px-5 rounded-lg shadow-sm shadow-primary/20 transition-all duration-200 hover:shadow-md hover:shadow-primary/30 hover:scale-[1.02]"
              >
                <Link to="/patient/concierge">Schedule Evaluation</Link>
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg transition-all duration-200 hover:bg-accent/80 active:scale-95"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden bg-background/95 backdrop-blur-xl overflow-hidden transition-all duration-300 ease-in-out border-b border-border/40",
          mobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 border-b-0"
        )}
      >
        <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
          {/* Conditions Section */}
          <div className="pb-3 mb-2 border-b border-border/30">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2 px-3">
              Conditions
            </p>
            {[
              { to: "/site/concussion", label: "Concussion Care" },
              { to: "/site/msk", label: "Musculoskeletal Care" },
              { to: "/site/performance", label: "Performance & Athletic Care" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block py-2.5 px-3 text-sm font-medium rounded-lg transition-colors hover:bg-accent/60"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Main Links */}
          <div className="pb-3 mb-2 border-b border-border/30">
            {[
              { to: "/site/articles", label: "Resources" },
              { to: "/site/about", label: "About PPC" },
              { to: "/site/registry", label: "Outcome Registry" },
              { to: "/site/wcsd-partnership", label: "WCSD Partnership" },
              { to: "/site/providers", label: "Providers" },
              { to: "/site/contact", label: "Contact" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block py-2.5 px-3 text-sm font-medium rounded-lg transition-colors hover:bg-accent/60"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Actions */}
          <div className="space-y-2 pt-1">
            <div className="flex gap-2">
              <Link
                to="/staff-login"
                className="flex-1 py-2.5 px-3 text-sm font-medium text-center text-muted-foreground rounded-lg border border-border/50 transition-colors hover:bg-accent/60"
                onClick={() => setMobileMenuOpen(false)}
              >
                Staff Login
              </Link>
              <Link
                to="/patient/intake/referral"
                className="flex-1 py-2.5 px-3 text-sm font-medium text-center text-muted-foreground rounded-lg border border-border/50 transition-colors hover:bg-accent/60"
                onClick={() => setMobileMenuOpen(false)}
              >
                Physician Referral
              </Link>
            </div>
            <Button asChild className="w-full h-11 rounded-lg shadow-sm">
              <Link to="/patient/concierge" onClick={() => setMobileMenuOpen(false)}>
                Schedule Evaluation
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;
