import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Starting webhook retry process...");

    // Get all pending/retrying webhooks that are due for retry
    const { data: retryItems, error: fetchError } = await supabase
      .from("webhook_retry_queue")
      .select("*")
      .in("status", ["pending", "retrying"])
      .lte("next_retry_at", new Date().toISOString())
      .order("next_retry_at", { ascending: true })
      .limit(50); // Process up to 50 at a time

    if (fetchError) {
      console.error("Error fetching retry queue:", fetchError);
      throw fetchError;
    }

    if (!retryItems || retryItems.length === 0) {
      console.log("No webhooks to retry");
      return new Response(
        JSON.stringify({ message: "No webhooks to retry", processed: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${retryItems.length} webhooks to retry`);

    let successCount = 0;
    let failedCount = 0;
    let abandonedCount = 0;

    // Process each retry item
    for (const item of retryItems) {
      console.log(`Retrying webhook: ${item.webhook_name} (attempt ${item.retry_count + 1}/${item.max_retries})`);

      // Update status to retrying
      await supabase
        .from("webhook_retry_queue")
        .update({ status: "retrying" })
        .eq("id", item.id);

      const startTime = Date.now();
      let status = "failed";
      let responseStatus: number | null = null;
      let responseBody: string | null = null;
      let errorMessage: string | null = null;

      try {
        const response = await fetch(item.webhook_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(item.request_payload),
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        const duration = Date.now() - startTime;
        responseStatus = response.status;

        try {
          responseBody = await response.text();
        } catch (e) {
          responseBody = "Unable to read response body";
        }

        if (response.ok) {
          status = "success";
          console.log(`Webhook ${item.webhook_name} succeeded on retry ${item.retry_count + 1}`);
          successCount++;

          // Update retry queue status to succeeded
          await supabase
            .from("webhook_retry_queue")
            .update({
              status: "succeeded",
              last_error: null,
            })
            .eq("id", item.id);

          // Log successful retry in activity log
          await supabase
            .from("webhook_activity_log")
            .insert({
              webhook_config_id: item.webhook_config_id,
              user_id: item.user_id,
              clinic_id: item.clinic_id,
              webhook_name: item.webhook_name,
              trigger_type: item.trigger_type,
              webhook_url: item.webhook_url,
              status: "success",
              request_payload: item.request_payload,
              response_status: responseStatus,
              response_body: responseBody?.substring(0, 5000),
              error_message: null,
              duration_ms: duration,
            });

          // Update webhook config last_triggered_at
          if (item.webhook_config_id) {
            await supabase
              .from("zapier_webhook_config")
              .update({ last_triggered_at: new Date().toISOString() })
              .eq("id", item.webhook_config_id);
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${responseBody}`);
        }
      } catch (webhookError: any) {
        const duration = Date.now() - startTime;

        if (webhookError.name === "TimeoutError") {
          errorMessage = "Request timed out after 30 seconds";
        } else {
          errorMessage = webhookError.message || "Unknown error";
        }

        console.error(`Webhook ${item.webhook_name} failed:`, errorMessage);

        const newRetryCount = item.retry_count + 1;

        // Check if we should abandon the retry
        if (newRetryCount >= item.max_retries) {
          console.log(`Abandoning webhook ${item.webhook_name} after ${newRetryCount} attempts`);
          abandonedCount++;

          // Update status to abandoned
          await supabase
            .from("webhook_retry_queue")
            .update({
              status: "abandoned",
              retry_count: newRetryCount,
              last_error: errorMessage,
            })
            .eq("id", item.id);

          // Log final failed attempt
          await supabase
            .from("webhook_activity_log")
            .insert({
              webhook_config_id: item.webhook_config_id,
              user_id: item.user_id,
              clinic_id: item.clinic_id,
              webhook_name: item.webhook_name,
              trigger_type: item.trigger_type,
              webhook_url: item.webhook_url,
              status: "failed",
              request_payload: item.request_payload,
              response_status: responseStatus,
              response_body: responseBody?.substring(0, 5000),
              error_message: `Abandoned after ${newRetryCount} attempts: ${errorMessage}`,
              duration_ms: duration,
            });
        } else {
          // Schedule next retry with exponential backoff
          const { data: nextRetryTime } = await supabase
            .rpc("calculate_webhook_retry_time", { retry_count: newRetryCount });

          failedCount++;

          await supabase
            .from("webhook_retry_queue")
            .update({
              status: "pending",
              retry_count: newRetryCount,
              next_retry_at: nextRetryTime,
              last_error: errorMessage,
            })
            .eq("id", item.id);

          console.log(`Scheduled retry ${newRetryCount + 1} for ${item.webhook_name} at ${nextRetryTime}`);

          // Log failed attempt
          await supabase
            .from("webhook_activity_log")
            .insert({
              webhook_config_id: item.webhook_config_id,
              user_id: item.user_id,
              clinic_id: item.clinic_id,
              webhook_name: item.webhook_name,
              trigger_type: item.trigger_type,
              webhook_url: item.webhook_url,
              status: "failed",
              request_payload: item.request_payload,
              response_status: responseStatus,
              response_body: responseBody?.substring(0, 5000),
              error_message: `Retry attempt ${newRetryCount}: ${errorMessage}`,
              duration_ms: duration,
            });
        }
      }
    }

    console.log(
      `Retry process complete: ${successCount} succeeded, ${failedCount} failed (will retry), ${abandonedCount} abandoned`
    );

    return new Response(
      JSON.stringify({
        success: true,
        processed: retryItems.length,
        succeeded: successCount,
        failed: failedCount,
        abandoned: abandonedCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in webhook retry process:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
