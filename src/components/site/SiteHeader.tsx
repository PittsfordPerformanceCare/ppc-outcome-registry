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
import { Menu, X, Brain } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className="relative text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
  >
    {children}
  </Link>
);

const SiteHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-18 items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link 
          to="/site/home" 
          className="group flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02]"
        >
          <div className="relative">
            <Brain className="h-9 w-9 text-primary transition-transform duration-300 group-hover:rotate-6" />
            <div className="absolute inset-0 -z-10 h-9 w-9 rounded-full bg-primary/10 blur-md transition-opacity duration-300 group-hover:opacity-100 opacity-0" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight lg:text-xl">
              Pittsford Performance Care
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-widest text-muted-foreground lg:block">
              Neurologic Rehabilitation
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=open]:text-foreground">
                  Conditions
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[420px] gap-4 p-6 md:w-[560px] md:grid-cols-2">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/site/concussion"
                          className="group block select-none space-y-2 rounded-lg p-4 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-sm focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                            Concussion Care
                          </div>
                          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            Specialized neurologic evaluation for persistent post-concussion symptoms
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/site/msk"
                          className="group block select-none space-y-2 rounded-lg p-4 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-sm focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                            Musculoskeletal Care
                          </div>
                          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            Neuromuscular-driven approach to chronic pain and movement dysfunction
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li className="md:col-span-2">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/site/performance"
                          className="group block select-none space-y-2 rounded-lg p-4 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-sm focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                            Performance & Athletic Care
                          </div>
                          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
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
                <NavigationMenuTrigger className="bg-transparent text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=open]:text-foreground">
                  About
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[320px] gap-3 p-5">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/site/about"
                          className="group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-sm focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                            About PPC
                          </div>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            Our philosophy, approach, and commitment to care
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/site/registry"
                          className="group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-sm focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                            PPC Outcome Registry
                          </div>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            Clarity through measurable recovery
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/site/wcsd-partnership"
                          className="group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-sm focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                            WCSD Partnership
                          </div>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            Clinic to classroom collaboration
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <NavLink to="/site/providers">Providers</NavLink>
          <NavLink to="/site/contact">Contact</NavLink>
          
          <div className="h-5 w-px bg-border/60" />
          
          <NavLink to="/staff-login">Staff Login</NavLink>

          <div className="flex items-center gap-4 ml-2">
            <NavLink to="/patient/intake/referral">Physician Referral</NavLink>
            <Button asChild size="default" className="px-6 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
              <Link to="/patient/concierge">Schedule Evaluation</Link>
            </Button>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2.5 rounded-lg transition-colors hover:bg-accent"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 transition-transform duration-200" />
          ) : (
            <Menu className="h-6 w-6 transition-transform duration-200" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden border-t border-border/40 bg-background overflow-hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="container mx-auto px-6 py-6 flex flex-col gap-2">
          <div className="space-y-1 pb-4 border-b border-border/40">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Conditions
            </p>
            <Link
              to="/site/concussion"
              className="block pl-4 py-2.5 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Concussion Care
            </Link>
            <Link
              to="/site/msk"
              className="block pl-4 py-2.5 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Musculoskeletal Care
            </Link>
            <Link
              to="/site/performance"
              className="block pl-4 py-2.5 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Performance & Athletic Care
            </Link>
          </div>
          
          <div className="py-2 space-y-1">
            <Link
              to="/site/articles"
              className="block py-2.5 px-4 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Resources
            </Link>
            <Link
              to="/site/about"
              className="block py-2.5 px-4 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              About PPC
            </Link>
            <Link
              to="/site/registry"
              className="block py-2.5 px-4 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Outcome Registry
            </Link>
            <Link
              to="/site/wcsd-partnership"
              className="block py-2.5 px-4 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              WCSD Partnership
            </Link>
            <Link
              to="/site/providers"
              className="block py-2.5 px-4 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Providers
            </Link>
            <Link
              to="/site/contact"
              className="block py-2.5 px-4 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
          
          <div className="pt-4 border-t border-border/40 space-y-3">
            <Link
              to="/staff-login"
              className="block py-2.5 px-4 text-sm font-medium text-muted-foreground rounded-md transition-colors hover:bg-accent hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Staff Login
            </Link>
            <Link
              to="/patient/intake/referral"
              className="block py-2.5 px-4 text-sm font-medium text-muted-foreground rounded-md transition-colors hover:bg-accent hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Physician Referral
            </Link>
            <Button asChild className="w-full shadow-sm">
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
