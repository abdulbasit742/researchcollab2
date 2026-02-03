import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ResearchLineage {
  id: string;
  researcher_id: string;
  mentor_id: string | null;
  relationship_type: string;
  institution_id: string | null;
  field_of_study: string | null;
  started_at: string | null;
  ended_at: string | null;
  contributions: string | null;
  verified: boolean;
  created_at: string;
}

interface IdeaEvolution {
  id: string;
  idea_identifier: string;
  title: string;
  description: string;
  field: string;
  originated_from: string | null;
  evolution_type: string | null;
  contributors: string[];
  related_projects: string[];
  evidence_links: string[];
  impact_assessment: string | null;
  created_at: string;
}

interface KnowledgeSnapshot {
  id: string;
  snapshot_type: string;
  snapshot_date: string;
  description: string;
  data_scope: string[];
  storage_location: string;
  verification_hash: string;
  format_version: string;
  accessible_until: string | null;
  created_at: string;
}

interface NegativeResult {
  id: string;
  project_id: string | null;
  researcher_id: string;
  hypothesis: string;
  methodology: string;
  expected_outcome: string;
  actual_outcome: string;
  why_it_failed: string;
  lessons_learned: string | null;
  field: string;
  replication_attempts: number;
  future_implications: string | null;
  is_public: boolean;
  created_at: string;
}

export function useKnowledgePreservation() {
  const { user } = useAuth();
  const [researchLineage, setResearchLineage] = useState<ResearchLineage[]>([]);
  const [ideaEvolution, setIdeaEvolution] = useState<IdeaEvolution[]>([]);
  const [knowledgeSnapshots, setKnowledgeSnapshots] = useState<KnowledgeSnapshot[]>([]);
  const [negativeResults, setNegativeResults] = useState<NegativeResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKnowledgeData();
  }, [user]);

  const fetchKnowledgeData = async () => {
    setLoading(true);
    try {
      const [lineageRes, ideasRes, snapshotsRes, negativeRes] = await Promise.all([
        supabase.from("research_lineage").select("*").order("started_at", { ascending: false }),
        supabase.from("idea_evolution").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("knowledge_snapshots").select("*").order("snapshot_date", { ascending: false }),
        supabase.from("negative_results_archive").select("*").eq("is_public", true).order("created_at", { ascending: false }).limit(50),
      ]);

      if (lineageRes.data) setResearchLineage(lineageRes.data as ResearchLineage[]);
      if (ideasRes.data) setIdeaEvolution(ideasRes.data as IdeaEvolution[]);
      if (snapshotsRes.data) setKnowledgeSnapshots(snapshotsRes.data as KnowledgeSnapshot[]);
      if (negativeRes.data) setNegativeResults(negativeRes.data as NegativeResult[]);
    } catch (error) {
      console.error("Error fetching knowledge data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addResearchLineage = async (lineage: Omit<ResearchLineage, "id" | "created_at" | "verified">) => {
    try {
      const { error } = await supabase.from("research_lineage").insert({
        ...lineage,
        verified: false,
      });
      if (error) throw error;
      toast.success("Research lineage added");
      fetchKnowledgeData();
      return true;
    } catch (error) {
      console.error("Error adding research lineage:", error);
      toast.error("Failed to add research lineage");
      return false;
    }
  };

  const contributeIdea = async (idea: Omit<IdeaEvolution, "id" | "created_at">) => {
    try {
      const { error } = await supabase.from("idea_evolution").insert(idea);
      if (error) throw error;
      toast.success("Idea contributed to evolution graph");
      fetchKnowledgeData();
      return true;
    } catch (error) {
      console.error("Error contributing idea:", error);
      toast.error("Failed to contribute idea");
      return false;
    }
  };

  const submitNegativeResult = async (result: Omit<NegativeResult, "id" | "created_at" | "replication_attempts">) => {
    try {
      const { error } = await supabase.from("negative_results_archive").insert({
        ...result,
        replication_attempts: 0,
      });
      if (error) throw error;
      toast.success("Negative result archived - thank you for contributing to knowledge!");
      fetchKnowledgeData();
      return true;
    } catch (error) {
      console.error("Error submitting negative result:", error);
      toast.error("Failed to submit negative result");
      return false;
    }
  };

  const createKnowledgeSnapshot = async (snapshot: Omit<KnowledgeSnapshot, "id" | "created_at">) => {
    try {
      const { error } = await supabase.from("knowledge_snapshots").insert(snapshot);
      if (error) throw error;
      toast.success("Knowledge snapshot created");
      fetchKnowledgeData();
      return true;
    } catch (error) {
      console.error("Error creating snapshot:", error);
      toast.error("Failed to create knowledge snapshot");
      return false;
    }
  };

  const getLineageGraph = (userId: string) => {
    const mentors = researchLineage.filter((r) => r.researcher_id === userId);
    const mentees = researchLineage.filter((r) => r.mentor_id === userId);
    return { mentors, mentees };
  };

  const getIdeaAncestry = (ideaId: string): IdeaEvolution[] => {
    const ancestry: IdeaEvolution[] = [];
    let currentIdea = ideaEvolution.find((i) => i.id === ideaId);
    
    while (currentIdea && currentIdea.originated_from) {
      const parent = ideaEvolution.find((i) => i.id === currentIdea!.originated_from);
      if (parent) {
        ancestry.push(parent);
        currentIdea = parent;
      } else {
        break;
      }
    }
    
    return ancestry;
  };

  const getKnowledgeStats = () => {
    return {
      totalLineageRecords: researchLineage.length,
      totalIdeas: ideaEvolution.length,
      totalSnapshots: knowledgeSnapshots.length,
      totalNegativeResults: negativeResults.length,
      uniqueFields: [...new Set(ideaEvolution.map((i) => i.field))].length,
    };
  };

  return {
    researchLineage,
    ideaEvolution,
    knowledgeSnapshots,
    negativeResults,
    loading,
    addResearchLineage,
    contributeIdea,
    submitNegativeResult,
    createKnowledgeSnapshot,
    getLineageGraph,
    getIdeaAncestry,
    getKnowledgeStats,
    refresh: fetchKnowledgeData,
  };
}
