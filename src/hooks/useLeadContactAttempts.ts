import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ContactAttempt {
  id: string;
  attempt_number: number;
  method: string;
  notes: string | null;
  contacted_at: string;
}

export function useLeadContactAttempts(leadId: string | null) {
  const [attempts, setAttempts] = useState<ContactAttempt[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAttempts = async () => {
    if (!leadId) {
      setAttempts([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lead_contact_attempts")
        .select("*")
        .eq("lead_id", leadId)
        .order("attempt_number", { ascending: true });

      if (error) throw error;
      setAttempts(data || []);
    } catch (error) {
      console.error("Error fetching contact attempts:", error);
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [leadId]);

  return { attempts, loading, refetch: fetchAttempts };
}
