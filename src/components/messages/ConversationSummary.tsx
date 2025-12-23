import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Message } from "@/hooks/useMessaging";

interface ConversationSummaryProps {
  messages: Message[];
  threshold?: number;
}

export function ConversationSummary({ messages, threshold = 30 }: ConversationSummaryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Only show for long conversations
  if (messages.length < threshold) return null;

  const generateSummary = async () => {
    setIsLoading(true);
    
    // Placeholder - in production this would call an AI endpoint
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a simple summary based on message content
    const textMessages = messages
      .filter(m => (m.type || 'text') === 'text' && !m.deleted_at)
      .map(m => m.body);
    
    const keyPoints = [
      `• ${messages.length} messages exchanged`,
      `• First message: "${textMessages[0]?.slice(0, 50)}..."`,
      `• Latest topic: "${textMessages[textMessages.length - 1]?.slice(0, 50)}..."`,
    ];

    setSummary(keyPoints.join('\n'));
    setIsLoading(false);
  };

  if (!summary) {
    return (
      <div className="px-4 py-3 border-b border-border bg-muted/20">
        <Button
          variant="outline"
          size="sm"
          onClick={generateSummary}
          disabled={isLoading}
          className="w-full gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating summary…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Summarize Conversation ({messages.length} messages)
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-muted/30 transition-colors"
      >
        <Sparkles className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-medium flex-1 text-left">AI Summary</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">
              <div className="text-sm text-muted-foreground whitespace-pre-line">
                {summary}
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                AI-generated summary • May not be accurate
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
