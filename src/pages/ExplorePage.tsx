import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, TrendingUp, Users, Grid3X3, Play, Film } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function ExplorePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("foryou");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: posts = [], isLoading: postsLoading } = useExplorePosts();
  const { data: tags = [] } = useTrendingTags();
  const { data: profiles = [] } = useSuggestedProfiles();

  if (!authLoading && !user) return <Navigate to="/" replace />;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <MainLayout>
      <div className="container max-w-3xl py-4 px-4 space-y-4">
        <h1 className="text-2xl font-bold">Explore</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts, tags, people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-0"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 gap-2">
            <TabsTrigger value="foryou" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4">
              For You
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4">
              Trending
            </TabsTrigger>
            <TabsTrigger value="reels" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4">
              <Film className="h-3.5 w-3.5 mr-1" />
              Reels
            </TabsTrigger>
            <TabsTrigger value="accounts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4">
              Accounts
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Trending Tags */}
        {activeTab === "trending" && (
          <div className="space-y-3">
            {tags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No trending tags yet</p>
            ) : (
              tags.map((tag, index) => (
                <motion.div
                  key={tag.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">#{tag.name}</p>
                    <p className="text-sm text-muted-foreground">{tag.count} posts</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Suggested Accounts */}
        {activeTab === "accounts" && (
          <div className="space-y-3">
            {profiles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No suggestions yet</p>
            ) : (
              profiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {(profile.full_name || "U").split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{profile.full_name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{profile.university || profile.role || "Member"}</p>
                  </div>
                  <Button size="sm" className="rounded-full" asChild>
                    <Link to={`/u/${profile.id}`}>View</Link>
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Reels Tab */}
        {activeTab === "reels" && (
          <div className="text-center py-8">
            <Film className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Discover Reels</h3>
            <p className="text-sm text-muted-foreground mb-4">Short-form insights from researchers and academics</p>
            <Button asChild>
              <Link to="/reels">Watch Reels</Link>
            </Button>
          </div>
        )}

        {/* Explore Grid */}
        {activeTab === "foryou" && (
          postsLoading ? (
            <div className="grid grid-cols-3 gap-0.5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-1">No posts to explore</h3>
              <p className="text-sm text-muted-foreground">Be the first to share something!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "relative cursor-pointer overflow-hidden",
                    index === 0 && "col-span-2 row-span-2"
                  )}
                >
                  <AspectRatio ratio={1}>
                    <div className={cn(
                      "w-full h-full bg-gradient-to-br flex items-center justify-center p-2",
                      gradientColors[index % gradientColors.length]
                    )}>
                      <p className="text-white font-medium text-xs text-center line-clamp-4">
                        {post.content.slice(0, 80)}
                      </p>
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center gap-4"
                    >
                      <div className="flex items-center gap-1 text-white text-sm">
                        <span>❤️</span>
                        <span className="font-semibold">{formatNumber(post.likes_count)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white text-sm">
                        <span>💬</span>
                        <span className="font-semibold">{formatNumber(post.comments_count)}</span>
                      </div>
                    </motion.div>
                  </AspectRatio>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>
    </MainLayout>
  );
}
