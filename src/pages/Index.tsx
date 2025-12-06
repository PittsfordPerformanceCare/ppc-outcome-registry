import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BeginIntake from "./BeginIntake";

const Index = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Authenticated users go to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        // Unauthenticated users see the intake page directly
        setIsAuthenticated(false);
      }
      setChecking(false);
    };

    checkAuth();
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show BeginIntake for unauthenticated users
  if (!isAuthenticated) {
    return <BeginIntake />;
  }

  return null;
};

export default Index;
