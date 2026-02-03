import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;
  skill_category: string;
  proficiency_level: string;
  is_featured: boolean;
  endorsement_count: number;
  created_at: string;
}

export interface SkillEndorsement {
  id: string;
  user_skill_id: string;
  endorser_id: string;
  endorsement_strength: number;
  created_at: string;
  endorser?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
  };
}

// =====================================================
// USER SKILLS
// =====================================================

export function useUserSkills(userId?: string) {
  return useQuery({
    queryKey: ["userSkills", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("user_skills")
        .select("*")
        .eq("user_id", userId)
        .order("endorsement_count", { ascending: false });
      
      if (error) throw error;
      return (data || []) as UserSkill[];
    },
    enabled: !!userId,
  });
}

export function useAddSkill() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (skill: {
      skill_name: string;
      skill_category: string;
      proficiency_level: string;
      is_featured?: boolean;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("user_skills")
        .insert({
          user_id: user.id,
          skill_name: skill.skill_name.toLowerCase().trim(),
          skill_category: skill.skill_category,
          proficiency_level: skill.proficiency_level,
          is_featured: skill.is_featured || false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSkills", user?.id] });
      toast.success("Skill added");
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast.error("You already have this skill");
      } else {
        toast.error("Failed to add skill");
      }
    },
  });
}

export function useUpdateSkill() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ skillId, updates }: {
      skillId: string;
      updates: Partial<Pick<UserSkill, "skill_category" | "proficiency_level" | "is_featured">>;
    }) => {
      const { error } = await supabase
        .from("user_skills")
        .update(updates)
        .eq("id", skillId)
        .eq("user_id", user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSkills", user?.id] });
      toast.success("Skill updated");
    },
    onError: () => {
      toast.error("Failed to update skill");
    },
  });
}

export function useRemoveSkill() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (skillId: string) => {
      const { error } = await supabase
        .from("user_skills")
        .delete()
        .eq("id", skillId)
        .eq("user_id", user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSkills", user?.id] });
      toast.success("Skill removed");
    },
    onError: () => {
      toast.error("Failed to remove skill");
    },
  });
}

// =====================================================
// SKILL ENDORSEMENTS
// =====================================================

export function useSkillEndorsements(skillId?: string) {
  return useQuery({
    queryKey: ["skillEndorsements", skillId],
    queryFn: async () => {
      if (!skillId) return [];
      
      const { data, error } = await supabase
        .from("skill_endorsements")
        .select(`
          *,
          endorser:profiles!skill_endorsements_endorser_id_fkey(id, full_name, role)
        `)
        .eq("user_skill_id", skillId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data || []) as SkillEndorsement[];
    },
    enabled: !!skillId,
  });
}

export function useHasEndorsedSkill(skillId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["hasEndorsed", user?.id, skillId],
    queryFn: async () => {
      if (!user?.id || !skillId) return false;
      
      const { data, error } = await supabase
        .from("skill_endorsements")
        .select("id")
        .eq("user_skill_id", skillId)
        .eq("endorser_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!user?.id && !!skillId,
  });
}

export function useEndorseSkill() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ skillId, strength = 1 }: { skillId: string; strength?: number }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("skill_endorsements")
        .insert({
          user_skill_id: skillId,
          endorser_id: user.id,
          endorsement_strength: strength,
        });
      
      if (error) throw error;
    },
    onSuccess: (_, { skillId }) => {
      queryClient.invalidateQueries({ queryKey: ["hasEndorsed", user?.id, skillId] });
      queryClient.invalidateQueries({ queryKey: ["skillEndorsements", skillId] });
      queryClient.invalidateQueries({ queryKey: ["userSkills"] });
      toast.success("Skill endorsed");
    },
    onError: (error: Error) => {
      if (error.message.includes("cannot endorse own")) {
        toast.error("You cannot endorse your own skill");
      } else {
        toast.error("Failed to endorse skill");
      }
    },
  });
}

export function useRemoveEndorsement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (skillId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("skill_endorsements")
        .delete()
        .eq("user_skill_id", skillId)
        .eq("endorser_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: (_, skillId) => {
      queryClient.invalidateQueries({ queryKey: ["hasEndorsed", user?.id, skillId] });
      queryClient.invalidateQueries({ queryKey: ["skillEndorsements", skillId] });
      queryClient.invalidateQueries({ queryKey: ["userSkills"] });
      toast.success("Endorsement removed");
    },
    onError: () => {
      toast.error("Failed to remove endorsement");
    },
  });
}
