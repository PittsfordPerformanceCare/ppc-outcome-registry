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

    // Get all pending retries that are due
    const { data: retries, error: fetchError } = await supabase
      .from("webhook_retry_queue")
      .select("*")
      .in("status", ["pending", "retrying"])
      .lte("next_retry_at", new Date().toISOString())
      .order("next_retry_at", { ascending: true })
      .limit(50); // Process max 50 at a time

    if (fetchError) {
      console.error("Error fetching retries:", fetchError);
      throw fetchError;
    }

    if (!retries || retries.length === 0) {
      console.log("No pending retries found");
      return new Response(
        JSON.stringify({ message: "No pending retries", processed: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${retries.length} webhooks to retry`);

    let successCount = 0;
    let failedCount = 0;
    let abandonedCount = 0;

    // Process each retry
    for (const retry of retries) {
      console.log(`Processing retry for webhook: ${retry.webhook_name} (attempt ${retry.retry_count + 1}/${retry.max_retries})`);

      // Update status to retrying
      await supabase
        .from("webhook_retry_queue")
        .update({ status: "retrying" })
        .eq("id", retry.id);

      const startTime = Date.now();
      let status = "failed";
      let responseStatus: number | null = null;
      let responseBody: string | null = null;
      let errorMessage: string | null = null;

      try {
        // Attempt the webhook call
        const response = await fetch(retry.webhook_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(retry.request_payload),
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
          successCount++;
          console.log(`Webhook retry succeeded: ${retry.webhook_name}`);

          // Update retry queue to succeeded
          await supabase
            .from("webhook_retry_queue")
            .update({ 
              status: "succeeded",
              retry_count: retry.retry_count + 1,
            })
            .eq("id", retry.id);

          // Log successful retry
          await supabase
            .from("webhook_activity_log")
            .insert({
              webhook_config_id: retry.webhook_config_id,
              user_id: retry.user_id,
              clinic_id: retry.clinic_id,
              webhook_name: retry.webhook_name,
              trigger_type: retry.trigger_type,
              webhook_url: retry.webhook_url,
              status: "success",
              request_payload: retry.request_payload,
              response_status: responseStatus,
              response_body: responseBody?.substring(0, 5000),
              error_message: null,
              duration_ms: duration,
            });

          // Update webhook config last triggered
          if (retry.webhook_config_id) {
            await supabase
              .from("zapier_webhook_config")
              .update({ last_triggered_at: new Date().toISOString() })
              .eq("id", retry.webhook_config_id);
          }

        } else {
          throw new Error(`HTTP ${response.status}: ${responseBody}`);
        }

      } catch (error: any) {
        const duration = Date.now() - startTime;

        if (error.name === "TimeoutError") {
          status = "timeout";
          errorMessage = "Request timed out after 30 seconds";
        } else {
          status = "failed";
          errorMessage = error.message || "Unknown error";
        }

        console.error(`Webhook retry failed: ${retry.webhook_name}`, errorMessage);

        const newRetryCount = retry.retry_count + 1;

        if (newRetryCount >= retry.max_retries) {
          // Max retries reached, abandon
          abandonedCount++;
          console.log(`Webhook abandoned after ${newRetryCount} attempts: ${retry.webhook_name}`);

          await supabase
            .from("webhook_retry_queue")
            .update({
              status: "abandoned",
              retry_count: newRetryCount,
              last_error: errorMessage,
            })
            .eq("id", retry.id);

        } else {
          // Schedule next retry with exponential backoff
          failedCount++;
          
          const { data: nextRetryTime } = await supabase
            .rpc("calculate_webhook_retry_time", { retry_count: newRetryCount });

          console.log(`Scheduling retry ${newRetryCount + 1} for ${retry.webhook_name} at ${nextRetryTime}`);

          await supabase
            .from("webhook_retry_queue")
            .update({
              status: "pending",
              retry_count: newRetryCount,
              next_retry_at: nextRetryTime,
              last_error: errorMessage,
            })
            .eq("id", retry.id);
        }

        // Log failed retry attempt
        await supabase
          .from("webhook_activity_log")
          .insert({
            webhook_config_id: retry.webhook_config_id,
            user_id: retry.user_id,
            clinic_id: retry.clinic_id,
            webhook_name: retry.webhook_name,
            trigger_type: retry.trigger_type,
            webhook_url: retry.webhook_url,
            status,
            request_payload: retry.request_payload,
            response_status: responseStatus,
            response_body: responseBody?.substring(0, 5000),
            error_message: errorMessage,
            duration_ms: duration,
          });
      }
    }

    console.log(`Retry process complete. Success: ${successCount}, Failed: ${failedCount}, Abandoned: ${abandonedCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: retries.length,
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
    console.error("Error in retry-failed-webhooks:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
