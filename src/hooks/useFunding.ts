import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FundingProgram {
  id: string;
  program_name: string;
  description: string | null;
  sponsor_type: "government" | "university" | "ngo" | "industry" | "platform" | "foundation";
  sponsor_org_id: string | null;
  sponsor_name: string | null;
  total_budget: number | null;
  currency: string;
  min_amount: number | null;
  max_amount: number | null;
  eligibility_criteria: Record<string, unknown> | null;
  focus_areas: string[] | null;
  application_deadline: string | null;
  review_process: "open" | "invited" | "committee";
  status: "draft" | "open" | "closed" | "archived";
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface FundingApplication {
  id: string;
  funding_program_id: string;
  applicant_user_id: string;
  research_timeline_id: string | null;
  proposal_title: string;
  proposal_summary: string;
  detailed_proposal: string | null;
  requested_amount: number;
  duration_months: number | null;
  team_members: Record<string, unknown> | null;
  budget_breakdown: Record<string, unknown> | null;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "withdrawn";
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface FundingReview {
  id: string;
  funding_application_id: string;
  reviewer_user_id: string;
  score: number | null;
  innovation_score: number | null;
  feasibility_score: number | null;
  impact_score: number | null;
  feedback: string | null;
  recommendation: "strong_approve" | "approve" | "neutral" | "reject" | "strong_reject" | null;
  is_conflicted: boolean;
  created_at: string;
}

interface FundingAllocation {
  id: string;
  funding_application_id: string;
  approved_amount: number;
  allocation_status: "active" | "paused" | "completed" | "terminated";
  released_amount: number;
  escrow_wallet_id: string | null;
  approval_notes: string | null;
  approved_by: string | null;
  approved_at: string;
  created_at: string;
}

interface FundingMilestone {
  id: string;
  funding_allocation_id: string;
  milestone_number: number;
  milestone_title: string;
  required_outcome: string;
  deliverables: Record<string, unknown> | null;
  release_amount: number;
  due_date: string | null;
  status: "pending" | "submitted" | "approved" | "rejected" | "revised";
  submission_notes: string | null;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export function useFundingPrograms() {
  const [programs, setPrograms] = useState<FundingProgram[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = useCallback(async () => {
    const { data, error } = await supabase
      .from("funding_programs")
      .select("*")
      .in("status", ["open", "closed"])
      .order("application_deadline", { ascending: true });

    if (error) {
      console.error("Error fetching funding programs:", error);
    } else {
      setPrograms(data as FundingProgram[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  return {
    programs,
    loading,
    fetchPrograms,
  };
}

export function useFundingApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<FundingApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("funding_applications")
      .select("*")
      .eq("applicant_user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
    } else {
      setApplications(data as FundingApplication[]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const createApplication = async (application: {
    funding_program_id: string;
    proposal_title: string;
    proposal_summary: string;
    detailed_proposal?: string;
    requested_amount: number;
    duration_months?: number;
    research_timeline_id?: string;
  }) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("funding_applications")
      .insert({
        funding_program_id: application.funding_program_id,
        proposal_title: application.proposal_title,
        proposal_summary: application.proposal_summary,
        detailed_proposal: application.detailed_proposal,
        requested_amount: application.requested_amount,
        duration_months: application.duration_months,
        research_timeline_id: application.research_timeline_id,
        applicant_user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create application");
      return { success: false, error };
    }

    toast.success("Application draft saved");
    await fetchApplications();
    return { success: true, data };
  };

  const updateApplication = async (id: string, updates: {
    proposal_title?: string;
    proposal_summary?: string;
    detailed_proposal?: string;
    requested_amount?: number;
    duration_months?: number;
  }) => {
    const { error } = await supabase
      .from("funding_applications")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update application");
      return { success: false, error };
    }

    toast.success("Application updated");
    await fetchApplications();
    return { success: true };
  };

  const submitApplication = async (id: string) => {
    const { error } = await supabase
      .from("funding_applications")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to submit application");
      return { success: false, error };
    }

    toast.success("Application submitted successfully");
    await fetchApplications();
    return { success: true };
  };

  const withdrawApplication = async (id: string) => {
    const { error } = await supabase
      .from("funding_applications")
      .update({
        status: "withdrawn",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to withdraw application");
      return { success: false, error };
    }

    toast.success("Application withdrawn");
    await fetchApplications();
    return { success: true };
  };

  return {
    applications,
    loading,
    fetchApplications,
    createApplication,
    updateApplication,
    submitApplication,
    withdrawApplication,
  };
}

export function useFundingAllocations() {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState<FundingAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllocations = useCallback(async () => {
    if (!user?.id) return;

    // Get allocations for user's applications
    const { data: applications } = await supabase
      .from("funding_applications")
      .select("id")
      .eq("applicant_user_id", user.id);

    if (!applications || applications.length === 0) {
      setLoading(false);
      return;
    }

    const applicationIds = applications.map((a) => a.id);

    const { data, error } = await supabase
      .from("funding_allocations")
      .select("*")
      .in("funding_application_id", applicationIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching allocations:", error);
    } else {
      setAllocations(data as FundingAllocation[]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchAllocations();
  }, [fetchAllocations]);

  return {
    allocations,
    loading,
    fetchAllocations,
  };
}

export function useFundingMilestones(allocationId: string | null) {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<FundingMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMilestones = useCallback(async () => {
    if (!allocationId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("funding_milestones")
      .select("*")
      .eq("funding_allocation_id", allocationId)
      .order("milestone_number", { ascending: true });

    if (error) {
      console.error("Error fetching milestones:", error);
    } else {
      setMilestones(data as FundingMilestone[]);
    }
    setLoading(false);
  }, [allocationId]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const submitMilestone = async (milestoneId: string, submissionNotes: string) => {
    const { error } = await supabase
      .from("funding_milestones")
      .update({
        status: "submitted",
        submission_notes: submissionNotes,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", milestoneId);

    if (error) {
      toast.error("Failed to submit milestone");
      return { success: false, error };
    }

    toast.success("Milestone submitted for review");
    await fetchMilestones();
    return { success: true };
  };

  return {
    milestones,
    loading,
    fetchMilestones,
    submitMilestone,
  };
}
