import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.88.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { voiceNoteId } = await req.json();

    if (!voiceNoteId) {
      return new Response(
        JSON.stringify({ error: "voiceNoteId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the voice note record
    const { data: voiceNote, error: fetchError } = await supabase
      .from("voice_notes")
      .select("*")
      .eq("id", voiceNoteId)
      .single();

    if (fetchError || !voiceNote) {
      console.error("Failed to fetch voice note:", fetchError);
      return new Response(
        JSON.stringify({ error: "Voice note not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Download the audio file
    const { data: audioData, error: downloadError } = await supabase.storage
      .from("voice-notes")
      .download(voiceNote.storage_path);

    if (downloadError || !audioData) {
      console.error("Failed to download audio:", downloadError);
      return new Response(
        JSON.stringify({ error: "Failed to download audio file" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert audio to base64 for AI processing
    const arrayBuffer = await audioData.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    // Determine mime type from file extension
    const extension = voiceNote.storage_path.split(".").pop()?.toLowerCase();
    const mimeType = extension === "webm" ? "audio/webm" : "audio/mp4";

    // Use Lovable AI for transcription with Gemini's audio capabilities
    if (!lovableApiKey) {
      console.warn("LOVABLE_API_KEY not configured, skipping transcription");
      return new Response(
        JSON.stringify({ message: "Transcription skipped - API key not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a professional transcription assistant. Transcribe the audio accurately, preserving the speaker's natural language and tone. Also analyze the sentiment of the audio on a scale from 0 (very negative) to 1 (very positive). Respond in JSON format with two fields:
- "transcript": the full transcription text
- "sentiment": a number between 0 and 1 representing the overall sentiment`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please transcribe this audio and analyze its sentiment."
              },
              {
                type: "input_audio",
                input_audio: {
                  data: base64Audio,
                  format: extension === "webm" ? "webm" : "mp4"
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI transcription failed:", aiResponse.status, errorText);
      
      // Don't fail the whole request, just log and continue
      return new Response(
        JSON.stringify({ message: "Transcription failed, will retry later" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ message: "No transcription content returned" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response
    let transcript = "";
    let sentimentScore = 0.5;

    try {
      const parsed = JSON.parse(content);
      transcript = parsed.transcript || "";
      sentimentScore = typeof parsed.sentiment === "number" 
        ? Math.max(0, Math.min(1, parsed.sentiment))
        : 0.5;
    } catch {
      // If JSON parsing fails, treat the whole content as transcript
      transcript = content;
    }

    // Update the voice note with transcript and sentiment
    const { error: updateError } = await supabase
      .from("voice_notes")
      .update({
        transcript,
        sentiment_score: sentimentScore,
      })
      .eq("id", voiceNoteId);

    if (updateError) {
      console.error("Failed to update voice note:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to save transcription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        transcript,
        sentiment_score: sentimentScore,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Transcription error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
