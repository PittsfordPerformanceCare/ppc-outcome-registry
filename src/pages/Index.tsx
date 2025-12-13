import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePWAStandalone } from "@/hooks/usePWAStandalone";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHome from "./site/SiteHome";

const Index = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { isStandalone, isChecked } = usePWAStandalone();

  useEffect(() => {
    // Wait for PWA check to complete
    if (!isChecked) return;

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if this is a patient account
        const { data: patientAccount } = await supabase
          .from("patient_accounts")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle();

        if (patientAccount) {
          // Patient user - go to patient dashboard
          navigate("/patient/concierge", { replace: true });
        } else {
          // Staff user - go to staff dashboard
          navigate("/dashboard", { replace: true });
        }
      } else if (isStandalone) {
        // PWA installed but not logged in - redirect to patient auth
        // This provides a better UX for installed app users
        navigate("/patient-auth", { replace: true });
      } else {
        // Regular browser, not logged in - show public site
        setIsAuthenticated(false);
      }
      setChecking(false);
    };

    checkAuth();
  }, [navigate, isStandalone, isChecked]);

  if (checking || !isChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show Hub Home with header and footer for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">
          <SiteHome />
        </main>
        <SiteFooter />
      </div>
    );
  }

  return null;
};

export default Index;
