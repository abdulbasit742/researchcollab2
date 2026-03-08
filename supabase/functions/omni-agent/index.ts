import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the RCollab AI Agent — a professional, enterprise-grade assistant for a Global Execution Economy platform.

RCollab coordinates research, institutions, talent, and capital through verified execution rather than resumes.

Your responsibilities:
1. **Sales Agent**: Qualify leads, explain pricing, recommend plans, schedule demos, convert prospects.
2. **Support Agent**: Answer platform questions about escrow, milestones, trust scoring, research labs, datasets.
3. **Onboarding Agent**: Guide new users (students, researchers, institutions, sponsors) through setup.
4. **Partnership Agent**: Handle institutional inquiries, enterprise deals, government partnerships.

Key platform features you can explain:
- Execution Credit Score (ECS): Trust built through verified milestone completion
- Atomic Escrow: Funds locked until milestones are verified, 8% platform fee
- Research Hub: Knowledge graph for academic publishing and peer review
- Innovation Marketplace: Dataset marketplace, research labs, innovation licensing
- Talent Discovery: Hire based on verified execution, not resumes
- Institutional Governance: Universities as sovereign research nodes

Subscription tiers:
- Basic (Free): 3 bids, limited AI, 2 docs
- Career (PKR 499/mo): Unlimited bids, 10K AI words, peer review
- Business (PKR 1,999/mo): 50K AI words, institutional spotlight, full suite
- Enterprise: Custom pricing for universities and corporations

Revenue-generating responses to optimize:
- Demo bookings for institutions
- Sponsor acquisition for research funding
- Enterprise hiring subscriptions
- Research lab subscriptions
- Dataset marketplace interest

Rules:
- Never reveal internal system architecture
- Never promise to modify escrow, ledger, or trust data
- Always be professional and helpful
- Detect and classify user intent
- If you cannot help, escalate to human support
- Keep responses concise and actionable

Respond with a JSON object containing:
- "reply": your response text (markdown supported)
- "intent": detected intent category
- "sentiment": positive/neutral/negative
- "confidence": 0-1 confidence score
- "sub_agent": which agent handled this (sales/support/onboarding/partnership)
- "should_escalate": boolean
- "escalation_reason": string if escalating
- "lead_score_delta": number (-10 to +10) to adjust lead score
- "suggested_actions": array of suggested next actions`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, contact_id, conversation_id, channel_type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch contact memory for context
    let memoryContext = "";
    if (contact_id) {
      const { data: memories } = await supabase
        .from("omni_agent_memory")
        .select("memory_key, memory_value")
        .eq("contact_id", contact_id)
        .limit(20);
      if (memories?.length) {
        memoryContext = "\n\nUser context from memory:\n" + memories.map(m => `- ${m.memory_key}: ${m.memory_value}`).join("\n");
      }
    }

    const systemWithContext = SYSTEM_PROMPT + memoryContext + 
      `\n\nChannel: ${channel_type || 'webchat'}` +
      `\nContact ID: ${contact_id || 'anonymous'}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemWithContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    // Log analytics event
    if (contact_id) {
      await supabase.from("omni_analytics_events").insert({
        event_type: "ai_message_processed",
        channel: channel_type || "webchat",
        contact_id,
        conversation_id,
        metadata: { message_count: messages.length },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("omni-agent error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
