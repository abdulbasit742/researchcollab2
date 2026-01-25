import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuditLog } from "./useAdminAuditLog";

export interface Organization {
  id: string;
  name: string;
  type: "university" | "enterprise" | "research_lab" | "department";
  admin_contact_email: string | null;
  admin_contact_name: string | null;
  city: string | null;
  country: string | null;
  member_limit: number;
  subscription_plan: "basic" | "professional" | "enterprise" | "custom";
  status: "active" | "suspended" | "pending";
  total_spent: number;
  created_at: string;
  updated_at: string;
  // Computed fields
  member_count?: number;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: "owner" | "admin" | "manager" | "member";
  status: "active" | "invited" | "suspended";
  tool_access: string[];
  created_at: string;
  // Joined
  user_name?: string;
}

export interface BulkLicense {
  id: string;
  org_id: string;
  tool_id: string;
  total_seats: number;
  used_seats: number;
  monthly_cost: number;
  status: "active" | "expired" | "cancelled";
  expires_at: string | null;
  created_at: string;
  // Joined
  tool_name?: string;
  org_name?: string;
}

export function useAdminEnterprise() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [licenses, setLicenses] = useState<BulkLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const { logAction } = useAdminAuditLog();

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const { data: orgsData, error } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get member counts
      if (orgsData && orgsData.length > 0) {
        const { data: memberCounts } = await supabase
          .from("organization_members")
          .select("org_id");

        const countMap: Record<string, number> = {};
        memberCounts?.forEach((m) => {
          countMap[m.org_id] = (countMap[m.org_id] || 0) + 1;
        });

        const enrichedOrgs = orgsData.map((org) => ({
          ...org,
          member_count: countMap[org.id] || 0,
        }));

        setOrganizations(enrichedOrgs as Organization[]);
      } else {
        setOrganizations([]);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (orgId?: string) => {
    try {
      let query = supabase
        .from("organization_members")
        .select("*")
        .order("created_at", { ascending: false });

      if (orgId) {
        query = query.eq("org_id", orgId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch user profiles
      if (data && data.length > 0) {
        const userIds = data.map((m) => m.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, first_name, last_name")
          .in("id", userIds);

        const enrichedMembers = data.map((member) => {
          const profile = profiles?.find((p) => p.id === member.user_id);
          return {
            ...member,
            user_name: profile?.full_name || `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Unknown",
          };
        });

        setMembers(enrichedMembers as OrgMember[]);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const fetchLicenses = async () => {
    try {
      const { data, error } = await supabase
        .from("org_bulk_licenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch tool and org names
      if (data && data.length > 0) {
        const toolIds = [...new Set(data.map((l) => l.tool_id))];
        const orgIds = [...new Set(data.map((l) => l.org_id))];

        const [{ data: tools }, { data: orgs }] = await Promise.all([
          supabase.from("tools").select("id, name").in("id", toolIds),
          supabase.from("organizations").select("id, name").in("id", orgIds),
        ]);

        const enrichedLicenses = data.map((license) => ({
          ...license,
          tool_name: tools?.find((t) => t.id === license.tool_id)?.name || "Unknown",
          org_name: orgs?.find((o) => o.id === license.org_id)?.name || "Unknown",
        }));

        setLicenses(enrichedLicenses as BulkLicense[]);
      } else {
        setLicenses([]);
      }
    } catch (error) {
      console.error("Error fetching licenses:", error);
    }
  };

  useEffect(() => {
    fetchOrganizations();
    fetchMembers();
    fetchLicenses();
  }, []);

  const createOrganization = async (org: { name: string; type: string } & Partial<Omit<Organization, "name" | "type">>) => {
    const { data, error } = await supabase
      .from("organizations")
      .insert([org])
      .select()
      .single();

    if (!error && data) {
      await logAction("organization_created", "organization", data.id, org);
      await fetchOrganizations();
    }
    return { data, error };
  };

  const updateOrganization = async (id: string, updates: Partial<Organization>) => {
    const { error } = await supabase
      .from("organizations")
      .update(updates)
      .eq("id", id);

    if (!error) {
      await logAction("organization_updated", "organization", id, updates);
      await fetchOrganizations();
    }
    return { error };
  };

  const suspendOrganization = async (id: string) => {
    return updateOrganization(id, { status: "suspended" });
  };

  const activateOrganization = async (id: string) => {
    return updateOrganization(id, { status: "active" });
  };

  const addBulkLicense = async (license: { total_seats: number; monthly_cost: number } & Partial<Omit<BulkLicense, "total_seats" | "monthly_cost">>) => {
    const { data, error } = await supabase
      .from("org_bulk_licenses")
      .insert([license])
      .select()
      .single();

    if (!error && data) {
      await logAction("bulk_license_created", "bulk_license", data.id, license);
      await fetchLicenses();
    }
    return { data, error };
  };

  const getStats = () => {
    const totalOrganizations = organizations.length;
    const totalMembers = members.length;
    const totalRevenue = organizations.reduce((sum, o) => sum + (o.total_spent || 0), 0);
    const activeLicenses = licenses.filter((l) => l.status === "active").length;
    const totalSeats = licenses.reduce((sum, l) => sum + (l.total_seats || 0), 0);
    const usedSeats = licenses.reduce((sum, l) => sum + (l.used_seats || 0), 0);

    return {
      totalOrganizations,
      totalMembers,
      totalRevenue,
      activeLicenses,
      totalSeats,
      usedSeats,
    };
  };

  return {
    organizations,
    members,
    licenses,
    loading,
    refetch: fetchOrganizations,
    fetchMembers,
    fetchLicenses,
    createOrganization,
    updateOrganization,
    suspendOrganization,
    activateOrganization,
    addBulkLicense,
    getStats,
  };
}
