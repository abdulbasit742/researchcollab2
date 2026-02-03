import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Types
interface CareerProfile {
  id: string;
  scholar_passport_id: string;
  current_stage: "undergraduate" | "masters" | "phd" | "postdoc" | "faculty" | "senior_researcher" | "emeritus" | "industry" | "independent";
  primary_domain: string | null;
  secondary_domains: string[] | null;
  career_goal_statement: string | null;
  years_in_academia: number | null;
  is_open_to_mentoring: boolean;
  max_mentees: number;
  mentoring_interests: string[] | null;
  seeking_mentorship: boolean;
  mentorship_needs: string[] | null;
  privacy_level: "public" | "connections" | "private";
  created_at: string;
  updated_at: string;
}

interface CareerMilestone {
  id: string;
  career_profile_id: string;
  milestone_type: "degree_completed" | "first_publication" | "grant_awarded" | "supervision_started" | "tenure" | "major_transition" | "award_received" | "leadership_role" | "industry_collaboration" | "teaching_excellence" | "citation_milestone";
  title: string;
  description: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  institution: string | null;
  achieved_at: string;
  verification_status: "self_reported" | "pending" | "verified" | "rejected";
  is_public: boolean;
  created_at: string;
}

interface MentorshipRelationship {
  id: string;
  mentor_scholar_passport_id: string;
  mentee_scholar_passport_id: string;
  mentorship_type: "research" | "career" | "teaching" | "industry_transition" | "writing" | "leadership";
  goals: string | null;
  expected_frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "as_needed" | null;
  start_date: string;
  expected_end_date: string | null;
  actual_end_date: string | null;
  status: "pending" | "active" | "paused" | "completed" | "terminated";
  initiated_by: "mentor" | "mentee";
  mentor_consent_at: string | null;
  mentee_consent_at: string | null;
  created_at: string;
}

interface MentorshipInteraction {
  id: string;
  mentorship_relationship_id: string;
  interaction_type: "meeting" | "feedback" | "review" | "guidance" | "milestone_check" | "resource_shared" | "introduction";
  summary: string | null;
  duration_minutes: number | null;
  occurred_at: string;
  logged_by: string;
  created_at: string;
}

interface CareerRiskFlag {
  id: string;
  career_profile_id: string;
  risk_type: "publication_gap" | "funding_gap" | "isolation" | "burnout_signal" | "career_stall" | "mentorship_needed" | "skill_gap";
  description: string | null;
  severity: "low" | "medium" | "high";
  detected_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  is_visible_to_user: boolean;
}

// Career Profile Hook
export function useCareerProfile(userId?: string) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  const fetchProfile = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    // First get the scholar passport
    const { data: passport } = await supabase
      .from("scholar_passports")
      .select("id")
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (!passport) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("career_profiles")
      .select("*")
      .eq("scholar_passport_id", passport.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching career profile:", error);
    } else {
      setProfile(data as CareerProfile | null);
    }
    setLoading(false);
  }, [targetUserId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<CareerProfile>) => {
    if (!profile?.id) return { success: false, error: "No profile found" };

    const { error } = await supabase
      .from("career_profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to update career profile");
      return { success: false, error };
    }

    toast.success("Career profile updated");
    await fetchProfile();
    return { success: true };
  };

  return { profile, loading, fetchProfile, updateProfile };
}

// Career Milestones Hook
export function useCareerMilestones(profileId?: string) {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<CareerMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMilestones = useCallback(async () => {
    let targetProfileId = profileId;

    if (!targetProfileId && user?.id) {
      const { data: passport } = await supabase
        .from("scholar_passports")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (passport) {
        const { data: profile } = await supabase
          .from("career_profiles")
          .select("id")
          .eq("scholar_passport_id", passport.id)
          .maybeSingle();

        targetProfileId = profile?.id;
      }
    }

    if (!targetProfileId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("career_milestones")
      .select("*")
      .eq("career_profile_id", targetProfileId)
      .order("achieved_at", { ascending: false });

    if (error) {
      console.error("Error fetching milestones:", error);
    } else {
      setMilestones((data || []) as CareerMilestone[]);
    }
    setLoading(false);
  }, [profileId, user?.id]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const addMilestone = async (milestone: {
    milestone_type: CareerMilestone["milestone_type"];
    title: string;
    description?: string;
    institution?: string;
    achieved_at: string;
    related_entity_type?: string;
    related_entity_id?: string;
    is_public?: boolean;
  }) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    // Get career profile ID
    const { data: passport } = await supabase
      .from("scholar_passports")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!passport) return { success: false, error: "No scholar passport" };

    const { data: profile } = await supabase
      .from("career_profiles")
      .select("id")
      .eq("scholar_passport_id", passport.id)
      .maybeSingle();

    if (!profile) return { success: false, error: "No career profile" };

    const { data, error } = await supabase
      .from("career_milestones")
      .insert({
        ...milestone,
        career_profile_id: profile.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add milestone");
      return { success: false, error };
    }

    toast.success("Milestone added");
    await fetchMilestones();
    return { success: true, data };
  };

  return { milestones, loading, fetchMilestones, addMilestone };
}

// Mentorship Hook
export function useMentorship() {
  const { user } = useAuth();
  const [relationships, setRelationships] = useState<MentorshipRelationship[]>([]);
  const [asMentor, setAsMentor] = useState<MentorshipRelationship[]>([]);
  const [asMentee, setAsMentee] = useState<MentorshipRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRelationships = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    // Get user's scholar passport
    const { data: passport } = await supabase
      .from("scholar_passports")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!passport) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("mentorship_relationships")
      .select("*")
      .or(`mentor_scholar_passport_id.eq.${passport.id},mentee_scholar_passport_id.eq.${passport.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching mentorships:", error);
    } else {
      const all = (data || []) as MentorshipRelationship[];
      setRelationships(all);
      setAsMentor(all.filter((r) => r.mentor_scholar_passport_id === passport.id));
      setAsMentee(all.filter((r) => r.mentee_scholar_passport_id === passport.id));
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  const requestMentorship = async (request: {
    mentor_scholar_passport_id: string;
    mentorship_type: MentorshipRelationship["mentorship_type"];
    goals?: string;
    expected_frequency?: MentorshipRelationship["expected_frequency"];
    expected_end_date?: string;
  }) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { data: passport } = await supabase
      .from("scholar_passports")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!passport) return { success: false, error: "No scholar passport" };

    const { data, error } = await supabase
      .from("mentorship_relationships")
      .insert({
        ...request,
        mentee_scholar_passport_id: passport.id,
        initiated_by: "mentee",
        mentee_consent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to request mentorship");
      return { success: false, error };
    }

    toast.success("Mentorship request sent");
    await fetchRelationships();
    return { success: true, data };
  };

  const respondToRequest = async (relationshipId: string, accept: boolean) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const updates: Record<string, unknown> = accept
      ? { status: "active", mentor_consent_at: new Date().toISOString() }
      : { status: "terminated", termination_reason: "Request declined" };

    const { error } = await supabase
      .from("mentorship_relationships")
      .update(updates)
      .eq("id", relationshipId);

    if (error) {
      toast.error("Failed to respond to request");
      return { success: false, error };
    }

    toast.success(accept ? "Mentorship accepted" : "Request declined");
    await fetchRelationships();
    return { success: true };
  };

  const endMentorship = async (relationshipId: string, reason?: string) => {
    const updates: Record<string, unknown> = {
      status: "completed",
      actual_end_date: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString(),
    };
    if (reason) {
      updates.termination_reason = reason;
    }
    
    const { error } = await supabase
      .from("mentorship_relationships")
      .update(updates)
      .eq("id", relationshipId);

    if (error) {
      toast.error("Failed to end mentorship");
      return { success: false, error };
    }

    toast.success("Mentorship completed");
    await fetchRelationships();
    return { success: true };
  };

  return {
    relationships,
    asMentor,
    asMentee,
    loading,
    fetchRelationships,
    requestMentorship,
    respondToRequest,
    endMentorship,
  };
}

// Mentorship Interactions Hook
export function useMentorshipInteractions(relationshipId: string) {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<MentorshipInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInteractions = useCallback(async () => {
    if (!relationshipId) return;

    const { data, error } = await supabase
      .from("mentorship_interactions")
      .select("*")
      .eq("mentorship_relationship_id", relationshipId)
      .order("occurred_at", { ascending: false });

    if (error) {
      console.error("Error fetching interactions:", error);
    } else {
      setInteractions((data || []) as MentorshipInteraction[]);
    }
    setLoading(false);
  }, [relationshipId]);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  const logInteraction = async (interaction: {
    interaction_type: MentorshipInteraction["interaction_type"];
    summary?: string;
    duration_minutes?: number;
    occurred_at?: string;
  }) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("mentorship_interactions")
      .insert({
        ...interaction,
        mentorship_relationship_id: relationshipId,
        logged_by: user.id,
        occurred_at: interaction.occurred_at || new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to log interaction");
      return { success: false, error };
    }

    toast.success("Interaction logged");
    await fetchInteractions();
    return { success: true, data };
  };

  return { interactions, loading, fetchInteractions, logInteraction };
}

// Career Risk Flags Hook (Private to user)
export function useCareerRiskFlags() {
  const { user } = useAuth();
  const [flags, setFlags] = useState<CareerRiskFlag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlags = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const { data: passport } = await supabase
      .from("scholar_passports")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!passport) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("career_profiles")
      .select("id")
      .eq("scholar_passport_id", passport.id)
      .maybeSingle();

    if (!profile) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("career_risk_flags")
      .select("*")
      .eq("career_profile_id", profile.id)
      .is("resolved_at", null)
      .order("detected_at", { ascending: false });

    if (error) {
      console.error("Error fetching risk flags:", error);
    } else {
      setFlags((data || []) as CareerRiskFlag[]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const acknowledgeFlag = async (flagId: string) => {
    const { error } = await supabase
      .from("career_risk_flags")
      .update({ acknowledged_at: new Date().toISOString() })
      .eq("id", flagId);

    if (error) return { success: false, error };

    await fetchFlags();
    return { success: true };
  };

  const resolveFlag = async (flagId: string, notes?: string) => {
    const { error } = await supabase
      .from("career_risk_flags")
      .update({
        resolved_at: new Date().toISOString(),
        resolution_notes: notes,
      })
      .eq("id", flagId);

    if (error) return { success: false, error };

    toast.success("Risk flag resolved");
    await fetchFlags();
    return { success: true };
  };

  return { flags, loading, fetchFlags, acknowledgeFlag, resolveFlag };
}

// Find Mentors Hook
export function useFindMentors(filters?: {
  domain?: string;
  mentoring_interests?: string[];
  current_stage?: string;
}) {
  const [mentors, setMentors] = useState<CareerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const searchMentors = useCallback(async () => {
    let query = supabase
      .from("career_profiles")
      .select("*")
      .eq("is_open_to_mentoring", true)
      .eq("privacy_level", "public");

    if (filters?.domain) {
      query = query.eq("primary_domain", filters.domain);
    }

    if (filters?.current_stage) {
      query = query.eq("current_stage", filters.current_stage);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error("Error searching mentors:", error);
    } else {
      setMentors((data || []) as CareerProfile[]);
    }
    setLoading(false);
  }, [filters?.domain, filters?.current_stage]);

  useEffect(() => {
    searchMentors();
  }, [searchMentors]);

  return { mentors, loading, searchMentors };
}
