import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BriefingRequest {
  type: "week_review" | "deal_status" | "network_pulse";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT via anon client
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsError || !claimsData?.claims?.sub) {
      throw new Error("Unauthorized");
    }
    const user = { id: claimsData.claims.sub as string };

    const { type }: BriefingRequest = await req.json();

    // Gather data based on briefing type
    let briefingData: Record<string, unknown> = {};
    let briefingText = "";
    let title = "";

    switch (type) {
      case "week_review": {
        title = "Your Week in Review";
        
        // Get recent activity counts
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        
        const [messagesResult, connectionsResult, dealsResult] = await Promise.all([
          supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("sender_id", user.id)
            .gte("created_at", weekAgo),
          supabase
            .from("connection_requests")
            .select("id", { count: "exact", head: true })
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .eq("status", "accepted")
            .gte("updated_at", weekAgo),
          supabase
            .from("offer_interest")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .gte("created_at", weekAgo),
        ]);

        const messageCount = messagesResult.count || 0;
        const newConnections = connectionsResult.count || 0;
        const dealInteractions = dealsResult.count || 0;

        briefingData = { messageCount, newConnections, dealInteractions };

        if (messageCount === 0 && newConnections === 0 && dealInteractions === 0) {
          briefingText = `Hello! This is your week in review. It looks like things have been quiet this week. Consider reaching out to your network or exploring new opportunities on the platform. Staying active helps build trust and visibility with potential collaborators.`;
        } else {
          briefingText = `Hello! Here's your week in review. You sent ${messageCount} messages this week, ${messageCount > 5 ? "showing great engagement" : "a good start"}. ${newConnections > 0 ? `You made ${newConnections} new connections, expanding your professional network.` : ""} ${dealInteractions > 0 ? `You showed interest in ${dealInteractions} opportunities.` : ""} Keep up the momentum!`;
        }
        break;
      }

      case "deal_status": {
        title = "Deal Status Update";
        
        // Get active deals
        const { data: interests } = await supabase
          .from("offer_interest")
          .select(`
            id,
            status,
            offer:offers(title, status)
          `)
          .eq("user_id", user.id)
          .in("status", ["pending", "accepted", "negotiating"]);

        const activeDeals = interests?.filter(i => i.offer) || [];
        const pendingCount = activeDeals.filter(d => d.status === "pending").length;
        const negotiatingCount = activeDeals.filter(d => d.status === "negotiating").length;
        const acceptedCount = activeDeals.filter(d => d.status === "accepted").length;

        briefingData = { activeDeals: activeDeals.length, pendingCount, negotiatingCount, acceptedCount };

        if (activeDeals.length === 0) {
          briefingText = `Hello! Your deal status update. You currently have no active deals in progress. Browse available opportunities to find your next collaboration.`;
        } else {
          briefingText = `Hello! Here's your deal status update. You have ${activeDeals.length} active deals. ${pendingCount > 0 ? `${pendingCount} are pending response.` : ""} ${negotiatingCount > 0 ? `${negotiatingCount} are in negotiation.` : ""} ${acceptedCount > 0 ? `${acceptedCount} have been accepted.` : ""} Check your deals page for details and next steps.`;
        }
        break;
      }

      case "network_pulse": {
        title = "Network Pulse";
        
        // Get connection stats
        const { count: totalConnections } = await supabase
          .from("connection_requests")
          .select("id", { count: "exact", head: true })
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .eq("status", "accepted");

        const { count: pendingRequests } = await supabase
          .from("connection_requests")
          .select("id", { count: "exact", head: true })
          .eq("receiver_id", user.id)
          .eq("status", "pending");

        const { count: recentMessages } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .neq("sender_id", user.id)
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        briefingData = { totalConnections, pendingRequests, recentMessages };

        briefingText = `Hello! Here's your network pulse. You have ${totalConnections || 0} connections in your network. ${pendingRequests ? `You have ${pendingRequests} pending connection requests waiting for your response.` : ""} ${recentMessages ? `You received ${recentMessages} messages in the last 24 hours.` : ""} ${!pendingRequests && !recentMessages ? "Your network is quiet. Consider reaching out to maintain your relationships." : ""}`;
        break;
      }

      default:
        throw new Error("Invalid briefing type");
    }

    const briefingId = crypto.randomUUID();
    const generatedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour expiry

    // Optional: Generate audio using ElevenLabs if API key is configured
    let audioUrl: string | undefined;
    const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");
    
    if (elevenLabsKey) {
      try {
        const voiceId = "JBFqnCBsd6RMkjVDRZzb"; // George - professional male voice
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: {
              "xi-api-key": elevenLabsKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: briefingText,
              model_id: "eleven_turbo_v2_5",
              voice_settings: {
                stability: 0.7,
                similarity_boost: 0.8,
                style: 0.3,
                use_speaker_boost: true,
              },
            }),
          }
        );

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer();
          const base64Audio = btoa(
            new Uint8Array(audioBuffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );
          audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
        }
      } catch (error) {
        console.error("ElevenLabs TTS failed:", error);
        // Continue without audio - client will use Web Speech API
      }
    }

    return new Response(
      JSON.stringify({
        id: briefingId,
        type,
        title,
        text: briefingText,
        audioUrl,
        generatedAt,
        expiresAt,
        data: briefingData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Briefing generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
