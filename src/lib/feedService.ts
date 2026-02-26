import { supabase } from "@/integrations/supabase/client";

/**
 * Feed service — standalone functions.
 * The useFeed hook already has realtime subscriptions.
 * This provides utility for programmatic use.
 */

export async function getFeedPosts(limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, full_name, role, university)
    `)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

export async function createPost(
  authorId: string,
  content: string,
  options?: {
    post_type?: string;
    visibility?: string;
    tags?: string[];
    media_urls?: string[];
  }
) {
  const insertData: Record<string, any> = {
    author_id: authorId,
    content,
    post_type: options?.post_type || "text",
    visibility: options?.visibility || "public",
    tags: options?.tags || [],
    media_urls: options?.media_urls || [],
  };

  const { data, error } = await supabase
    .from("posts")
    .insert(insertData as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function subscribeToFeed(
  callback: (payload: any) => void
): () => void {
  const channel = supabase
    .channel("feed-live")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "posts",
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
