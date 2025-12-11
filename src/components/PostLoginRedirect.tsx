import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

export function PostLoginRedirect() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isClinician, loading: roleLoading } = useUserRole();
  const [hasRedirected, setHasRedirected] = useState(false);

  const loading = authLoading || roleLoading;

  useEffect(() => {
    if (loading || hasRedirected) return;
    
    if (!user) {
      // Not logged in, go to patient concierge
      navigate("/patient/concierge", { replace: true });
      setHasRedirected(true);
      return;
    }

    // User is logged in, route based on role
    if (isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    } else if (isClinician) {
      navigate("/clinician/dashboard", { replace: true });
    } else {
      // Fallback for patients or unknown roles
      navigate("/site/home", { replace: true });
    }
    setHasRedirected(true);
  }, [user, isAdmin, isClinician, loading, navigate, hasRedirected]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return null;
}
