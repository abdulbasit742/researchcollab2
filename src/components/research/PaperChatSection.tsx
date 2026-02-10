import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Loader2, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { ResearchPaper } from "@/hooks/useResearchPapers";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface PaperChatSectionProps {
  paper: ResearchPaper;
  onAsk: (paper: ResearchPaper, question: string) => Promise<string | null>;
  loading: boolean;
}

export function PaperChatSection({ paper, onAsk, loading }: PaperChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);

    const answer = await onAsk(paper, question);
    if (answer) {
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    }
  };

  if (!expanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2 mt-2"
        onClick={() => setExpanded(true)}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Chat with this Paper
      </Button>
    );
  }

  return (
    <div className="space-y-3 pt-3 border-t">
      <h4 className="text-sm font-semibold flex items-center gap-1.5">
        <MessageCircle className="h-3.5 w-3.5 text-primary" />
        Ask About This Paper
        <Badge variant="info" className="text-[10px] ml-1">AI</Badge>
      </h4>

      {/* Messages */}
      <div className="max-h-48 overflow-y-auto space-y-2 rounded-lg bg-muted/30 p-2">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">
            Ask questions like "What methodology was used?" or "Explain the main findings"
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && <Bot className="h-4 w-4 text-primary mt-0.5 shrink-0" />}
            <div className={`text-xs max-w-[85%] rounded-lg px-2.5 py-1.5 ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-background border"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-xs max-w-none dark:prose-invert">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : msg.content}
            </div>
            {msg.role === "user" && <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-center">
            <Bot className="h-4 w-4 text-primary shrink-0" />
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="text-xs h-8"
          disabled={loading}
        />
        <Button size="sm" className="h-8 px-2.5" onClick={handleSend} disabled={!input.trim() || loading}>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
