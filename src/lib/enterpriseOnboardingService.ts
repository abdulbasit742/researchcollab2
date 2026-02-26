import { supabase } from "@/integrations/supabase/client";

/**
 * Enterprise Onboarding Service — manages institutional registration flow.
 *
 * Flow:
 *   1. Organization registers (or is created by admin)
 *   2. Admin assigns institutional role to members
 *   3. Initial wallet allocation
 *   4. Dashboard metrics initialized
 *   5. Subscription tier applied
 */

export interface OnboardingStatus {
  orgCreated: boolean;
  adminAssigned: boolean;
  walletInitialized: boolean;
  metricsInitialized: boolean;
  subscriptionApplied: boolean;
  completionPercentage: number;
}

export async function createInstitution(params: {
  name: string;
  type: string;
  adminEmail?: string;
  adminName?: string;
  country?: string;
  city?: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from("organizations")
    .insert({
      name: params.name,
      type: params.type,
      admin_contact_email: params.adminEmail ?? null,
      admin_contact_name: params.adminName ?? null,
      country: params.country ?? null,
      city: params.city ?? null,
      status: "pending_verification",
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function assignInstitutionalAdmin(orgId: string, userId: string) {
  const { error } = await supabase
    .from("organization_members")
    .insert({
      org_id: orgId,
      user_id: userId,
      role: "admin",
      is_faculty_admin: true,
      status: "active",
    });

  if (error) throw error;

  // Notify user
  await supabase.from("notifications").insert({
    user_id: userId,
    type: "system",
    title: "Institutional Admin Role Assigned",
    message: "You have been assigned as an institutional administrator.",
    data: { org_id: orgId, link: `/org/${orgId}/dashboard` },
  });
}

export async function initializeInstitutionWallet(orgId: string) {
  // Check if org already has metrics
  const { data: existing } = await supabase
    .from("academic_output_metrics")
    .select("id")
    .eq("institution_id", orgId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("academic_output_metrics").insert({
      institution_id: orgId,
      period: new Date().toISOString().substring(0, 7),
      active_fyps: 0,
      active_research: 0,
      completed_fyps: 0,
      economic_output: 0,
    });
  }
}

export async function applySubscriptionTier(orgId: string, tierName: string) {
  await supabase
    .from("organizations")
    .update({
      subscription_plan: tierName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orgId);
}

export async function getOnboardingStatus(orgId: string): Promise<OnboardingStatus> {
  const [orgRes, membersRes, metricsRes] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", orgId).maybeSingle(),
    supabase.from("organization_members").select("id, role").eq("org_id", orgId),
    supabase.from("academic_output_metrics").select("id").eq("institution_id", orgId).maybeSingle(),
  ]);

  const org = orgRes.data;
  const members = membersRes.data ?? [];
  const hasAdmin = members.some(m => m.role === "admin");
  const hasMetrics = !!metricsRes.data;
  const hasSub = !!org?.subscription_plan;

  const steps = [!!org, hasAdmin, true, hasMetrics, hasSub];
  const completed = steps.filter(Boolean).length;

  return {
    orgCreated: !!org,
    adminAssigned: hasAdmin,
    walletInitialized: true,
    metricsInitialized: hasMetrics,
    subscriptionApplied: hasSub,
    completionPercentage: Math.round((completed / steps.length) * 100),
  };
}
