import { Link } from "react-router-dom";
import { Brain, MapPin, Phone, Mail } from "lucide-react";

const SiteFooter = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/site/home" className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-bold">Pittsford Performance Care</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Neurologic-driven care for concussion recovery and musculoskeletal performance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link to="/site/home" className="text-muted-foreground hover:text-foreground">
                Home
              </Link>
              <Link to="/site/concussion" className="text-muted-foreground hover:text-foreground">
                Concussion Care
              </Link>
              <Link to="/site/msk" className="text-muted-foreground hover:text-foreground">
                MSK Care
              </Link>
              <Link to="/site/articles" className="text-muted-foreground hover:text-foreground">
                Resources
              </Link>
              <Link to="/patient/concierge" className="text-muted-foreground hover:text-foreground">
                Schedule Evaluation
              </Link>
            </nav>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h4 className="font-semibold">About PPC</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link to="/site/about" className="text-muted-foreground hover:text-foreground">
                Our Approach
              </Link>
              <Link to="/site/providers" className="text-muted-foreground hover:text-foreground">
                Our Providers
              </Link>
              <Link to="/site/contact" className="text-muted-foreground hover:text-foreground">
                Contact Us
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  3800 Monroe Ave., Suite 22<br />
                  Pittsford, NY 14534
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+15855551234" className="hover:text-foreground">
                  (585) 555-1234
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:info@pittsfordperformancecare.com" className="hover:text-foreground">
                  info@pittsfordperformancecare.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Pittsford Performance Care. All rights reserved.</p>
            <nav className="flex gap-4">
              <Link to="/site/privacy" className="hover:text-foreground">Privacy Policy</Link>
              <Link to="/site/terms" className="hover:text-foreground">Terms of Service</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
