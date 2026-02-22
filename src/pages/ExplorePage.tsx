import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Grid3X3, Film, Heart, MessageCircle, Bookmark, Users, Flame, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useExplorePosts, useTrendingTags, useSuggestedProfiles } from "@/hooks/useExplore";
import { cn } from "@/lib/utils";

const gradientColors = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-purple-500",
  "from-pink-500 to-rose-500",
  "from-teal-500 to-cyan-500",
  "from-yellow-500 to-orange-500",
  "from-violet-500 to-purple-500",
];

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

function ExplorePostGrid({ posts, isLoading }: { posts: any[]; isLoading: boolean }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className={cn("aspect-square", i === 0 && "col-span-2 row-span-2")} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Grid3X3 className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-1">No posts to explore</h3>
        <p className="text-sm text-muted-foreground">Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
      {posts.map((post, index) => {
        const isLarge = index === 0 || index === 5;
        return (
          <motion.div
            key={post.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.03 }}
            onMouseEnter={() => setHoveredId(post.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              "relative cursor-pointer overflow-hidden group",
              isLarge && "col-span-2 row-span-2"
            )}
          >
            <AspectRatio ratio={1}>
              <div className={cn(
                "w-full h-full bg-gradient-to-br flex items-center justify-center p-3",
                gradientColors[index % gradientColors.length]
              )}>
                <p className={cn(
                  "text-white font-semibold text-center line-clamp-4",
                  isLarge ? "text-sm" : "text-[10px] leading-tight"
                )}>
                  {post.content.slice(0, isLarge ? 120 : 60)}
                </p>
              </div>

              {/* Hover overlay */}
              <AnimatePresence>
                {hoveredId === post.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center gap-6 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-1.5 text-white">
                      <Heart className="h-5 w-5 fill-white" />
                      <span className="font-bold text-sm">{formatNumber(post.likes_count)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white">
                      <MessageCircle className="h-5 w-5 fill-white" />
                      <span className="font-bold text-sm">{formatNumber(post.comments_count)}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </AspectRatio>
          </motion.div>
        );
      })}
    </div>
  );
}

function TrendingTagsList({ tags }: { tags: { name: string; count: number }[] }) {
  if (tags.length === 0) {
    return (
      <div className="text-center py-12">
        <Flame className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No trending tags yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tags.map((tag, index) => (
        <motion.div
          key={tag.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.04 }}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 cursor-pointer transition-colors group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/30 transition-colors">
            <span className="text-lg font-bold text-primary">{index + 1}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">#{tag.name}</p>
            <p className="text-xs text-muted-foreground">{formatNumber(tag.count)} posts</p>
          </div>
          <TrendingUp className="h-4 w-4 text-green-500 shrink-0" />
        </motion.div>
      ))}
    </div>
  );
}

function SuggestedAccountsList({ profiles }: { profiles: any[] }) {
  if (profiles.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No suggestions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {profiles.map((profile, index) => (
        <motion.div
          key={profile.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.04 }}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors"
        >
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-bold">
                {(profile.full_name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-background" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{profile.full_name || "Unknown"}</p>
            <p className="text-xs text-muted-foreground truncate">{profile.university || profile.role || "Member"}</p>
          </div>
          <Button size="sm" className="rounded-full text-xs h-8 px-4" asChild>
            <Link to={`/u/${profile.id}`}>Follow</Link>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export default function ExplorePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("foryou");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const { data: posts = [], isLoading: postsLoading } = useExplorePosts();
  const { data: tags = [] } = useTrendingTags();
  const { data: profiles = [] } = useSuggestedProfiles();

  if (!authLoading && !user) return <Navigate to="/" replace />;

  return (
    <MainLayout>
      <div className="container max-w-3xl py-4 px-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Explore</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bookmark className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <motion.div
          className="relative"
          animate={{ scale: searchFocused ? 1.02 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts, tags, people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="pl-10 h-11 bg-muted/50 border-0 rounded-xl text-sm"
          />
        </motion.div>

        {/* Quick category chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {["🔬 Research", "💡 Ideas", "📊 Data", "🎓 Academic", "🤝 Collab"].map((chip) => (
            <Button
              key={chip}
              variant="outline"
              size="sm"
              className="rounded-full text-xs shrink-0 h-8 border-muted-foreground/20"
            >
              {chip}
            </Button>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 gap-1">
            <TabsTrigger value="foryou" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              For You
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 gap-1.5">
              <Flame className="h-3.5 w-3.5" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="reels" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 gap-1.5">
              <Film className="h-3.5 w-3.5" />
              Reels
            </TabsTrigger>
            <TabsTrigger value="accounts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 gap-1.5">
              <Users className="h-3.5 w-3.5" />
              People
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "foryou" && (
              <ExplorePostGrid posts={posts} isLoading={postsLoading} />
            )}

            {activeTab === "trending" && (
              <TrendingTagsList tags={tags} />
            )}

            {activeTab === "accounts" && (
              <SuggestedAccountsList profiles={profiles} />
            )}

            {activeTab === "reels" && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <Film className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Discover Reels</h3>
                <p className="text-sm text-muted-foreground mb-4">Short-form insights from researchers</p>
                <Button className="rounded-full px-6" asChild>
                  <Link to="/reels">Watch Reels</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
