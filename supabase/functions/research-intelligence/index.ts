import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.88.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    ).auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // ============================================================
    // ACTION: parse_document — Extract text + chunk document
    // ============================================================
    if (action === "parse_document") {
      const { document_id } = body;

      // Get document record
      const { data: doc, error: docErr } = await supabase
        .from("research_documents")
        .select("*")
        .eq("id", document_id)
        .single();
      if (docErr || !doc) {
        return new Response(JSON.stringify({ error: "Document not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update processing status
      await supabase.from("research_documents")
        .update({ processing_status: "processing" })
        .eq("id", document_id);

      // For now, if extracted_text is already provided (client-side extraction), chunk it
      const text = doc.extracted_text || "";
      if (!text) {
        await supabase.from("research_documents")
          .update({ processing_status: "failed" })
          .eq("id", document_id);
        return new Response(JSON.stringify({ error: "No text to parse" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Chunk text into ~500 char segments with overlap
      const chunks = chunkText(text, 500, 50);
      const documentChunks = chunks.map((chunk, i) => ({
        chunk_id: `${document_id}_chunk_${i}`,
        text: chunk.text,
        start_index: chunk.start,
        end_index: chunk.end,
        section_index: i,
      }));

      // Parse basic structure
      const parsedStructure = {
        total_chars: text.length,
        total_chunks: documentChunks.length,
        headings: extractHeadings(text),
        paragraph_count: text.split(/\n\n+/).length,
      };

      await supabase.from("research_documents").update({
        document_chunks: documentChunks,
        chunk_count: documentChunks.length,
        parsed_structure: parsedStructure,
        processing_status: "completed",
      }).eq("id", document_id);

      // Log audit
      await supabase.from("research_audit_log").insert({
        workspace_id: doc.workspace_id,
        user_id: user.id,
        action_type: "upload",
        entity_id: document_id,
        metadata: { chunk_count: documentChunks.length },
      });

      return new Response(JSON.stringify({
        success: true,
        chunk_count: documentChunks.length,
        parsed_structure: parsedStructure,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ============================================================
    // ACTION: query — Source-grounded AI query
    // ============================================================
    if (action === "query") {
      const { workspace_id, query_text } = body;

      // Insert query record
      const { data: queryRec, error: qErr } = await supabase
        .from("research_queries")
        .insert({ workspace_id, user_id: user.id, query_text, status: "processing" })
        .select()
        .single();
      if (qErr) throw qErr;

      // Fetch all documents in workspace
      const { data: docs } = await supabase
        .from("research_documents")
        .select("id, file_name, document_chunks, extracted_text")
        .eq("workspace_id", workspace_id)
        .eq("processing_status", "completed")
        .eq("is_latest_version", true);

      if (!docs || docs.length === 0) {
        await supabase.from("research_queries").update({ status: "failed" }).eq("id", queryRec.id);
        return new Response(JSON.stringify({ error: "No processed documents in workspace" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Simple keyword relevance scoring (semantic search placeholder)
      const queryTerms = query_text.toLowerCase().split(/\s+/).filter((t: string) => t.length > 2);
      const allChunks: Array<{ chunk: any; doc_id: string; doc_name: string; score: number }> = [];

      for (const doc of docs) {
        const chunks = (doc.document_chunks as any[]) || [];
        for (const chunk of chunks) {
          const text = (chunk.text || "").toLowerCase();
          let score = 0;
          for (const term of queryTerms) {
            if (text.includes(term)) score += 1;
          }
          if (score > 0) {
            allChunks.push({ chunk, doc_id: doc.id, doc_name: doc.file_name, score });
          }
        }
      }

      // Sort by relevance, take top 10
      allChunks.sort((a, b) => b.score - a.score);
      const topChunks = allChunks.slice(0, 10);

      // Build context for AI
      const sourceContext = topChunks.map((c, i) =>
        `[Source ${i + 1} — ${c.doc_name}, Chunk ${c.chunk.section_index}]\n${c.chunk.text}`
      ).join("\n\n---\n\n");

      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are a research assistant. Answer ONLY based on the provided source documents. 
For every claim, cite the source using [Source N] format.
If information is not in the sources, say "Not found in provided sources."
Never make claims beyond what the sources support.
Rate your confidence from 0.0 to 1.0 at the end of your response as: [Confidence: X.X]`
            },
            {
              role: "user",
              content: `SOURCES:\n\n${sourceContext}\n\n---\n\nQUESTION: ${query_text}`
            }
          ],
        }),
      });

      if (!aiResponse.ok) {
        const status = aiResponse.status;
        const errText = await aiResponse.text();
        console.error("AI error:", status, errText);
        await supabase.from("research_queries").update({ status: "failed" }).eq("id", queryRec.id);

        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI query failed");
      }

      const aiData = await aiResponse.json();
      const responseText = aiData.choices?.[0]?.message?.content || "";

      // Extract confidence score
      const confMatch = responseText.match(/\[Confidence:\s*([\d.]+)\]/);
      const confidence = confMatch ? parseFloat(confMatch[1]) : 0.5;

      // Build citation map
      const citationMap = topChunks.map((c, i) => ({
        source_index: i + 1,
        document_id: c.doc_id,
        document_name: c.doc_name,
        chunk_id: c.chunk.chunk_id,
        section_index: c.chunk.section_index,
        text_preview: c.chunk.text.substring(0, 200),
        relevance_score: c.score,
      }));

      // Save response
      const { data: respRec } = await supabase.from("research_responses").insert({
        query_id: queryRec.id,
        ai_response: responseText,
        citation_map: citationMap,
        confidence_score: confidence,
        model_used: "google/gemini-3-flash-preview",
        token_count: aiData.usage?.total_tokens || 0,
      }).select().single();

      // Update query status
      await supabase.from("research_queries").update({ status: "completed" }).eq("id", queryRec.id);

      // Log audit
      await supabase.from("research_audit_log").insert({
        workspace_id,
        user_id: user.id,
        action_type: "query",
        entity_id: queryRec.id,
        metadata: { citation_count: citationMap.length, confidence },
      });

      return new Response(JSON.stringify({
        query_id: queryRec.id,
        response_id: respRec?.id,
        ai_response: responseText,
        citation_map: citationMap,
        confidence_score: confidence,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("research-intelligence error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ============================================================
// UTILITIES
// ============================================================

function chunkText(text: string, chunkSize: number, overlap: number) {
  const chunks: Array<{ text: string; start: number; end: number }> = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    chunks.push({ text: text.slice(i, end), start: i, end });
    i += chunkSize - overlap;
  }
  return chunks;
}

function extractHeadings(text: string): string[] {
  const lines = text.split("\n");
  const headings: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    // Detect markdown headings or short ALL-CAPS lines
    if (trimmed.startsWith("#")) {
      headings.push(trimmed.replace(/^#+\s*/, ""));
    } else if (trimmed.length > 3 && trimmed.length < 100 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
      headings.push(trimmed);
    }
  }
  return headings;
}
