import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ScholarPassport {
  id: string;
  user_id: string;
  public_scholar_id: string;
  primary_affiliation: string | null;
  academic_role: "student" | "researcher" | "faculty" | "supervisor" | "industry_researcher" | "independent" | null;
  research_interests: string[] | null;
  verification_level: "unverified" | "basic" | "institution_verified" | "fully_verified";
  passport_status: "active" | "limited" | "suspended";
  created_at: string;
  updated_at: string;
}

interface ScholarCredential {
  id: string;
  scholar_passport_id: string;
  credential_type: "degree" | "position" | "affiliation" | "certification" | "award" | "fellowship";
  credential_title: string;
  issuing_body: string;
  issuing_body_verified: boolean;
  issued_date: string | null;
  expires_at: string | null;
  verification_status: "pending" | "verified" | "rejected";
  verification_source: string | null;
  verification_notes: string | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
}

interface ScholarVerificationEvent {
  id: string;
  scholar_passport_id: string;
  event_type: "submitted" | "verified" | "revoked" | "updated" | "level_changed";
  previous_value: string | null;
  new_value: string | null;
  performed_by: string | null;
  notes: string | null;
  created_at: string;
}

interface ScholarIdentityLink {
  id: string;
  scholar_passport_id: string;
  provider: "orcid" | "google_scholar" | "university_portal" | "researchgate" | "linkedin" | "github";
  external_identifier: string;
  profile_url: string | null;
  verification_status: "pending" | "verified" | "failed";
  verified_at: string | null;
  created_at: string;
}

export function useScholarPassport(userId?: string) {
  const { user } = useAuth();
  const [passport, setPassport] = useState<ScholarPassport | null>(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  const fetchPassport = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("scholar_passports")
      .select("*")
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching passport:", error);
    } else {
      setPassport(data as ScholarPassport | null);
    }
    setLoading(false);
  }, [targetUserId]);

  useEffect(() => {
    fetchPassport();
  }, [fetchPassport]);

  const updatePassport = async (updates: {
    primary_affiliation?: string;
    academic_role?: ScholarPassport["academic_role"];
    research_interests?: string[];
  }) => {
    if (!passport?.id) return { success: false, error: "No passport found" };

    const { error } = await supabase
      .from("scholar_passports")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", passport.id);

    if (error) {
      toast.error("Failed to update passport");
      return { success: false, error };
    }

    toast.success("Scholar passport updated");
    await fetchPassport();
    return { success: true };
  };

  return {
    passport,
    loading,
    fetchPassport,
    updatePassport,
  };
}

export function useScholarCredentials(passportId?: string) {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<ScholarCredential[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCredentials = useCallback(async () => {
    if (!passportId) {
      // Try to get passport ID from user
      if (user?.id) {
        const { data: passport } = await supabase
          .from("scholar_passports")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (passport) {
          const { data, error } = await supabase
            .from("scholar_credentials")
            .select("*")
            .eq("scholar_passport_id", passport.id)
            .order("created_at", { ascending: false });

          if (!error) {
            setCredentials(data as ScholarCredential[]);
          }
        }
      }
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("scholar_credentials")
      .select("*")
      .eq("scholar_passport_id", passportId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching credentials:", error);
    } else {
      setCredentials(data as ScholarCredential[]);
    }
    setLoading(false);
  }, [passportId, user?.id]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const addCredential = async (credential: {
    credential_type: ScholarCredential["credential_type"];
    credential_title: string;
    issuing_body: string;
    issued_date?: string;
    expires_at?: string;
  }) => {
    // Get passport ID
    let targetPassportId = passportId;
    if (!targetPassportId && user?.id) {
      const { data: passport } = await supabase
        .from("scholar_passports")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      targetPassportId = passport?.id;
    }

    if (!targetPassportId) return { success: false, error: "No passport found" };

    const { data, error } = await supabase
      .from("scholar_credentials")
      .insert({
        ...credential,
        scholar_passport_id: targetPassportId,
        verification_source: "self",
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add credential");
      return { success: false, error };
    }

    // Log verification event
    await supabase.from("scholar_verification_events").insert({
      scholar_passport_id: targetPassportId,
      event_type: "submitted",
      new_value: credential.credential_title,
      performed_by: user?.id,
      notes: `New ${credential.credential_type} credential submitted`,
    });

    toast.success("Credential added - pending verification");
    await fetchCredentials();
    return { success: true, data };
  };

  return {
    credentials,
    loading,
    fetchCredentials,
    addCredential,
  };
}

export function useScholarIdentityLinks(passportId?: string) {
  const { user } = useAuth();
  const [links, setLinks] = useState<ScholarIdentityLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    let targetPassportId = passportId;
    if (!targetPassportId && user?.id) {
      const { data: passport } = await supabase
        .from("scholar_passports")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      targetPassportId = passport?.id;
    }

    if (!targetPassportId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("scholar_identity_links")
      .select("*")
      .eq("scholar_passport_id", targetPassportId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching identity links:", error);
    } else {
      setLinks(data as ScholarIdentityLink[]);
    }
    setLoading(false);
  }, [passportId, user?.id]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const addIdentityLink = async (link: {
    provider: ScholarIdentityLink["provider"];
    external_identifier: string;
    profile_url?: string;
  }) => {
    let targetPassportId = passportId;
    if (!targetPassportId && user?.id) {
      const { data: passport } = await supabase
        .from("scholar_passports")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      targetPassportId = passport?.id;
    }

    if (!targetPassportId) return { success: false, error: "No passport found" };

    const { data, error } = await supabase
      .from("scholar_identity_links")
      .insert({
        ...link,
        scholar_passport_id: targetPassportId,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to link identity");
      return { success: false, error };
    }

    toast.success(`${link.provider} account linked - pending verification`);
    await fetchLinks();
    return { success: true, data };
  };

  return {
    links,
    loading,
    fetchLinks,
    addIdentityLink,
  };
}

export function useScholarVerificationHistory(passportId?: string) {
  const { user } = useAuth();
  const [events, setEvents] = useState<ScholarVerificationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    let targetPassportId = passportId;
    if (!targetPassportId && user?.id) {
      const { data: passport } = await supabase
        .from("scholar_passports")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      targetPassportId = passport?.id;
    }

    if (!targetPassportId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("scholar_verification_events")
      .select("*")
      .eq("scholar_passport_id", targetPassportId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching verification events:", error);
    } else {
      setEvents(data as ScholarVerificationEvent[]);
    }
    setLoading(false);
  }, [passportId, user?.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    fetchEvents,
  };
}
