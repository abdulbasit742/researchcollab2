import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface DecisionClass {
  id: string;
  domain: string;
  impact_level: string;
  ai_allowed_role: string;
  human_override_required: boolean;
  description: string | null;
  examples: unknown;
  created_at: string;
}

export interface AIAdvisoryRecord {
  id: string;
  decision_context: string;
  decision_class_id: string | null;
  ai_model_id: string | null;
  recommendation_summary: string;
  full_reasoning: unknown;
  uncertainty_level: string;
  human_decision: string | null;
  divergence_reason: string | null;
  was_followed: boolean | null;
  decided_by: string | null;
  created_at: string;
}

export interface CivilizationalPrinciple {
  id: string;
  principle_name: string;
  description: string;
  scope: string;
  change_requirements: unknown;
  is_active: boolean;
  ratified_at: string | null;
  ratified_by: unknown;
  created_at: string;
}

export interface IntergenerationalSafeguard {
  id: string;
  decision_id: string | null;
  safeguard_type: string;
  parameters: unknown;
  next_review_at: string | null;
  review_count: number;
  last_reviewed_at: string | null;
  created_at: string;
}

export function useCivilizationalGovernance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [decisionClasses, setDecisionClasses] = useState<DecisionClass[]>([]);
  const [advisoryRecords, setAdvisoryRecords] = useState<AIAdvisoryRecord[]>([]);
  const [principles, setPrinciples] = useState<CivilizationalPrinciple[]>([]);
  const [safeguards, setSafeguards] = useState<IntergenerationalSafeguard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGovernanceData();
  }, [user]);

  const fetchGovernanceData = async () => {
    setLoading(true);
    try {
      const [classesRes, principlesRes, safeguardsRes] = await Promise.all([
        supabase.from("decision_classes").select("*").order("domain"),
        supabase.from("civilizational_principles").select("*").eq("is_active", true),
        supabase.from("intergenerational_safeguards").select("*"),
      ]);

      if (classesRes.data) setDecisionClasses(classesRes.data);
      if (principlesRes.data) setPrinciples(principlesRes.data);
      if (safeguardsRes.data) setSafeguards(safeguardsRes.data);

      // Fetch user's advisory records if logged in
      if (user) {
        const { data: advisoryData } = await supabase
          .from("ai_advisory_records")
          .select("*")
          .eq("decided_by", user.id)
          .order("created_at", { ascending: false })
          .limit(50);
        if (advisoryData) setAdvisoryRecords(advisoryData);
      }
    } catch (error) {
      console.error("Error fetching governance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const recordAIAdvisory = async (
    context: string,
    recommendation: string,
    uncertainty: string,
    humanDecision?: string,
    divergenceReason?: string
  ) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("ai_advisory_records").insert({
        decision_context: context,
        recommendation_summary: recommendation,
        uncertainty_level: uncertainty,
        human_decision: humanDecision,
        divergence_reason: divergenceReason,
        was_followed: humanDecision === recommendation,
        decided_by: user.id,
      });

      if (error) throw error;
      fetchGovernanceData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to record advisory";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const isAIAllowed = (domain: string, impactLevel: string): { allowed: boolean; role: string } => {
    const decisionClass = decisionClasses.find(
      (dc) => dc.domain === domain && dc.impact_level === impactLevel
    );
    if (!decisionClass) return { allowed: true, role: "advisory" };
    return {
      allowed: decisionClass.ai_allowed_role !== "prohibited",
      role: decisionClass.ai_allowed_role,
    };
  };

  const getSafeguardsForDecision = (decisionId: string): IntergenerationalSafeguard[] => {
    return safeguards.filter((s) => s.decision_id === decisionId);
  };

  return {
    decisionClasses,
    advisoryRecords,
    principles,
    safeguards,
    loading,
    refetch: fetchGovernanceData,
    recordAIAdvisory,
    isAIAllowed,
    getSafeguardsForDecision,
  };
}
