import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MutualCollaborator {
  id: string;
  fullName: string;
  role: string | null;
  connectionType: string;
  projectReference: string | null;
  verified: boolean;
}

export interface SharedWorkContext {
  sharedProjects: number;
  sharedInstitution: boolean;
  mutualCollaborators: MutualCollaborator[];
  totalMutualConnections: number;
}

export function useMutualCollaborators(targetUserId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["mutualCollaborators", user?.id, targetUserId],
    queryFn: async (): Promise<SharedWorkContext> => {
      if (!user?.id || !targetUserId || user.id === targetUserId) {
        return {
          sharedProjects: 0,
          sharedInstitution: false,
          mutualCollaborators: [],
          totalMutualConnections: 0,
        };
      }

      // Get my work connections
      const { data: myConnections } = await supabase
        .from("work_connections")
        .select("connected_user_id")
        .eq("user_id", user.id);

      // Get target's work connections  
      const { data: theirConnections } = await supabase
        .from("work_connections")
        .select("connected_user_id")
        .eq("user_id", targetUserId);

      const mySet = new Set((myConnections || []).map(c => c.connected_user_id));
      const theirSet = new Set((theirConnections || []).map(c => c.connected_user_id));
      
      // Find intersection (mutual work connections)
      const mutualIds = [...mySet].filter(id => theirSet.has(id));

      // Get profiles of mutual connections
      let mutualCollaborators: MutualCollaborator[] = [];
      if (mutualIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, first_name, last_name, role")
          .in("id", mutualIds.slice(0, 5)); // Limit to 5

        const { data: connectionDetails } = await supabase
          .from("work_connections")
          .select("connected_user_id, connection_type, project_reference, verified")
          .eq("user_id", user.id)
          .in("connected_user_id", mutualIds);

        mutualCollaborators = (profiles || []).map((p: any) => {
          const conn = connectionDetails?.find(c => c.connected_user_id === p.id);
          return {
            id: p.id,
            fullName: p.full_name || `${p.first_name || ""} ${p.last_name || ""}`.trim() || "User",
            role: p.role,
            connectionType: conn?.connection_type || "collaborator",
            projectReference: conn?.project_reference,
            verified: conn?.verified || false,
          };
        });
      }

      // Check for shared projects (both participated in same project)
      const { data: myProjects } = await supabase
        .from("accountability_records")
        .select("project_id")
        .or(`initiator_id.eq.${user.id},executor_id.eq.${user.id}`)
        .not("project_id", "is", null);

      const { data: theirProjects } = await supabase
        .from("accountability_records")
        .select("project_id")
        .or(`initiator_id.eq.${targetUserId},executor_id.eq.${targetUserId}`)
        .not("project_id", "is", null);

      const myProjectIds = new Set((myProjects || []).map(p => p.project_id));
      const theirProjectIds = new Set((theirProjects || []).map(p => p.project_id));
      const sharedProjectIds = [...myProjectIds].filter(id => theirProjectIds.has(id));

      // Check for shared institution
      const [{ data: myProfile }, { data: theirProfile }] = await Promise.all([
        supabase.from("profiles").select("university").eq("id", user.id).maybeSingle(),
        supabase.from("profiles").select("university").eq("id", targetUserId).maybeSingle(),
      ]);

      const sharedInstitution = !!(
        myProfile?.university && 
        theirProfile?.university && 
        myProfile.university.toLowerCase() === theirProfile.university.toLowerCase()
      );

      return {
        sharedProjects: sharedProjectIds.length,
        sharedInstitution,
        mutualCollaborators,
        totalMutualConnections: mutualIds.length,
      };
    },
    enabled: !!user?.id && !!targetUserId && user.id !== targetUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
