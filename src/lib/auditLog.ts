import { supabase } from "@/integrations/supabase/client";

export async function logAudit(
  action: string,
  tableName: string,
  recordId: string,
  oldData?: any,
  newData?: any
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Get user's profile for clinic_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .maybeSingle();

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action,
      table_name: tableName,
      record_id: recordId,
      old_data: oldData || null,
      new_data: newData || null,
      clinic_id: profile?.clinic_id || null,
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}
