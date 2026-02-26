import { supabase } from "@/integrations/supabase/client";

/**
 * Organization Service — CRUD for organizations, members, and metrics.
 * Hooks (useOrganizationManagement, useEnterpriseAdmin) handle UI-level queries.
 * This service is for programmatic / edge-function use.
 */

export async function getOrganization(orgId: string) {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getOrganizationsByType(type: string) {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("type", type)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getOrganizationMembers(orgId: string) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("*, profiles(id, full_name, university, role)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addOrganizationMember(orgId: string, userId: string, role = "member") {
  const { data, error } = await supabase
    .from("organization_members")
    .insert({ org_id: orgId, user_id: userId, role })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeOrganizationMember(memberId: string) {
  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("id", memberId);
  if (error) throw error;
}

export async function updateOrganization(orgId: string, updates: Record<string, any>) {
  const { error } = await supabase
    .from("organizations")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", orgId);
  if (error) throw error;
}

export async function getOrganizationMetrics(orgId: string) {
  const { data, error } = await supabase
    .from("academic_output_metrics")
    .select("*")
    .eq("institution_id", orgId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getUserOrganizations(userId: string) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("*, organizations(*)")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}
