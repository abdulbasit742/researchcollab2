import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Grid3X3, MessageCircle, Heart } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const gradientColors = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-purple-500",
  "from-pink-500 to-rose-500",
];

interface ProfilePostGridProps {
  userId: string;
}

export function ProfilePostGrid({ userId }: ProfilePostGridProps) {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["profile-posts-grid", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, content, likes_count, comments_count, created_at")
        .eq("author_id", userId)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-0.5">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold mb-1">No posts yet</h3>
        <p className="text-sm text-muted-foreground">Posts will appear here in a grid</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03 }}
          whileHover={{ scale: 1.02 }}
          className="relative cursor-pointer overflow-hidden"
        >
          <AspectRatio ratio={1}>
            <div className={cn(
              "w-full h-full bg-gradient-to-br flex items-center justify-center p-2",
              gradientColors[index % gradientColors.length]
            )}>
              <p className="text-white font-medium text-xs text-center line-clamp-4">
                {post.content.slice(0, 60)}
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3"
            >
              <div className="flex items-center gap-1 text-white text-sm">
                <Heart className="h-4 w-4 fill-white" />
                <span className="font-semibold">{post.likes_count}</span>
              </div>
              <div className="flex items-center gap-1 text-white text-sm">
                <MessageCircle className="h-4 w-4" />
                <span className="font-semibold">{post.comments_count}</span>
              </div>
            </motion.div>
          </AspectRatio>
        </motion.div>
      ))}
    </div>
  );
}
