import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface MutualWorkContextData {
  sharedInstitutions: string[];
  mutualCollaborators: number;
  sharedSkills: string[];
}

export function useMutualWorkContext(targetUserId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["mutual-work-context", user?.id, targetUserId],
    queryFn: async (): Promise<MutualWorkContextData | null> => {
      if (!user?.id || !targetUserId || user.id === targetUserId) return null;

      // Fetch in parallel: institutions, skills, and offers for both users
      const [myOrgsRes, targetOrgsRes, mySkillsRes, targetSkillsRes, myOffersRes, targetOffersRes] =
        await Promise.all([
          supabase
            .from("organization_members")
            .select("organizations(name)")
            .eq("user_id", user.id),
          supabase
            .from("organization_members")
            .select("organizations(name)")
            .eq("user_id", targetUserId),
          supabase
            .from("user_skills")
            .select("skill_name")
            .eq("user_id", user.id),
          supabase
            .from("user_skills")
            .select("skill_name")
            .eq("user_id", targetUserId),
          // Get completed offers where current user participated
          supabase
            .from("offers")
            .select("id, sender_id, recipient_id")
            .eq("status", "completed")
            .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .limit(100),
          // Get completed offers where target user participated
          supabase
            .from("offers")
            .select("id, sender_id, recipient_id")
            .eq("status", "completed")
            .or(`sender_id.eq.${targetUserId},recipient_id.eq.${targetUserId}`)
            .limit(100),
        ]);

      // Shared institutions
      const myOrgs = (myOrgsRes.data || [])
        .map((o: any) => o.organizations?.name)
        .filter(Boolean);
      const targetOrgs = (targetOrgsRes.data || [])
        .map((o: any) => o.organizations?.name)
        .filter(Boolean);
      const sharedInstitutions = myOrgs.filter((o: string) => targetOrgs.includes(o));

      // Shared skills
      const mySkills = (mySkillsRes.data || []).map((s: any) => s.skill_name);
      const targetSkills = (targetSkillsRes.data || []).map((s: any) => s.skill_name);
      const sharedSkills = mySkills.filter((s: string) => targetSkills.includes(s));

      // Mutual collaborators: find people who worked with both users
      const myCollaborators = new Set<string>();
      (myOffersRes.data || []).forEach((o: any) => {
        if (o.sender_id !== user.id) myCollaborators.add(o.sender_id);
        if (o.recipient_id !== user.id) myCollaborators.add(o.recipient_id);
      });
      let mutualCollaborators = 0;
      (targetOffersRes.data || []).forEach((o: any) => {
        if (o.sender_id !== targetUserId && myCollaborators.has(o.sender_id)) mutualCollaborators++;
        if (o.recipient_id !== targetUserId && myCollaborators.has(o.recipient_id)) mutualCollaborators++;
      });

      return { sharedInstitutions, mutualCollaborators, sharedSkills };
    },
    enabled: !!user?.id && !!targetUserId && user.id !== targetUserId,
    staleTime: 5 * 60 * 1000,
  });
}
