import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface CanonicalKnowledgeRecord {
  id: string;
  artifact_id: string | null;
  artifact_type: string;
  canonical_version: string;
  checksum: string;
  declared_scope: string;
  governance_body: string | null;
  title: string;
  abstract: string | null;
  metadata: unknown;
  is_active: boolean;
  created_at: string;
}

export interface KnowledgeVersion {
  id: string;
  canonical_record_id: string;
  version_label: string;
  change_type: string;
  supersedes_version_id: string | null;
  justification: string;
  evidence_links: unknown;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface KnowledgeGovernanceBody {
  id: string;
  name: string;
  jurisdiction: string;
  mandate: string;
  decision_process: string;
  quorum_rules: unknown;
  members: unknown;
  is_active: boolean;
  created_at: string;
}

export interface KnowledgeDissentRecord {
  id: string;
  canonical_record_id: string;
  dissenting_claim: string;
  supporting_evidence: unknown;
  submitted_by: string | null;
  visibility: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
}

export function useKnowledgeCommons() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [canonicalRecords, setCanonicalRecords] = useState<CanonicalKnowledgeRecord[]>([]);
  const [governanceBodies, setGovernanceBodies] = useState<KnowledgeGovernanceBody[]>([]);
  const [dissentRecords, setDissentRecords] = useState<KnowledgeDissentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKnowledgeCommons();
  }, []);

  const fetchKnowledgeCommons = async () => {
    setLoading(true);
    try {
      const [recordsRes, bodiesRes, dissentRes] = await Promise.all([
        supabase
          .from("canonical_knowledge_records")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("knowledge_governance_bodies")
          .select("*")
          .eq("is_active", true),
        supabase
          .from("knowledge_dissent_records")
          .select("*")
          .eq("visibility", "public")
          .order("created_at", { ascending: false }),
      ]);

      if (recordsRes.data) setCanonicalRecords(recordsRes.data);
      if (bodiesRes.data) setGovernanceBodies(bodiesRes.data);
      if (dissentRes.data) setDissentRecords(dissentRes.data);
    } catch (error) {
      console.error("Error fetching knowledge commons:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCanonicalRecord = async (record: Partial<CanonicalKnowledgeRecord>) => {
    try {
      const { error } = await supabase
        .from("canonical_knowledge_records")
        .insert({
          artifact_type: record.artifact_type || "finding",
          checksum: record.checksum || crypto.randomUUID(),
          declared_scope: record.declared_scope || "disciplinary",
          title: record.title || "Untitled",
          abstract: record.abstract,
        });

      if (error) throw error;
      toast({ title: "Canonical record created" });
      fetchKnowledgeCommons();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create record";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const submitDissent = async (canonicalRecordId: string, claim: string, evidence: unknown[] = []) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("knowledge_dissent_records").insert([{
        canonical_record_id: canonicalRecordId,
        dissenting_claim: claim,
        supporting_evidence: JSON.stringify(evidence),
        submitted_by: user.id,
      }]);

      if (error) throw error;
      toast({ title: "Dissent submitted for review" });
      fetchKnowledgeCommons();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to submit dissent";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const getVersionHistory = async (canonicalRecordId: string): Promise<KnowledgeVersion[]> => {
    const { data } = await supabase
      .from("knowledge_versions")
      .select("*")
      .eq("canonical_record_id", canonicalRecordId)
      .order("created_at", { ascending: true });
    return data || [];
  };

  return {
    canonicalRecords,
    governanceBodies,
    dissentRecords,
    loading,
    refetch: fetchKnowledgeCommons,
    createCanonicalRecord,
    submitDissent,
    getVersionHistory,
  };
}
