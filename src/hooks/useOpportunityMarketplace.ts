import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTrustSystem, getTrustTier } from "./useTrustSystem";

export interface EnhancedOpportunity {
  id: string;
  title: string;
  description: string;
  type: "project" | "collaboration" | "grant" | "position" | "advisory";
  category: string;
  budget: { min: number; max: number; type: "fixed" | "hourly" | "milestone" };
  timeline: { start?: Date; end?: Date; duration?: string };
  postedBy: {
    id: string;
    name: string;
    institution?: string;
    trustScore: number;
    trustTier: string;
  };
  requirements: {
    skills: string[];
    minTrustScore: number;
    verificationRequired: boolean;
    institutionTypes?: string[];
  };
  fitScore: number;
  fitExplanation: string[];
  matchReasons: string[];
  blockers: string[];
  competitionLevel: "low" | "medium" | "high";
  successLikelihood: number;
  isSponsored: boolean;
  sponsoringOrg?: string;
  applicationCount: number;
  viewCount: number;
  createdAt: Date;
  deadline?: Date;
}

export interface OpportunityFilters {
  types: string[];
  categories: string[];
  budgetRange: { min: number; max: number };
  trustThreshold: number;
  skills: string[];
  timeframe: "any" | "urgent" | "flexible";
  verified: boolean;
  institutionSponsored: boolean;
}

export interface MarketInsight {
  category: string;
  demand: "high" | "medium" | "low";
  saturation: number;
  avgBudget: number;
  avgSuccessRate: number;
  trending: boolean;
}

export function useOpportunityMarketplace(initialFilters?: Partial<OpportunityFilters>) {
  const { user, profile } = useAuth();
  const { breakdown: trustBreakdown } = useTrustSystem();
  
  const [opportunities, setOpportunities] = useState<EnhancedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OpportunityFilters>({
    types: [],
    categories: [],
    budgetRange: { min: 0, max: 100000 },
    trustThreshold: 0,
    skills: [],
    timeframe: "any",
    verified: false,
    institutionSponsored: false,
    ...initialFilters,
  });

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch projects which represent opportunities
      let query = supabase
        .from("projects" as any)
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });
        
      // Apply filters
      if (filters.types.length > 0) {
        query = query.in("offer_type", filters.types);
      }
      
      if (filters.categories.length > 0) {
        query = query.in("category", filters.categories);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      // Transform and enrich opportunities
      const userSkills = profile?.interests || [];
      const userTrustScore = trustBreakdown?.overall || 50;
      
      const enriched: EnhancedOpportunity[] = (data || []).map((opp: any) => {
        const requiredSkills = opp.required_skills || [];
        const matchingSkills = requiredSkills.filter((s: string) => 
          userSkills.some(us => us.toLowerCase().includes(s.toLowerCase()))
        );
        const minTrustRequired = opp.min_trust_score || 0;
        
        // Calculate fit score
        const skillMatch = requiredSkills.length > 0 
          ? (matchingSkills.length / requiredSkills.length) * 50 
          : 25;
        const trustMatch = userTrustScore >= minTrustRequired ? 30 : 
          Math.max(0, 30 - (minTrustRequired - userTrustScore));
        const fitScore = Math.min(100, skillMatch + trustMatch + 20);
        
        // Generate fit explanation
        const fitExplanation: string[] = [];
        if (matchingSkills.length > 0) {
          fitExplanation.push(`${matchingSkills.length} matching skills: ${matchingSkills.join(", ")}`);
        }
        if (userTrustScore >= minTrustRequired) {
          fitExplanation.push("Meets trust requirements");
        }
        
        // Identify blockers
        const blockers: string[] = [];
        if (userTrustScore < minTrustRequired) {
          blockers.push(`Requires ${minTrustRequired} trust score (you have ${userTrustScore})`);
        }
        if (opp.requires_verification && !profile?.university) {
          blockers.push("Requires institutional verification");
        }
        
        return {
          id: opp.id,
          title: opp.title,
          description: opp.description,
          type: opp.offer_type || "project",
          category: opp.category || "general",
          budget: {
            min: Number(opp.budget_min) || 0,
            max: Number(opp.budget_max) || Number(opp.budget_min) || 0,
            type: opp.budget_type || "fixed",
          },
          timeline: {
            end: opp.deadline ? new Date(opp.deadline) : undefined,
            duration: opp.estimated_duration,
          },
          postedBy: {
            id: opp.posted_by,
            name: opp.profiles?.full_name || "Unknown",
            institution: opp.profiles?.university,
            trustScore: 70, // Would fetch from user_trust_profiles
            trustTier: "silver",
          },
          requirements: {
            skills: requiredSkills,
            minTrustScore: minTrustRequired,
            verificationRequired: opp.requires_verification || false,
          },
          fitScore,
          fitExplanation,
          matchReasons: fitExplanation,
          blockers,
          competitionLevel: opp.application_count > 10 ? "high" : 
            opp.application_count > 5 ? "medium" : "low",
          successLikelihood: fitScore * 0.8,
          isSponsored: false,
          applicationCount: opp.application_count || 0,
          viewCount: opp.view_count || 0,
          createdAt: new Date(opp.created_at),
          deadline: opp.deadline ? new Date(opp.deadline) : undefined,
        };
      });
      
      // Sort by fit score
      enriched.sort((a, b) => b.fitScore - a.fitScore);
      
      setOpportunities(enriched);
    } catch (err: any) {
      console.error("Error fetching opportunities:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, profile, trustBreakdown]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Get market insights
  const marketInsights = useMemo((): MarketInsight[] => {
    const categoryMap = new Map<string, EnhancedOpportunity[]>();
    
    opportunities.forEach(opp => {
      const existing = categoryMap.get(opp.category) || [];
      categoryMap.set(opp.category, [...existing, opp]);
    });
    
    return Array.from(categoryMap.entries()).map(([category, opps]) => ({
      category,
      demand: opps.length > 10 ? "high" : opps.length > 5 ? "medium" : "low",
      saturation: Math.min(100, opps.reduce((sum, o) => sum + o.applicationCount, 0) / opps.length * 10),
      avgBudget: opps.reduce((sum, o) => sum + (o.budget.min + o.budget.max) / 2, 0) / opps.length,
      avgSuccessRate: 65,
      trending: opps.filter(o => 
        o.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length > 3,
    }));
  }, [opportunities]);

  // Compare opportunities
  const compareOpportunities = useCallback((ids: string[]) => {
    return opportunities.filter(o => ids.includes(o.id));
  }, [opportunities]);

  // Check readiness for opportunity
  const checkReadiness = useCallback((opportunityId: string) => {
    const opp = opportunities.find(o => o.id === opportunityId);
    if (!opp) return null;
    
    return {
      ready: opp.blockers.length === 0,
      blockers: opp.blockers,
      suggestions: opp.blockers.map(b => {
        if (b.includes("trust score")) {
          return "Complete more projects to increase your trust score";
        }
        if (b.includes("verification")) {
          return "Complete your institutional verification in Settings";
        }
        return "Review the requirements carefully";
      }),
    };
  }, [opportunities]);

  return {
    opportunities,
    loading,
    error,
    filters,
    setFilters,
    refresh: fetchOpportunities,
    marketInsights,
    compareOpportunities,
    checkReadiness,
  };
}

// Hook for saved opportunities
export function useSavedOpportunities() {
  const { user } = useAuth();
  const [saved, setSaved] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    // Load from localStorage for now (would be in DB)
    const savedData = localStorage.getItem(`saved_opps_${user?.id}`);
    const dismissedData = localStorage.getItem(`dismissed_opps_${user?.id}`);
    
    if (savedData) setSaved(JSON.parse(savedData));
    if (dismissedData) setDismissed(JSON.parse(dismissedData));
  }, [user]);

  const saveOpportunity = useCallback((id: string) => {
    setSaved(prev => {
      const updated = [...prev, id];
      localStorage.setItem(`saved_opps_${user?.id}`, JSON.stringify(updated));
      return updated;
    });
  }, [user]);

  const unsaveOpportunity = useCallback((id: string) => {
    setSaved(prev => {
      const updated = prev.filter(i => i !== id);
      localStorage.setItem(`saved_opps_${user?.id}`, JSON.stringify(updated));
      return updated;
    });
  }, [user]);

  const dismissOpportunity = useCallback((id: string) => {
    setDismissed(prev => {
      const updated = [...prev, id];
      localStorage.setItem(`dismissed_opps_${user?.id}`, JSON.stringify(updated));
      return updated;
    });
  }, [user]);

  return {
    saved,
    dismissed,
    saveOpportunity,
    unsaveOpportunity,
    dismissOpportunity,
    isSaved: (id: string) => saved.includes(id),
    isDismissed: (id: string) => dismissed.includes(id),
  };
}

// Hook for opportunity lifecycle tracking
export function useOpportunityLifecycle(opportunityId: string) {
  const [lifecycle, setLifecycle] = useState<{
    stage: "discovery" | "application" | "negotiation" | "execution" | "completion";
    events: { stage: string; date: Date; description: string }[];
    nextSteps: string[];
  } | null>(null);

  useEffect(() => {
    // Would fetch actual lifecycle data
    setLifecycle({
      stage: "discovery",
      events: [
        { stage: "discovery", date: new Date(), description: "Opportunity viewed" },
      ],
      nextSteps: ["Submit application", "Review project scope"],
    });
  }, [opportunityId]);

  return { lifecycle };
}
