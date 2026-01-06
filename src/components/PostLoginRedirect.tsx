import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

export function PostLoginRedirect() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isClinician, isOwner, loading: roleLoading } = useUserRole();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const loading = authLoading || roleLoading;

  // Wait for auth to fully resolve before making decisions
  useEffect(() => {
    if (!authLoading) {
      setAuthChecked(true);
    }
  }, [authLoading]);

  useEffect(() => {
    // Don't redirect until auth has been fully checked
    if (loading || hasRedirected || !authChecked) return;
    
    if (!user) {
      // Not logged in - show staff login instead of patient concierge
      // This is the /auth route used for staff
      navigate("/staff-login", { replace: true });
      setHasRedirected(true);
      return;
    }

    // User is logged in, route based on role
    // Jennifer goes to admin dashboard, other clinicians go to clinician dashboard
    const userEmail = user.email?.toLowerCase();
    const isAdminPrimary = userEmail === 'jennifer@pittsfordperformancecare.com';
    
    if (isAdminPrimary && isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    } else if (isClinician) {
      navigate("/clinician/dashboard", { replace: true });
    } else if (isAdmin || isOwner) {
      navigate("/admin/dashboard", { replace: true });
    } else {
      // Fallback for patients or unknown roles - go to hub
      navigate("/site/hub", { replace: true });
    }
    setHasRedirected(true);
  }, [user, isAdmin, isClinician, isOwner, loading, navigate, hasRedirected, authChecked]);

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return null;
}
