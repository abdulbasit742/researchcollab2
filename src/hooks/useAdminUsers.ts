import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminUser {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  university: string | null;
  department: string | null;
  location: string | null;
  created_at: string;
  onboarding_completed: boolean | null;
  user_role?: "student" | "researcher" | "admin";
  is_blocked?: boolean;
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      // Fetch blocked users
      const { data: blocks } = await supabase
        .from("user_blocks")
        .select("blocked_id");

      const blockedIds = new Set((blocks || []).map(b => b.blocked_id));
      const roleMap = new Map((roles || []).map(r => [r.user_id, r.role]));

      const enrichedUsers = (profiles || []).map(profile => ({
        ...profile,
        user_role: roleMap.get(profile.id) as "student" | "researcher" | "admin" | undefined,
        is_blocked: blockedIds.has(profile.id),
      }));

      setUsers(enrichedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: "student" | "researcher" | "admin") => {
    try {
      // Check if user already has a role
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role })
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role });
        if (error) throw error;
      }

      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      console.error("Error updating user role:", err);
      return { success: false, error: err.message };
    }
  };

  const blockUser = async (userId: string, blockerId: string) => {
    try {
      const { error } = await supabase
        .from("user_blocks")
        .insert({ blocked_id: userId, blocker_id: blockerId });
      if (error) throw error;
      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      console.error("Error blocking user:", err);
      return { success: false, error: err.message };
    }
  };

  const unblockUser = async (userId: string, blockerId: string) => {
    try {
      const { error } = await supabase
        .from("user_blocks")
        .delete()
        .eq("blocked_id", userId)
        .eq("blocker_id", blockerId);
      if (error) throw error;
      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      console.error("Error unblocking user:", err);
      return { success: false, error: err.message };
    }
  };

  const updateUserProfile = async (userId: string, updates: Partial<AdminUser>) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);
      if (error) throw error;
      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      console.error("Error updating user:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    users,
    loading,
    refetch: fetchUsers,
    updateUserRole,
    blockUser,
    unblockUser,
    updateUserProfile,
  };
}
