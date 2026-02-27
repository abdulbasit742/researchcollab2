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

      // Save consensus history for each cluster
      const { data: latestVersion } = await supabase
        .from("workspace_versions")
        .select("version_number")
        .eq("workspace_id", workspace_id)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();
      const currentVersion = (latestVersion?.version_number || 0) + 1;

      // Insert consensus history entries
      for (const cluster of (synthesis.consensus_clusters || [])) {
        await supabase.from("topic_consensus_history").insert({
          workspace_id,
          topic: cluster.topic,
          version_number: currentVersion,
          consensus_score: cluster.consensus_level === "high" ? 0.9 : cluster.consensus_level === "medium" ? 0.6 : cluster.consensus_level === "low" ? 0.3 : 0.1,
          reinforcement_count: (synthesis.relationships || []).filter((r: any) => r.type === "reinforces" && cluster.claim_ids?.includes(r.claim_a)).length,
          contradiction_count: (synthesis.contradictions || []).filter((c: any) => cluster.claim_ids?.includes(c.claim_a)).length,
          evidence_density: (synthesis.evidence_scores || []).filter((e: any) => cluster.claim_ids?.includes(e.claim_id)).reduce((sum: number, e: any) => sum + (e.score || 0), 0) / Math.max(cluster.claim_ids?.length || 1, 1),
          claim_count: cluster.claim_ids?.length || 0,
        });
      }

      // Auto-create workspace version snapshot
      await supabase.from("workspace_versions").insert({
        workspace_id,
        version_number: currentVersion,
        summary_snapshot: `Cross-synthesis: ${rels.length} relationships, ${(synthesis.consensus_clusters || []).length} clusters, ${(synthesis.contradictions || []).length} contradictions`,
        consensus_snapshot: synthesis.consensus_clusters || [],
        claim_graph_snapshot: { relationships: rels.length, contradictions: (synthesis.contradictions || []).length, gaps: (synthesis.research_gaps || []).length },
        document_count: docIds.length,
        claim_count: claims.length,
        created_by: user.id,
      });

      await supabase.from("research_audit_log").insert({
        workspace_id,
        user_id: user.id,
        action_type: "cross_synthesis",
        metadata: {
          version: currentVersion,
          relationships: rels.length,
          consensus_clusters: synthesis.consensus_clusters?.length || 0,
          contradictions: synthesis.contradictions?.length || 0,
          gaps: synthesis.research_gaps?.length || 0,
        },
      });

      return jsonResponse({
        success: true,
        version_number: currentVersion,
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

    // ============================================================
    // ACTION: create_version_snapshot
    // ============================================================
    if (action === "create_version_snapshot") {
      const { workspace_id, summary } = body;

      const { data: latestVersion } = await supabase
        .from("workspace_versions")
        .select("version_number")
        .eq("workspace_id", workspace_id)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();
      const newVersion = (latestVersion?.version_number || 0) + 1;

      // Snapshot current state
      const [claimsRes, relsRes, docsRes] = await Promise.all([
        supabase.from("research_claims").select("*").eq("workspace_id", workspace_id),
        supabase.from("claim_relationships").select("*").eq("workspace_id", workspace_id),
        supabase.from("research_documents").select("id").eq("workspace_id", workspace_id).eq("is_latest_version", true),
      ]);

      const claims = claimsRes.data || [];
      const rels = relsRes.data || [];

      const { data: consensusHistory } = await supabase
        .from("topic_consensus_history")
        .select("*")
        .eq("workspace_id", workspace_id)
        .order("created_at", { ascending: false })
        .limit(20);

      const { data: version, error: vErr } = await supabase
        .from("workspace_versions")
        .insert({
          workspace_id,
          version_number: newVersion,
          summary_snapshot: summary || `Version ${newVersion} snapshot`,
          consensus_snapshot: consensusHistory || [],
          claim_graph_snapshot: {
            total_claims: claims.length,
            total_relationships: rels.length,
            claim_types: claims.reduce((acc: any, c: any) => { acc[c.claim_type] = (acc[c.claim_type] || 0) + 1; return acc; }, {}),
            relationship_types: rels.reduce((acc: any, r: any) => { acc[r.relationship_type] = (acc[r.relationship_type] || 0) + 1; return acc; }, {}),
          },
          document_count: docsRes.data?.length || 0,
          claim_count: claims.length,
          created_by: user.id,
        })
        .select().single();

      if (vErr) throw vErr;

      await supabase.from("research_audit_log").insert({
        workspace_id,
        user_id: user.id,
        action_type: "version_snapshot",
        entity_id: version.id,
        metadata: { version_number: newVersion },
      });

      return jsonResponse({ success: true, version });
    }

    // ============================================================
    // ACTION: lock_version
    // ============================================================
    if (action === "lock_version") {
      const { version_id } = body;

      const { error } = await supabase
        .from("workspace_versions")
        .update({ is_locked: true })
        .eq("id", version_id);

      if (error) throw error;
      return jsonResponse({ success: true });
    }

    // ============================================================
    // ACTION: archive_version
    // ============================================================
    if (action === "archive_version") {
      const { version_id } = body;

      const { error } = await supabase
        .from("workspace_versions")
        .update({ is_archived: true, is_locked: true })
        .eq("id", version_id);

      if (error) throw error;
      return jsonResponse({ success: true });
    }

    // ============================================================
    // ACTION: detect_consensus_shifts
    // ============================================================
    if (action === "detect_consensus_shifts") {
      const { workspace_id } = body;

      const { data: history } = await supabase
        .from("topic_consensus_history")
        .select("*")
        .eq("workspace_id", workspace_id)
        .order("version_number", { ascending: true });

      if (!history || history.length < 2) {
        return jsonResponse({ shifts: [], alerts: [] });
      }

      // Group by topic and detect shifts
      const topicMap: Record<string, any[]> = {};
      for (const h of history) {
        if (!topicMap[h.topic]) topicMap[h.topic] = [];
        topicMap[h.topic].push(h);
      }

      const shifts: any[] = [];
      const alerts: any[] = [];

      for (const [topic, entries] of Object.entries(topicMap)) {
        if (entries.length < 2) continue;
        const latest = entries[entries.length - 1];
        const previous = entries[entries.length - 2];
        const delta = latest.consensus_score - previous.consensus_score;

        if (Math.abs(delta) > 0.2) {
          shifts.push({
            topic,
            from_version: previous.version_number,
            to_version: latest.version_number,
            from_score: previous.consensus_score,
            to_score: latest.consensus_score,
            delta,
            direction: delta > 0 ? "strengthening" : "weakening",
          });

          if (Math.abs(delta) > 0.4) {
            alerts.push({
              topic,
              severity: "high",
              message: `Rapid consensus ${delta > 0 ? "strengthening" : "collapse"} detected for "${topic}" (Δ${(delta * 100).toFixed(0)}%)`,
            });
          }
        }
      }

      return jsonResponse({ shifts, alerts });
    }

    // ============================================================
    // ACTION: generate_funding_plan — Research-to-Capital conversion
    // ============================================================
    if (action === "generate_funding_plan") {
      const { workspace_id, plan_type = "grant", title, duration_months = 12 } = body;

      // Fetch claims and synthesis data
      const [claimsRes, relsRes] = await Promise.all([
        supabase.from("research_claims")
          .select("id, document_id, claim_text, claim_type, confidence_score, evidence_strength")
          .eq("workspace_id", workspace_id),
        supabase.from("claim_relationships")
          .select("claim_id_a, claim_id_b, relationship_type, similarity_score")
          .eq("workspace_id", workspace_id),
      ]);

      const claims = claimsRes.data || [];
      const rels = relsRes.data || [];

      if (claims.length === 0) {
        return jsonResponse({ error: "No claims extracted. Run claim extraction first." }, 400);
      }

      // Get doc names
      const docIds = [...new Set(claims.map(c => c.document_id))];
      const { data: docs } = await supabase
        .from("research_documents").select("id, file_name").in("id", docIds);
      const docMap = Object.fromEntries((docs || []).map(d => [d.id, d.file_name]));

      const claimSummary = claims.map(c =>
        `[Claim ${c.id}] (${c.claim_type}, evidence: ${c.evidence_strength || 0.5}, doc: "${docMap[c.document_id] || 'unknown'}"): ${c.claim_text}`
      ).join("\n");

      const planTypePrompts: Record<string, string> = {
        grant: "academic research grant proposal with institutional compliance",
        startup: "startup funding blueprint with investor-ready milestones",
        enterprise_rnd: "enterprise R&D budget with departmental allocations",
        policy: "public policy implementation funding plan with accountability measures",
      };

      const aiResult = await callAI([
        {
          role: "system",
          content: `You are a research-to-capital structuring engine. Generate a structured funding plan based on the research claims provided.
Output a JSON object with this structure:
{
  "problem_statement": "...(cite claim IDs)",
  "proposed_solution": "...(cite claim IDs)",
  "milestones": [
    {
      "title": "...",
      "description": "...",
      "linked_claim_ids": ["uuid",...],
      "budget_amount": number,
      "duration_days": number,
      "risk_level": "low|medium|high|critical",
      "deliverable": "...",
      "evidence_requirement": "...",
      "performance_metric": "..."
    }
  ],
  "budget_breakdown": [
    {"category": "personnel|equipment|software|research|compliance|contingency|travel|other", "amount": number, "justification": "..."}
  ],
  "total_budget": number,
  "risk_assessment": "...",
  "expected_outcomes": ["..."],
  "feasibility_notes": "..."
}
Plan type: ${planTypePrompts[plan_type] || planTypePrompts.grant}.
Duration: ${duration_months} months. Currency: PKR.
All budget amounts must sum to total_budget. Every milestone must cite research claim IDs. No fabricated costs — label assumptions clearly.
Return ONLY valid JSON.`
        },
        { role: "user", content: `RESEARCH CLAIMS (${claims.length} total):\n\n${claimSummary}` }
      ]);

      if (aiResult.error) {
        return jsonResponse({ error: aiResult.error }, aiResult.status || 500);
      }

      let plan: any;
      try {
        const cleaned = aiResult.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        plan = JSON.parse(cleaned);
      } catch {
        return jsonResponse({ error: "AI returned unparseable funding plan" }, 500);
      }

      // Insert funding plan
      const { data: fundingPlan, error: fpErr } = await supabase
        .from("funding_plans")
        .insert({
          workspace_id,
          owner_id: user.id,
          title: title || `${plan_type} Funding Plan — ${new Date().toLocaleDateString()}`,
          plan_type,
          total_budget: plan.total_budget || 0,
          duration_months,
          problem_statement: plan.problem_statement,
          proposed_solution: plan.proposed_solution,
          risk_score: 0.5,
          source_claim_ids: claims.map(c => c.id),
          ai_generation_metadata: {
            claim_count: claims.length,
            relationship_count: rels.length,
            risk_assessment: plan.risk_assessment,
            expected_outcomes: plan.expected_outcomes,
            feasibility_notes: plan.feasibility_notes,
            generated_at: new Date().toISOString(),
          },
        })
        .select().single();

      if (fpErr) throw fpErr;

      // Insert milestones
      const milestones = (plan.milestones || []).map((m: any, i: number) => ({
        funding_plan_id: fundingPlan.id,
        milestone_title: m.title,
        milestone_description: m.description,
        linked_research_claim_ids: m.linked_claim_ids || [],
        budget_amount: m.budget_amount || 0,
        expected_duration_days: m.duration_days || 30,
        risk_level: m.risk_level || 'medium',
        deliverable_description: m.deliverable,
        evidence_requirement: m.evidence_requirement,
        performance_metric: m.performance_metric,
        sort_order: i,
      }));

      if (milestones.length > 0) {
        await supabase.from("funding_plan_milestones").insert(milestones);
      }

      // Insert budget breakdown
      const budgetItems = (plan.budget_breakdown || []).map((b: any) => ({
        funding_plan_id: fundingPlan.id,
        category: b.category || 'other',
        amount: b.amount || 0,
        justification_text: b.justification,
      }));

      if (budgetItems.length > 0) {
        await supabase.from("funding_plan_budget_breakdown").insert(budgetItems);
      }

      // Create initial version snapshot
      await supabase.from("funding_plan_versions").insert({
        funding_plan_id: fundingPlan.id,
        version_number: 1,
        snapshot: { plan, milestones, budget_breakdown: budgetItems },
        change_summary: "Initial AI-generated plan",
        created_by: user.id,
      });

      await supabase.from("research_audit_log").insert({
        workspace_id,
        user_id: user.id,
        action_type: "funding_plan_generated",
        entity_id: fundingPlan.id,
        metadata: { plan_type, total_budget: plan.total_budget, milestone_count: milestones.length },
      });

      return jsonResponse({
        success: true,
        funding_plan: fundingPlan,
        milestones_count: milestones.length,
        budget_items_count: budgetItems.length,
      });
    }

    // ============================================================
    // ACTION: simulate_feasibility — Capital feasibility simulation
    // ============================================================
    if (action === "simulate_feasibility") {
      const { funding_plan_id } = body;

      const [planRes, msRes, budgetRes] = await Promise.all([
        supabase.from("funding_plans").select("*").eq("id", funding_plan_id).single(),
        supabase.from("funding_plan_milestones").select("*").eq("funding_plan_id", funding_plan_id).order("sort_order"),
        supabase.from("funding_plan_budget_breakdown").select("*").eq("funding_plan_id", funding_plan_id),
      ]);

      if (planRes.error || !planRes.data) return jsonResponse({ error: "Plan not found" }, 404);

      const plan = planRes.data;
      const milestones = msRes.data || [];
      const budget = budgetRes.data || [];

      const msSummary = milestones.map((m: any) =>
        `- ${m.milestone_title}: PKR ${m.budget_amount}, ${m.expected_duration_days} days, risk: ${m.risk_level}`
      ).join("\n");

      const budgetSummary = budget.map((b: any) =>
        `- ${b.category}: PKR ${b.amount} — ${b.justification_text || 'N/A'}`
      ).join("\n");

      const aiResult = await callAI([
        {
          role: "system",
          content: `You are a capital feasibility simulator. Analyze the funding plan and provide a structured feasibility assessment.
Return JSON:
{
  "feasibility_index": 0.0-1.0,
  "budget_adequacy": "adequate|tight|insufficient|generous",
  "timeline_realism": "realistic|optimistic|aggressive|conservative",
  "capital_burn_rate_monthly": number,
  "resource_gaps": ["..."],
  "risk_probability": 0.0-1.0,
  "scenarios": {
    "optimistic": {"completion_probability": 0.0-1.0, "budget_variance_pct": number, "timeline_variance_days": number},
    "neutral": {"completion_probability": 0.0-1.0, "budget_variance_pct": number, "timeline_variance_days": number},
    "conservative": {"completion_probability": 0.0-1.0, "budget_variance_pct": number, "timeline_variance_days": number}
  },
  "recommendations": ["..."],
  "capital_efficiency_projection": 0.0-1.0
}
Return ONLY valid JSON.`
        },
        {
          role: "user",
          content: `FUNDING PLAN: ${plan.title}\nType: ${plan.plan_type}\nTotal: PKR ${plan.total_budget}\nDuration: ${plan.duration_months} months\n\nMILESTONES:\n${msSummary}\n\nBUDGET:\n${budgetSummary}`
        }
      ]);

      if (aiResult.error) return jsonResponse({ error: aiResult.error }, aiResult.status || 500);

      let simulation: any;
      try {
        const cleaned = aiResult.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        simulation = JSON.parse(cleaned);
      } catch {
        return jsonResponse({ error: "AI returned unparseable simulation" }, 500);
      }

      // Update plan with scores
      await supabase.from("funding_plans").update({
        feasibility_index: simulation.feasibility_index || 0.5,
        risk_score: simulation.risk_probability || 0.5,
        ai_generation_metadata: {
          ...((plan.ai_generation_metadata as any) || {}),
          feasibility_simulation: simulation,
          simulated_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      }).eq("id", funding_plan_id);

      return jsonResponse({ success: true, simulation });
    }

    // ============================================================
    // ACTION: ai_methodology_review — AI-assisted methodology analysis
    // ============================================================
    if (action === "ai_methodology_review") {
      const { workspace_id, review_cycle_id, claim_ids } = body;

      // Fetch specified claims or all workspace claims
      let claimsQuery = supabase.from("research_claims")
        .select("id, document_id, chunk_id, claim_text, claim_type, confidence_score, evidence_strength")
        .eq("workspace_id", workspace_id);
      if (claim_ids?.length) claimsQuery = claimsQuery.in("id", claim_ids);
      const { data: claims } = await claimsQuery;

      if (!claims || claims.length === 0) {
        return jsonResponse({ error: "No claims found to review" }, 400);
      }

      const claimSummary = claims.map(c =>
        `[Claim ${c.id}] (${c.claim_type}, confidence: ${c.confidence_score}, evidence: ${c.evidence_strength || 'N/A'}): ${c.claim_text}`
      ).join("\n");

      const aiResult = await callAI([
        {
          role: "system",
          content: `You are a rigorous academic methodology reviewer. Analyze each claim and provide structured review feedback.
Return JSON:
{
  "reviews": [
    {
      "claim_id": "uuid",
      "methodology_score": 0.0-1.0,
      "issues": [
        {"type": "methodology|evidence|logic|clarity|compliance|bias", "severity": "low|medium|high|critical", "description": "..."}
      ],
      "strengths": ["..."],
      "reproducibility_assessment": "high|medium|low|unknown",
      "bias_indicators": ["..."],
      "missing_controls": ["..."],
      "statistical_validity": "strong|adequate|weak|not_applicable",
      "recommendation": "accept|minor_revision|major_revision|reject"
    }
  ],
  "overall_assessment": {
    "methodology_quality": 0.0-1.0,
    "evidence_density": 0.0-1.0,
    "logical_coherence": 0.0-1.0,
    "bias_risk": 0.0-1.0,
    "summary": "..."
  }
}
Return ONLY valid JSON. Be thorough but fair.`
        },
        { role: "user", content: `CLAIMS TO REVIEW:\n\n${claimSummary}` }
      ]);

      if (aiResult.error) return jsonResponse({ error: aiResult.error }, aiResult.status || 500);

      let analysis: any;
      try {
        const cleaned = aiResult.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        analysis = JSON.parse(cleaned);
      } catch {
        return jsonResponse({ error: "AI returned unparseable review" }, 500);
      }

      // If review_cycle_id provided, insert AI comments
      if (review_cycle_id && analysis.reviews) {
        const aiComments = [];
        for (const rev of analysis.reviews) {
          for (const issue of (rev.issues || [])) {
            aiComments.push({
              review_cycle_id,
              reviewer_id: user.id,
              claim_id: rev.claim_id,
              comment_text: issue.description,
              comment_type: issue.type || 'methodology',
              severity_level: issue.severity || 'medium',
              ai_analysis: { methodology_score: rev.methodology_score, recommendation: rev.recommendation },
            });
          }
        }
        if (aiComments.length > 0) {
          for (let i = 0; i < aiComments.length; i += 50) {
            await supabase.from("review_comments").insert(aiComments.slice(i, i + 50));
          }
        }
      }

      await supabase.from("research_audit_log").insert({
        workspace_id,
        user_id: user.id,
        action_type: "ai_methodology_review",
        metadata: { claim_count: claims.length, review_cycle_id },
      });

      return jsonResponse({ success: true, analysis });
    }

    // ============================================================
    // ACTION: generate_review_outcome — Weighted review decision
    // ============================================================
    if (action === "generate_review_outcome") {
      const { review_cycle_id } = body;

      // Fetch cycle, reviewers, and comments
      const [cycleRes, reviewersRes, commentsRes] = await Promise.all([
        supabase.from("peer_review_cycles").select("*").eq("id", review_cycle_id).single(),
        supabase.from("peer_review_reviewers").select("*").eq("review_cycle_id", review_cycle_id),
        supabase.from("review_comments").select("*").eq("review_cycle_id", review_cycle_id),
      ]);

      if (cycleRes.error || !cycleRes.data) return jsonResponse({ error: "Review cycle not found" }, 404);

      const reviewers = reviewersRes.data || [];
      const comments = commentsRes.data || [];

      if (comments.length === 0) return jsonResponse({ error: "No review comments submitted yet" }, 400);

      // Calculate weighted scores
      const reviewerWeightMap: Record<string, number> = {};
      for (const r of reviewers) reviewerWeightMap[r.reviewer_id] = r.review_weight;

      const severityScores: Record<string, number> = { low: 0.1, medium: 0.3, high: 0.6, critical: 1.0 };
      let totalWeightedSeverity = 0;
      let totalWeight = 0;
      const criticalCount = comments.filter(c => c.severity_level === 'critical').length;
      const highCount = comments.filter(c => c.severity_level === 'high').length;

      for (const c of comments) {
        const w = reviewerWeightMap[c.reviewer_id] || 1.0;
        totalWeightedSeverity += (severityScores[c.severity_level] || 0.3) * w;
        totalWeight += w;
      }

      const avgSeverity = totalWeight > 0 ? totalWeightedSeverity / totalWeight : 0;

      let decision: string;
      if (criticalCount > 0 || avgSeverity > 0.7) decision = 'reject';
      else if (highCount > 2 || avgSeverity > 0.4) decision = 'major_revision';
      else if (avgSeverity > 0.2) decision = 'minor_revision';
      else decision = 'approve';

      // AI summary
      const commentsSummary = comments.map(c => `[${c.comment_type}/${c.severity_level}]: ${c.comment_text}`).join("\n");
      const aiResult = await callAI([
        { role: "system", content: "Summarize peer review findings in 2-3 sentences. Be objective. Mention key strengths and weaknesses." },
        { role: "user", content: `Decision: ${decision}\nComments:\n${commentsSummary}` }
      ]);

      const summary = aiResult.error ? `Decision: ${decision}. ${comments.length} review comments analyzed.` : aiResult.text;

      const { data: outcome, error: outErr } = await supabase
        .from("review_outcomes")
        .insert({
          review_cycle_id,
          decision,
          summary,
          weighted_score: 1 - avgSeverity,
          reviewer_scores: reviewers.map(r => ({ reviewer_id: r.reviewer_id, weight: r.review_weight })),
          institutional_seal: cycleRes.data.review_type === 'institutional',
        })
        .select().single();

      if (outErr) throw outErr;

      // Update cycle status
      const statusMap: Record<string, string> = { approve: 'approved', reject: 'rejected', minor_revision: 'revision_requested', major_revision: 'revision_requested' };
      await supabase.from("peer_review_cycles").update({
        status: statusMap[decision] || 'in_review',
        closed_at: decision === 'approve' || decision === 'reject' ? new Date().toISOString() : null,
      }).eq("id", review_cycle_id);

      await supabase.from("research_audit_log").insert({
        workspace_id: cycleRes.data.workspace_id,
        user_id: user.id,
        action_type: "review_outcome",
        entity_id: outcome.id,
        metadata: { decision, weighted_score: 1 - avgSeverity, comment_count: comments.length },
      });

      return jsonResponse({ success: true, outcome, decision, weighted_score: 1 - avgSeverity });
    }

    // ============================================================
    // ACTION: detect_review_bias — Bias & collusion detection
    // ============================================================
    if (action === "detect_review_bias") {
      const { workspace_id } = body;

      const { data: cycles } = await supabase
        .from("peer_review_cycles")
        .select("id, initiated_by")
        .eq("workspace_id", workspace_id);

      if (!cycles || cycles.length === 0) return jsonResponse({ alerts: [] });

      const cycleIds = cycles.map(c => c.id);
      const { data: comments } = await supabase
        .from("review_comments")
        .select("reviewer_id, severity_level, review_cycle_id")
        .in("review_cycle_id", cycleIds);

      const alerts: any[] = [];

      // Check for reviewer patterns
      const reviewerPatterns: Record<string, { low: number; total: number }> = {};
      for (const c of (comments || [])) {
        if (!reviewerPatterns[c.reviewer_id]) reviewerPatterns[c.reviewer_id] = { low: 0, total: 0 };
        reviewerPatterns[c.reviewer_id].total++;
        if (c.severity_level === 'low') reviewerPatterns[c.reviewer_id].low++;
      }

      for (const [rid, p] of Object.entries(reviewerPatterns)) {
        if (p.total >= 5 && p.low / p.total > 0.8) {
          alerts.push({
            type: "lenient_reviewer",
            reviewer_id: rid,
            severity: "medium",
            message: `Reviewer shows consistently lenient pattern (${((p.low / p.total) * 100).toFixed(0)}% low-severity ratings)`,
          });
        }
      }

      return jsonResponse({ alerts });
    }

    // ============================================================
    // ACTION: compute_claim_influence
    // ============================================================
    if (action === "compute_claim_influence") {
      const { claim_id } = body;
      // Count citations by type
      const { data: citations } = await supabase.from("claim_citations").select("citation_type").eq("cited_claim_id", claim_id);
      const cits = citations || [];
      const supportCount = cits.filter((c: any) => c.citation_type === "supports").length;
      const contradictCount = cits.filter((c: any) => c.citation_type === "contradicts").length;
      const extensionCount = cits.filter((c: any) => c.citation_type === "extends").length;
      const totalCitations = cits.length;

      // Compute CIS: weighted formula
      const cis = (totalCitations * 1.0) + (supportCount * 0.5) + (extensionCount * 0.3) - (contradictCount * 0.2);

      await supabase.from("claim_influence_metrics").upsert({
        claim_id,
        citation_count: totalCitations,
        support_count: supportCount,
        contradiction_count: contradictCount,
        extension_count: extensionCount,
        claim_influence_score: Math.max(0, cis),
        computed_at: new Date().toISOString(),
      }, { onConflict: "claim_id" });

      // Also update the claim itself
      await supabase.from("research_claims").update({
        citation_count: totalCitations,
        claim_influence_score: Math.max(0, cis),
      }).eq("id", claim_id);

      return jsonResponse({ success: true, claim_influence_score: cis, citation_count: totalCitations });
    }

    // ============================================================
    // ACTION: detect_citation_manipulation
    // ============================================================
    if (action === "detect_citation_manipulation") {
      const { workspace_id } = body;
      const { data: citations } = await supabase.from("claim_citations").select("*").or(`citing_workspace_id.eq.${workspace_id},cited_workspace_id.eq.${workspace_id}`);
      const cits = citations || [];

      const flags: any[] = [];

      // Detect self-citation loops (same user citing themselves)
      const selfCites = cits.filter((c: any) => c.citing_workspace_id === c.cited_workspace_id);
      if (selfCites.length > 5) {
        flags.push({ flag_type: "self_citation_loop", severity: "medium", description: `${selfCites.length} self-citations detected within same workspace` });
      }

      // Detect mutual citation clusters
      const pairMap = new Map<string, number>();
      for (const c of cits) {
        const key = [c.citing_workspace_id, c.cited_workspace_id].sort().join(":");
        pairMap.set(key, (pairMap.get(key) || 0) + 1);
      }
      for (const [pair, count] of pairMap) {
        if (count > 3) {
          flags.push({ flag_type: "mutual_citation", severity: "medium", description: `Mutual citation cluster (${count} citations) between workspaces` });
        }
      }

      // Save flags
      for (const flag of flags) {
        await supabase.from("citation_manipulation_flags").insert({ ...flag, evidence: { workspace_id, citation_count: cits.length } });
      }

      return jsonResponse({ flags, summary: `Scanned ${cits.length} citations. ${flags.length} patterns flagged.` });
    }

    // ============================================================
    // ACTION: detect_emerging_topics
    // ============================================================
    if (action === "detect_emerging_topics") {
      const { workspace_id } = body;
      const { data: claims } = await supabase.from("research_claims").select("id, claim_text, claim_type, topic_tags, domain_category, created_at").eq("workspace_id", workspace_id);
      if (!claims || claims.length < 3) return jsonResponse({ topics: [] });

      const claimSummary = (claims as any[]).map((c: any) => `[${c.claim_type}] ${c.claim_text} (tags: ${(c.topic_tags || []).join(",")})`).join("\n");

      const aiResult = await callAI([
        { role: "system", content: `Analyze these research claims and detect emerging topics. Return JSON array: [{"topic": "...", "growth_rate": 0-100, "claim_count": N, "severity": "high|medium|low"}]. Return ONLY valid JSON.` },
        { role: "user", content: claimSummary }
      ]);
      if (aiResult.error) return jsonResponse({ topics: [] });

      try {
        const cleaned = aiResult.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const topics = JSON.parse(cleaned);
        return jsonResponse({ topics: Array.isArray(topics) ? topics : [] });
      } catch {
        return jsonResponse({ topics: [] });
      }
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
