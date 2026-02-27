/**
 * React hooks for Escrow-Verified Talent Intelligence System.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  buildExecutionResume,
  calculateTalentReadinessScore,
  generateHiringPrediction,
  generateInstitutionalTalentReport,
  TRS_TRANSPARENCY,
} from "@/lib/professional/talentIntelligence";

export function useExecutionResume(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  return useQuery({
    queryKey: ["execution-resume", targetId],
    queryFn: () => buildExecutionResume(targetId!),
    enabled: !!targetId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTalentReadinessScore(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  return useQuery({
    queryKey: ["talent-readiness-score", targetId],
    queryFn: () => calculateTalentReadinessScore(targetId!),
    enabled: !!targetId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHiringPrediction(userId?: string) {
  return useQuery({
    queryKey: ["hiring-prediction", userId],
    queryFn: () => generateHiringPrediction(userId!),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useInstitutionalTalentReport(institutionId?: string) {
  return useQuery({
    queryKey: ["institutional-talent-report", institutionId],
    queryFn: () => generateInstitutionalTalentReport(institutionId!),
    enabled: !!institutionId,
    staleTime: 15 * 60 * 1000,
  });
}

export function useSubmitSponsorFeedback() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedback: {
      projectId?: string;
      executorId: string;
      communicationClarity: number;
      deliverableQuality: number;
      professionalism: number;
      timeliness: number;
      problemSolving: number;
      comments?: string;
    }) => {
      if (!user) throw new Error("Authentication required");
      const { error } = await supabase.from("sponsor_performance_feedback").insert({
        project_id: feedback.projectId,
        sponsor_id: user.id,
        executor_id: feedback.executorId,
        communication_clarity: feedback.communicationClarity,
        deliverable_quality: feedback.deliverableQuality,
        professionalism: feedback.professionalism,
        timeliness: feedback.timeliness,
        problem_solving: feedback.problemSolving,
        comments: feedback.comments,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Feedback submitted", description: "Your performance feedback has been recorded." });
      queryClient.invalidateQueries({ queryKey: ["execution-resume"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useSponsorFeedback(executorId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sponsor-feedback", executorId],
    queryFn: async () => {
      const { data } = await supabase
        .from("sponsor_performance_feedback")
        .select("*")
        .eq("executor_id", executorId!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!executorId,
  });
}

export function useSkillEvidence(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  return useQuery({
    queryKey: ["skill-evidence", targetId],
    queryFn: async () => {
      const { data } = await supabase
        .from("skill_evidence_blocks")
        .select("*")
        .eq("user_id", targetId!);
      return data ?? [];
    },
    enabled: !!targetId,
  });
}

export function useAddSkillEvidence() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (evidence: {
      skillName: string;
      projectId?: string;
      deliverableUrl?: string;
      evidenceDescription?: string;
    }) => {
      if (!user) throw new Error("Authentication required");
      const { error } = await supabase.from("skill_evidence_blocks").insert({
        user_id: user.id,
        skill_name: evidence.skillName,
        project_id: evidence.projectId,
        deliverable_url: evidence.deliverableUrl,
        evidence_description: evidence.evidenceDescription,
        confidence_level: "low", // starts low, upgrades with sponsor/faculty confirmation
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Skill evidence added", description: "Awaiting sponsor/faculty confirmation for higher confidence." });
      queryClient.invalidateQueries({ queryKey: ["skill-evidence"] });
    },
  });
}

export function useFacultyAssessments(studentId?: string) {
  return useQuery({
    queryKey: ["faculty-assessments", studentId],
    queryFn: async () => {
      const { data } = await supabase
        .from("faculty_talent_assessments")
        .select("*")
        .eq("student_id", studentId!);
      return data ?? [];
    },
    enabled: !!studentId,
  });
}

export function useSubmitFacultyAssessment() {
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (assessment: {
      studentId: string;
      assessmentType: string;
      executionDepthRating: number;
      skillAccuracyRating: number;
      recommendationLevel: string;
      notes?: string;
      flags?: string[];
    }) => {
      if (!user) throw new Error("Authentication required");
      const { error } = await supabase.from("faculty_talent_assessments").insert({
        faculty_id: user.id,
        student_id: assessment.studentId,
        assessment_type: assessment.assessmentType,
        execution_depth_rating: assessment.executionDepthRating,
        skill_accuracy_rating: assessment.skillAccuracyRating,
        recommendation_level: assessment.recommendationLevel,
        notes: assessment.notes,
        flags: assessment.flags,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Assessment submitted", description: "Faculty assessment recorded." });
    },
  });
}

export function useTRSTransparency() {
  return TRS_TRANSPARENCY;
}
