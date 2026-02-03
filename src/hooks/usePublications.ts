import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =====================================================
// TYPES
// =====================================================

export interface Publication {
  id: string;
  title: string;
  abstract: string | null;
  publication_type: string;
  publication_date: string | null;
  journal_or_venue: string | null;
  doi: string | null;
  external_url: string | null;
  pdf_url: string | null;
  visibility: string;
  is_featured: boolean;
  created_at: string;
  authors?: PublicationAuthor[];
  metrics?: PublicationMetrics;
  verifications?: PublicationVerification[];
}

export interface PublicationAuthor {
  id: string;
  publication_id: string;
  user_id: string | null;
  author_name: string;
  author_order: number;
  affiliation: string | null;
  is_corresponding_author: boolean;
}

export interface PublicationMetrics {
  publication_id: string;
  views_count: number;
  citation_count: number;
  downloads_count: number;
  shares_count: number;
}

export interface PublicationVerification {
  id: string;
  publication_id: string;
  verification_source: string;
  verified_by: string | null;
  verified_at: string;
}

// =====================================================
// USER PUBLICATIONS
// =====================================================

export function useUserPublications(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  
  return useQuery({
    queryKey: ["userPublications", targetId],
    queryFn: async () => {
      if (!targetId) return [];
      
      // Get publications where user is an author
      const { data: authorships, error: authError } = await supabase
        .from("publication_authors")
        .select("publication_id")
        .eq("user_id", targetId);
      
      if (authError) throw authError;
      
      const pubIds = authorships?.map(a => a.publication_id) || [];
      if (pubIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("publications")
        .select(`
          *,
          publication_authors(*),
          publication_metrics(*),
          publication_verifications(*)
        `)
        .in("id", pubIds)
        .order("publication_date", { ascending: false });
      
      if (error) throw error;
      return data as Publication[];
    },
    enabled: !!targetId,
  });
}

// =====================================================
// ALL PUBLICATIONS (PAGINATED)
// =====================================================

export function usePublications(filters?: { type?: string; search?: string }) {
  return useInfiniteQuery({
    queryKey: ["publications", filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("publications")
        .select(`
          *,
          publication_authors(*),
          publication_metrics(*)
        `)
        .eq("visibility", "public")
        .order("publication_date", { ascending: false })
        .range(pageParam * 20, (pageParam + 1) * 20 - 1);
      
      if (filters?.type) {
        query = query.eq("publication_type", filters.type);
      }
      
      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return {
        publications: data as Publication[],
        nextPage: data.length === 20 ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}

// =====================================================
// SINGLE PUBLICATION
// =====================================================

export function usePublication(publicationId?: string) {
  return useQuery({
    queryKey: ["publication", publicationId],
    queryFn: async () => {
      if (!publicationId) return null;
      
      const { data, error } = await supabase
        .from("publications")
        .select(`
          *,
          publication_authors(*),
          publication_metrics(*),
          publication_verifications(*)
        `)
        .eq("id", publicationId)
        .single();
      
      if (error) throw error;
      
      // Increment view count
      await supabase
        .from("publication_metrics")
        .update({ views_count: (data.publication_metrics?.views_count || 0) + 1 })
        .eq("publication_id", publicationId);
      
      return data as Publication;
    },
    enabled: !!publicationId,
  });
}

// =====================================================
// CREATE PUBLICATION
// =====================================================

export function useCreatePublication() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      publication: Omit<Publication, "id" | "created_at" | "authors" | "metrics" | "verifications">;
      authors: Omit<PublicationAuthor, "id" | "publication_id">[];
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      // Create publication
      const { data: pub, error: pubError } = await supabase
        .from("publications")
        .insert(data.publication)
        .select()
        .single();
      
      if (pubError) throw pubError;
      
      // Add authors
      const authorsWithPubId = data.authors.map((author, idx) => ({
        ...author,
        publication_id: pub.id,
        author_order: idx + 1,
      }));
      
      const { error: authError } = await supabase
        .from("publication_authors")
        .insert(authorsWithPubId);
      
      if (authError) throw authError;
      
      // Initialize metrics
      await supabase
        .from("publication_metrics")
        .insert({ publication_id: pub.id });
      
      return pub;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPublications", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      toast.success("Publication added");
    },
    onError: () => {
      toast.error("Failed to add publication");
    },
  });
}

// =====================================================
// CLAIM PUBLICATION
// =====================================================

export function useClaimPublication() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (publicationId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("publication_claims")
        .insert({
          publication_id: publicationId,
          claimant_user_id: user.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Claim submitted for review");
    },
    onError: () => {
      toast.error("Failed to submit claim");
    },
  });
}

// =====================================================
// DELETE PUBLICATION
// =====================================================

export function useDeletePublication() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (publicationId: string) => {
      const { error } = await supabase
        .from("publications")
        .delete()
        .eq("id", publicationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPublications", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      toast.success("Publication removed");
    },
  });
}
