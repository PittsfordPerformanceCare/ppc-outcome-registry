import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePWAStandalone } from "@/hooks/usePWAStandalone";

const Index = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
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
        // Regular browser, not logged in - redirect to public site
        navigate("/site/home", { replace: true });
      }
      setChecking(false);
    };

    checkAuth();
  }, [navigate, isStandalone, isChecked]);

  // Always show loading while checking or redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );
};

export default Index;
