import { Link } from "react-router-dom";
import { Brain, MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SiteFooter = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* Top CTA Banner */}
      <div className="bg-gradient-to-r from-primary via-primary to-primary/90 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold mb-2">Ready to Start Your Recovery?</h3>
              <p className="text-white/80">Schedule your comprehensive neurologic evaluation today.</p>
            </div>
            <Button size="lg" variant="secondary" className="group" asChild>
              <Link to="/patient/concierge">
                Schedule Evaluation
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-slate-900 text-slate-300">
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/site/home" className="flex items-center gap-3 mb-6 group">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <span className="font-bold text-white text-lg">Pittsford<br />Performance Care</span>
              </Link>
              <p className="text-slate-400 leading-relaxed">
                Neurologic-driven care for concussion recovery and musculoskeletal performance.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">Quick Links</h4>
              <nav className="flex flex-col gap-3">
                {[
                  { to: "/site/home", label: "Home" },
                  { to: "/site/concussion", label: "Concussion Care" },
                  { to: "/site/msk", label: "MSK Care" },
                  { to: "/site/articles", label: "Resources" },
                  { to: "/patient/concierge", label: "Schedule Evaluation" },
                ].map((link) => (
                  <Link 
                    key={link.to}
                    to={link.to} 
                    className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* About */}
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">About PPC</h4>
              <nav className="flex flex-col gap-3">
                {[
                  { to: "/site/about", label: "Our Approach" },
                  { to: "/site/providers", label: "Our Providers" },
                  { to: "/site/contact", label: "Contact Us" },
                ].map((link) => (
                  <Link 
                    key={link.to}
                    to={link.to} 
                    className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">Contact</h4>
              <div className="space-y-4">
                <a 
                  href="https://maps.google.com/?q=3800+Monroe+Ave+Suite+22+Pittsford+NY+14534"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group"
                >
                  <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-slate-400 group-hover:text-white transition-colors pt-1">
                    3800 Monroe Ave., Suite 22<br />
                    Pittsford, NY 14534
                  </span>
                </a>
                <a 
                  href="tel:+15858807542"
                  className="flex items-center gap-3 group"
                >
                  <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-slate-400 group-hover:text-white transition-colors">
                    (585) 880-7542
                  </span>
                </a>
                <a 
                  href="mailto:info@pittsfordperformancecare.com"
                  className="flex items-center gap-3 group"
                >
                  <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-slate-400 group-hover:text-white transition-colors text-sm">
                    info@pittsfordperformancecare.com
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
              <p>&copy; {new Date().getFullYear()} Pittsford Performance Care. All rights reserved.</p>
              <nav className="flex gap-6">
                <Link to="/site/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link to="/site/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
