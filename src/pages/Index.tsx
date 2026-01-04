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
        // FIRST: Check if user has a staff role (admin or clinician) - they are NOT patients
        const { data: staffRoles, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        if (roleError) {
          console.error("Error fetching user roles:", roleError);
        }

        // Check for staff roles
        const staffRole = staffRoles?.find(r => 
          ["admin", "clinician", "owner"].includes(r.role)
        );

        if (staffRole) {
          // Staff user - go to admin dashboard (admins) or clinician dashboard (clinicians only)
          // Check if user is ALSO an admin (admins take priority)
          const isAdmin = staffRoles?.some(r => r.role === "admin");
          const isOwner = staffRoles?.some(r => r.role === "owner");
          
          if (isAdmin || isOwner) {
            navigate("/admin/dashboard", { replace: true });
          } else {
            navigate("/clinician/dashboard", { replace: true });
          }
        } else {
          // No staff role - check if patient account
          const { data: patientAccount } = await supabase
            .from("patient_accounts")
            .select("id")
            .eq("id", session.user.id)
            .maybeSingle();

          if (patientAccount) {
            navigate("/patient/concierge", { replace: true });
          } else {
            // Unknown user type - send to hub
            navigate("/site/hub", { replace: true });
          }
        }
      } else if (isStandalone) {
        // PWA installed but not logged in - redirect to patient auth
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
