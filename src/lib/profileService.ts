import { supabase } from "@/integrations/supabase/client";

// Use the DB-generated type to stay in sync
import type { Database } from "@/integrations/supabase/types";
export type ProfileData = Database["public"]["Tables"]["profiles"]["Row"];

export async function getProfile(userId: string): Promise<ProfileData | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("getProfile error:", error);
    return null;
  }
  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<ProfileData, "id" | "created_at">>
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("updateProfile error:", error);
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

export async function createProfileIfNotExists(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}): Promise<ProfileData | null> {
  // Check if profile exists
  const existing = await getProfile(user.id);
  if (existing) return existing;

  // Create default profile
  const meta = user.user_metadata || {};
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      first_name: meta.first_name || null,
      last_name: meta.last_name || null,
      full_name: meta.first_name && meta.last_name
        ? `${meta.first_name} ${meta.last_name}`
        : null,
    })
    .select()
    .single();

  if (error) {
    console.error("createProfileIfNotExists error:", error);
    return null;
  }
  return data;
}
