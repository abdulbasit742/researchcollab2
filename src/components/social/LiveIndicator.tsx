import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Users, Eye, MessageCircle, Gift, Heart, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface LiveStream {
  id: string;
  host: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  title: string;
  viewers: number;
  isLive: boolean;
  thumbnail?: string;
  backgroundColor: string;
}

const mockLiveStreams: LiveStream[] = [
  {
    id: "1",
    host: { name: "Dr. Sarah Chen", verified: true },
    title: "Live Q&A: AI Research Careers",
    viewers: 1234,
    isLive: true,
    backgroundColor: "from-red-500 to-pink-500",
  },
  {
    id: "2",
    host: { name: "Prof. Ahmed Khan", verified: true },
    title: "Lab Tour: Quantum Computing",
    viewers: 567,
    isLive: true,
    backgroundColor: "from-blue-500 to-purple-500",
  },
];

// Live badge component
export function LiveBadge({ size = "default" }: { size?: "small" | "default" }) {
  return (
    <motion.div
      animate={{ opacity: [1, 0.7, 1] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className={cn(
        "bg-red-500 text-white font-bold uppercase rounded flex items-center gap-1",
        size === "small" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
      )}
    >
      <Radio className={size === "small" ? "h-2 w-2" : "h-3 w-3"} />
      Live
    </motion.div>
  );
}

// Live streams horizontal scroll
export function LiveStreamsBar() {
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);

  if (mockLiveStreams.length === 0) return null;

  return (
    <>
      <div className="flex gap-3 p-4 overflow-x-auto scrollbar-hide bg-gradient-to-r from-red-500/10 via-pink-500/10 to-purple-500/10">
        <div className="flex items-center gap-2 shrink-0">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2 h-2 rounded-full bg-red-500"
          />
          <span className="text-sm font-semibold text-red-500">LIVE NOW</span>
        </div>
        
        {mockLiveStreams.map((stream) => (
          <motion.div
            key={stream.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStream(stream)}
            className="shrink-0 cursor-pointer"
          >
            <div className={cn(
              "relative w-40 h-24 rounded-lg bg-gradient-to-br overflow-hidden",
              stream.backgroundColor
            )}>
              {/* Live Badge */}
              <div className="absolute top-2 left-2">
                <LiveBadge size="small" />
              </div>
              
              {/* Viewer Count */}
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 rounded px-1.5 py-0.5 text-white text-xs">
                <Eye className="h-3 w-3" />
                {stream.viewers.toLocaleString()}
              </div>
              
              {/* Host Info */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-5 w-5 border border-white/30">
                    <AvatarFallback className="text-[8px] bg-white/20 text-white">
                      {stream.host.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white text-xs font-medium truncate">{stream.host.name}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate w-40">{stream.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Live Stream Viewer Modal */}
      <Dialog open={!!selectedStream} onOpenChange={() => setSelectedStream(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black border-0 overflow-hidden h-[80vh]">
          {selectedStream && (
            <LiveStreamViewer stream={selectedStream} onClose={() => setSelectedStream(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Full screen live viewer
function LiveStreamViewer({ stream, onClose }: { stream: LiveStream; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [hearts, setHearts] = useState<number[]>([]);

  const sendHeart = () => {
    const id = Date.now();
    setHearts(prev => [...prev, id]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h !== id));
    }, 2000);
  };

  return (
    <div className="relative w-full h-full flex">
      {/* Main Stream View */}
      <div className={cn(
        "flex-1 bg-gradient-to-br flex items-center justify-center relative",
        stream.backgroundColor
      )}>
        <p className="text-white text-3xl font-bold text-center px-8">
          {stream.title}
        </p>
        
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white/30">
              <AvatarFallback className="bg-white/20 text-white">
                {stream.host.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{stream.host.name}</span>
                {stream.host.verified && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px]">✓</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <LiveBadge size="small" />
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {stream.viewers.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Floating Hearts */}
        <div className="absolute bottom-24 right-8">
          <AnimatePresence>
            {hearts.map(id => (
              <motion.div
                key={id}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -150, scale: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute"
              >
                <Heart className="h-8 w-8 text-red-500 fill-red-500" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Send a message..."
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
          <Button size="icon" variant="ghost" className="text-white hover:bg-white/10">
            <Gift className="h-5 w-5" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-white hover:bg-white/10"
            onClick={sendHeart}
          >
            <Heart className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" className="text-white hover:bg-white/10">
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Chat Sidebar (desktop) */}
      <div className="hidden md:flex w-80 flex-col bg-card border-l">
        <div className="p-3 border-b">
          <h3 className="font-semibold">Live Chat</h3>
        </div>
        <div className="flex-1 p-3 space-y-3 overflow-y-auto">
          {/* Mock chat messages */}
          {[
            { user: "ResearchFan", msg: "This is amazing! 🔬" },
            { user: "PhDStudent", msg: "Great insights!" },
            { user: "ScienceLover", msg: "❤️❤️❤️" },
            { user: "AcademicPro", msg: "How do I apply for your lab?" },
          ].map((chat, i) => (
            <div key={i} className="text-sm">
              <span className="font-semibold text-primary">{chat.user}: </span>
              <span className="text-muted-foreground">{chat.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
