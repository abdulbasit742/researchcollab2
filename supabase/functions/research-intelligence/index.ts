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
    // ACTION: parse_document
    // ============================================================
    if (action === "parse_document") {
      const { document_id } = body;
      const { data: doc, error: docErr } = await supabase
        .from("research_documents").select("*").eq("id", document_id).single();
      if (docErr || !doc) {
        return new Response(JSON.stringify({ error: "Document not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase.from("research_documents")
        .update({ processing_status: "processing" }).eq("id", document_id);

      const text = doc.extracted_text || "";
      if (!text) {
        await supabase.from("research_documents")
          .update({ processing_status: "failed" }).eq("id", document_id);
        return new Response(JSON.stringify({ error: "No text to parse" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const chunks = chunkText(text, 500, 50);
      const documentChunks = chunks.map((chunk, i) => ({
        chunk_id: `${document_id}_chunk_${i}`,
        text: chunk.text,
        start_index: chunk.start,
        end_index: chunk.end,
        section_index: i,
      }));

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

      await supabase.from("research_audit_log").insert({
        workspace_id: doc.workspace_id,
        user_id: user.id,
        action_type: "upload",
        entity_id: document_id,
        metadata: { chunk_count: documentChunks.length },
      });

      return jsonResponse({
        success: true,
        chunk_count: documentChunks.length,
        parsed_structure: parsedStructure,
      });
    }

    // ============================================================
    // ACTION: query — Source-grounded AI query
    // ============================================================
    if (action === "query") {
      const { workspace_id, query_text } = body;

      const { data: queryRec, error: qErr } = await supabase
        .from("research_queries")
        .insert({ workspace_id, user_id: user.id, query_text, status: "processing" })
        .select().single();
      if (qErr) throw qErr;

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

      const topChunks = rankChunks(docs, query_text, 10);

      const sourceContext = topChunks.map((c, i) =>
        `[Source ${i + 1} — ${c.doc_name}, Chunk ${c.chunk.section_index}]\n${c.chunk.text}`
      ).join("\n\n---\n\n");

      const aiResult = await callAI([
        {
          role: "system",
          content: `You are a research assistant. Answer ONLY based on the provided source documents. 
For every claim, cite the source using [Source N] format.
If information is not in the sources, say "Not found in provided sources."
Never make claims beyond what the sources support.
Rate your confidence from 0.0 to 1.0 at the end of your response as: [Confidence: X.X]`
        },
        { role: "user", content: `SOURCES:\n\n${sourceContext}\n\n---\n\nQUESTION: ${query_text}` }
      ]);
      if (aiResult.error) {
        await supabase.from("research_queries").update({ status: "failed" }).eq("id", queryRec.id);
        return new Response(JSON.stringify({ error: aiResult.error }), {
          status: aiResult.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const responseText = aiResult.text;
      const confMatch = responseText.match(/\[Confidence:\s*([\d.]+)\]/);
      const confidence = confMatch ? parseFloat(confMatch[1]) : 0.5;

      const citationMap = topChunks.map((c, i) => ({
        source_index: i + 1,
        document_id: c.doc_id,
        document_name: c.doc_name,
        chunk_id: c.chunk.chunk_id,
        section_index: c.chunk.section_index,
        text_preview: c.chunk.text.substring(0, 200),
        relevance_score: c.score,
      }));

      const { data: respRec } = await supabase.from("research_responses").insert({
        query_id: queryRec.id,
        ai_response: responseText,
        citation_map: citationMap,
        confidence_score: confidence,
        model_used: "google/gemini-3-flash-preview",
        token_count: aiResult.tokens || 0,
      }).select().single();

      await supabase.from("research_queries").update({ status: "completed" }).eq("id", queryRec.id);

      await supabase.from("research_audit_log").insert({
        workspace_id,
        user_id: user.id,
        action_type: "query",
        entity_id: queryRec.id,
        metadata: { citation_count: citationMap.length, confidence },
      });

      return jsonResponse({
        query_id: queryRec.id,
        response_id: respRec?.id,
        ai_response: responseText,
        citation_map: citationMap,
        confidence_score: confidence,
      });
    }

    // ============================================================
    // ACTION: extract_claims — Extract claims from all workspace documents
    // ============================================================
    if (action === "extract_claims") {
      const { workspace_id } = body;

      const { data: docs } = await supabase
        .from("research_documents")
        .select("id, file_name, document_chunks")
        .eq("workspace_id", workspace_id)
        .eq("processing_status", "completed")
        .eq("is_latest_version", true);

      if (!docs || docs.length === 0) {
        return jsonResponse({ error: "No processed documents" }, 400);
      }

      // Delete existing claims for fresh extraction
      await supabase.from("research_claims")
        .delete().eq("workspace_id", workspace_id);

      const allClaims: any[] = [];

      for (const doc of docs) {
        const chunks = (doc.document_chunks as any[]) || [];
        // Process in batches of 5 chunks
        for (let i = 0; i < chunks.length; i += 5) {
          const batch = chunks.slice(i, i + 5);
          const batchText = batch.map((c: any, idx: number) =>
            `[Chunk ${c.chunk_id}]\n${c.text}`
          ).join("\n\n---\n\n");

          const aiResult = await callAI([
            {
              role: "system",
              content: `Extract all distinct claims from the text chunks. For each claim output a JSON array.
Each claim object: {"chunk_id": "...", "claim_text": "...", "claim_type": "fact|hypothesis|conclusion|statistic|method|policy", "confidence": 0.0-1.0}
Return ONLY a valid JSON array. No markdown, no explanation.`
            },
            { role: "user", content: batchText }
          ]);

          if (!aiResult.error) {
            try {
              const cleaned = aiResult.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
              const claims = JSON.parse(cleaned);
              if (Array.isArray(claims)) {
                for (const claim of claims) {
                  allClaims.push({
                    workspace_id,
                    document_id: doc.id,
                    chunk_id: claim.chunk_id || batch[0]?.chunk_id || `unknown`,
                    claim_text: claim.claim_text,
                    claim_type: claim.claim_type || 'fact',
                    confidence_score: claim.confidence || 0.5,
                  });
                }
              }
            } catch { /* skip unparseable */ }
          }
        }
      }

      // Insert claims in batches
      if (allClaims.length > 0) {
        for (let i = 0; i < allClaims.length; i += 50) {
          await supabase.from("research_claims").insert(allClaims.slice(i, i + 50));
        }
      }

      await supabase.from("research_audit_log").insert({
        workspace_id,
        user_id: user.id,
        action_type: "claim_extraction",
        metadata: { total_claims: allClaims.length },
      });

      return jsonResponse({ success: true, total_claims: allClaims.length });
    }

    // ============================================================
    // ACTION: cross_synthesize — Detect contradictions, consensus, gaps
    // ============================================================
    if (action === "cross_synthesize") {
      const { workspace_id } = body;

      // Fetch all claims
      const { data: claims } = await supabase
        .from("research_claims")
        .select("id, document_id, chunk_id, claim_text, claim_type, confidence_score")
        .eq("workspace_id", workspace_id);

      if (!claims || claims.length < 2) {
        return jsonResponse({ error: "Need at least 2 claims. Extract claims first." }, 400);
      }

      // Get doc names for context
      const docIds = [...new Set(claims.map(c => c.document_id))];
      const { data: docs } = await supabase
        .from("research_documents")
        .select("id, file_name")
        .in("id", docIds);
      const docMap = Object.fromEntries((docs || []).map(d => [d.id, d.file_name]));

      // Build claim summary for AI
      const claimSummary = claims.map(c =>
        `[Claim ${c.id}] (${c.claim_type}, from "${docMap[c.document_id] || 'unknown'}"): ${c.claim_text}`
      ).join("\n");

      const aiResult = await callAI([
        {
          role: "system",
          content: `You are a research synthesis engine. Analyze the claims below and produce a JSON object with:
{
  "relationships": [{"claim_a": "uuid", "claim_b": "uuid", "type": "reinforces|contradicts|related|extends", "similarity": 0.0-1.0, "reasoning": "..."}],
  "consensus_clusters": [{"topic": "...", "consensus_level": "high|medium|low|contested", "claim_ids": ["uuid",...], "summary": "..."}],
  "contradictions": [{"claim_a": "uuid", "claim_b": "uuid", "nature": "...", "possible_cause": "..."}],
  "research_gaps": [{"topic": "...", "description": "...", "severity": "high|medium|low"}],
  "evidence_scores": [{"claim_id": "uuid", "score": 0.0-1.0, "reasoning": "..."}]
}
Return ONLY valid JSON. No markdown, no explanation. Use the exact claim IDs provided.`
        },
        { role: "user", content: `CLAIMS (${claims.length} total):\n\n${claimSummary}` }
      ]);

      if (aiResult.error) {
        return jsonResponse({ error: aiResult.error }, aiResult.status || 500);
      }

      let synthesis: any;
      try {
        const cleaned = aiResult.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        synthesis = JSON.parse(cleaned);
      } catch {
        return jsonResponse({ error: "AI returned unparseable synthesis" }, 500);
      }

      // Delete old relationships
      await supabase.from("claim_relationships").delete().eq("workspace_id", workspace_id);

      // Insert relationships
      const rels = (synthesis.relationships || [])
        .filter((r: any) => r.claim_a && r.claim_b)
        .map((r: any) => ({
          workspace_id,
          claim_id_a: r.claim_a,
          claim_id_b: r.claim_b,
          relationship_type: r.type || 'related',
          similarity_score: r.similarity || 0,
          ai_reasoning: r.reasoning || null,
        }));

      if (rels.length > 0) {
        for (let i = 0; i < rels.length; i += 50) {
          await supabase.from("claim_relationships").insert(rels.slice(i, i + 50));
        }
      }

      // Update evidence scores
      for (const es of (synthesis.evidence_scores || [])) {
        if (es.claim_id) {
          await supabase.from("research_claims")
            .update({ evidence_strength: es.score || 0 })
            .eq("id", es.claim_id);
        }
      }

      await supabase.from("research_audit_log").insert({
        workspace_id,
        user_id: user.id,
        action_type: "cross_synthesis",
        metadata: {
          relationships: rels.length,
          consensus_clusters: synthesis.consensus_clusters?.length || 0,
          contradictions: synthesis.contradictions?.length || 0,
          gaps: synthesis.research_gaps?.length || 0,
        },
      });

      return jsonResponse({
        success: true,
        relationships_count: rels.length,
        consensus_clusters: synthesis.consensus_clusters || [],
        contradictions: synthesis.contradictions || [],
        research_gaps: synthesis.research_gaps || [],
        evidence_scores: synthesis.evidence_scores || [],
      });
    }

    // ============================================================
    // ACTION: generate_synthesis_report
    // ============================================================
    if (action === "generate_synthesis_report") {
      const { workspace_id, report_type = "synthesis", title } = body;

      // Fetch claims and relationships
      const [claimsRes, relsRes] = await Promise.all([
        supabase.from("research_claims")
          .select("id, document_id, claim_text, claim_type, confidence_score, evidence_strength")
          .eq("workspace_id", workspace_id),
        supabase.from("claim_relationships")
          .select("claim_id_a, claim_id_b, relationship_type, similarity_score, ai_reasoning")
          .eq("workspace_id", workspace_id),
      ]);

      const claims = claimsRes.data || [];
      const rels = relsRes.data || [];

      if (claims.length === 0) {
        return jsonResponse({ error: "No claims extracted yet" }, 400);
      }

      // Get doc names
      const docIds = [...new Set(claims.map(c => c.document_id))];
      const { data: docs } = await supabase
        .from("research_documents").select("id, file_name").in("id", docIds);
      const docMap = Object.fromEntries((docs || []).map(d => [d.id, d.file_name]));

      const claimText = claims.map(c =>
        `[${c.id}] (${c.claim_type}, evidence: ${c.evidence_strength}, doc: "${docMap[c.document_id] || 'unknown'}"): ${c.claim_text}`
      ).join("\n");

      const relText = rels.map(r =>
        `${r.claim_id_a} ${r.relationship_type} ${r.claim_id_b} (similarity: ${r.similarity_score})`
      ).join("\n");

      const promptMap: Record<string, string> = {
        synthesis: "Generate a comprehensive research synthesis report",
        policy_brief: "Generate a policy brief based on the research claims",
        grant_foundation: "Generate a grant application foundation document",
        gap_analysis: "Generate a research gap analysis report",
      };

      const aiResult = await callAI([
        {
          role: "system",
          content: `${promptMap[report_type] || promptMap.synthesis}. Structure it with these sections:
1. Topic Overview
2. High-Consensus Findings
3. Contested Areas
4. Methodological Differences
5. Quantitative Variance Summary
6. Identified Research Gaps
7. Suggested Future Research Directions

Use markdown formatting. Cite claims using their IDs. Every statement must be traceable.`
        },
        {
          role: "user",
          content: `CLAIMS:\n${claimText}\n\nRELATIONSHIPS:\n${relText}`
        }
      ]);

      if (aiResult.error) {
        return jsonResponse({ error: aiResult.error }, aiResult.status || 500);
      }

      const reportContent = {
        markdown: aiResult.text,
        claim_count: claims.length,
        relationship_count: rels.length,
        generated_at: new Date().toISOString(),
      };

      const { data: report, error: repErr } = await supabase
        .from("research_synthesis_reports")
        .insert({
          workspace_id,
          generated_by: user.id,
          title: title || `${report_type} Report — ${new Date().toLocaleDateString()}`,
          report_type,
          content: reportContent,
          claim_ids: claims.map(c => c.id),
        })
        .select().single();

      if (repErr) throw repErr;

      await supabase.from("research_audit_log").insert({
        workspace_id,
        user_id: user.id,
        action_type: "synthesis_report",
        entity_id: report.id,
        metadata: { report_type, claim_count: claims.length },
      });

      return jsonResponse({ success: true, report });
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

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callAI(messages: Array<{ role: string; content: string }>) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return { error: "LOVABLE_API_KEY not configured", status: 500, text: "", tokens: 0 };

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("AI error:", response.status, errText);
    if (response.status === 429) return { error: "Rate limit exceeded. Please try again later.", status: 429, text: "", tokens: 0 };
    if (response.status === 402) return { error: "AI credits exhausted. Please add credits.", status: 402, text: "", tokens: 0 };
    return { error: "AI query failed", status: 500, text: "", tokens: 0 };
  }

  const data = await response.json();
  return {
    error: null,
    status: 200,
    text: data.choices?.[0]?.message?.content || "",
    tokens: data.usage?.total_tokens || 0,
  };
}

function rankChunks(docs: any[], queryText: string, limit: number) {
  const queryTerms = queryText.toLowerCase().split(/\s+/).filter((t: string) => t.length > 2);
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

  allChunks.sort((a, b) => b.score - a.score);
  return allChunks.slice(0, limit);
}

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
    if (trimmed.startsWith("#")) {
      headings.push(trimmed.replace(/^#+\s*/, ""));
    } else if (trimmed.length > 3 && trimmed.length < 100 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
      headings.push(trimmed);
    }
  }
  return headings;
}
