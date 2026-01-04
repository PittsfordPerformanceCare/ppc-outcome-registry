import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PhoneIntakeDialog } from "@/components/admin-dashboard/PhoneIntakeDialog";
import { CreateIntakeLinkDialog } from "@/components/admin-dashboard/CreateIntakeLinkDialog";
import { FrontDeskQRCode } from "@/components/admin-dashboard/FrontDeskQRCode";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface DashboardHeaderProps {
  onRefresh?: () => void;
}

export function DashboardHeader({ onRefresh }: DashboardHeaderProps) {
  const navigate = useNavigate();
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
      <div className="flex items-center gap-3">
        <FrontDeskQRCode />
        <CreateIntakeLinkDialog />
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/returning-patient")}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Returning Patient
        </Button>
        <PhoneIntakeDialog onSuccess={onRefresh} />
        <div className="text-right">
          <p className="text-sm font-medium">{userName || "Admin"}</p>
          <p className="text-xs text-muted-foreground">Clinic Admin</p>
        </div>
      </div>
    </header>
  );
}
