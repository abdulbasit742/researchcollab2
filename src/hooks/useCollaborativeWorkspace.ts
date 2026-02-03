import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

export interface CollaborativeWorkspace {
  id: string;
  research_timeline_id: string | null;
  title: string;
  description: string | null;
  workspace_type: string;
  created_by: string;
  is_archived: boolean;
  settings: Json;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: string;
  invited_by: string | null;
  joined_at: string;
}

export interface WorkspaceBlock {
  id: string;
  workspace_id: string;
  parent_block_id: string | null;
  block_type: string;
  content: Json;
  position: number;
  created_by: string;
  last_edited_by: string | null;
  is_locked: boolean;
  locked_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceBlockVersion {
  id: string;
  block_id: string;
  version_number: number;
  content_snapshot: Json;
  edited_by: string;
  change_type: string | null;
  change_note: string | null;
  created_at: string;
}

export interface WorkspacePresence {
  id: string;
  workspace_id: string;
  user_id: string;
  current_block_id: string | null;
  cursor_position: Json | null;
  last_seen_at: string;
}

export interface WorkspaceDiscussion {
  id: string;
  workspace_id: string;
  related_block_id: string | null;
  discussion_type: string;
  content: string;
  created_by: string;
  is_resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export function useWorkspace(workspaceId?: string) {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<CollaborativeWorkspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspace = useCallback(async () => {
    if (!workspaceId) {
      setWorkspace(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from("collaborative_workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single();

      if (fetchError) throw fetchError;
      setWorkspace(data);

      // Fetch members
      const { data: membersData } = await supabase
        .from("workspace_members")
        .select("*")
        .eq("workspace_id", workspaceId);

      setMembers(membersData || []);
    } catch (err: any) {
      console.error("Error fetching workspace:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const updateWorkspace = async (updates: Partial<CollaborativeWorkspace>) => {
    if (!workspaceId) return { success: false, error: "No workspace ID" };

    try {
      const { error } = await supabase
        .from("collaborative_workspaces")
        .update(updates as any)
        .eq("id", workspaceId);

      if (error) throw error;
      await fetchWorkspace();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const inviteMember = async (userId: string, role: string = "contributor") => {
    if (!workspaceId || !user) return { success: false, error: "Missing data" };

    try {
      const { data, error } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspaceId,
          user_id: userId,
          role,
          invited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setMembers(prev => [...prev, data]);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("workspace_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      setMembers(prev => prev.filter(m => m.id !== memberId));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return {
    workspace,
    members,
    loading,
    error,
    refetch: fetchWorkspace,
    updateWorkspace,
    inviteMember,
    removeMember,
  };
}

export function useWorkspaces() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<CollaborativeWorkspace[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("collaborative_workspaces")
        .select("*")
        .eq("is_archived", false)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setWorkspaces(data || []);
    } catch (err) {
      console.error("Error fetching workspaces:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const createWorkspace = async (workspace: {
    title: string;
    description?: string;
    workspace_type: string;
    research_timeline_id?: string;
    settings?: Record<string, any>;
  }) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { data, error } = await supabase
        .from("collaborative_workspaces")
        .insert({
          ...workspace,
          created_by: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      await fetchWorkspaces();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { workspaces, loading, createWorkspace, refetch: fetchWorkspaces };
}

export function useWorkspaceBlocks(workspaceId?: string) {
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<WorkspaceBlock[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlocks = useCallback(async () => {
    if (!workspaceId) {
      setBlocks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("workspace_blocks")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("position", { ascending: true });

      if (error) throw error;
      setBlocks(data || []);
    } catch (err) {
      console.error("Error fetching blocks:", err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!workspaceId) return;

    const channel = supabase
      .channel(`workspace-blocks-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_blocks",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBlocks(prev => [...prev, payload.new as WorkspaceBlock].sort((a, b) => a.position - b.position));
          } else if (payload.eventType === "UPDATE") {
            setBlocks(prev => prev.map(b => b.id === payload.new.id ? payload.new as WorkspaceBlock : b));
          } else if (payload.eventType === "DELETE") {
            setBlocks(prev => prev.filter(b => b.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId]);

  const createBlock = async (block: {
    block_type: string;
    content: Record<string, any>;
    position?: number;
    parent_block_id?: string;
  }) => {
    if (!workspaceId || !user) return { success: false, error: "Missing data" };

    try {
      const maxPosition = blocks.length > 0 ? Math.max(...blocks.map(b => b.position)) + 1 : 0;
      
      const { data, error } = await supabase
        .from("workspace_blocks")
        .insert({
          ...block,
          workspace_id: workspaceId,
          created_by: user.id,
          position: block.position ?? maxPosition,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateBlock = async (blockId: string, updates: Partial<WorkspaceBlock>) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("workspace_blocks")
        .update({
          ...updates,
          last_edited_by: user.id,
        } as any)
        .eq("id", blockId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteBlock = async (blockId: string) => {
    try {
      const { error } = await supabase
        .from("workspace_blocks")
        .delete()
        .eq("id", blockId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const lockBlock = async (blockId: string) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("workspace_blocks")
        .update({
          is_locked: true,
          locked_by: user.id,
        })
        .eq("id", blockId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const unlockBlock = async (blockId: string) => {
    try {
      const { error } = await supabase
        .from("workspace_blocks")
        .update({
          is_locked: false,
          locked_by: null,
        })
        .eq("id", blockId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return {
    blocks,
    loading,
    refetch: fetchBlocks,
    createBlock,
    updateBlock,
    deleteBlock,
    lockBlock,
    unlockBlock,
  };
}

export function useWorkspacePresence(workspaceId?: string) {
  const { user } = useAuth();
  const [presence, setPresence] = useState<WorkspacePresence[]>([]);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchPresence = async () => {
      const { data } = await supabase
        .from("workspace_presence")
        .select("*")
        .eq("workspace_id", workspaceId);

      setPresence(data || []);
    };

    fetchPresence();

    // Subscribe to presence changes
    const channel = supabase
      .channel(`workspace-presence-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_presence",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          fetchPresence();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId]);

  const updatePresence = async (currentBlockId?: string, cursorPosition?: Record<string, any>) => {
    if (!workspaceId || !user) return;

    try {
      await supabase
        .from("workspace_presence")
        .upsert({
          workspace_id: workspaceId,
          user_id: user.id,
          current_block_id: currentBlockId,
          cursor_position: cursorPosition,
          last_seen_at: new Date().toISOString(),
        } as any, {
          onConflict: "workspace_id,user_id",
        });
    } catch (err) {
      console.error("Error updating presence:", err);
    }
  };

  const leaveWorkspace = async () => {
    if (!workspaceId || !user) return;

    try {
      await supabase
        .from("workspace_presence")
        .delete()
        .eq("workspace_id", workspaceId)
        .eq("user_id", user.id);
    } catch (err) {
      console.error("Error leaving workspace:", err);
    }
  };

  return { presence, updatePresence, leaveWorkspace };
}

export function useWorkspaceDiscussions(workspaceId?: string) {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<WorkspaceDiscussion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscussions = async () => {
      if (!workspaceId) {
        setDiscussions([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("workspace_discussions")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setDiscussions(data || []);
      } catch (err) {
        console.error("Error fetching discussions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();

    // Subscribe to new discussions
    if (workspaceId) {
      const channel = supabase
        .channel(`workspace-discussions-${workspaceId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "workspace_discussions",
            filter: `workspace_id=eq.${workspaceId}`,
          },
          (payload) => {
            setDiscussions(prev => [...prev, payload.new as WorkspaceDiscussion]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [workspaceId]);

  const createDiscussion = async (discussion: {
    discussion_type: string;
    content: string;
    related_block_id?: string;
  }) => {
    if (!workspaceId || !user) return { success: false, error: "Missing data" };

    try {
      const { data, error } = await supabase
        .from("workspace_discussions")
        .insert({
          ...discussion,
          workspace_id: workspaceId,
          created_by: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const resolveDiscussion = async (discussionId: string) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("workspace_discussions")
        .update({
          is_resolved: true,
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", discussionId);

      if (error) throw error;
      setDiscussions(prev => prev.map(d => 
        d.id === discussionId 
          ? { ...d, is_resolved: true, resolved_by: user.id, resolved_at: new Date().toISOString() }
          : d
      ));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { discussions, loading, createDiscussion, resolveDiscussion };
}
