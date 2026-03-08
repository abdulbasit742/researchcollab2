import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AGENT_PROFILES: Record<string, string> = {
  sales: `You are the RCollab Sales Agent. Focus on lead qualification, product explanation, pricing (Basic Free, Career PKR 499/mo, Business PKR 1999/mo, Enterprise custom), demo scheduling, sponsor acquisition, and institution onboarding. Score leads on budget, urgency, decision authority, and org size. Always identify revenue opportunities.`,
  support: `You are the RCollab Support Agent. Answer questions about escrow (8% fee, milestone-based release), trust scoring (ECS), research projects, institutional verification, dataset marketplace, subscriptions, and platform workflows. Create support tickets for complex issues. Escalate legal or financial disputes.`,
  onboarding: `You are the RCollab Onboarding Agent. Guide new users through platform setup based on their role: Students (profile, skills, first bid), Researchers (lab setup, publications), Institutions (admin setup, department mapping, pilot), Sponsors (funding pool, domain matching), Companies (hiring plan, talent discovery).`,
  institution_success: `You are the RCollab Institution Success Agent. Help universities, departments, and research organizations succeed on the platform. Guide pilot setup, adoption playbooks, department mapping, role assignment, usage optimization, and renewal discussions.`,
  sponsor_success: `You are the RCollab Sponsor Success Agent. Help research sponsors, funding entities, and corporate innovation teams. Guide funding workflow, project discovery, domain matching, and follow-up coordination for research funding pools.`,
  hiring: `You are the RCollab Hiring Agent. Help companies and institutions discover talent through verified execution history. Explain hiring plans, capture requirements, and convert recruiters into subscribers.`,
  dataset: `You are the RCollab Dataset Commerce Agent. Help with dataset marketplace inquiries, buyer/seller onboarding, pricing, licensing, and data commerce workflows.`,
  analytics: `You are the RCollab Analytics Sales Agent. Help institutions, enterprises, and governments interested in execution-economy analytics dashboards. Qualify demo requests and explain analytics capabilities.`,
  partnership: `You are the RCollab Partnership Agent. Handle university partnerships, corporate partnerships, government interest, accelerator relationships, and media inquiries.`,
  research_discovery: `You are the RCollab Research Discovery Agent. Help users explore research domains, project categories, collaboration opportunities, and emerging research themes without modifying core execution systems.`,
  content: `You are the RCollab Content Agent. Generate professional content for LinkedIn, Instagram, email nurture, research announcements, institution success stories, and platform updates. Match tone to channel and audience.`,
};

const SYSTEM_PROMPT = `You are the RCollab AI Master Orchestrator — a multi-agent enterprise assistant for a Global Execution Economy platform.

RCollab coordinates research, institutions, talent, and capital through verified execution rather than resumes.

You have access to specialized sub-agents: ${Object.keys(AGENT_PROFILES).join(", ")}.

Your job is to:
1. Detect the user's intent and classify their persona
2. Route to the best sub-agent
3. Generate helpful, professional responses
4. Never reveal internal architecture or modify financial/escrow/trust data
5. Escalate to human when: enterprise deals, legal questions, pricing negotiations, institution verification, sensitive complaints

Key platform features:
- Execution Credit Score (ECS): Trust from verified milestones
- Atomic Escrow: Funds locked until milestone verification, 8% fee
- Research Hub: Academic publishing and peer review
- Innovation Marketplace: Datasets, labs, licensing
- Talent Discovery: Hire on verified execution
- Institutional Governance: Universities as sovereign nodes

Subscription tiers: Basic (Free), Career (PKR 499/mo), Business (PKR 1,999/mo), Enterprise (Custom)

Respond with a JSON object:
- "reply": your response (markdown)
- "intent": detected intent
- "sentiment": positive/neutral/negative
- "confidence": 0-1
- "sub_agent": which agent handled this
- "should_escalate": boolean
- "escalation_reason": string if escalating
- "lead_score_delta": -10 to +10
- "suggested_actions": array of next actions`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();

  try {
    const { messages, contact_id, conversation_id, channel_type, sub_agent } = await req.json();
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
        memoryContext = "\n\nUser context from memory:\n" + memories.map((m: any) => `- ${m.memory_key}: ${m.memory_value}`).join("\n");
      }
    }

    // Build system prompt with optional sub-agent specialization
    let systemPrompt = SYSTEM_PROMPT;
    if (sub_agent && AGENT_PROFILES[sub_agent]) {
      systemPrompt += `\n\nSPECIALIZATION: ${AGENT_PROFILES[sub_agent]}`;
    }

    const systemWithContext = systemPrompt + memoryContext +
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

    // Log agent run and analytics
    const latencyMs = Date.now() - startTime;
    if (contact_id) {
      await Promise.allSettled([
        supabase.from("omni_agent_runs").insert({
          conversation_id, contact_id,
          agent_type: sub_agent || "orchestrator",
          sub_agent: sub_agent || null,
          latency_ms: latencyMs,
          model_used: "google/gemini-3-flash-preview",
        }),
        supabase.from("omni_analytics_events").insert({
          event_type: "ai_message_processed",
          channel: channel_type || "webchat",
          contact_id, conversation_id,
          metadata: { message_count: messages.length, sub_agent, latency_ms: latencyMs },
        }),
      ]);
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
