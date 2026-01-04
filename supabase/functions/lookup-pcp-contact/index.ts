import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const searchName = doctorName.trim();
    console.log(`Looking up PCP: "${searchName}" (location: ${location || "not provided"})`);

    // STEP 1: Check verified_providers table first
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try exact match first, then fuzzy match
    const searchTerms: string[] = searchName.toLowerCase().split(/\s+/).filter((term: string) => term.length > 1);
    
    // Build a query that matches providers where all search terms appear in the name
    let { data: providers, error: dbError } = await supabase
      .from("verified_providers")
      .select("*")
      .ilike("provider_name", `%${searchName}%`)
      .limit(5);

    // If no exact match, try matching just last name or first + last
    if ((!providers || providers.length === 0) && searchTerms.length > 0) {
      const lastTerm = searchTerms[searchTerms.length - 1];
      const { data: fuzzyProviders, error: fuzzyError } = await supabase
        .from("verified_providers")
        .select("*")
        .ilike("provider_name", `%${lastTerm}%`)
        .limit(10);
      
      if (!fuzzyError && fuzzyProviders && fuzzyProviders.length > 0) {
        // Score and rank by how many search terms match
        const scored = fuzzyProviders.map(p => {
          const nameLower = p.provider_name.toLowerCase();
          const matchCount = searchTerms.filter((term: string) => nameLower.includes(term)).length;
          return { ...p, matchScore: matchCount };
        }).filter(p => p.matchScore > 0)
          .sort((a, b) => b.matchScore - a.matchScore);
        
        providers = scored.slice(0, 5);
      }
    }

    if (dbError) {
      console.error("Database lookup error:", dbError);
    }

    // If we found a match in the database, return it
    if (providers && providers.length > 0) {
      const bestMatch = providers[0];
      
      // Format full address
      const addressParts = [
        bestMatch.street_address,
        bestMatch.city,
        bestMatch.state,
        bestMatch.zip
      ].filter(Boolean);
      const fullAddress = addressParts.join(", ");

      console.log(`Found verified provider: ${bestMatch.provider_name} at ${bestMatch.practice_name}`);

      return new Response(
        JSON.stringify({
          phone: bestMatch.phone || "",
          fax: bestMatch.fax || "",
          address: fullAddress,
          confidence: "high",
          note: `Verified: ${bestMatch.provider_name} at ${bestMatch.practice_name}`,
          source: "database"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("No database match found, falling back to AI lookup");

    // STEP 2: Fall back to AI lookup
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
Doctor Name: ${searchName}
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
        JSON.stringify({ ...result, source: "ai" }),
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
            JSON.stringify({ ...result, source: "ai" }),
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
        note: "Could not retrieve contact information",
        source: "none"
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
