import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Institution Onboarding Agent — AI-guided setup for universities joining RCollab.
 * Steps: intro → institution_details → departments → labs → faculty → verification → complete
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { session_id, user_message, contact_id, conversation_id, channel_type } = await req.json();

    if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured");

    // Load existing session or create new
    let session: any = null;
    if (session_id) {
      const { data } = await supabase.from("omni_institution_onboarding_sessions")
        .select("*").eq("id", session_id).single();
      session = data;
    }

    const currentStep = session?.onboarding_step || "intro";
    const collectedData = {
      institution_name: session?.institution_name || "",
      institution_type: session?.institution_type || "",
      country: session?.country || "",
      departments: session?.departments || [],
      labs: session?.labs || [],
      faculty_contacts: session?.faculty_contacts || [],
    };

    const stepPrompts: Record<string, string> = {
      intro: "Welcome the institution representative. Ask for their institution name, type (university, research institute, polytechnic, college), and country.",
      institution_details: "The user is providing institution details. Extract institution_name, institution_type, and country. Ask about departments they want to register.",
      departments: "The user is listing departments. Extract department names into an array. Ask about research labs.",
      labs: "The user is listing labs. Extract lab names and their associated departments. Ask about key faculty contacts.",
      faculty: "The user is providing faculty contacts. Extract names, emails, and roles. Summarize everything and confirm.",
      verification: "Summarize all collected information and ask the user to confirm before submitting for verification.",
      complete: "Thank the user. Their institution registration is being processed.",
    };

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an institution onboarding specialist for RCollab, a global research execution platform.
You are guiding a university representative through registration.

Current step: ${currentStep}
Instruction: ${stepPrompts[currentStep]}
Data collected so far: ${JSON.stringify(collectedData)}

Extract any new information from the user's message and provide a friendly, professional response.
Always determine what the next_step should be based on completeness of data.`
          },
          { role: "user", content: user_message || "Hello, I want to register my institution" }
        ],
        tools: [{
          type: "function",
          function: {
            name: "process_onboarding",
            description: "Process institution onboarding step",
            parameters: {
              type: "object",
              properties: {
                response_message: { type: "string", description: "Friendly response to the user" },
                next_step: { type: "string", enum: ["intro", "institution_details", "departments", "labs", "faculty", "verification", "complete"] },
                extracted_data: {
                  type: "object",
                  properties: {
                    institution_name: { type: "string" },
                    institution_type: { type: "string" },
                    country: { type: "string" },
                    departments: { type: "array", items: { type: "string" } },
                    labs: { type: "array", items: { type: "object", properties: { name: { type: "string" }, department: { type: "string" } } } },
                    faculty_contacts: { type: "array", items: { type: "object", properties: { name: { type: "string" }, email: { type: "string" }, role: { type: "string" } } } },
                  },
                },
                completion_pct: { type: "number" },
              },
              required: ["response_message", "next_step", "completion_pct"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "process_onboarding" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let result: any = {};
    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    }

    const extracted = result.extracted_data || {};
    const updatedData = {
      institution_name: extracted.institution_name || collectedData.institution_name,
      institution_type: extracted.institution_type || collectedData.institution_type,
      country: extracted.country || collectedData.country,
      departments: extracted.departments?.length ? extracted.departments : collectedData.departments,
      labs: extracted.labs?.length ? extracted.labs : collectedData.labs,
      faculty_contacts: extracted.faculty_contacts?.length ? extracted.faculty_contacts : collectedData.faculty_contacts,
      onboarding_step: result.next_step || currentStep,
      completion_pct: result.completion_pct || 0,
      ai_summary: result.response_message,
      updated_at: new Date().toISOString(),
    };

    let savedSession: any;
    if (session_id && session) {
      const { data, error } = await supabase.from("omni_institution_onboarding_sessions")
        .update(updatedData).eq("id", session_id).select().single();
      if (error) throw error;
      savedSession = data;
    } else {
      const { data, error } = await supabase.from("omni_institution_onboarding_sessions")
        .insert({ ...updatedData, contact_id, conversation_id, channel_type: channel_type || "webchat" })
        .select().single();
      if (error) throw error;
      savedSession = data;
    }

    return new Response(JSON.stringify({
      success: true,
      session_id: savedSession.id,
      response_message: result.response_message,
      current_step: result.next_step,
      completion_pct: result.completion_pct,
      collected_data: updatedData,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("institution-onboarding-agent error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
