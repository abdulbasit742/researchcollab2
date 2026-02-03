import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =====================================================
// TYPES
// =====================================================

export interface Match {
  id: string;
  user_id: string;
  matched_user_id: string;
  match_score: number;
  match_reasons: {
    skills_overlap?: number;
    same_university?: boolean;
    same_organization?: boolean;
    mutual_connections?: number;
    research_interests?: string[];
  } | null;
  created_at: string;
  // Joined data
  matched_profile?: {
    id: string;
    full_name: string | null;
    university: string | null;
    role: string | null;
  };
  connection_status?: "none" | "pending" | "connected";
}

// =====================================================
// AI MATCHES
// =====================================================

export function useAIMatches() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["aiMatches", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Check for cached matches first
      const { data: cached, error: cacheError } = await supabase
        .from("ai_match_results")
        .select("*, profiles!ai_match_results_matched_user_id_fkey(id, full_name, university, role)")
        .eq("user_id", user.id)
        .gte("expires_at", new Date().toISOString())
        .order("match_score", { ascending: false })
        .limit(20);
      
      if (cacheError) throw cacheError;
      
      if (cached && cached.length > 0) {
        // Get connection statuses
        const matchedIds = cached.map(m => m.matched_user_id);
        const { data: connections } = await supabase
          .from("connection_requests")
          .select("requester_id, recipient_id, status")
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .in("requester_id", matchedIds.concat(user.id))
          .in("recipient_id", matchedIds.concat(user.id));
        
        return cached.map(m => {
          const conn = connections?.find(c => 
            (c.requester_id === user.id && c.recipient_id === m.matched_user_id) ||
            (c.requester_id === m.matched_user_id && c.recipient_id === user.id)
          );
          
          return {
            ...m,
            matched_profile: m.profiles,
            connection_status: conn?.status === "accepted" ? "connected" : 
                              conn ? "pending" : "none",
          };
        }) as Match[];
      }
      
      // Generate new matches if no cached results
      return await generateMatches(user.id);
    },
    enabled: !!user?.id,
  });
}

// =====================================================
// GENERATE MATCHES (RULE-BASED ALGORITHM)
// =====================================================

async function generateMatches(userId: string): Promise<Match[]> {
  // Get user's profile
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("*, user_skills(skill_name)")
    .eq("id", userId)
    .single();
  
  if (!myProfile) return [];
  
  const mySkills = myProfile.user_skills?.map((s: any) => s.skill_name.toLowerCase()) || [];
  
  // Get potential matches
  const { data: potentials } = await supabase
    .from("profiles")
    .select("*, user_skills(skill_name)")
    .neq("id", userId)
    .limit(100);
  
  if (!potentials || potentials.length === 0) return [];
  
  // Get existing connections
  const { data: connections } = await supabase
    .from("connection_requests")
    .select("requester_id, recipient_id, status")
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);
  
  const connectedIds = connections
    ?.filter(c => c.status === "accepted")
    .map(c => c.requester_id === userId ? c.recipient_id : c.requester_id) || [];
  
  // Score each potential match
  const scored = potentials
    .filter(p => !connectedIds.includes(p.id))
    .map(p => {
      let score = 0;
      const reasons: Match["match_reasons"] = {};
      
      // Skills overlap (35%)
      const theirSkills = p.user_skills?.map((s: any) => s.skill_name.toLowerCase()) || [];
      const overlap = mySkills.filter((s: string) => theirSkills.includes(s));
      if (overlap.length > 0) {
        score += Math.min(overlap.length * 7, 35);
        reasons.skills_overlap = overlap.length;
        reasons.research_interests = overlap;
      }
      
      // Same university (20%)
      if (myProfile.university && p.university && 
          myProfile.university.toLowerCase() === p.university.toLowerCase()) {
        score += 20;
        reasons.same_university = true;
      }
      
      // Trust score bonus (15%) - simplified
      score += 5;
      
      // Role compatibility (15%)
      if (myProfile.role === "student" && p.role === "researcher") score += 15;
      if (myProfile.role === "researcher" && p.role === "student") score += 10;
      if (myProfile.role === p.role) score += 5;
      
      // Random factor for diversity (15%)
      score += Math.random() * 15;
      
      return {
        matched_user_id: p.id,
        match_score: Math.min(Math.round(score), 100),
        match_reasons: reasons,
        profile: {
          id: p.id,
          full_name: p.full_name,
          university: p.university,
          role: p.role,
        },
      };
    })
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 20);
  
  // Cache results
  if (scored.length > 0) {
    await supabase
      .from("ai_match_results")
      .upsert(
        scored.map(s => ({
          user_id: userId,
          matched_user_id: s.matched_user_id,
          match_score: s.match_score,
          match_reasons: s.match_reasons,
        })),
        { onConflict: "user_id,matched_user_id" }
      );
  }
  
  return scored.map(s => ({
    id: `${userId}-${s.matched_user_id}`,
    user_id: userId,
    matched_user_id: s.matched_user_id,
    match_score: s.match_score,
    match_reasons: s.match_reasons,
    created_at: new Date().toISOString(),
    matched_profile: s.profile,
    connection_status: "none" as const,
  }));
}

// =====================================================
// REFRESH MATCHES
// =====================================================

export function useRefreshMatches() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      
      // Delete old matches
      await supabase
        .from("ai_match_results")
        .delete()
        .eq("user_id", user.id);
      
      // Generate new ones
      return await generateMatches(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiMatches", user?.id] });
      toast.success("Matches refreshed");
    },
  });
}

// =====================================================
// PEOPLE YOU MAY KNOW (NETWORK BASED)
// =====================================================

export function usePeopleYouMayKnow() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["peopleYouMayKnow", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("network_suggestions")
        .select("*, profiles!network_suggestions_suggested_user_id_fkey(id, full_name, avatar_url, university, bio)")
        .eq("user_id", user.id)
        .order("score", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return data.map(s => ({
        ...s,
        profile: s.profiles,
      }));
    },
    enabled: !!user?.id,
  });
}
