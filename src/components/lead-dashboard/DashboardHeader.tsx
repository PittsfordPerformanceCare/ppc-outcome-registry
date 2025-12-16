import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function DashboardHeader() {
  const [userName, setUserName] = useState<string>("");
  const [clinicName, setClinicName] = useState<string>("Pittsford Performance Care");

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        if (profile?.full_name) {
          setUserName(profile.full_name);
        }
      }

      const { data: settings } = await supabase
        .from("clinic_settings")
        .select("clinic_name")
        .limit(1)
        .single();

      if (settings?.clinic_name) {
        setClinicName(settings.clinic_name);
      }
    };

    fetchData();
  }, []);

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <header className="flex items-center justify-between py-4 border-b border-border/40">
      <div className="space-y-0.5">
        <p className="text-sm text-muted-foreground">{formatDate()}</p>
        <h1 className="text-xl font-semibold tracking-tight">{clinicName}</h1>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{userName || "Admin"}</p>
        <p className="text-xs text-muted-foreground">Clinic Admin</p>
      </div>
    </header>
  );
}
