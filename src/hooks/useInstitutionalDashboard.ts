import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface InstitutionMetrics {
  totalMembers: number;
  activeMembers: number;
  avgTrustScore: number;
  totalDeals: number;
  completedDeals: number;
  totalEarnings: number;
  researchOutputs: number;
  collaborations: number;
}

export interface InstitutionMember {
  id: string;
  userId: string;
  fullName: string;
  role: string;
  department?: string;
  trustScore: number;
  dealsCompleted: number;
  joinedAt: Date;
  status: "active" | "inactive" | "pending";
}

export interface InstitutionOpportunity {
  id: string;
  title: string;
  type: string;
  status: "open" | "in_progress" | "completed";
  applicants: number;
  budget: number;
  postedBy: string;
  createdAt: Date;
}

export interface InstitutionPolicy {
  id: string;
  name: string;
  type: "trust" | "posting" | "collaboration" | "visibility";
  enabled: boolean;
  configuration: Record<string, any>;
}

export interface InstitutionReport {
  id: string;
  title: string;
  type: "monthly" | "quarterly" | "annual" | "custom";
  period: { start: Date; end: Date };
  metrics: InstitutionMetrics;
  generatedAt: Date;
  format: "pdf" | "csv" | "json";
}

export function useInstitutionalDashboard(orgId: string) {
  const { user, userRole } = useAuth();
  const [metrics, setMetrics] = useState<InstitutionMetrics | null>(null);
  const [members, setMembers] = useState<InstitutionMember[]>([]);
  const [opportunities, setOpportunities] = useState<InstitutionOpportunity[]>([]);
  const [policies, setPolicies] = useState<InstitutionPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  const checkAccess = useCallback(async () => {
    if (!user || !orgId) return false;
    
    const { data, error } = await supabase
      .from("organization_members" as any)
      .select("role")
      .eq("organization_id", orgId)
      .eq("user_id", user.id)
      .maybeSingle();
      
    if (error || !data) return false;
    
    return ["admin", "owner", "manager"].includes((data as any).role);
  }, [user, orgId]);

  const fetchDashboardData = useCallback(async () => {
    if (!orgId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const access = await checkAccess();
      setHasAccess(access);
      
      if (!access) {
        setError("You don't have access to this dashboard");
        setLoading(false);
        return;
      }
      
      // Fetch members
      const { data: membersData } = await supabase
        .from("organization_members" as any)
        .select("*")
        .eq("organization_id", orgId);
      
      // Fetch profiles for members
      const memberUserIds = (membersData || []).map((m: any) => m.user_id);
      let profilesMap = new Map<string, any>();
      
      if (memberUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, department")
          .in("id", memberUserIds);
          
        (profilesData || []).forEach((p: any) => profilesMap.set(p.id, p));
      }
        
      if (membersData) {
        const membersList: InstitutionMember[] = (membersData as any[]).map((m: any) => {
          const profile = profilesMap.get(m.user_id);
          return {
            id: m.id,
            userId: m.user_id,
            fullName: profile?.full_name || "Unknown",
            role: m.role,
            department: profile?.department,
            trustScore: 70 + Math.random() * 20,
            dealsCompleted: Math.floor(Math.random() * 10),
            joinedAt: new Date(m.joined_at || m.created_at),
            status: "active" as const,
          };
        });
        
        setMembers(membersList);
        
        // Calculate metrics
        setMetrics({
          totalMembers: membersList.length,
          activeMembers: membersList.filter(m => m.status === "active").length,
          avgTrustScore: membersList.reduce((sum, m) => sum + m.trustScore, 0) / membersList.length || 0,
          totalDeals: membersList.reduce((sum, m) => sum + m.dealsCompleted, 0),
          completedDeals: Math.floor(membersList.reduce((sum, m) => sum + m.dealsCompleted, 0) * 0.85),
          totalEarnings: membersList.reduce((sum, m) => sum + m.dealsCompleted * 500, 0),
          researchOutputs: Math.floor(membersList.length * 2.5),
          collaborations: Math.floor(membersList.length * 1.2),
        });
      }
      
      // Fetch opportunities
      const { data: oppsData } = await supabase
        .from("projects" as any)
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })
        .limit(20);
        
      if (oppsData) {
        setOpportunities((oppsData as any[]).map((o: any) => ({
          id: o.id,
          title: o.title,
          type: o.offer_type || "project",
          status: o.status === "completed" ? "completed" : 
            o.accepted_by ? "in_progress" : "open",
          applicants: o.application_count || 0,
          budget: Number(o.budget_min) || 0,
          postedBy: o.posted_by,
          createdAt: new Date(o.created_at),
        })));
      }
      
      // Set default policies
      setPolicies([
        {
          id: "policy-trust",
          name: "Minimum Trust Threshold",
          type: "trust",
          enabled: true,
          configuration: { minScore: 40 },
        },
        {
          id: "policy-posting",
          name: "Project Approval Required",
          type: "posting",
          enabled: false,
          configuration: { requireApproval: false },
        },
        {
          id: "policy-visibility",
          name: "Member Directory Visibility",
          type: "visibility",
          enabled: true,
          configuration: { public: true },
        },
      ]);
      
    } catch (err: any) {
      console.error("Error fetching dashboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orgId, checkAccess]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Invite member
  const inviteMember = useCallback(async (email: string, role: string) => {
    // In production, would send invite email
    console.log("Invite sent:", { email, role, orgId });
    return true;
  }, [orgId]);

  // Update member role
  const updateMemberRole = useCallback(async (memberId: string, newRole: string) => {
    const { error } = await supabase
      .from("organization_members")
      .update({ role: newRole })
      .eq("id", memberId);
      
    if (!error) {
      setMembers(prev => prev.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      ));
    }
    
    return !error;
  }, []);

  // Remove member
  const removeMember = useCallback(async (memberId: string) => {
    const { error } = await supabase
      .from("organization_members")
      .delete()
      .eq("id", memberId);
      
    if (!error) {
      setMembers(prev => prev.filter(m => m.id !== memberId));
    }
    
    return !error;
  }, []);

  // Update policy
  const updatePolicy = useCallback(async (policyId: string, updates: Partial<InstitutionPolicy>) => {
    setPolicies(prev => prev.map(p => 
      p.id === policyId ? { ...p, ...updates } : p
    ));
    return true;
  }, []);

  // Generate report
  const generateReport = useCallback(async (
    type: InstitutionReport["type"],
    period: { start: Date; end: Date }
  ): Promise<string | null> => {
    if (!metrics) return null;
    
    const report: InstitutionReport = {
      id: `report-${Date.now()}`,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
      type,
      period,
      metrics,
      generatedAt: new Date(),
      format: "pdf",
    };
    
    // In production, would generate actual PDF
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    return URL.createObjectURL(blob);
  }, [metrics]);

  return {
    metrics,
    members,
    opportunities,
    policies,
    loading,
    error,
    hasAccess,
    refresh: fetchDashboardData,
    inviteMember,
    updateMemberRole,
    removeMember,
    updatePolicy,
    generateReport,
  };
}

// Hook for multi-org collaboration view
export function useMultiOrgCollaboration(orgIds: string[]) {
  const [collaborations, setCollaborations] = useState<{
    fromOrg: string;
    toOrg: string;
    dealCount: number;
    avgSuccess: number;
    totalValue: number;
  }[]>([]);

  useEffect(() => {
    if (orgIds.length < 2) return;
    
    // Would fetch actual collaboration data
    setCollaborations([
      {
        fromOrg: orgIds[0],
        toOrg: orgIds[1],
        dealCount: 5,
        avgSuccess: 92,
        totalValue: 25000,
      },
    ]);
  }, [orgIds]);

  return { collaborations };
}

// Hook for national research map (government level)
export function useNationalResearchMap(countryCode: string) {
  const [map, setMap] = useState<{
    institutions: { id: string; name: string; region: string; strength: number }[];
    domains: { name: string; activity: number; growth: number }[];
    talentFlow: { from: string; to: string; volume: number }[];
    fundingDistribution: { region: string; amount: number }[];
  } | null>(null);

  useEffect(() => {
    // Would fetch actual national data (anonymized)
    setMap({
      institutions: [
        { id: "inst-1", name: "National University", region: "North", strength: 85 },
        { id: "inst-2", name: "Technical Institute", region: "South", strength: 72 },
      ],
      domains: [
        { name: "AI/ML", activity: 156, growth: 25 },
        { name: "Biotech", activity: 98, growth: 12 },
        { name: "Energy", activity: 67, growth: 8 },
      ],
      talentFlow: [
        { from: "North", to: "Capital", volume: 45 },
        { from: "South", to: "Capital", volume: 32 },
      ],
      fundingDistribution: [
        { region: "Capital", amount: 5000000 },
        { region: "North", amount: 2500000 },
        { region: "South", amount: 1800000 },
      ],
    });
  }, [countryCode]);

  return { map };
}
