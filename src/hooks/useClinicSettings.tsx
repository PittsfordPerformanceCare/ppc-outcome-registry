import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ClinicSettings {
  id: string;
  clinic_name: string;
  tagline: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  logo_url: string | null;
}

export const useClinicSettings = () => {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("clinic_settings")
        .select("*")
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      console.error("Error fetching clinic settings:", error);
      toast({
        title: "Error loading clinic settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (updates: Partial<ClinicSettings>) => {
    try {
      if (!settings?.id) return;

      const { error } = await supabase
        .from("clinic_settings")
        .update(updates)
        .eq("id", settings.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Clinic settings updated successfully",
      });

      await fetchSettings();
    } catch (error: any) {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadLogo = async (file: File) => {
    try {
      if (!settings?.id) return;

      // Delete old logo if exists
      if (settings.logo_url) {
        const oldPath = settings.logo_url.split("/").pop();
        if (oldPath) {
          await supabase.storage.from("clinic-logos").remove([oldPath]);
        }
      }

      // Upload new logo
      const fileExt = file.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("clinic-logos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("clinic-logos")
        .getPublicUrl(fileName);

      // Update settings with new logo URL
      await updateSettings({ logo_url: publicUrl });

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Error uploading logo",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    uploadLogo,
    refetch: fetchSettings,
  };
};
