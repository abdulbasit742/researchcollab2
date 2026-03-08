import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Channel Webhook Gateway — Receives inbound messages from WhatsApp, Instagram, Email
 * and normalizes them into the omni_messages format for processing by the AI agent.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const url = new URL(req.url);
    const channel = url.searchParams.get("channel") || "unknown";
    const payload = await req.json();

    // Log the raw webhook
    await supabase.from("omni_webhook_logs").insert({
      channel,
      external_id: payload.external_id || payload.from || null,
      payload,
      processed: false,
    });

    // Normalize message based on channel
    let normalized: {
      channel_type: string;
      external_user_id: string;
      sender_name: string | null;
      message_content: string;
      attachments: any[];
      timestamp: string;
    };

    switch (channel) {
      case "whatsapp":
        // WhatsApp Business API webhook format
        const waMsg = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
        normalized = {
          channel_type: "whatsapp",
          external_user_id: waMsg?.from || payload.from || "unknown",
          sender_name: payload.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name || null,
          message_content: waMsg?.text?.body || payload.text || payload.message || "",
          attachments: waMsg?.image ? [{ type: "image", url: waMsg.image.id }] : [],
          timestamp: new Date().toISOString(),
        };
        break;

      case "instagram":
        // Instagram Messaging API format
        const igMsg = payload.entry?.[0]?.messaging?.[0];
        normalized = {
          channel_type: "instagram",
          external_user_id: igMsg?.sender?.id || payload.sender_id || "unknown",
          sender_name: null,
          message_content: igMsg?.message?.text || payload.message || "",
          attachments: igMsg?.message?.attachments || [],
          timestamp: new Date().toISOString(),
        };
        break;

      case "email":
        normalized = {
          channel_type: "email",
          external_user_id: payload.from_email || payload.from || "unknown",
          sender_name: payload.from_name || null,
          message_content: payload.body || payload.text || payload.html || "",
          attachments: payload.attachments || [],
          timestamp: payload.date || new Date().toISOString(),
        };
        break;

      default:
        normalized = {
          channel_type: channel,
          external_user_id: payload.user_id || payload.from || "unknown",
          sender_name: payload.name || null,
          message_content: payload.message || payload.text || payload.content || "",
          attachments: [],
          timestamp: new Date().toISOString(),
        };
    }

    // Resolve or create contact
    let contact;
    const { data: existingContact } = await supabase
      .from("omni_contacts")
      .select("*")
      .or(`external_ids->>whatsapp.eq.${normalized.external_user_id},external_ids->>instagram.eq.${normalized.external_user_id},email.eq.${normalized.external_user_id}`)
      .maybeSingle();

    if (existingContact) {
      contact = existingContact;
    } else {
      const isEmail = normalized.channel_type === "email";
      const { data: newContact, error: contactError } = await supabase.from("omni_contacts").insert({
        display_name: normalized.sender_name || `${channel} User`,
        ...(isEmail ? { email: normalized.external_user_id } : {}),
        preferred_channel: channel,
        contact_type: "anonymous",
        lead_status: "new",
      }).select().single();
      if (contactError) throw contactError;
      contact = newContact;
    }

    // Find or create conversation
    const { data: existingConv } = await supabase
      .from("omni_conversations")
      .select("*")
      .eq("contact_id", contact.id)
      .eq("channel_type", normalized.channel_type)
      .in("status", ["open", "pending", "escalated"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let conversation = existingConv;
    if (!conversation) {
      const { data: newConv, error: convError } = await supabase.from("omni_conversations").insert({
        contact_id: contact.id,
        channel_type: normalized.channel_type,
        status: "open",
        assigned_agent: "ai",
      }).select().single();
      if (convError) throw convError;
      conversation = newConv;
    }

    // Insert message
    await supabase.from("omni_messages").insert({
      conversation_id: conversation.id,
      contact_id: contact.id,
      content: normalized.message_content,
      direction: "inbound",
      sender_type: "contact",
      channel_type: normalized.channel_type,
    });

    // Update conversation timestamp
    await supabase.from("omni_conversations").update({
      last_message_at: new Date().toISOString(),
    }).eq("id", conversation.id);

    // Mark webhook as processed
    await supabase.from("omni_webhook_logs").update({ processed: true })
      .eq("channel", channel)
      .eq("processed", false)
      .order("received_at", { ascending: false })
      .limit(1);

    // Log analytics event
    await supabase.from("omni_analytics_events").insert({
      event_type: "inbound_webhook",
      channel: normalized.channel_type,
      contact_id: contact.id,
      conversation_id: conversation.id,
      metadata: { external_user_id: normalized.external_user_id },
    });

    return new Response(JSON.stringify({
      success: true,
      contact_id: contact.id,
      conversation_id: conversation.id,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("webhook-gateway error:", e);
    return new Response(JSON.stringify({
      error: e instanceof Error ? e.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
