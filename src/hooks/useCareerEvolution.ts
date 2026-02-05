// ============================================
// SYSTEM 52: CAREER EVOLUTION & TRANSITION ENGINE
// Support nonlinear careers: pivots, transitions, reinvention
// ============================================

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type {
  CareerEvolutionProfile,
  CareerPhase,
  CareerTrajectory,
  CareerPivot,
  TransitionReadiness,
  PivotOption,
  MentorshipProfile,
} from "@/types/human-capital";

interface CareerEvolutionState {
  profile: CareerEvolutionProfile | null;
  isLoading: boolean;
}

export function useCareerEvolution(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const [state] = useState<CareerEvolutionState>({
    profile: targetUserId ? generateMockProfile(targetUserId) : null,
    isLoading: false,
  });

  // Get current career phase
  const getCurrentPhase = useCallback((): CareerPhase | null => {
    return state.profile?.currentPhase || null;
  }, [state.profile]);

  // Get career trajectory
  const getTrajectory = useCallback((): CareerTrajectory | null => {
    return state.profile?.trajectory || null;
  }, [state.profile]);

  // Get pivot history
  const getPivotHistory = useCallback((): CareerPivot[] => {
    return state.profile?.pivotHistory || [];
  }, [state.profile]);

  // Assess transition readiness
  const assessTransitionReadiness = useCallback((): TransitionReadiness => {
    if (!state.profile) {
      return {
        readyForPivot: false,
        pivotOptions: [],
        blockers: ["Profile not loaded"],
        supportNeeded: [],
      };
    }

    return state.profile.transitionReadiness;
  }, [state.profile]);

  // Explore pivot options
  const explorePivotOptions = useCallback((
    fromDomain?: string
  ): PivotOption[] => {
    // Mock pivot option generation
    return [
      {
        targetDomain: "Data Science",
        feasibility: 0.75,
        capabilityTransferRate: 0.65,
        estimatedTransitionTime: "6-12 months",
        suggestedPath: [
          "Complete Python/R data science fundamentals",
          "Build portfolio with 3 data projects",
          "Seek mentorship from domain expert",
          "Apply for stretch role with data focus",
        ],
      },
      {
        targetDomain: "Product Management",
        feasibility: 0.68,
        capabilityTransferRate: 0.55,
        estimatedTransitionTime: "12-18 months",
        suggestedPath: [
          "Take product management certification",
          "Shadow PMs on current projects",
          "Lead a small product initiative",
          "Build cross-functional network",
        ],
      },
      {
        targetDomain: "Consulting",
        feasibility: 0.82,
        capabilityTransferRate: 0.78,
        estimatedTransitionTime: "3-6 months",
        suggestedPath: [
          "Leverage domain expertise",
          "Build client management skills",
          "Develop proposal writing capability",
          "Network in consulting community",
        ],
      },
    ];
  }, []);

  // Get mentorship profile
  const getMentorshipProfile = useCallback((): MentorshipProfile | null => {
    return state.profile?.mentorshipProfile || null;
  }, [state.profile]);

  // Find mentors for transition
  const findTransitionMentors = useCallback((
    targetDomain: string
  ): {
    mentorId: string;
    matchScore: number;
    expertise: string[];
    availability: string;
    successfulTransitions: number;
  }[] => {
    // Mock mentor matching for transitions
    return [
      {
        mentorId: "mentor-1",
        matchScore: 88,
        expertise: [targetDomain, "Career Transitions", "Leadership"],
        availability: "2 hours/month",
        successfulTransitions: 5,
      },
      {
        mentorId: "mentor-2",
        matchScore: 75,
        expertise: [targetDomain, "Technical Leadership"],
        availability: "4 hours/month",
        successfulTransitions: 3,
      },
    ];
  }, []);

  // Plan a career pivot
  const planPivot = useCallback((
    targetDomain: string
  ): {
    phases: { phase: string; duration: string; activities: string[] }[];
    milestones: { milestone: string; expectedDate: string }[];
    risks: { risk: string; mitigation: string }[];
    successIndicators: string[];
  } => {
    return {
      phases: [
        {
          phase: "Foundation",
          duration: "0-3 months",
          activities: ["Skill assessment", "Learning fundamentals", "Network building"],
        },
        {
          phase: "Development",
          duration: "3-9 months",
          activities: ["Advanced training", "Portfolio building", "Mentorship engagement"],
        },
        {
          phase: "Transition",
          duration: "9-12 months",
          activities: ["Job search", "Interviews", "Role transition"],
        },
        {
          phase: "Establishment",
          duration: "12-18 months",
          activities: ["Onboarding", "Building credibility", "Expanding network"],
        },
      ],
      milestones: [
        { milestone: "Complete foundational training", expectedDate: "Month 2" },
        { milestone: "First project in new domain", expectedDate: "Month 5" },
        { milestone: "Mentor endorsement", expectedDate: "Month 8" },
        { milestone: "First role in new domain", expectedDate: "Month 12" },
      ],
      risks: [
        { risk: "Skill gap larger than expected", mitigation: "Adjust timeline, seek additional training" },
        { risk: "Limited opportunities", mitigation: "Expand geographic/remote search, consider adjacent roles" },
        { risk: "Financial pressure", mitigation: "Maintain current role while transitioning, build savings" },
      ],
      successIndicators: [
        "Consistent progress on learning milestones",
        "Growing network in target domain",
        "Positive mentor feedback",
        "Interview callbacks in new domain",
      ],
    };
  }, []);

  // Get late-career / post-retirement options
  const getLateCareerOptions = useCallback((): {
    option: string;
    description: string;
    suitability: number;
    benefits: string[];
  }[] => {
    return [
      {
        option: "Advisory Role",
        description: "Part-time strategic advisor to organizations",
        suitability: 0.85,
        benefits: ["Leverage experience", "Flexible time", "High impact"],
      },
      {
        option: "Mentorship Focus",
        description: "Dedicated mentoring of next generation",
        suitability: 0.9,
        benefits: ["Knowledge transfer", "Legacy building", "Meaningful impact"],
      },
      {
        option: "Board Participation",
        description: "Serve on organizational boards",
        suitability: 0.7,
        benefits: ["Governance experience", "Network expansion", "Industry influence"],
      },
      {
        option: "Research/Writing",
        description: "Document and share domain expertise",
        suitability: 0.75,
        benefits: ["Knowledge preservation", "Thought leadership", "Flexible schedule"],
      },
    ];
  }, []);

  // Summary
  const summary = useMemo(() => {
    if (!state.profile) return null;

    return {
      currentPhase: state.profile.currentPhase,
      trajectoryDirection: state.profile.trajectory.direction,
      pivotsCompleted: state.profile.pivotHistory.length,
      readyForTransition: state.profile.transitionReadiness.readyForPivot,
      mentorshipStatus: state.profile.mentorshipProfile.availability,
    };
  }, [state.profile]);

  return {
    profile: state.profile,
    isLoading: state.isLoading,
    getCurrentPhase,
    getTrajectory,
    getPivotHistory,
    assessTransitionReadiness,
    explorePivotOptions,
    getMentorshipProfile,
    findTransitionMentors,
    planPivot,
    getLateCareerOptions,
    summary,
  };
}

// Helper functions

function generateMockProfile(userId: string): CareerEvolutionProfile {
  const now = new Date();

  return {
    userId,
    currentPhase: "growth",
    trajectory: {
      direction: "ascending",
      velocity: "steady",
      projectedPhases: [
        {
          phase: "peak",
          estimatedStart: "3-5 years",
          likelyFocus: ["Technical leadership", "Strategic initiatives"],
          preparationNeeded: ["Leadership development", "Strategic thinking"],
        },
        {
          phase: "late_career",
          estimatedStart: "15-20 years",
          likelyFocus: ["Advisory", "Mentorship", "Knowledge transfer"],
          preparationNeeded: ["Mentorship skills", "Knowledge documentation"],
        },
      ],
    },
    pivotHistory: [
      {
        id: "pivot-1",
        fromDomain: "Software Engineering",
        toDomain: "Research",
        pivotedAt: new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000),
        success: "successful",
        transferredCapabilities: ["Problem solving", "Technical analysis", "Documentation"],
        newCapabilities: ["Research methodology", "Academic writing", "Peer review"],
        lessonsLearned: ["Patience with academic timelines", "Value of networking in new domain"],
      },
    ],
    transitionReadiness: {
      readyForPivot: true,
      pivotOptions: [
        {
          targetDomain: "Data Science",
          feasibility: 0.75,
          capabilityTransferRate: 0.65,
          estimatedTransitionTime: "6-12 months",
          suggestedPath: ["Learn ML fundamentals", "Build data projects", "Seek mentorship"],
        },
      ],
      blockers: [],
      supportNeeded: ["Mentorship", "Dedicated learning time"],
    },
    mentorshipProfile: {
      canMentor: ["Research methodology", "Career transitions", "Technical writing"],
      seeksMentorshipIn: ["Leadership", "Strategic planning"],
      mentorshipStyle: "Collaborative, goal-oriented",
      availability: "active",
      impactScore: 72,
    },
  };
}

export type { CareerEvolutionProfile, CareerPhase, CareerPivot, PivotOption };
