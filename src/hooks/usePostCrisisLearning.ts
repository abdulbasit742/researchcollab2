import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  PostCrisisReview,
  LearningItem,
  Recommendation,
  PlaybookUpdate,
  ReadinessAdjustment,
} from "@/types/crisis-coordination";

// System 60: Post-Crisis Learning & Reforms
// Capture what worked, what failed, update playbooks, and adjust readiness

export function usePostCrisisLearning() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<PostCrisisReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initiate a post-crisis review
  const initiateReview = useCallback(async (
    missionId: string,
    missionName: string,
    initialParticipants: string[] = []
  ): Promise<PostCrisisReview | null> => {
    if (!user) return null;
    setIsLoading(true);

    const review: PostCrisisReview = {
      id: `review-${Date.now()}`,
      missionId,
      missionName,
      conductedAt: new Date().toISOString(),
      facilitatedBy: user.id,
      participants: [user.id, ...initialParticipants],
      whatWorked: [],
      whatFailed: [],
      recommendations: [],
      playbookUpdates: [],
      readinessAdjustments: [],
      status: "in_progress",
    };

    await new Promise(r => setTimeout(r, 300));
    setReviews(prev => [...prev, review]);
    setIsLoading(false);
    return review;
  }, [user]);

  // Add a "what worked" item
  const addWhatWorked = useCallback((
    reviewId: string,
    item: Omit<LearningItem, "id">
  ) => {
    const learningItem: LearningItem = {
      ...item,
      id: `worked-${Date.now()}`,
    };

    setReviews(prev => prev.map(r => 
      r.id === reviewId
        ? { ...r, whatWorked: [...r.whatWorked, learningItem] }
        : r
    ));
  }, []);

  // Add a "what failed" item
  const addWhatFailed = useCallback((
    reviewId: string,
    item: Omit<LearningItem, "id">
  ) => {
    const learningItem: LearningItem = {
      ...item,
      id: `failed-${Date.now()}`,
    };

    setReviews(prev => prev.map(r => 
      r.id === reviewId
        ? { ...r, whatFailed: [...r.whatFailed, learningItem] }
        : r
    ));
  }, []);

  // Add a recommendation
  const addRecommendation = useCallback((
    reviewId: string,
    recommendation: Omit<Recommendation, "id" | "status">
  ) => {
    const rec: Recommendation = {
      ...recommendation,
      id: `rec-${Date.now()}`,
      status: "proposed",
    };

    setReviews(prev => prev.map(r => 
      r.id === reviewId
        ? { ...r, recommendations: [...r.recommendations, rec] }
        : r
    ));
  }, []);

  // Update recommendation status
  const updateRecommendationStatus = useCallback((
    reviewId: string,
    recommendationId: string,
    status: Recommendation["status"],
    assignedTo?: string,
    targetDate?: string
  ) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId
        ? {
            ...r,
            recommendations: r.recommendations.map(rec =>
              rec.id === recommendationId
                ? {
                    ...rec,
                    status,
                    assignedTo: assignedTo || rec.assignedTo,
                    targetDate: targetDate || rec.targetDate,
                    implementedAt: status === "implemented" ? new Date().toISOString() : rec.implementedAt,
                  }
                : rec
            ),
          }
        : r
    ));
  }, []);

  // Propose a playbook update
  const proposePlaybookUpdate = useCallback((
    reviewId: string,
    update: Omit<PlaybookUpdate, "appliedAt" | "approvedBy">
  ) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId
        ? { ...r, playbookUpdates: [...r.playbookUpdates, update] }
        : r
    ));
  }, []);

  // Apply a playbook update
  const applyPlaybookUpdate = useCallback((
    reviewId: string,
    playbookId: string,
    approvedBy: string
  ) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId
        ? {
            ...r,
            playbookUpdates: r.playbookUpdates.map(update =>
              update.playbookId === playbookId
                ? { ...update, approvedBy, appliedAt: new Date().toISOString() }
                : update
            ),
          }
        : r
    ));
  }, []);

  // Propose a readiness adjustment
  const proposeReadinessAdjustment = useCallback((
    reviewId: string,
    adjustment: ReadinessAdjustment
  ) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId
        ? { ...r, readinessAdjustments: [...r.readinessAdjustments, adjustment] }
        : r
    ));
  }, []);

  // Complete a review
  const completeReview = useCallback((reviewId: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, status: "completed" as const } : r
    ));
  }, []);

  // Archive a review
  const archiveReview = useCallback((reviewId: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, status: "archived" as const } : r
    ));
  }, []);

  // Get insights across all reviews
  const getAggregateInsights = useCallback(() => {
    const completedReviews = reviews.filter(r => r.status === "completed" || r.status === "archived");
    
    // Aggregate what worked categories
    const workedCategories: Record<string, number> = {};
    completedReviews.flatMap(r => r.whatWorked).forEach(item => {
      workedCategories[item.category] = (workedCategories[item.category] || 0) + 1;
    });

    // Aggregate what failed categories
    const failedCategories: Record<string, number> = {};
    completedReviews.flatMap(r => r.whatFailed).forEach(item => {
      failedCategories[item.category] = (failedCategories[item.category] || 0) + 1;
    });

    // Recommendation implementation rate
    const allRecs = completedReviews.flatMap(r => r.recommendations);
    const implementedRecs = allRecs.filter(r => r.status === "implemented");

    return {
      totalReviews: completedReviews.length,
      topSuccessPatterns: Object.entries(workedCategories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category, count]) => ({ category, count })),
      topFailurePatterns: Object.entries(failedCategories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category, count]) => ({ category, count })),
      recommendationImplementationRate: allRecs.length > 0
        ? implementedRecs.length / allRecs.length
        : 0,
      playbooksUpdated: completedReviews
        .flatMap(r => r.playbookUpdates)
        .filter(u => u.appliedAt).length,
    };
  }, [reviews]);

  return {
    reviews,
    isLoading,
    initiateReview,
    addWhatWorked,
    addWhatFailed,
    addRecommendation,
    updateRecommendationStatus,
    proposePlaybookUpdate,
    applyPlaybookUpdate,
    proposeReadinessAdjustment,
    completeReview,
    archiveReview,
    getAggregateInsights,
  };
}
