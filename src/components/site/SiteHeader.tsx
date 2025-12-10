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

const SiteHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/site/home" className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight">
            Pittsford Performance Care
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">
                  Conditions
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/site/concussion"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">
                            Concussion Care
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Specialized neurologic evaluation for persistent post-concussion symptoms
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/site/msk"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">
                            Musculoskeletal Care
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Neuromuscular-driven approach to chronic pain and movement dysfunction
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Link
            to="/site/articles"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Resources
          </Link>
          <Link
            to="/site/about"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            About
          </Link>
          <Link
            to="/site/providers"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Providers
          </Link>
          <Link
            to="/site/contact"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact
          </Link>

          <Button asChild className="ml-4">
            <Link to="/patient/concierge">Schedule Evaluation</Link>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Conditions</p>
              <Link
                to="/site/concussion"
                className="block pl-4 py-2 text-sm hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Concussion Care
              </Link>
              <Link
                to="/site/msk"
                className="block pl-4 py-2 text-sm hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Musculoskeletal Care
              </Link>
            </div>
            <Link
              to="/site/articles"
              className="py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Resources
            </Link>
            <Link
              to="/site/about"
              className="py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/site/providers"
              className="py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Providers
            </Link>
            <Link
              to="/site/contact"
              className="py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Button asChild className="mt-2">
              <Link to="/patient/concierge" onClick={() => setMobileMenuOpen(false)}>
                Schedule Evaluation
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
