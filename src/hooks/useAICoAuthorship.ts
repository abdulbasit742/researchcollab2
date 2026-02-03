import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =============================================
// FEATURE 28: AI Co-Authorship & Attribution
// =============================================

export interface AIAssistanceRecord {
  id: string;
  workspace_id?: string;
  research_timeline_id?: string;
  ai_tool_name: string;
  ai_model_version?: string;
  assistance_type: 'drafting' | 'summarization' | 'translation' | 'code' | 'analysis' | 'literature_review' | 'editing';
  initiated_by_user_id?: string;
  scope_description?: string;
  input_tokens?: number;
  output_tokens?: number;
  used_at: string;
}

export interface AIAttributionStatement {
  id: string;
  target_type: 'workspace' | 'publication' | 'dataset' | 'proposal' | 'research_timeline';
  target_id: string;
  disclosure_text: string;
  ai_tools_used?: string[];
  generated_at: string;
  approved_by_user_id?: string;
  approved_at?: string;
  is_public: boolean;
}

export interface AIContributionFlag {
  id: string;
  target_type: string;
  target_id: string;
  ai_involvement_level: 'none' | 'assistive' | 'substantial' | 'prohibited';
  flag_reason?: string;
  flagged_by?: string;
  applied_at: string;
  reviewed_at?: string;
  review_status: 'pending' | 'confirmed' | 'cleared';
}

export interface AIPolicyProfile {
  id: string;
  scope: 'platform' | 'institution' | 'journal' | 'funding_program' | 'research_domain';
  scope_id?: string;
  policy_name: string;
  allowed_uses: string[];
  prohibited_uses: string[];
  disclosure_required: boolean;
  max_ai_contribution_percentage?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useAIAssistance() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AIAssistanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const logAIUsage = useCallback(async (
    aiToolName: string,
    assistanceType: AIAssistanceRecord['assistance_type'],
    options?: {
      workspaceId?: string;
      researchTimelineId?: string;
      modelVersion?: string;
      scopeDescription?: string;
      inputTokens?: number;
      outputTokens?: number;
    }
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("ai_assistance_records")
        .insert({
          ai_tool_name: aiToolName,
          assistance_type: assistanceType,
          initiated_by_user_id: user.id,
          workspace_id: options?.workspaceId,
          research_timeline_id: options?.researchTimelineId,
          ai_model_version: options?.modelVersion,
          scope_description: options?.scopeDescription,
          input_tokens: options?.inputTokens,
          output_tokens: options?.outputTokens
        })
        .select()
        .single();

      if (error) throw error;
      return data as AIAssistanceRecord;
    } catch (error) {
      console.error("Error logging AI usage:", error);
      return null;
    }
  }, [user]);

  const fetchMyAIUsage = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ai_assistance_records")
        .select("*")
        .eq("initiated_by_user_id", user.id)
        .order("used_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setRecords((data || []) as AIAssistanceRecord[]);
    } catch (error) {
      console.error("Error fetching AI usage:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchAIUsageForWorkspace = useCallback(async (workspaceId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ai_assistance_records")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("used_at", { ascending: false });

      if (error) throw error;
      setRecords((data || []) as AIAssistanceRecord[]);
    } catch (error) {
      console.error("Error fetching workspace AI usage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    records,
    isLoading,
    logAIUsage,
    fetchMyAIUsage,
    fetchAIUsageForWorkspace
  };
}

export function useAIAttribution() {
  const { user } = useAuth();
  const [statements, setStatements] = useState<AIAttributionStatement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateDisclosure = useCallback(async (
    targetType: AIAttributionStatement['target_type'],
    targetId: string,
    aiToolsUsed: string[]
  ) => {
    // Auto-generate disclosure text based on tools used
    const toolsList = aiToolsUsed.join(", ");
    const disclosureText = `This work was created with assistance from AI tools (${toolsList}). The AI was used for drafting, editing, or analysis support. All content has been reviewed and verified by the human authors, who take full responsibility for the accuracy and integrity of the work.`;

    try {
      const { data, error } = await supabase
        .from("ai_attribution_statements")
        .insert({
          target_type: targetType,
          target_id: targetId,
          disclosure_text: disclosureText,
          ai_tools_used: aiToolsUsed,
          approved_by_user_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("AI disclosure statement generated");
      return data as AIAttributionStatement;
    } catch (error) {
      console.error("Error generating disclosure:", error);
      toast.error("Failed to generate disclosure");
      return null;
    }
  }, [user]);

  const approveDisclosure = useCallback(async (statementId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("ai_attribution_statements")
        .update({
          approved_by_user_id: user.id,
          approved_at: new Date().toISOString()
        })
        .eq("id", statementId);

      if (error) throw error;
      toast.success("Disclosure approved");
      return true;
    } catch (error) {
      console.error("Error approving disclosure:", error);
      toast.error("Failed to approve disclosure");
      return false;
    }
  }, [user]);

  const publishDisclosure = useCallback(async (statementId: string) => {
    try {
      const { error } = await supabase
        .from("ai_attribution_statements")
        .update({ is_public: true })
        .eq("id", statementId);

      if (error) throw error;
      toast.success("Disclosure published");
      return true;
    } catch (error) {
      console.error("Error publishing disclosure:", error);
      toast.error("Failed to publish disclosure");
      return false;
    }
  }, []);

  const fetchDisclosuresForTarget = useCallback(async (targetType: string, targetId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ai_attribution_statements")
        .select("*")
        .eq("target_type", targetType)
        .eq("target_id", targetId);

      if (error) throw error;
      setStatements((data || []) as AIAttributionStatement[]);
    } catch (error) {
      console.error("Error fetching disclosures:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    statements,
    isLoading,
    generateDisclosure,
    approveDisclosure,
    publishDisclosure,
    fetchDisclosuresForTarget
  };
}

export function useAIPolicy() {
  const [policies, setPolicies] = useState<AIPolicyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActivePolicies = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ai_policy_profiles")
        .select("*")
        .eq("is_active", true)
        .order("scope");

      if (error) throw error;
      setPolicies((data || []) as AIPolicyProfile[]);
    } catch (error) {
      console.error("Error fetching AI policies:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPlatformPolicy = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("ai_policy_profiles")
        .select("*")
        .eq("scope", "platform")
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data as AIPolicyProfile;
    } catch (error) {
      console.error("Error fetching platform policy:", error);
      return null;
    }
  }, []);

  const checkCompliance = useCallback((policy: AIPolicyProfile, usageType: string): boolean => {
    if (policy.prohibited_uses.includes(usageType)) {
      return false;
    }
    if (policy.allowed_uses.length > 0 && !policy.allowed_uses.includes(usageType)) {
      return false;
    }
    return true;
  }, []);

  return {
    policies,
    isLoading,
    fetchActivePolicies,
    getPlatformPolicy,
    checkCompliance
  };
}

export function useAIContributionFlags() {
  const { user } = useAuth();
  const [flags, setFlags] = useState<AIContributionFlag[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const flagAIContribution = useCallback(async (
    targetType: string,
    targetId: string,
    level: AIContributionFlag['ai_involvement_level'],
    reason?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("ai_contribution_flags")
        .insert({
          target_type: targetType,
          target_id: targetId,
          ai_involvement_level: level,
          flag_reason: reason,
          flagged_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("AI contribution flag applied");
      return data as AIContributionFlag;
    } catch (error) {
      console.error("Error flagging AI contribution:", error);
      toast.error("Failed to flag AI contribution");
      return null;
    }
  }, [user]);

  const fetchFlagsForTarget = useCallback(async (targetType: string, targetId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ai_contribution_flags")
        .select("*")
        .eq("target_type", targetType)
        .eq("target_id", targetId);

      if (error) throw error;
      setFlags((data || []) as AIContributionFlag[]);
    } catch (error) {
      console.error("Error fetching AI flags:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    flags,
    isLoading,
    flagAIContribution,
    fetchFlagsForTarget
  };
}
