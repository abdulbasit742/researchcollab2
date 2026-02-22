import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, MessageCircle, Send, Link2, Twitter, Bookmark, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
}

const shareOptions = [
  { icon: Copy, label: "Copy Link", color: "bg-muted text-foreground" },
  { icon: MessageCircle, label: "Message", color: "bg-blue-500 text-white" },
  { icon: Send, label: "Direct", color: "bg-purple-500 text-white" },
  { icon: Twitter, label: "Twitter", color: "bg-sky-500 text-white" },
  { icon: Bookmark, label: "Save", color: "bg-yellow-500 text-white" },
  { icon: Flag, label: "Report", color: "bg-red-500/10 text-red-500" },
];

export function ShareSheet({ isOpen, onClose, url, title }: ShareSheetProps) {
  const handleShare = (option: string) => {
    if (option === "Copy Link") {
      navigator.clipboard.writeText(url || window.location.href);
      toast({ title: "Link copied!" });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 pb-10 max-w-lg mx-auto"
          >
            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-5" />
            
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">Share</h3>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {shareOptions.map((option) => (
                <motion.button
                  key={option.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShare(option.label)}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${option.color}`}>
                    <option.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-muted-foreground">{option.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
