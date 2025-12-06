import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Authenticated users go to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        // Unauthenticated users go to intake gateway
        navigate("/begin-intake", { replace: true });
      }
      setChecking(false);
    };

    checkAuth();
  }, [navigate]);

  // Show nothing while checking - redirect happens immediately
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return null;
};

export default Index;
