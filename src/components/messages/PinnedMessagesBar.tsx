import { Pin, ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Message } from "@/hooks/useMessaging";

interface PinnedMessagesBarProps {
  pinnedMessages: Array<{ id: string; message_id: string; is_global: boolean }>;
  messages: Message[];
  onScrollTo: (messageId: string) => void;
  onUnpin?: (messageId: string) => void;
}

export function PinnedMessagesBar({ 
  pinnedMessages, 
  messages, 
  onScrollTo,
  onUnpin 
}: PinnedMessagesBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (pinnedMessages.length === 0) return null;

  const pinnedMsgs = pinnedMessages
    .map(p => messages.find(m => m.id === p.message_id))
    .filter(Boolean) as Message[];

  if (pinnedMsgs.length === 0) return null;

  const firstPinned = pinnedMsgs[0];
  const hasMultiple = pinnedMsgs.length > 1;

  return (
    <div className="border-b border-border bg-muted/30">
      <button
        onClick={() => hasMultiple ? setIsExpanded(!isExpanded) : onScrollTo(firstPinned.id)}
        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-muted/50 transition-colors"
      >
        <Pin className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm truncate flex-1 text-left">
          {(firstPinned as any).deleted_at 
            ? "This message was deleted" 
            : firstPinned.body.slice(0, 60) + (firstPinned.body.length > 60 ? "…" : "")}
        </span>
        {hasMultiple && (
          <span className="text-xs text-muted-foreground shrink-0">
            +{pinnedMsgs.length - 1} more
          </span>
        )}
        {hasMultiple && (
          isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && hasMultiple && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-2 space-y-1">
              {pinnedMsgs.slice(1).map(msg => (
                <div 
                  key={msg.id}
                  className="flex items-center gap-2 group"
                >
                  <button
                    onClick={() => onScrollTo(msg.id)}
                    className="flex-1 text-left text-sm text-muted-foreground truncate hover:text-foreground transition-colors py-1"
                  >
                    {(msg as any).deleted_at ? "This message was deleted" : msg.body.slice(0, 50)}
                  </button>
                  {onUnpin && (
                    <button
                      onClick={() => onUnpin(msg.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
