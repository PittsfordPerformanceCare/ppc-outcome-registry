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

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action,
      table_name: tableName,
      record_id: recordId,
      old_data: oldData || null,
      new_data: newData || null,
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}
