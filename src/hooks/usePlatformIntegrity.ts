import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface IntegrityScore {
  overall: number;
  components: {
    behavior: number;
    consistency: number;
    quality: number;
    responsiveness: number;
  };
  flags: IntegrityFlag[];
  restrictions: AccountRestriction[];
}

export interface IntegrityFlag {
  id: string;
  type: "warning" | "violation" | "pattern";
  category: "spam" | "gaming" | "fraud" | "quality" | "behavior";
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  createdAt: Date;
  expiresAt?: Date;
  acknowledged: boolean;
}

export interface AccountRestriction {
  id: string;
  type: "rate_limit" | "feature_lock" | "visibility_reduction" | "probation";
  reason: string;
  appliedAt: Date;
  expiresAt?: Date;
  appealable: boolean;
}

export interface QualityMetrics {
  postQuality: number;
  responseRate: number;
  completionRate: number;
  disputeRate: number;
  avgRating: number;
  qualityTrend: "improving" | "stable" | "declining";
}

export interface GamingDetection {
  trustFarming: boolean;
  circularEndorsements: boolean;
  artificialActivity: boolean;
  lowValueDeals: boolean;
  spamPosting: boolean;
  riskScore: number;
  lastChecked: Date;
}

export function usePlatformIntegrity() {
  const { user } = useAuth();
  const [integrityScore, setIntegrityScore] = useState<IntegrityScore | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [gamingStatus, setGamingStatus] = useState<GamingDetection | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchIntegrityData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Fetch user activity for analysis
      const { data: offers } = await supabase
        .from("offers")
        .select("*")
        .or(`posted_by.eq.${user.id},accepted_by.eq.${user.id}`);
        
      const { data: reviews } = await supabase
        .from("project_reviews")
        .select("*")
        .eq("reviewee_id", user.id);
        
      // Calculate quality metrics
      const completed = offers?.filter(o => o.status === "completed") || [];
      const disputed = offers?.filter(o => o.status === "disputed") || [];
      const total = offers?.length || 1;
      
      const avgRating = reviews?.length 
        ? reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviews.length 
        : 0;
        
      setQualityMetrics({
        postQuality: 75,
        responseRate: 85,
        completionRate: total > 0 ? (completed.length / total) * 100 : 100,
        disputeRate: total > 0 ? (disputed.length / total) * 100 : 0,
        avgRating,
        qualityTrend: "stable",
      });
      
      // Check for gaming patterns
      const gamingChecks: GamingDetection = {
        trustFarming: false,
        circularEndorsements: false,
        artificialActivity: false,
        lowValueDeals: completed.filter((o: any) => 
          (Number(o.price) || Number(o.budget_min) || 0) < 10
        ).length > 5,
        spamPosting: false,
        riskScore: 0,
        lastChecked: new Date(),
      };
      
      // Calculate risk score
      let riskScore = 0;
      if (gamingChecks.lowValueDeals) riskScore += 20;
      if (gamingChecks.artificialActivity) riskScore += 30;
      if (gamingChecks.trustFarming) riskScore += 40;
      
      gamingChecks.riskScore = riskScore;
      setGamingStatus(gamingChecks);
      
      // Build integrity score
      const behaviorScore = 100 - riskScore;
      const consistencyScore = qualityMetrics?.qualityTrend === "improving" ? 85 : 
        qualityMetrics?.qualityTrend === "stable" ? 75 : 60;
      
      setIntegrityScore({
        overall: (behaviorScore + consistencyScore + (qualityMetrics?.completionRate || 80) + avgRating * 20) / 4,
        components: {
          behavior: behaviorScore,
          consistency: consistencyScore,
          quality: qualityMetrics?.completionRate || 80,
          responsiveness: qualityMetrics?.responseRate || 85,
        },
        flags: riskScore > 30 ? [{
          id: "flag-1",
          type: "warning",
          category: "gaming",
          description: "Unusual activity pattern detected",
          severity: riskScore > 60 ? "high" : "medium",
          createdAt: new Date(),
          acknowledged: false,
        }] : [],
        restrictions: [],
      });
      
    } catch (err) {
      console.error("Error fetching integrity data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchIntegrityData();
  }, [fetchIntegrityData]);

  // Acknowledge flag
  const acknowledgeFlag = useCallback(async (flagId: string) => {
    setIntegrityScore(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        flags: prev.flags.map(f => 
          f.id === flagId ? { ...f, acknowledged: true } : f
        ),
      };
    });
  }, []);

  // Appeal restriction
  const appealRestriction = useCallback(async (restrictionId: string, reason: string) => {
    console.log("Appeal submitted:", { restrictionId, reason });
    return true;
  }, []);

  return {
    integrityScore,
    qualityMetrics,
    gamingStatus,
    loading,
    refresh: fetchIntegrityData,
    acknowledgeFlag,
    appealRestriction,
  };
}

// Hook for platform-wide health (admin only)
export function usePlatformHealth() {
  const { userRole } = useAuth();
  const [health, setHealth] = useState<{
    userGrowth: number;
    dealVolume: number;
    disputeRate: number;
    avgTrustScore: number;
    activeUsers: number;
    riskAlerts: number;
    systemStatus: "healthy" | "degraded" | "critical";
  } | null>(null);

  useEffect(() => {
    if (userRole?.role !== "admin") return;
    
    // Would fetch actual platform metrics
    setHealth({
      userGrowth: 12,
      dealVolume: 156,
      disputeRate: 3.2,
      avgTrustScore: 68,
      activeUsers: 1250,
      riskAlerts: 5,
      systemStatus: "healthy",
    });
  }, [userRole]);

  return { health };
}

// Hook for data portability and exit
export function useDataPortability() {
  const { user } = useAuth();
  const [exportStatus, setExportStatus] = useState<"idle" | "processing" | "ready" | "error">("idle");
  const [lastExport, setLastExport] = useState<Date | null>(null);

  const requestExport = useCallback(async (format: "json" | "csv" | "pdf") => {
    if (!user) return null;
    
    setExportStatus("processing");
    
    try {
      // Fetch all user data
      const [profile, offers, reviews, connections] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("offers" as any).select("*").or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`),
        supabase.from("project_reviews" as any).select("*").or(`reviewer_id.eq.${user.id},reviewee_id.eq.${user.id}`),
        supabase.from("connections" as any).select("*").or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`),
      ]);
      
      const exportData = {
        exportDate: new Date().toISOString(),
        profile: profile.data,
        projects: offers.data,
        reviews: reviews.data,
        connections: connections.data,
      };
      
      if (format === "json") {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        setExportStatus("ready");
        setLastExport(new Date());
        return url;
      }
      
      // For CSV/PDF, would need additional processing
      setExportStatus("ready");
      setLastExport(new Date());
      return null;
    } catch (err) {
      console.error("Export error:", err);
      setExportStatus("error");
      return null;
    }
  }, [user]);

  const requestAccountDeletion = useCallback(async (reason: string) => {
    if (!user) return false;
    
    // In production, would create a deletion request
    console.log("Deletion requested:", { userId: user.id, reason });
    return true;
  }, [user]);

  return {
    exportStatus,
    lastExport,
    requestExport,
    requestAccountDeletion,
  };
}
