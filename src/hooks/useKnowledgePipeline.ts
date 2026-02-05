import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  KnowledgeOpportunityLink,
  KnowledgeImpactMetrics,
} from "@/types/knowledge-civilization";

// ============================================
// SYSTEM 44: KNOWLEDGE → OPPORTUNITY PIPELINE
// Knowledge must not sit idle - it must create impact
// ============================================

export function useKnowledgePipeline() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<KnowledgeOpportunityLink[]>([]);
  const [metrics, setMetrics] = useState<Map<string, KnowledgeImpactMetrics>>(new Map());

  // Link knowledge to opportunity
  const linkKnowledgeToOpportunity = useCallback(async (
    knowledgeObjectId: string,
    opportunityId: string,
    linkType: KnowledgeOpportunityLink["linkType"],
    strength: number = 1
  ): Promise<KnowledgeOpportunityLink | null> => {
    if (!user) {
      toast.error("You must be logged in to create links");
      return null;
    }

    // Check if link already exists
    const existing = links.find(l => 
      l.knowledgeObjectId === knowledgeObjectId && 
      l.opportunityId === opportunityId
    );
    
    if (existing) {
      toast.error("Link already exists");
      return null;
    }

    const link: KnowledgeOpportunityLink = {
      id: crypto.randomUUID(),
      knowledgeObjectId,
      opportunityId,
      linkType,
      strength: Math.max(0, Math.min(1, strength)),
      createdAt: new Date(),
      utilized: false,
    };

    setLinks(prev => [...prev, link]);
    toast.success("Knowledge linked to opportunity");
    return link;
  }, [user, links]);

  // Mark link as utilized
  const markUtilized = useCallback(async (linkId: string): Promise<boolean> => {
    setLinks(prev => prev.map(l => 
      l.id === linkId ? { ...l, utilized: true } : l
    ));

    // Update metrics for the knowledge object
    const link = links.find(l => l.id === linkId);
    if (link) {
      updateMetrics(link.knowledgeObjectId, { opportunitiesUnlocked: 1 });
    }

    return true;
  }, [links]);

  // Find opportunities enabled by knowledge
  const findEnabledOpportunities = useCallback((
    knowledgeObjectId: string
  ): string[] => {
    return links
      .filter(l => l.knowledgeObjectId === knowledgeObjectId && l.linkType === "enables")
      .map(l => l.opportunityId);
  }, [links]);

  // Find knowledge required for opportunity
  const findRequiredKnowledge = useCallback((
    opportunityId: string
  ): Array<{ id: string; strength: number }> => {
    return links
      .filter(l => l.opportunityId === opportunityId && l.linkType === "required")
      .map(l => ({ id: l.knowledgeObjectId, strength: l.strength }));
  }, [links]);

  // Find recommended knowledge for opportunity
  const findRecommendedKnowledge = useCallback((
    opportunityId: string
  ): Array<{ id: string; strength: number }> => {
    return links
      .filter(l => l.opportunityId === opportunityId && l.linkType === "recommended")
      .map(l => ({ id: l.knowledgeObjectId, strength: l.strength }));
  }, [links]);

  // Update impact metrics
  const updateMetrics = useCallback((
    knowledgeObjectId: string,
    updates: Partial<{
      opportunitiesUnlocked: number;
      trustImpact: number;
      institutionalAdoptions: number;
      policyInfluence: number;
      totalEconomicValue: number;
    }>
  ) => {
    setMetrics(prev => {
      const existing = prev.get(knowledgeObjectId) || {
        objectId: knowledgeObjectId,
        opportunitiesUnlocked: 0,
        trustImpact: 0,
        institutionalAdoptions: 0,
        policyInfluence: 0,
        totalEconomicValue: 0,
        measuredAt: new Date(),
      };

      const updated: KnowledgeImpactMetrics = {
        ...existing,
        opportunitiesUnlocked: existing.opportunitiesUnlocked + (updates.opportunitiesUnlocked || 0),
        trustImpact: existing.trustImpact + (updates.trustImpact || 0),
        institutionalAdoptions: existing.institutionalAdoptions + (updates.institutionalAdoptions || 0),
        policyInfluence: existing.policyInfluence + (updates.policyInfluence || 0),
        totalEconomicValue: existing.totalEconomicValue + (updates.totalEconomicValue || 0),
        measuredAt: new Date(),
      };

      const newMap = new Map(prev);
      newMap.set(knowledgeObjectId, updated);
      return newMap;
    });
  }, []);

  // Record trust impact from knowledge application
  const recordTrustImpact = useCallback(async (
    knowledgeObjectId: string,
    trustDelta: number
  ): Promise<boolean> => {
    updateMetrics(knowledgeObjectId, { trustImpact: trustDelta });
    return true;
  }, [updateMetrics]);

  // Record institutional adoption
  const recordInstitutionalAdoption = useCallback(async (
    knowledgeObjectId: string,
    institutionId: string
  ): Promise<boolean> => {
    updateMetrics(knowledgeObjectId, { institutionalAdoptions: 1 });
    toast.success("Institutional adoption recorded");
    return true;
  }, [updateMetrics]);

  // Record policy influence
  const recordPolicyInfluence = useCallback(async (
    knowledgeObjectId: string,
    policyDescription: string
  ): Promise<boolean> => {
    updateMetrics(knowledgeObjectId, { policyInfluence: 1 });
    toast.success("Policy influence recorded");
    return true;
  }, [updateMetrics]);

  // Record economic value generated
  const recordEconomicValue = useCallback(async (
    knowledgeObjectId: string,
    value: number
  ): Promise<boolean> => {
    updateMetrics(knowledgeObjectId, { totalEconomicValue: value });
    return true;
  }, [updateMetrics]);

  // Get impact metrics for a knowledge object
  const getImpactMetrics = useCallback((
    knowledgeObjectId: string
  ): KnowledgeImpactMetrics | null => {
    return metrics.get(knowledgeObjectId) || null;
  }, [metrics]);

  // Calculate overall pipeline health
  const getPipelineHealth = useCallback(() => {
    const totalLinks = links.length;
    const utilizedLinks = links.filter(l => l.utilized).length;
    const utilizationRate = totalLinks > 0 ? utilizedLinks / totalLinks : 0;

    const allMetrics = Array.from(metrics.values());
    const totalOpportunitiesUnlocked = allMetrics.reduce((sum, m) => sum + m.opportunitiesUnlocked, 0);
    const totalTrustImpact = allMetrics.reduce((sum, m) => sum + m.trustImpact, 0);
    const totalEconomicValue = allMetrics.reduce((sum, m) => sum + m.totalEconomicValue, 0);

    return {
      totalLinks,
      utilizedLinks,
      utilizationRate,
      totalOpportunitiesUnlocked,
      totalTrustImpact,
      totalEconomicValue,
      activeKnowledgeObjects: metrics.size,
      averageImpactPerObject: metrics.size > 0 
        ? totalOpportunitiesUnlocked / metrics.size 
        : 0,
    };
  }, [links, metrics]);

  // Find high-impact knowledge objects
  const findHighImpactKnowledge = useCallback((minScore: number = 50) => {
    return Array.from(metrics.entries())
      .map(([id, m]) => ({
        id,
        impactScore: (
          m.opportunitiesUnlocked * 10 +
          m.trustImpact +
          m.institutionalAdoptions * 20 +
          m.policyInfluence * 30
        ),
        metrics: m,
      }))
      .filter(item => item.impactScore >= minScore)
      .sort((a, b) => b.impactScore - a.impactScore);
  }, [metrics]);

  // Find underutilized knowledge
  const findUnderutilizedKnowledge = useCallback((
    maxUtilization: number = 0.1
  ) => {
    const knowledgeIds = new Set(links.map(l => l.knowledgeObjectId));
    
    return Array.from(knowledgeIds)
      .map(id => {
        const objectLinks = links.filter(l => l.knowledgeObjectId === id);
        const utilizedCount = objectLinks.filter(l => l.utilized).length;
        const utilizationRate = objectLinks.length > 0 
          ? utilizedCount / objectLinks.length 
          : 0;
        
        return { id, utilizationRate, totalLinks: objectLinks.length };
      })
      .filter(item => item.utilizationRate <= maxUtilization)
      .sort((a, b) => a.utilizationRate - b.utilizationRate);
  }, [links]);

  return {
    loading,
    links,
    linkKnowledgeToOpportunity,
    markUtilized,
    findEnabledOpportunities,
    findRequiredKnowledge,
    findRecommendedKnowledge,
    recordTrustImpact,
    recordInstitutionalAdoption,
    recordPolicyInfluence,
    recordEconomicValue,
    getImpactMetrics,
    getPipelineHealth,
    findHighImpactKnowledge,
    findUnderutilizedKnowledge,
  };
}

export type { KnowledgeOpportunityLink, KnowledgeImpactMetrics };
