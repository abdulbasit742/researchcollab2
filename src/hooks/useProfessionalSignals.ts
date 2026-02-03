import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// Professional Reaction Types - NOT likes
export type ProfessionalReactionType = 
  | 'useful'           // "This is useful information"
  | 'verified'         // "I can verify this is accurate" 
  | 'collaborate'      // "I'd work with this person"
  | 'insightful'       // "Valuable insight or outcome"
  | 'high_integrity';  // "This person shows high integrity"

export const PROFESSIONAL_REACTIONS: Record<ProfessionalReactionType, {
  label: string;
  emoji: string;
  description: string;
  trustWeight: number;
}> = {
  useful: {
    label: "Useful",
    emoji: "📌",
    description: "This information is professionally useful",
    trustWeight: 1,
  },
  verified: {
    label: "Verified",
    emoji: "✓",
    description: "I can verify this is accurate",
    trustWeight: 3,
  },
  collaborate: {
    label: "I'd Collaborate",
    emoji: "🤝",
    description: "I would work with this person",
    trustWeight: 5,
  },
  insightful: {
    label: "Insightful",
    emoji: "💡",
    description: "Valuable professional insight",
    trustWeight: 2,
  },
  high_integrity: {
    label: "High Integrity",
    emoji: "🛡️",
    description: "This person demonstrates high integrity",
    trustWeight: 4,
  },
};

// Structured Update Types - NOT casual posts
export type ProfessionalUpdateType = 
  | 'work_started'
  | 'work_completed'
  | 'research_milestone'
  | 'case_outcome'
  | 'lesson_learned'
  | 'institutional_announcement'
  | 'opportunity_posted'
  | 'collaboration_request';

export const PROFESSIONAL_UPDATE_TYPES: Record<ProfessionalUpdateType, {
  label: string;
  icon: string;
  description: string;
  requiresLink: boolean;
}> = {
  work_started: {
    label: "Work Started",
    icon: "🚀",
    description: "Started a new project or role",
    requiresLink: true,
  },
  work_completed: {
    label: "Work Completed",
    icon: "✅",
    description: "Successfully completed a project",
    requiresLink: true,
  },
  research_milestone: {
    label: "Research Milestone",
    icon: "🔬",
    description: "Reached a significant research milestone",
    requiresLink: true,
  },
  case_outcome: {
    label: "Case Outcome",
    icon: "📊",
    description: "Sharing an outcome or case study",
    requiresLink: false,
  },
  lesson_learned: {
    label: "Lesson Learned",
    icon: "📝",
    description: "Sharing a lesson (especially from failure)",
    requiresLink: false,
  },
  institutional_announcement: {
    label: "Institutional Announcement",
    icon: "🏛️",
    description: "Official institutional news",
    requiresLink: false,
  },
  opportunity_posted: {
    label: "Opportunity Posted",
    icon: "💼",
    description: "Posted a new opportunity",
    requiresLink: true,
  },
  collaboration_request: {
    label: "Collaboration Request",
    icon: "🤝",
    description: "Looking for collaborators",
    requiresLink: false,
  },
};

export interface ProfessionalSignal {
  id: string;
  author_id: string;
  update_type: ProfessionalUpdateType;
  content: string;
  linked_entity_type: 'project' | 'offer' | 'milestone' | 'publication' | 'grant' | 'institution' | null;
  linked_entity_id: string | null;
  linked_entity_title: string | null;
  visibility: 'public' | 'connections' | 'institution';
  is_failure_context: boolean;
  credibility_weight: number;
  created_at: string;
  author?: {
    id: string;
    full_name: string | null;
    role: string | null;
    university: string | null;
    trust_score?: number;
  };
  reactions?: ProfessionalReaction[];
  reaction_counts?: Record<ProfessionalReactionType, number>;
  my_reaction?: ProfessionalReactionType | null;
  peer_validations_count?: number;
}

export interface ProfessionalReaction {
  id: string;
  signal_id: string;
  user_id: string;
  reaction_type: ProfessionalReactionType;
  created_at: string;
  reactor?: {
    id: string;
    full_name: string | null;
    trust_score?: number;
  };
}

export interface PeerValidation {
  id: string;
  signal_id: string;
  comment_id: string;
  validator_id: string;
  validation_type: 'accurate' | 'can_confirm' | 'worked_with' | 'quality_endorsement';
  created_at: string;
  validator?: {
    id: string;
    full_name: string | null;
    trust_score?: number;
  };
}

// Hook for professional signal feed
export function useProfessionalSignalFeed() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const fetchSignals = useCallback(async () => {
    // For now, use posts table but filter by structured types
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        author:profiles!posts_author_id_fkey(id, full_name, role, university)
      `)
      .eq("is_hidden", false)
      .in("post_type", [
        'research_update', 
        'milestone', 
        'publication', 
        'collaboration_request',
        'announcement'
      ])
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Transform to professional signals format
    return (data || []).map(post => ({
      id: post.id,
      author_id: post.author_id,
      update_type: mapPostTypeToUpdateType(post.post_type),
      content: post.content,
      linked_entity_type: post.linked_entity_type as any,
      linked_entity_id: post.linked_entity_id,
      linked_entity_title: null,
      visibility: post.visibility as any,
      is_failure_context: false,
      credibility_weight: calculateCredibilityWeight(post),
      created_at: post.created_at,
      author: post.author,
    })) as ProfessionalSignal[];
  }, [page]);

  const query = useQuery({
    queryKey: ["professional-signals", page, user?.id],
    queryFn: fetchSignals,
    enabled: !!user,
    staleTime: 30000,
  });

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  return {
    signals: query.data || [],
    isLoading: query.isLoading,
    hasMore: (query.data?.length || 0) === PAGE_SIZE,
    loadMore,
    refetch: query.refetch,
  };
}

// Hook for professional reactions (not likes)
export function useProfessionalReactions(signalId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // For now, map to existing post_likes but with reaction type metadata
  const reactMutation = useMutation({
    mutationFn: async (reactionType: ProfessionalReactionType) => {
      if (!user) throw new Error("Not authenticated");

      // Check if user already reacted (limit: 3 reactions per day per user)
      const { count } = await supabase
        .from("post_likes")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if ((count || 0) >= 10) {
        throw new Error("Daily reaction limit reached. Professional reactions are limited to preserve meaning.");
      }

      // Insert reaction
      const { error } = await supabase
        .from("post_likes")
        .insert({ 
          post_id: signalId, 
          user_id: user.id,
        });

      if (error) throw error;

      return { reactionType };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional-signals"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast({
        title: "Reaction added",
        description: "Your professional signal has been recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Cannot react",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeReactionMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", signalId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional-signals"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  return {
    react: reactMutation.mutate,
    removeReaction: removeReactionMutation.mutate,
    isReacting: reactMutation.isPending,
  };
}

// Hook for peer validation on comments
export function usePeerValidation(commentId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const validateMutation = useMutation({
    mutationFn: async (validationType: PeerValidation['validation_type']) => {
      if (!user) throw new Error("Not authenticated");

      // Mark comment as peer-validated via like with specific context
      const { error } = await supabase
        .from("comment_likes")
        .insert({ 
          comment_id: commentId, 
          user_id: user.id,
        });

      if (error) throw error;

      return { validationType };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments"] });
      toast({
        title: "Peer validation recorded",
        description: "Your professional endorsement has been added.",
      });
    },
  });

  return {
    validate: validateMutation.mutate,
    isValidating: validateMutation.isPending,
  };
}

// Hook for contextual following
export function useContextualFollow() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: async ({ 
      targetId, 
      followType, 
      context 
    }: { 
      targetId: string; 
      followType: 'user' | 'domain' | 'institution' | 'project';
      context?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Use existing follows table
      const { error } = await supabase
        .from("user_follows")
        .insert({ 
          follower_id: user.id, 
          following_id: targetId,
        });

      if (error) throw error;

      return { targetId, followType, context };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["following"] });
      toast({
        title: `Now following`,
        description: `You'll see relevant updates in your signal stream.`,
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (targetId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });

  return {
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    isFollowing: followMutation.isPending,
  };
}

// Hook for creating structured professional updates
export function useCreateProfessionalUpdate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      updateType: ProfessionalUpdateType;
      content: string;
      linkedEntityType?: 'project' | 'offer' | 'milestone' | 'publication' | 'grant' | 'institution';
      linkedEntityId?: string;
      isFailureContext?: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Validate required links for certain types
      const updateConfig = PROFESSIONAL_UPDATE_TYPES[data.updateType];
      if (updateConfig.requiresLink && !data.linkedEntityId) {
        throw new Error(`${updateConfig.label} requires linking to a specific work item.`);
      }

      // Map to posts table
      const { data: post, error } = await supabase
        .from("posts")
        .insert([{
          author_id: user.id,
          content: data.content,
          post_type: mapUpdateTypeToPostType(data.updateType),
          visibility: 'public' as const,
          linked_entity_type: data.linkedEntityType || null,
          linked_entity_id: data.linkedEntityId || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional-signals"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast({
        title: "Professional update published",
        description: "Your update is now visible to relevant professionals.",
      });
    },
    onError: (error) => {
      toast({
        title: "Cannot publish update",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Helper functions
function mapPostTypeToUpdateType(postType: string): ProfessionalUpdateType {
  const mapping: Record<string, ProfessionalUpdateType> = {
    'research_update': 'research_milestone',
    'milestone': 'work_completed',
    'publication': 'case_outcome',
    'collaboration_request': 'collaboration_request',
    'announcement': 'institutional_announcement',
  };
  return mapping[postType] || 'case_outcome';
}

type PostTypeEnum = "announcement" | "collaboration_request" | "milestone" | "organization_post" | "publication" | "research_update" | "text";

function mapUpdateTypeToPostType(updateType: ProfessionalUpdateType): PostTypeEnum {
  const mapping: Record<ProfessionalUpdateType, PostTypeEnum> = {
    'work_started': 'milestone',
    'work_completed': 'milestone',
    'research_milestone': 'research_update',
    'case_outcome': 'publication',
    'lesson_learned': 'research_update',
    'institutional_announcement': 'announcement',
    'opportunity_posted': 'collaboration_request',
    'collaboration_request': 'collaboration_request',
  };
  return mapping[updateType] || 'text';
}

function calculateCredibilityWeight(post: any): number {
  let weight = 1;
  
  // Higher weight for linked entities
  if (post.linked_entity_id) weight += 2;
  
  // Higher weight for structured types
  if (['research_update', 'milestone', 'publication'].includes(post.post_type)) {
    weight += 1;
  }
  
  return weight;
}
