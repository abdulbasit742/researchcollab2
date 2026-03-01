import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TagEntry {
  id: string;
  tag_name: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

export function useTagIndex(entityType?: string, entityId?: string) {
  const qc = useQueryClient();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["tag-index", entityType, entityId],
    queryFn: async (): Promise<TagEntry[]> => {
      let query = supabase.from("tag_index").select("*");
      if (entityType) query = query.eq("entity_type", entityType);
      if (entityId) query = query.eq("entity_id", entityId);
      const { data } = await query.order("tag_name").limit(100);
      return (data ?? []) as TagEntry[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const addTag = useMutation({
    mutationFn: async ({ tagName, entType, entId }: { tagName: string; entType: string; entId: string }) => {
      const clean = tagName.trim().toLowerCase().replace(/[^a-z0-9\-_ ]/g, "").slice(0, 50);
      if (!clean) throw new Error("Invalid tag");
      await supabase.from("tag_index").upsert(
        { tag_name: clean, entity_type: entType, entity_id: entId },
        { onConflict: "tag_name,entity_type,entity_id" }
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tag-index"] }),
  });

  return { tags, isLoading, addTag: addTag.mutate };
}

export function usePopularTags(limit = 20) {
  return useQuery({
    queryKey: ["popular-tags", limit],
    queryFn: async () => {
      const { data } = await supabase
        .from("tag_index")
        .select("tag_name")
        .limit(500);
      // Count frequency client-side
      const counts: Record<string, number> = {};
      (data ?? []).forEach((t: any) => {
        counts[t.tag_name] = (counts[t.tag_name] || 0) + 1;
      });
      return Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([name, count]) => ({ name, count }));
    },
    staleTime: 10 * 60 * 1000,
  });
}
