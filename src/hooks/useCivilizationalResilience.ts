import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DataCustodyNode {
  id: string;
  node_name: string;
  node_type: string;
  geographic_location: string;
  jurisdiction: string;
  operator_organization: string | null;
  data_categories: string[];
  sync_frequency: string | null;
  last_sync_at: string | null;
  encryption_standard: string;
  access_protocol: string;
  offline_capable: boolean;
  sovereignty_compliant: boolean;
  continuity_priority: number | null;
  created_at: string;
}

interface ContinuityCheckpoint {
  id: string;
  checkpoint_type: string;
  checkpoint_date: string;
  systems_included: string[];
  verification_status: string;
  recovery_tested: boolean;
  recovery_test_date: string | null;
  recovery_time_objective: string | null;
  storage_nodes: string[];
  integrity_hash: string;
  created_at: string;
}

interface FundingModel {
  id: string;
  model_name: string;
  model_type: string;
  description: string;
  revenue_sources: Record<string, unknown>;
  cost_structure: Record<string, unknown> | null;
  sustainability_metrics: Record<string, unknown> | null;
  transition_requirements: string | null;
  is_active: boolean;
  activated_at: string | null;
  created_at: string;
}

interface EndowmentFund {
  id: string;
  fund_name: string;
  purpose: string;
  target_amount: number | null;
  current_amount: number;
  currency: string;
  custodian: string;
  investment_policy: string | null;
  spending_rule: string | null;
  restricted_uses: string[] | null;
  donor_visibility: string | null;
  created_at: string;
}

interface EthicsReview {
  id: string;
  review_type: string;
  subject: string;
  reviewer_type: string;
  reviewer_name: string | null;
  reviewer_organization: string | null;
  review_scope: string;
  findings: string;
  recommendations: string[] | null;
  severity: string | null;
  management_response: string | null;
  remediation_deadline: string | null;
  remediated_at: string | null;
  public_summary: string | null;
  created_at: string;
}

interface AccountabilityReport {
  id: string;
  report_period_start: string;
  report_period_end: string;
  report_type: string;
  title: string;
  executive_summary: string;
  full_report_url: string | null;
  key_metrics: Record<string, unknown>;
  published_at: string | null;
  is_public: boolean;
  created_at: string;
}

interface CommunityChallenge {
  id: string;
  challenger_id: string | null;
  challenger_type: string;
  challenge_type: string;
  target_entity_type: string;
  target_entity_id: string | null;
  challenge_title: string;
  challenge_description: string;
  urgency: string | null;
  status: string;
  resolution: string | null;
  resolution_date: string | null;
  appeal_available: boolean;
  appealed: boolean;
  created_at: string;
}

export function useCivilizationalResilience() {
  const { user } = useAuth();
  const [dataCustodyNodes, setDataCustodyNodes] = useState<DataCustodyNode[]>([]);
  const [checkpoints, setCheckpoints] = useState<ContinuityCheckpoint[]>([]);
  const [fundingModels, setFundingModels] = useState<FundingModel[]>([]);
  const [endowmentFunds, setEndowmentFunds] = useState<EndowmentFund[]>([]);
  const [ethicsReviews, setEthicsReviews] = useState<EthicsReview[]>([]);
  const [accountabilityReports, setAccountabilityReports] = useState<AccountabilityReport[]>([]);
  const [communityChallenges, setCommunityChallenges] = useState<CommunityChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResilienceData();
  }, []);

  const fetchResilienceData = async () => {
    setLoading(true);
    try {
      const [
        nodesRes,
        checkpointsRes,
        fundingRes,
        endowmentRes,
        ethicsRes,
        reportsRes,
        challengesRes,
      ] = await Promise.all([
        supabase.from("data_custody_nodes").select("*").order("continuity_priority"),
        supabase.from("continuity_checkpoints").select("*").order("checkpoint_date", { ascending: false }).limit(50),
        supabase.from("funding_models").select("*"),
        supabase.from("endowment_funds").select("*"),
        supabase.from("ethics_reviews").select("*").order("created_at", { ascending: false }),
        supabase.from("accountability_reports").select("*").eq("is_public", true).order("report_period_end", { ascending: false }),
        supabase.from("community_challenges").select("*").order("created_at", { ascending: false }),
      ]);

      if (nodesRes.data) setDataCustodyNodes(nodesRes.data as DataCustodyNode[]);
      if (checkpointsRes.data) setCheckpoints(checkpointsRes.data as ContinuityCheckpoint[]);
      if (fundingRes.data) setFundingModels(fundingRes.data as FundingModel[]);
      if (endowmentRes.data) setEndowmentFunds(endowmentRes.data as EndowmentFund[]);
      if (ethicsRes.data) setEthicsReviews(ethicsRes.data as EthicsReview[]);
      if (reportsRes.data) setAccountabilityReports(reportsRes.data as AccountabilityReport[]);
      if (challengesRes.data) setCommunityChallenges(challengesRes.data as CommunityChallenge[]);
    } catch (error) {
      console.error("Error fetching resilience data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addDataCustodyNode = async (node: Omit<DataCustodyNode, "id" | "created_at">) => {
    try {
      const { error } = await supabase.from("data_custody_nodes").insert(node);
      if (error) throw error;
      toast.success("Data custody node added");
      fetchResilienceData();
      return true;
    } catch (error) {
      console.error("Error adding custody node:", error);
      toast.error("Failed to add data custody node");
      return false;
    }
  };

  const createCheckpoint = async (checkpoint: Omit<ContinuityCheckpoint, "id" | "created_at">) => {
    try {
      const { error } = await supabase.from("continuity_checkpoints").insert(checkpoint);
      if (error) throw error;
      toast.success("Continuity checkpoint created");
      fetchResilienceData();
      return true;
    } catch (error) {
      console.error("Error creating checkpoint:", error);
      toast.error("Failed to create checkpoint");
      return false;
    }
  };

  const submitCommunityChallenge = async (challenge: Omit<CommunityChallenge, "id" | "created_at" | "status" | "appeal_available" | "appealed">) => {
    if (!user) return false;
    try {
      const { error } = await supabase.from("community_challenges").insert({
        ...challenge,
        challenger_id: user.id,
        status: "submitted",
        appeal_available: true,
        appealed: false,
      });
      if (error) throw error;
      toast.success("Challenge submitted successfully");
      fetchResilienceData();
      return true;
    } catch (error) {
      console.error("Error submitting challenge:", error);
      toast.error("Failed to submit challenge");
      return false;
    }
  };

  const resolveChallenge = async (challengeId: string, resolution: string) => {
    try {
      const { error } = await supabase
        .from("community_challenges")
        .update({
          status: "resolved",
          resolution,
          resolution_date: new Date().toISOString(),
        })
        .eq("id", challengeId);
      if (error) throw error;
      toast.success("Challenge resolved");
      fetchResilienceData();
      return true;
    } catch (error) {
      console.error("Error resolving challenge:", error);
      toast.error("Failed to resolve challenge");
      return false;
    }
  };

  const getResilienceScore = () => {
    const nodeScore = Math.min(dataCustodyNodes.length * 10, 30);
    const checkpointScore = checkpoints.filter((c) => c.verification_status === "verified").length > 0 ? 20 : 0;
    const fundingScore = fundingModels.some((f) => f.is_active) ? 20 : 0;
    const ethicsScore = ethicsReviews.length > 0 ? 15 : 0;
    const transparencyScore = accountabilityReports.length > 0 ? 15 : 0;
    
    return {
      total: nodeScore + checkpointScore + fundingScore + ethicsScore + transparencyScore,
      breakdown: {
        dataCustody: nodeScore,
        continuity: checkpointScore,
        funding: fundingScore,
        ethics: ethicsScore,
        transparency: transparencyScore,
      },
    };
  };

  const getResilienceStats = () => {
    return {
      totalNodes: dataCustodyNodes.length,
      offlineCapableNodes: dataCustodyNodes.filter((n) => n.offline_capable).length,
      verifiedCheckpoints: checkpoints.filter((c) => c.verification_status === "verified").length,
      activeFundingModels: fundingModels.filter((f) => f.is_active).length,
      totalEndowment: endowmentFunds.reduce((sum, f) => sum + (f.current_amount || 0), 0),
      pendingChallenges: communityChallenges.filter((c) => c.status === "submitted" || c.status === "under_review").length,
    };
  };

  return {
    dataCustodyNodes,
    checkpoints,
    fundingModels,
    endowmentFunds,
    ethicsReviews,
    accountabilityReports,
    communityChallenges,
    loading,
    addDataCustodyNode,
    createCheckpoint,
    submitCommunityChallenge,
    resolveChallenge,
    getResilienceScore,
    getResilienceStats,
    refresh: fetchResilienceData,
  };
}
