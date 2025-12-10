import { Outlet, Link } from "react-router-dom";
import { Brain, ArrowLeft, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const PatientLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/site/hub" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="font-bold text-lg">PPC</span>
                <span className="text-xs block text-muted-foreground">Pittsford Performance Care</span>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link 
                to="/site/hub" 
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Site</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span>Pittsford Performance Care</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a href="tel:585-625-2555" className="flex items-center gap-1 hover:text-foreground">
                <Phone className="h-3 w-3" />
                (585) 625-2555
              </a>
              <a href="mailto:info@pittsfordperformancecare.com" className="flex items-center gap-1 hover:text-foreground">
                <Mail className="h-3 w-3" />
                info@pittsfordperformancecare.com
              </a>
            </div>
            <p className="text-center">
              © {new Date().getFullYear()} PPC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatientLayout;
