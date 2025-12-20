import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { doctorName, location } = await req.json();

    if (!doctorName || doctorName.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Doctor name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a medical office assistant that helps look up doctor contact information. 
When given a doctor's name, provide their likely phone number and fax number if you have reliable information.
Be conservative - only provide information if you're reasonably confident it's accurate.
If you cannot find reliable contact information, indicate that clearly.

IMPORTANT: Only return real, verified contact information from your training data. Do not make up phone numbers or fax numbers.
If you're not confident about the information, return empty strings for the fields you're unsure about.`;

    const userPrompt = `Please look up the contact information for this Primary Care Physician:
Doctor Name: ${doctorName}
${location ? `Location/Area: ${location}` : ""}

Return the information in this exact JSON format:
{
  "phone": "phone number or empty string if unknown",
  "fax": "fax number or empty string if unknown", 
  "address": "office address or empty string if unknown",
  "confidence": "high, medium, or low",
  "note": "any relevant notes about the information found"
}

If you cannot find reliable information for this doctor, return:
{
  "phone": "",
  "fax": "",
  "address": "",
  "confidence": "low",
  "note": "Could not find verified contact information for this physician"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_doctor_contact",
              description: "Provide the doctor's contact information",
              parameters: {
                type: "object",
                properties: {
                  phone: { type: "string", description: "Doctor's office phone number" },
                  fax: { type: "string", description: "Doctor's office fax number" },
                  address: { type: "string", description: "Doctor's office address" },
                  confidence: { type: "string", enum: ["high", "medium", "low"], description: "Confidence level in the information" },
                  note: { type: "string", description: "Any relevant notes" }
                },
                required: ["phone", "fax", "address", "confidence", "note"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_doctor_contact" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI lookup failed");
    }

    const data = await response.json();
    
    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall && toolCall.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: try to parse content as JSON
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (e) {
        console.error("Failed to parse AI response:", e);
      }
    }

    return new Response(
      JSON.stringify({ 
        phone: "", 
        fax: "", 
        address: "",
        confidence: "low",
        note: "Could not retrieve contact information" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("PCP lookup error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
