import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =====================================================
// TYPES
// =====================================================

export interface Collaboration {
  id: string;
  title: string;
  description: string | null;
  collaboration_type: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  organization_id: string | null;
  created_by: string;
  created_at: string;
  // Joined data
  organization?: { name: string };
  members?: CollaborationMember[];
  member_count?: number;
}

export interface CollaborationMember {
  id: string;
  collaboration_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  // Joined data
  profile?: { full_name: string | null };
}

// =====================================================
// MY COLLABORATIONS
// =====================================================

export function useMyCollaborations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["myCollaborations", user?.id],
    queryFn: async () => {
      if (!user?.id) return { active: [], past: [], suggested: [] };
      
      // Get collaborations I'm a member of
      const { data: memberships, error: memError } = await supabase
        .from("collaboration_members")
        .select(`
          *,
          collaborations(*, organizations(name))
        `)
        .eq("user_id", user.id);
      
      if (memError) throw memError;
      
      // Get collaborations I created
      const { data: created, error: createdError } = await supabase
        .from("collaborations")
        .select("*, organizations(name)")
        .eq("created_by", user.id);
      
      if (createdError) throw createdError;
      
      // Combine and deduplicate
      const all = new Map<string, Collaboration>();
      
      memberships?.forEach(m => {
        if (m.collaborations) {
          all.set(m.collaborations.id, {
            ...m.collaborations,
            organization: m.collaborations.organizations,
          });
        }
      });
      
      created?.forEach(c => {
        all.set(c.id, {
          ...c,
          organization: c.organizations,
        });
      });
      
      const allCollabs = Array.from(all.values());
      
      return {
        active: allCollabs.filter(c => c.status === "active"),
        past: allCollabs.filter(c => c.status === "completed"),
        suggested: [], // Could add AI-based suggestions here
      };
    },
    enabled: !!user?.id,
  });
}

// =====================================================
// SINGLE COLLABORATION
// =====================================================

export function useCollaboration(collabId?: string) {
  return useQuery({
    queryKey: ["collaboration", collabId],
    queryFn: async () => {
      if (!collabId) return null;
      
      const { data, error } = await supabase
        .from("collaborations")
        .select(`
          *,
          organizations(name),
          collaboration_members(*, profiles(full_name))
        `)
        .eq("id", collabId)
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        organization: data.organizations,
        members: data.collaboration_members?.map((m: any) => ({
          ...m,
          profile: m.profiles,
        })),
        member_count: data.collaboration_members?.length || 0,
      } as Collaboration;
    },
    enabled: !!collabId,
  });
}

// =====================================================
// CREATE COLLABORATION
// =====================================================

export function useCreateCollaboration() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      collaboration_type?: string;
      start_date?: string;
      organization_id?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data: collab, error } = await supabase
        .from("collaborations")
        .insert({
          ...data,
          created_by: user.id,
          status: "active",
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add creator as member
      await supabase
        .from("collaboration_members")
        .insert({
          collaboration_id: collab.id,
          user_id: user.id,
          role: "lead",
        });
      
      return collab;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCollaborations"] });
      toast.success("Collaboration created");
    },
    onError: () => {
      toast.error("Failed to create collaboration");
    },
  });
}

// =====================================================
// ADD MEMBER TO COLLABORATION
// =====================================================

export function useAddCollaborationMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ collaborationId, userId, role }: {
      collaborationId: string;
      userId: string;
      role?: string;
    }) => {
      const { error } = await supabase
        .from("collaboration_members")
        .insert({
          collaboration_id: collaborationId,
          user_id: userId,
          role: role || "member",
        });
      
      if (error) throw error;
    },
    onSuccess: (_, { collaborationId }) => {
      queryClient.invalidateQueries({ queryKey: ["collaboration", collaborationId] });
      toast.success("Member added");
    },
  });
}

// =====================================================
// UPDATE COLLABORATION STATUS
// =====================================================

export function useUpdateCollaborationStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ collaborationId, status }: {
      collaborationId: string;
      status: string;
    }) => {
      const { error } = await supabase
        .from("collaborations")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", collaborationId);
      
      if (error) throw error;
    },
    onSuccess: (_, { collaborationId }) => {
      queryClient.invalidateQueries({ queryKey: ["collaboration", collaborationId] });
      queryClient.invalidateQueries({ queryKey: ["myCollaborations"] });
      toast.success("Status updated");
    },
  });
}

// =====================================================
// DISCOVER COLLABORATIONS
// =====================================================

export function useDiscoverCollaborations(filters?: { type?: string; search?: string }) {
  return useQuery({
    queryKey: ["discoverCollaborations", filters],
    queryFn: async () => {
      let query = supabase
        .from("collaborations")
        .select(`
          *,
          organizations(name),
          collaboration_members(id)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (filters?.type) {
        query = query.eq("collaboration_type", filters.type);
      }
      
      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return data.map(c => ({
        ...c,
        organization: c.organizations,
        member_count: c.collaboration_members?.length || 0,
      })) as Collaboration[];
    },
  });
}
