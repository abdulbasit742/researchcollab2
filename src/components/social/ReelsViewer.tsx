import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Music2, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Reel {
  id: string;
  userId: string;
  userName: string;
  userTitle: string;
  content: string;
  backgroundColor: string;
  audioTrack?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

const mockReels: Reel[] = [
  {
    id: "1",
    userId: "u1",
    userName: "Dr. Sarah Chen",
    userTitle: "AI Research Lead",
    content: "3 things I learned from my PhD journey that nobody talks about...",
    backgroundColor: "from-purple-600 via-pink-500 to-orange-400",
    audioTrack: "Original Audio - Dr. Sarah Chen",
    likes: 12500,
    comments: 342,
    shares: 89,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "2",
    userId: "u2",
    userName: "Prof. James Wilson",
    userTitle: "Quantum Physics",
    content: "This experiment changed everything we know about quantum entanglement! 🔬",
    backgroundColor: "from-blue-600 via-cyan-500 to-teal-400",
    audioTrack: "Trending Sound - Science Vibes",
    likes: 45200,
    comments: 1205,
    shares: 567,
    isLiked: true,
    isBookmarked: false,
  },
  {
    id: "3",
    userId: "u3",
    userName: "Dr. Emily Park",
    userTitle: "Neuroscience",
    content: "The brain does something incredible when you learn a new skill...",
    backgroundColor: "from-green-600 via-emerald-500 to-cyan-400",
    audioTrack: "Original Audio - Dr. Emily Park",
    likes: 8900,
    comments: 234,
    shares: 123,
    isLiked: false,
    isBookmarked: true,
  },
  {
    id: "4",
    userId: "u4",
    userName: "Prof. Ahmed Hassan",
    userTitle: "Climate Science",
    content: "Breaking: New data on climate patterns that will surprise you 🌍",
    backgroundColor: "from-orange-600 via-red-500 to-pink-400",
    audioTrack: "Trending Sound - Discovery",
    likes: 67800,
    comments: 2341,
    shares: 1205,
    isLiked: false,
    isBookmarked: false,
  },
];

interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
  onLike: () => void;
  onDoubleTap: () => void;
}

function ReelCard({ reel, isActive, onLike, onDoubleTap }: ReelCardProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [localLiked, setLocalLiked] = useState(reel.isLiked);
  const [localBookmarked, setLocalBookmarked] = useState(reel.isBookmarked);
  const lastTapTime = useRef(0);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      // Double tap
      handleDoubleTap();
    } else {
      // Single tap - toggle play/pause
      setIsPlaying(prev => !prev);
    }
    lastTapTime.current = now;
  };

  const handleDoubleTap = () => {
    if (!localLiked) {
      setLocalLiked(true);
      onDoubleTap();
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="relative w-full h-full">
      {/* Background Content */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br flex items-center justify-center",
          reel.backgroundColor
        )}
        onClick={handleTap}
      >
        <div className="text-white text-center px-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold leading-tight"
          >
            {reel.content}
          </motion.p>
        </div>

        {/* Play/Pause Indicator */}
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

        {/* Double Tap Heart Animation */}
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

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
        {/* Profile */}
        <motion.div whileTap={{ scale: 0.9 }} className="relative">
          <Avatar className="h-12 w-12 border-2 border-white">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {reel.userName.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-xs">+</span>
          </div>
        </motion.div>

        {/* Like */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setLocalLiked(!localLiked)}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={localLiked ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart className={cn(
              "h-8 w-8",
              localLiked ? "text-red-500 fill-red-500" : "text-white"
            )} />
          </motion.div>
          <span className="text-white text-xs mt-1">{formatNumber(reel.likes + (localLiked && !reel.isLiked ? 1 : 0))}</span>
        </motion.button>

        {/* Comment */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center"
        >
          <MessageCircle className="h-8 w-8 text-white" />
          <span className="text-white text-xs mt-1">{formatNumber(reel.comments)}</span>
        </motion.button>

        {/* Share */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center"
        >
          <Share2 className="h-8 w-8 text-white" />
          <span className="text-white text-xs mt-1">{formatNumber(reel.shares)}</span>
        </motion.button>

        {/* Bookmark */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setLocalBookmarked(!localBookmarked)}
          className="flex flex-col items-center"
        >
          <Bookmark className={cn(
            "h-8 w-8",
            localBookmarked ? "text-yellow-400 fill-yellow-400" : "text-white"
          )} />
        </motion.button>

        {/* Music Disc */}
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
          <span className="font-bold">@{reel.userName.replace(" ", "").toLowerCase()}</span>
          <Button size="sm" variant="outline" className="h-6 text-xs border-white/50 text-white hover:bg-white/10">
            Follow
          </Button>
        </div>
        <p className="text-sm text-white/90 mb-2">{reel.userTitle}</p>
        
        {reel.audioTrack && (
          <div className="flex items-center gap-2">
            <Music2 className="h-4 w-4" />
            <div className="flex-1 overflow-hidden">
              <motion.p
                animate={{ x: [0, -100, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="text-sm whitespace-nowrap"
              >
                {reel.audioTrack}
              </motion.p>
            </div>
          </div>
        )}
      </div>

      {/* Volume Control */}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-4 right-3 text-white hover:bg-white/10"
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </Button>
    </div>
  );
}

export function ReelsViewer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.y < -threshold && currentIndex < mockReels.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (info.offset.y > threshold && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[600px] bg-black overflow-hidden rounded-xl"
    >
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
            reel={mockReels[currentIndex]}
            isActive={true}
            onLike={() => {}}
            onDoubleTap={() => {}}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1">
        {mockReels.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-1 rounded-full transition-all",
              index === currentIndex ? "h-4 bg-white" : "h-1 bg-white/40"
            )}
          />
        ))}
      </div>

      {/* Swipe Hint */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/70 text-sm flex flex-col items-center"
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: 3, duration: 0.5 }}
        >
          ↑
        </motion.div>
        Swipe up for next
      </motion.div>
    </div>
  );
}
