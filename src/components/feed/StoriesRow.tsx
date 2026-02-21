import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, X, Eye, Heart, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStories, useCreateStory, useViewStory, useLikeStory, type StoryGroup } from "@/hooks/useStories";
import { useAuth } from "@/contexts/AuthContext";

const gradients = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-purple-500",
  "from-pink-500 to-rose-500",
];

export function StoriesRow() {
  const { user } = useAuth();
  const { data: storyGroups = [], isLoading } = useStories();
  const createStory = useCreateStory();
  const viewStory = useViewStory();
  const likeStory = useLikeStory();

  const [selectedGroup, setSelectedGroup] = useState<StoryGroup | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newStoryContent, setNewStoryContent] = useState("");
  const [selectedGradient, setSelectedGradient] = useState(gradients[0]);

  const openStory = (group: StoryGroup) => {
    setSelectedGroup(group);
    setCurrentItemIndex(0);
    // Mark as viewed
    if (group.stories[0]) {
      viewStory.mutate(group.stories[0].id);
    }
  };

  const closeStory = () => {
    setSelectedGroup(null);
    setCurrentItemIndex(0);
  };

  const nextItem = () => {
    if (!selectedGroup) return;
    if (currentItemIndex < selectedGroup.stories.length - 1) {
      const nextIdx = currentItemIndex + 1;
      setCurrentItemIndex(nextIdx);
      viewStory.mutate(selectedGroup.stories[nextIdx].id);
    } else {
      const currentIdx = storyGroups.findIndex(g => g.userId === selectedGroup.userId);
      if (currentIdx < storyGroups.length - 1) {
        const nextGroup = storyGroups[currentIdx + 1];
        setSelectedGroup(nextGroup);
        setCurrentItemIndex(0);
        viewStory.mutate(nextGroup.stories[0].id);
      } else {
        closeStory();
      }
    }
  };

  const prevItem = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
    } else if (selectedGroup) {
      const currentIdx = storyGroups.findIndex(g => g.userId === selectedGroup.userId);
      if (currentIdx > 0) {
        const prevGroup = storyGroups[currentIdx - 1];
        setSelectedGroup(prevGroup);
        setCurrentItemIndex(prevGroup.stories.length - 1);
      }
    }
  };

  const handleCreateStory = () => {
    if (!newStoryContent.trim()) return;
    createStory.mutate(
      { content: newStoryContent, background_color: selectedGradient },
      {
        onSuccess: () => {
          setNewStoryContent("");
          setShowCreateDialog(false);
        },
      }
    );
  };

  const currentStory = selectedGroup?.stories[currentItemIndex];

  if (isLoading) {
    return (
      <div className="flex gap-3 p-4 overflow-x-auto">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
            <div className="w-10 h-2 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-3 p-4 overflow-x-auto scrollbar-hide bg-card rounded-lg border">
        {/* Create Story */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateDialog(true)}
          className="flex flex-col items-center gap-1 cursor-pointer shrink-0"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/50">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">Your Story</span>
        </motion.div>

        {/* Story Groups */}
        {storyGroups.map((group) => (
          <motion.div
            key={group.userId}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openStory(group)}
            className="flex flex-col items-center gap-1 cursor-pointer shrink-0"
          >
            <div className={cn(
              "p-0.5 rounded-full",
              group.hasUnviewed
                ? "bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500"
                : "bg-muted"
            )}>
              <Avatar className="h-14 w-14 border-2 border-background">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {group.userName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-16">
              {group.userName.split(" ")[0]}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Create Story Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <h3 className="text-lg font-semibold mb-4">Create Story</h3>
          <div className={cn("w-full h-48 rounded-lg bg-gradient-to-br flex items-center justify-center mb-4", selectedGradient)}>
            <p className="text-white text-xl font-bold text-center px-6">
              {newStoryContent || "Your story text..."}
            </p>
          </div>
          <div className="flex gap-2 mb-4">
            {gradients.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGradient(g)}
                className={cn(
                  "w-8 h-8 rounded-full bg-gradient-to-br shrink-0",
                  g,
                  selectedGradient === g && "ring-2 ring-primary ring-offset-2"
                )}
              />
            ))}
          </div>
          <Input
            value={newStoryContent}
            onChange={(e) => setNewStoryContent(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground text-right">{newStoryContent.length}/200</p>
          <Button onClick={handleCreateStory} disabled={!newStoryContent.trim() || createStory.isPending} className="w-full">
            {createStory.isPending ? "Posting..." : "Share Story"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Story Viewer */}
      <Dialog open={!!selectedGroup} onOpenChange={() => closeStory()}>
        <DialogContent className="max-w-md p-0 bg-black border-0 overflow-hidden h-[85vh]">
          {selectedGroup && currentStory && (
            <div className="relative w-full h-full">
              {/* Progress Bars */}
              <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
                {selectedGroup.stories.map((_, index) => (
                  <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all"
                      style={{ width: index < currentItemIndex ? "100%" : index === currentItemIndex ? "50%" : "0%" }}
                    />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-4 z-20">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border border-white/20">
                    <AvatarFallback className="bg-white/10 text-white text-xs">
                      {selectedGroup.userName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-white">
                    <p className="text-sm font-medium">{selectedGroup.userName}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={closeStory} className="text-white hover:bg-white/10">
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
                    currentStory.background_color
                  )}
                >
                  <p className="text-white text-2xl font-bold text-center px-8">
                    {currentStory.content}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Areas */}
              <div className="absolute inset-0 flex z-10">
                <div className="w-1/3 h-full cursor-pointer" onClick={prevItem} />
                <div className="w-1/3 h-full" />
                <div className="w-1/3 h-full cursor-pointer" onClick={nextItem} />
              </div>

              {/* Stats */}
              <div className="absolute bottom-4 left-0 right-0 px-4 z-20">
                <div className="flex items-center gap-4 text-white/70 text-sm mb-3">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {currentStory.views_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {currentStory.likes_count || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Send a message..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder:text-white/50 text-sm focus:outline-none"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => likeStory.mutate({ storyId: currentStory.id, isLiked: false })}
                    className="text-white hover:bg-white/10"
                  >
                    <Heart className="h-5 w-5" />
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
