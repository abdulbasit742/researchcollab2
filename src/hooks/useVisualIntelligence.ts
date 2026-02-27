/**
 * React hooks for Professional Visual Intelligence Platform.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  createPortfolioItem,
  getUserPortfolio,
  discoverPortfolio,
  getProjectStories,
  createProjectStoryEvent,
  getInstitutionalChannels,
  getShowcasePosts,
  getVisualDiscussions,
  addVisualDiscussion,
  getExecutionReels,
  getUserBadges,
  calculateVisualImpactScore,
  VISUAL_INTELLIGENCE_TRANSPARENCY,
  type PortfolioItemInput,
  type StoryEventType,
} from "@/lib/professional/visualIntelligence";

export function useUserPortfolio(userId?: string) {
  return useQuery({
    queryKey: ["visual-portfolio", userId],
    queryFn: () => getUserPortfolio(userId!),
    enabled: !!userId,
  });
}

export function useDiscoverPortfolio(filters?: { visualType?: string; institutionId?: string; limit?: number }) {
  return useQuery({
    queryKey: ["discover-portfolio", filters],
    queryFn: () => discoverPortfolio(filters ?? {}),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePortfolioItem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string; input: PortfolioItemInput }) =>
      createPortfolioItem(params.userId, params.input),
    onSuccess: () => {
      toast({ title: "Portfolio item created", description: "Your execution visual has been added." });
      queryClient.invalidateQueries({ queryKey: ["visual-portfolio"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useProjectStories(projectId?: string) {
  return useQuery({
    queryKey: ["project-stories", projectId],
    queryFn: () => getProjectStories(projectId!),
    enabled: !!projectId,
  });
}

export function useCreateProjectStoryEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      userId: string;
      event: {
        projectId: string;
        eventType: StoryEventType;
        eventTitle: string;
        eventDescription?: string;
        mediaUrl?: string;
        milestoneNumber?: number;
        escrowStage?: string;
      };
    }) => createProjectStoryEvent(params.userId, params.event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-stories"] });
    },
  });
}

export function useInstitutionalChannels(institutionId?: string) {
  return useQuery({
    queryKey: ["showcase-channels", institutionId],
    queryFn: () => getInstitutionalChannels(institutionId),
    staleTime: 10 * 60 * 1000,
  });
}

export function useShowcasePosts(channelId?: string, institutionId?: string) {
  return useQuery({
    queryKey: ["showcase-posts", channelId, institutionId],
    queryFn: () => getShowcasePosts(channelId, institutionId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVisualDiscussions(portfolioItemId?: string) {
  return useQuery({
    queryKey: ["visual-discussions", portfolioItemId],
    queryFn: () => getVisualDiscussions(portfolioItemId!),
    enabled: !!portfolioItemId,
  });
}

export function useAddVisualDiscussion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      authorId: string;
      portfolioItemId: string;
      content: string;
      discussionType?: string;
      isFacultyReview?: boolean;
      isSponsorComment?: boolean;
      parentId?: string;
    }) => addVisualDiscussion(params.authorId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visual-discussions"] });
    },
  });
}

export function useExecutionReels(filters?: { userId?: string; reelType?: string; limit?: number }) {
  return useQuery({
    queryKey: ["execution-reels", filters],
    queryFn: () => getExecutionReels(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserBadges(userId?: string) {
  return useQuery({
    queryKey: ["visual-badges", userId],
    queryFn: () => getUserBadges(userId!),
    enabled: !!userId,
  });
}

export function useVisualImpactScore(userId?: string) {
  return useQuery({
    queryKey: ["visual-impact-score", userId],
    queryFn: () => calculateVisualImpactScore(userId!),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useVisualIntelligenceTransparency() {
  return VISUAL_INTELLIGENCE_TRANSPARENCY;
}
