import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, X, ChevronLeft, ChevronRight, Eye, Heart, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  items: StoryItem[];
  hasUnviewed: boolean;
}

interface StoryItem {
  id: string;
  type: "image" | "video" | "text";
  content: string;
  backgroundColor?: string;
  createdAt: string;
  views: number;
  likes: number;
}

// Mock stories data
const mockStories: Story[] = [
  {
    id: "1",
    userId: "user1",
    userName: "Dr. Sarah Chen",
    items: [
      { id: "s1", type: "text", content: "Just published my latest research paper! 🎉", backgroundColor: "from-purple-500 to-pink-500", createdAt: "2h ago", views: 234, likes: 45 },
      { id: "s2", type: "text", content: "Conference presentation went great!", backgroundColor: "from-blue-500 to-cyan-500", createdAt: "4h ago", views: 189, likes: 32 },
    ],
    hasUnviewed: true,
  },
  {
    id: "2",
    userId: "user2",
    userName: "Prof. Ahmed Khan",
    items: [
      { id: "s3", type: "text", content: "Lab tour day! 🔬", backgroundColor: "from-green-500 to-emerald-500", createdAt: "1h ago", views: 456, likes: 78 },
    ],
    hasUnviewed: true,
  },
  {
    id: "3",
    userId: "user3",
    userName: "Dr. Emily Wang",
    items: [
      { id: "s4", type: "text", content: "New collaboration announcement coming soon!", backgroundColor: "from-orange-500 to-red-500", createdAt: "30m ago", views: 123, likes: 21 },
    ],
    hasUnviewed: false,
  },
  {
    id: "4",
    userId: "user4",
    userName: "Prof. James Miller",
    items: [
      { id: "s5", type: "text", content: "Excited for the symposium next week! 📚", backgroundColor: "from-indigo-500 to-purple-500", createdAt: "3h ago", views: 345, likes: 56 },
    ],
    hasUnviewed: true,
  },
];

export function Stories() {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const openStory = (story: Story) => {
    setSelectedStory(story);
    setCurrentItemIndex(0);
    setProgress(0);
  };

  const closeStory = () => {
    setSelectedStory(null);
    setCurrentItemIndex(0);
    setProgress(0);
  };

  const nextItem = () => {
    if (!selectedStory) return;
    if (currentItemIndex < selectedStory.items.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
      setProgress(0);
    } else {
      // Move to next story
      const currentIndex = mockStories.findIndex(s => s.id === selectedStory.id);
      if (currentIndex < mockStories.length - 1) {
        setSelectedStory(mockStories[currentIndex + 1]);
        setCurrentItemIndex(0);
        setProgress(0);
      } else {
        closeStory();
      }
    }
  };

  const prevItem = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
      setProgress(0);
    } else if (selectedStory) {
      const currentIndex = mockStories.findIndex(s => s.id === selectedStory.id);
      if (currentIndex > 0) {
        const prevStory = mockStories[currentIndex - 1];
        setSelectedStory(prevStory);
        setCurrentItemIndex(prevStory.items.length - 1);
        setProgress(0);
      }
    }
  };

  return (
    <>
      {/* Stories Row */}
      <div className="flex gap-3 p-4 overflow-x-auto scrollbar-hide">
        {/* Add Story Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center gap-1 cursor-pointer"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/50">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <span className="text-xs text-muted-foreground">Your Story</span>
        </motion.div>

        {/* Other Stories */}
        {mockStories.map((story) => (
          <motion.div
            key={story.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openStory(story)}
            className="flex flex-col items-center gap-1 cursor-pointer"
          >
            <div className={cn(
              "p-0.5 rounded-full",
              story.hasUnviewed
                ? "bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500"
                : "bg-muted"
            )}>
              <Avatar className="h-14 w-14 border-2 border-background">
                <AvatarImage src={story.userAvatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {story.userName.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-16">
              {story.userName.split(" ")[0]}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      <Dialog open={!!selectedStory} onOpenChange={() => closeStory()}>
        <DialogContent className="max-w-md p-0 bg-black border-0 overflow-hidden h-[85vh]">
          {selectedStory && (
            <div className="relative w-full h-full">
              {/* Progress Bars */}
              <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
                {selectedStory.items.map((_, index) => (
                  <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white"
                      initial={{ width: "0%" }}
                      animate={{
                        width: index < currentItemIndex ? "100%" : index === currentItemIndex ? `${progress}%` : "0%"
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-4 z-20">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border border-white/20">
                    <AvatarFallback className="bg-white/10 text-white text-xs">
                      {selectedStory.userName.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-white">
                    <p className="text-sm font-medium">{selectedStory.userName}</p>
                    <p className="text-xs text-white/70">{selectedStory.items[currentItemIndex]?.createdAt}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeStory}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Story Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentItemIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "absolute inset-0 flex items-center justify-center bg-gradient-to-br",
                    selectedStory.items[currentItemIndex]?.backgroundColor || "from-gray-800 to-gray-900"
                  )}
                >
                  <p className="text-white text-2xl font-bold text-center px-8">
                    {selectedStory.items[currentItemIndex]?.content}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Areas */}
              <div className="absolute inset-0 flex z-10">
                <div className="w-1/3 h-full cursor-pointer" onClick={prevItem} />
                <div className="w-1/3 h-full" />
                <div className="w-1/3 h-full cursor-pointer" onClick={nextItem} />
              </div>

              {/* Story Stats & Actions */}
              <div className="absolute bottom-4 left-0 right-0 px-4 z-20">
                <div className="flex items-center justify-between text-white/70 text-sm mb-3">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {selectedStory.items[currentItemIndex]?.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {selectedStory.items[currentItemIndex]?.likes}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Send a message..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-1 focus:ring-white/50"
                  />
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/10">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/10">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
