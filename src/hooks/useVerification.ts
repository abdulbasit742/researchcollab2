import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface VerificationSubmission {
  id: string;
  user_id: string;
  verification_type: string;
  status: string;
  documents: any[];
  submitted_data: Record<string, any>;
  reviewer_id: string | null;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserTrustProfile {
  id: string;
  user_id: string;
  trust_score: number;
  verification_level: string;
  total_projects_completed: number;
  total_projects_posted: number;
  successful_rate: number;
  response_time_hours: number | null;
  is_verified_student: boolean;
  is_verified_researcher: boolean;
  is_verified_partner: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  description: string | null;
  earned_at: string;
}

export function useVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<VerificationSubmission[]>([]);
  const [trustProfile, setTrustProfile] = useState<UserTrustProfile | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchVerificationData();
    } else {
      setSubmissions([]);
      setTrustProfile(null);
      setBadges([]);
      setLoading(false);
    }
  }, [user]);

  const fetchVerificationData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch verification submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("verification_submissions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (submissionsError) throw submissionsError;
      setSubmissions(submissionsData as VerificationSubmission[]);

      // Fetch or create trust profile
      let { data: trustData, error: trustError } = await supabase
        .from("user_trust_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (trustError && !trustError.message.includes("No rows found")) {
        throw trustError;
      }

      // If no profile exists, create one
      if (!trustData) {
        const { data: newProfile, error: createError } = await supabase
          .from("user_trust_profiles")
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) throw createError;
        trustData = newProfile;
      }

      setTrustProfile(trustData as UserTrustProfile);

      // Fetch badges
      const { data: badgesData, error: badgesError } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });

      if (badgesError) throw badgesError;
      setBadges(badgesData as UserBadge[]);
    } catch (err: any) {
      console.error("Error fetching verification data:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitVerification = async (
    verificationType: string,
    documents: any[],
    submittedData: Record<string, any>
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit verification.",
        variant: "destructive",
      });
      return { success: false, error: "Not authenticated" };
    }

    try {
      // Check if there's already a pending submission
      const { data: existingSubmission } = await supabase
        .from("verification_submissions")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("verification_type", verificationType)
        .in("status", ["pending", "approved"])
        .maybeSingle();

      if (existingSubmission) {
        const message = existingSubmission.status === "approved"
          ? "You are already verified for this type."
          : "You already have a pending verification request.";
        
        toast({
          title: "Already Submitted",
          description: message,
          variant: "destructive",
        });
        return { success: false, error: message };
      }

      const { error } = await supabase
        .from("verification_submissions")
        .insert({
          user_id: user.id,
          verification_type: verificationType,
          documents,
          submitted_data: submittedData,
        });

      if (error) throw error;

      toast({
        title: "Verification Submitted!",
        description: "Your verification request is under review. We'll notify you once it's processed.",
      });

      await fetchVerificationData();
      return { success: true };
    } catch (err: any) {
      console.error("Error submitting verification:", err);
      toast({
        title: "Submission Failed",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  return {
    submissions,
    trustProfile,
    badges,
    loading,
    refetch: fetchVerificationData,
    submitVerification,
  };
}

export function useAdminVerifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<(VerificationSubmission & { user_name?: string; user_email?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllSubmissions();
  }, []);

  const fetchAllSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("verification_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles for each submission
      const submissionsWithUsers = await Promise.all(
        (data || []).map(async (submission) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", submission.user_id)
            .maybeSingle();

          return {
            ...submission,
            documents: submission.documents as any[] || [],
            submitted_data: submission.submitted_data as Record<string, any> || {},
            user_name: profile?.full_name || "Unknown User",
          } as VerificationSubmission & { user_name?: string; user_email?: string };
        })
      );

      setSubmissions(submissionsWithUsers);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const reviewSubmission = async (
    submissionId: string,
    status: "approved" | "rejected" | "requires_more_info",
    notes?: string
  ) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("verification_submissions")
        .update({
          status,
          reviewer_id: user.id,
          reviewer_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", submissionId);

      if (error) throw error;

      // If approved, update the user's trust profile
      if (status === "approved") {
        const submission = submissions.find(s => s.id === submissionId);
        if (submission) {
          const updates: Record<string, any> = {
            verification_level: "verified",
            trust_score: 30, // Base score for verification
          };

          if (submission.verification_type === "student") {
            updates.is_verified_student = true;
          } else if (submission.verification_type === "researcher") {
            updates.is_verified_researcher = true;
          } else if (submission.verification_type === "partner") {
            updates.is_verified_partner = true;
          }

          await supabase
            .from("user_trust_profiles")
            .update(updates)
            .eq("user_id", submission.user_id);
        }
      }

      toast({
        title: "Review Submitted",
        description: `Verification has been ${status}.`,
      });

      await fetchAllSubmissions();
      return { success: true };
    } catch (err: any) {
      console.error("Error reviewing submission:", err);
      toast({
        title: "Review Failed",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  return {
    submissions,
    loading,
    refetch: fetchAllSubmissions,
    reviewSubmission,
  };
}
