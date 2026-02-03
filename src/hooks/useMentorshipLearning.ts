import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// =====================================================
// MENTORSHIP & LEARNING SYSTEM (Features 41-50)
// =====================================================

// Feature 41: Mentor Matching Algorithm
export interface MentorMatch {
  mentor_id: string;
  mentor_name: string;
  expertise_alignment: number;
  communication_style_fit: number;
  availability_match: number;
  success_rate: number;
  mentees_currently: number;
  mentees_max: number;
  overall_fit_score: number;
  why_matched: string[];
}

// Feature 42: Learning Goal Framework
export interface LearningGoal {
  goal_id: string;
  title: string;
  category: 'skill' | 'knowledge' | 'certification' | 'project';
  target_date: string;
  milestones: {
    milestone: string;
    due_date: string;
    completed: boolean;
    evidence?: string;
  }[];
  progress_percentage: number;
  blockers: string[];
  mentor_assigned?: string;
}

// Feature 43: Skill Transfer Tracking
export interface SkillTransfer {
  from_user_id: string;
  to_user_id: string;
  skill: string;
  transfer_sessions: {
    date: string;
    duration_hours: number;
    topics_covered: string[];
    effectiveness_rating: number;
  }[];
  overall_transfer_success: number;
  competency_achieved: boolean;
}

// Feature 44: Reverse Mentorship Program
export interface ReverseMentorship {
  junior_id: string;
  senior_id: string;
  focus_areas: string[];
  sessions_completed: number;
  insights_shared: string[];
  value_ratings: { by_junior: number; by_senior: number };
  innovative_ideas_generated: number;
}

// Feature 45: Peer Learning Circles
export interface LearningCircle {
  circle_id: string;
  topic: string;
  members: { user_id: string; role: 'facilitator' | 'member' }[];
  meeting_schedule: string;
  resources_shared: number;
  discussions_held: number;
  collective_progress: number;
  active: boolean;
}

// Feature 46: Competency Assessment Framework
export interface CompetencyAssessment {
  user_id: string;
  competency: string;
  self_assessment: number;
  peer_assessment: number;
  evidence_based_score: number;
  final_score: number;
  assessment_date: string;
  growth_areas: string[];
  strengths: string[];
}

// Feature 47: Learning Resource Curation
export interface CuratedResource {
  resource_id: string;
  title: string;
  type: 'course' | 'book' | 'video' | 'article' | 'workshop';
  skill_tags: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_time_hours: number;
  community_rating: number;
  completion_rate: number;
  curator_id: string;
  endorsements: number;
}

// Feature 48: Mentorship Impact Metrics
export interface MentorshipImpact {
  mentor_id: string;
  total_mentees: number;
  active_mentees: number;
  successful_outcomes: number;
  average_goal_completion: number;
  mentee_career_advancement: number;
  satisfaction_score: number;
  time_invested_hours: number;
  impact_score: number;
}

// Feature 49: Adaptive Learning Recommendations
export interface LearningRecommendation {
  recommendation_id: string;
  resource_id: string;
  reason: string;
  relevance_score: number;
  urgency: 'immediate' | 'soon' | 'whenever';
  expected_impact: string;
  time_commitment: string;
  prerequisites_met: boolean;
}

// Feature 50: Learning Analytics Dashboard
export interface LearningAnalytics {
  total_learning_hours: number;
  skills_developed: number;
  goals_completed: number;
  goals_in_progress: number;
  learning_streak_days: number;
  strongest_learning_method: string;
  time_of_day_preference: string;
  comparison_to_peers: number;
  next_recommended_action: string;
}

export function useMentorshipLearning() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mentorMatches, setMentorMatches] = useState<MentorMatch[]>([]);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [learningCircles, setLearningCircles] = useState<LearningCircle[]>([]);
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);

  // Feature 41: Find Mentor Matches
  const findMentorMatches = useCallback((
    userSkillGaps: string[],
    userPreferences: { communicationStyle: string; availability: string },
    availableMentors: { id: string; name: string; expertise: string[]; style: string; availability: string; successRate: number }[]
  ): MentorMatch[] => {
    return availableMentors.map(mentor => {
      const expertiseMatch = userSkillGaps.filter(s => mentor.expertise.includes(s)).length / Math.max(userSkillGaps.length, 1);
      const styleMatch = mentor.style === userPreferences.communicationStyle ? 1 : 0.5;
      const availabilityMatch = mentor.availability === userPreferences.availability ? 1 : 0.7;
      
      const overallScore = (expertiseMatch * 50) + (styleMatch * 25) + (availabilityMatch * 15) + (mentor.successRate * 0.1);

      return {
        mentor_id: mentor.id,
        mentor_name: mentor.name,
        expertise_alignment: expertiseMatch * 100,
        communication_style_fit: styleMatch * 100,
        availability_match: availabilityMatch * 100,
        success_rate: mentor.successRate,
        mentees_currently: 2,
        mentees_max: 5,
        overall_fit_score: overallScore,
        why_matched: [
          `${Math.round(expertiseMatch * 100)}% expertise overlap`,
          styleMatch === 1 ? 'Matching communication style' : 'Compatible style',
          `${Math.round(mentor.successRate)}% mentor success rate`
        ]
      };
    }).sort((a, b) => b.overall_fit_score - a.overall_fit_score);
  }, []);

  // Feature 42: Create Learning Goal
  const createLearningGoal = useCallback((
    title: string,
    category: LearningGoal['category'],
    targetDate: string,
    milestones: string[]
  ): LearningGoal => {
    const goal: LearningGoal = {
      goal_id: crypto.randomUUID(),
      title,
      category,
      target_date: targetDate,
      milestones: milestones.map((m, i) => ({
        milestone: m,
        due_date: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false
      })),
      progress_percentage: 0,
      blockers: []
    };

    setLearningGoals(prev => [...prev, goal]);
    toast({ title: "Learning Goal Created", description: `Goal "${title}" has been set` });
    return goal;
  }, [toast]);

  // Feature 46: Conduct Competency Assessment
  const conductAssessment = useCallback((
    competency: string,
    selfScore: number,
    peerScores: number[],
    evidenceScore: number
  ): CompetencyAssessment => {
    const peerAverage = peerScores.reduce((a, b) => a + b, 0) / Math.max(peerScores.length, 1);
    const finalScore = (selfScore * 0.2) + (peerAverage * 0.3) + (evidenceScore * 0.5);

    return {
      user_id: user?.id || '',
      competency,
      self_assessment: selfScore,
      peer_assessment: peerAverage,
      evidence_based_score: evidenceScore,
      final_score: finalScore,
      assessment_date: new Date().toISOString(),
      growth_areas: finalScore < 70 ? [competency] : [],
      strengths: finalScore >= 80 ? [competency] : []
    };
  }, [user]);

  // Feature 48: Calculate Mentorship Impact
  const calculateMentorshipImpact = useCallback((
    mentorId: string,
    mentees: { goalCompletion: number; careerAdvanced: boolean; satisfaction: number }[],
    hoursInvested: number
  ): MentorshipImpact => {
    const successfulOutcomes = mentees.filter(m => m.goalCompletion > 80).length;
    const avgGoalCompletion = mentees.reduce((sum, m) => sum + m.goalCompletion, 0) / Math.max(mentees.length, 1);
    const careerAdvancement = mentees.filter(m => m.careerAdvanced).length / Math.max(mentees.length, 1) * 100;
    const avgSatisfaction = mentees.reduce((sum, m) => sum + m.satisfaction, 0) / Math.max(mentees.length, 1);

    const impactScore = (successfulOutcomes / Math.max(mentees.length, 1) * 40) + 
      (avgGoalCompletion * 0.3) + 
      (careerAdvancement * 0.2) + 
      (avgSatisfaction * 2);

    return {
      mentor_id: mentorId,
      total_mentees: mentees.length,
      active_mentees: Math.ceil(mentees.length * 0.6),
      successful_outcomes: successfulOutcomes,
      average_goal_completion: avgGoalCompletion,
      mentee_career_advancement: careerAdvancement,
      satisfaction_score: avgSatisfaction,
      time_invested_hours: hoursInvested,
      impact_score: Math.min(100, impactScore)
    };
  }, []);

  // Feature 50: Generate Learning Analytics
  const generateLearningAnalytics = useCallback((
    learningActivities: { date: string; hours: number; type: string }[],
    goals: LearningGoal[]
  ): LearningAnalytics => {
    const totalHours = learningActivities.reduce((sum, a) => sum + a.hours, 0);
    const goalsCompleted = goals.filter(g => g.progress_percentage >= 100).length;
    const goalsInProgress = goals.filter(g => g.progress_percentage > 0 && g.progress_percentage < 100).length;
    
    // Calculate streak
    const sortedDates = learningActivities.map(a => a.date).sort();
    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const expectedDate = new Date(Date.now() - streak * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      if (sortedDates[i].slice(0, 10) === expectedDate) {
        streak++;
      } else {
        break;
      }
    }

    const typeCounts = learningActivities.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + a.hours;
      return acc;
    }, {} as Record<string, number>);
    const strongestMethod = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'courses';

    return {
      total_learning_hours: totalHours,
      skills_developed: Math.floor(totalHours / 20),
      goals_completed: goalsCompleted,
      goals_in_progress: goalsInProgress,
      learning_streak_days: streak,
      strongest_learning_method: strongestMethod,
      time_of_day_preference: 'morning',
      comparison_to_peers: 65,
      next_recommended_action: goals.length === 0 ? 'Set your first learning goal' : 'Continue current goal'
    };
  }, []);

  return {
    mentorMatches,
    learningGoals,
    learningCircles,
    analytics,
    findMentorMatches,
    createLearningGoal,
    conductAssessment,
    calculateMentorshipImpact,
    generateLearningAnalytics,
    setLearningGoals,
    setLearningCircles
  };
}
