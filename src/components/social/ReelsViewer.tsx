import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music2,
  Play,
  Volume2,
  VolumeX,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReels, useCreateReel, useLikeReel, useBookmarkReel, type Reel } from "@/hooks/useReels";

const gradients = [
  "from-purple-600 via-pink-500 to-orange-400",
  "from-blue-600 via-cyan-500 to-teal-400",
  "from-green-600 via-emerald-500 to-cyan-400",
  "from-orange-600 via-red-500 to-pink-400",
  "from-indigo-600 via-violet-500 to-purple-400",
  "from-rose-600 via-pink-500 to-fuchsia-400",
];

function ReelCard({ reel, onLike, onBookmark }: { reel: Reel; onLike: () => void; onBookmark: () => void }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHeart, setShowHeart] = useState(false);
  const [localLiked, setLocalLiked] = useState(reel.isLiked);
  const [localBookmarked, setLocalBookmarked] = useState(reel.isBookmarked);
  const lastTapTime = useRef(0);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      if (!localLiked) {
        setLocalLiked(true);
        onLike();
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
    } else {
      setIsPlaying(prev => !prev);
    }
    lastTapTime.current = now;
  };

  const toggleLike = () => {
    setLocalLiked(!localLiked);
    onLike();
  };

  const toggleBookmark = () => {
    setLocalBookmarked(!localBookmarked);
    onBookmark();
  };

  const fmt = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  const initials = (reel.author?.full_name || "U").split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <div className="relative w-full h-full">
      <div
        className={cn("absolute inset-0 bg-gradient-to-br flex items-center justify-center", reel.background_color)}
        onClick={handleTap}
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white text-2xl font-bold text-center px-12 leading-tight"
        >
          {reel.content}
        </motion.p>

        <AnimatePresence>
          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-black/20"
            >
              <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center">
                <Play className="h-10 w-10 text-white ml-1" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showHeart && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1.5 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart className="h-32 w-32 text-white fill-red-500 drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Actions */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
        <motion.div whileTap={{ scale: 0.9 }} className="relative">
          <Avatar className="h-12 w-12 border-2 border-white">
            <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-xs">+</span>
          </div>
        </motion.div>

        <motion.button whileTap={{ scale: 0.9 }} onClick={toggleLike} className="flex flex-col items-center">
          <motion.div animate={localLiked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart className={cn("h-8 w-8", localLiked ? "text-red-500 fill-red-500" : "text-white")} />
          </motion.div>
          <span className="text-white text-xs mt-1">{fmt(reel.likes_count + (localLiked && !reel.isLiked ? 1 : 0))}</span>
        </motion.button>

        <motion.button whileTap={{ scale: 0.9 }} className="flex flex-col items-center">
          <MessageCircle className="h-8 w-8 text-white" />
          <span className="text-white text-xs mt-1">{fmt(reel.comments_count)}</span>
        </motion.button>

        <motion.button whileTap={{ scale: 0.9 }} className="flex flex-col items-center">
          <Share2 className="h-8 w-8 text-white" />
          <span className="text-white text-xs mt-1">{fmt(reel.shares_count)}</span>
        </motion.button>

        <motion.button whileTap={{ scale: 0.9 }} onClick={toggleBookmark} className="flex flex-col items-center">
          <Bookmark className={cn("h-8 w-8", localBookmarked ? "text-yellow-400 fill-yellow-400" : "text-white")} />
        </motion.button>

        <motion.div
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-gray-600 flex items-center justify-center"
        >
          <div className="w-4 h-4 rounded-full bg-gray-400" />
        </motion.div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-4 left-3 right-16 text-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-sm">@{(reel.author?.full_name || "user").replace(/\s+/g, "").toLowerCase()}</span>
          <Button size="sm" variant="outline" className="h-6 text-xs border-white/50 text-white hover:bg-white/10">
            Follow
          </Button>
        </div>
        <p className="text-sm text-white/90 mb-2">{reel.author?.role || reel.author?.university || ""}</p>
        {reel.audio_track && (
          <div className="flex items-center gap-2">
            <Music2 className="h-4 w-4" />
            <motion.p
              animate={{ x: [0, -100, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="text-sm whitespace-nowrap"
            >
              {reel.audio_track}
            </motion.p>
          </div>
        )}
      </div>
    </div>
  );
}

export function ReelsViewer() {
  const { data, isLoading, fetchNextPage, hasNextPage } = useReels();
  const likeReel = useLikeReel();
  const bookmarkReel = useBookmarkReel();
  const createReel = useCreateReel();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [selectedGradient, setSelectedGradient] = useState(gradients[0]);

  const reels = useMemo(() => data?.pages.flat() || [], [data]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 80;
    if (info.offset.y < -threshold && currentIndex < reels.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      if (next >= reels.length - 2 && hasNextPage) fetchNextPage();
    } else if (info.offset.y > threshold && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleCreate = () => {
    if (!newContent.trim()) return;
    createReel.mutate(
      { content: newContent, background_color: selectedGradient },
      { onSuccess: () => { setNewContent(""); setShowCreate(false); } }
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-[600px] bg-muted rounded-xl flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="w-full h-[600px] bg-black rounded-xl flex flex-col items-center justify-center text-white gap-4">
        <Play className="h-16 w-16 text-white/50" />
        <h3 className="text-xl font-bold">No Reels Yet</h3>
        <p className="text-white/70 text-sm">Be the first to create a reel!</p>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Reel
        </Button>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Reel</h3>
            <div className={cn("w-full h-48 rounded-lg bg-gradient-to-br flex items-center justify-center mb-4", selectedGradient)}>
              <p className="text-white text-xl font-bold text-center px-6">{newContent || "Your reel content..."}</p>
            </div>
            <div className="flex gap-2 mb-4">
              {gradients.map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGradient(g)}
                  className={cn("w-8 h-8 rounded-full bg-gradient-to-br shrink-0", g, selectedGradient === g && "ring-2 ring-primary ring-offset-2")}
                />
              ))}
            </div>
            <Input value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="What's on your mind?" maxLength={300} />
            <p className="text-xs text-muted-foreground text-right">{newContent.length}/300</p>
            <Button onClick={handleCreate} disabled={!newContent.trim() || createReel.isPending} className="w-full">
              {createReel.isPending ? "Posting..." : "Share Reel"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] bg-black overflow-hidden rounded-xl">
      {/* Create button */}
      <Button
        size="icon"
        onClick={() => setShowCreate(true)}
        className="absolute top-4 left-4 z-30 rounded-full bg-white/10 hover:bg-white/20 text-white"
      >
        <Plus className="h-5 w-5" />
      </Button>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={handleDragEnd}
          className="absolute inset-0"
        >
          <ReelCard
            reel={reels[currentIndex]}
            onLike={() => likeReel.mutate({ reelId: reels[currentIndex].id, isLiked: !!reels[currentIndex].isLiked })}
            onBookmark={() => bookmarkReel.mutate({ reelId: reels[currentIndex].id, isBookmarked: !!reels[currentIndex].isBookmarked })}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1">
        {reels.slice(0, 10).map((_, index) => (
          <div
            key={index}
            className={cn("w-1 rounded-full transition-all", index === currentIndex ? "h-4 bg-white" : "h-1 bg-white/40")}
          />
        ))}
      </div>

      {/* Swipe hint */}
      {currentIndex === 0 && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/70 text-sm flex flex-col items-center"
        >
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: 3, duration: 0.5 }}>↑</motion.div>
          Swipe up for next
        </motion.div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <h3 className="text-lg font-semibold mb-4">Create Reel</h3>
          <div className={cn("w-full h-48 rounded-lg bg-gradient-to-br flex items-center justify-center mb-4", selectedGradient)}>
            <p className="text-white text-xl font-bold text-center px-6">{newContent || "Your reel content..."}</p>
          </div>
          <div className="flex gap-2 mb-4">
            {gradients.map(g => (
              <button
                key={g}
                onClick={() => setSelectedGradient(g)}
                className={cn("w-8 h-8 rounded-full bg-gradient-to-br shrink-0", g, selectedGradient === g && "ring-2 ring-primary ring-offset-2")}
              />
            ))}
          </div>
          <Input value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="What's your insight?" maxLength={300} />
          <p className="text-xs text-muted-foreground text-right">{newContent.length}/300</p>
          <Button onClick={handleCreate} disabled={!newContent.trim() || createReel.isPending} className="w-full">
            {createReel.isPending ? "Posting..." : "Share Reel"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
