import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Grid3X3, Play, Bookmark, TrendingUp, Users, Microscope, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ExploreItem {
  id: string;
  type: "image" | "video" | "carousel";
  thumbnail: string;
  backgroundColor: string;
  title: string;
  likes: number;
  comments: number;
  isReel?: boolean;
}

const mockExploreItems: ExploreItem[] = [
  { id: "1", type: "video", thumbnail: "", backgroundColor: "from-purple-500 to-pink-500", title: "PhD Life Tips", likes: 12500, comments: 342, isReel: true },
  { id: "2", type: "image", thumbnail: "", backgroundColor: "from-blue-500 to-cyan-500", title: "Lab Setup Tour", likes: 8900, comments: 234 },
  { id: "3", type: "image", thumbnail: "", backgroundColor: "from-green-500 to-emerald-500", title: "Research Findings", likes: 15600, comments: 567 },
  { id: "4", type: "video", thumbnail: "", backgroundColor: "from-orange-500 to-red-500", title: "Conference Highlights", likes: 23400, comments: 890, isReel: true },
  { id: "5", type: "carousel", thumbnail: "", backgroundColor: "from-indigo-500 to-purple-500", title: "Paper Review", likes: 4500, comments: 123 },
  { id: "6", type: "image", thumbnail: "", backgroundColor: "from-pink-500 to-rose-500", title: "New Publication", likes: 6700, comments: 456 },
  { id: "7", type: "video", thumbnail: "", backgroundColor: "from-teal-500 to-cyan-500", title: "Day in Research", likes: 34500, comments: 1234, isReel: true },
  { id: "8", type: "image", thumbnail: "", backgroundColor: "from-yellow-500 to-orange-500", title: "Award Ceremony", likes: 7800, comments: 345 },
  { id: "9", type: "image", thumbnail: "", backgroundColor: "from-violet-500 to-purple-500", title: "Team Meeting", likes: 2300, comments: 89 },
];

const trendingTopics = [
  { name: "AIResearch", posts: "125K posts", icon: Microscope },
  { name: "PhDLife", posts: "89K posts", icon: GraduationCap },
  { name: "OpenScience", posts: "56K posts", icon: Users },
  { name: "DataVisualization", posts: "43K posts", icon: TrendingUp },
];

const suggestedAccounts = [
  { name: "Dr. Sarah Chen", handle: "@sarahchen_ai", followers: "125K", verified: true },
  { name: "Prof. James Wilson", handle: "@jwilson_physics", followers: "89K", verified: true },
  { name: "Dr. Emily Park", handle: "@emilypark_neuro", followers: "67K", verified: false },
];

export function ExploreGrid() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("foryou");

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted/50 border-0"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 gap-2">
          <TabsTrigger value="foryou" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4">
            For You
          </TabsTrigger>
          <TabsTrigger value="trending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4">
            Trending
          </TabsTrigger>
          <TabsTrigger value="research" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4">
            Research
          </TabsTrigger>
          <TabsTrigger value="accounts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4">
            Accounts
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Trending Topics */}
      {activeTab === "trending" && (
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <motion.div
              key={topic.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <topic.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">#{topic.name}</p>
                <p className="text-sm text-muted-foreground">{topic.posts}</p>
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Suggested Accounts */}
      {activeTab === "accounts" && (
        <div className="space-y-3">
          {suggestedAccounts.map((account, index) => (
            <motion.div
              key={account.handle}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {account.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="font-semibold">{account.name}</p>
                  {account.verified && (
                    <Badge variant="secondary" className="h-4 px-1 text-[10px]">✓</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{account.handle}</p>
                <p className="text-xs text-muted-foreground">{account.followers} followers</p>
              </div>
              <Button size="sm" className="rounded-full">Follow</Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Explore Grid */}
      {(activeTab === "foryou" || activeTab === "research") && (
        <div className="grid grid-cols-3 gap-0.5">
          {mockExploreItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className={cn(
                "relative cursor-pointer overflow-hidden",
                // Make some items span 2x2
                index === 0 && "col-span-2 row-span-2"
              )}
            >
              <AspectRatio ratio={1}>
                <div className={cn(
                  "w-full h-full bg-gradient-to-br flex items-center justify-center",
                  item.backgroundColor
                )}>
                  <p className="text-white font-medium text-xs text-center px-2">
                    {item.title}
                  </p>
                </div>
                
                {/* Video/Reel indicator */}
                {item.isReel && (
                  <div className="absolute top-2 right-2">
                    <Play className="h-5 w-5 text-white drop-shadow-lg fill-white" />
                  </div>
                )}
                
                {/* Multiple images indicator */}
                {item.type === "carousel" && (
                  <div className="absolute top-2 right-2">
                    <Grid3X3 className="h-5 w-5 text-white drop-shadow-lg" />
                  </div>
                )}

                {/* Hover overlay with stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center gap-4"
                >
                  <div className="flex items-center gap-1 text-white">
                    <span className="text-lg">❤️</span>
                    <span className="font-semibold">{formatNumber(item.likes)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white">
                    <span className="text-lg">💬</span>
                    <span className="font-semibold">{formatNumber(item.comments)}</span>
                  </div>
                </motion.div>
              </AspectRatio>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
