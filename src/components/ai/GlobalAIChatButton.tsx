import { useState, useRef, useEffect, useCallback, forwardRef } from "react";
import { Bot, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUniversalAI } from "@/hooks/useUniversalAI";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

function getPageContext(pathname: string): string {
  if (pathname.includes("/deals") || pathname.includes("/opportunities")) return "deals & opportunities";
  if (pathname.includes("/messages")) return "messaging & collaboration";
  if (pathname.includes("/profile")) return "profile & career";
  if (pathname.includes("/learning") || pathname.includes("/knowledge")) return "learning & knowledge";
  if (pathname.includes("/trust")) return "trust & reputation";
  if (pathname.includes("/research")) return "research & academia";
  if (pathname.includes("/career")) return "career development";
  if (pathname.includes("/network")) return "professional networking";
  return "general platform usage";
}

export const GlobalAIChatButton = forwardRef<HTMLButtonElement>((_props, ref) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const { streamChat, loading } = useUniversalAI();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    const pageCtx = getPageContext(location.pathname);
    const systemContext: Msg = {
      role: "user",
      content: `[System context: The user is currently on the ${pageCtx} section of the platform.]`,
    };

    await streamChat({
      domain: "general",
      action: "chat",
      messages: [systemContext, ...messages, userMsg],
      onDelta: upsert,
      onDone: () => {},
    });
  }, [input, loading, messages, streamChat, location.pathname]);

  return (
    <>
      {/* Floating button */}
      <button
        ref={ref}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed z-50 bottom-20 md:bottom-6 right-4 md:right-6 h-14 w-14 rounded-full",
          "bg-primary text-primary-foreground shadow-lg",
          "flex items-center justify-center transition-transform hover:scale-105",
          "focus:outline-none focus:ring-2 focus:ring-primary/50",
          open && "scale-0 pointer-events-none"
        )}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed z-50 bottom-20 md:bottom-6 right-4 md:right-6 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[70vh] rounded-2xl border bg-background shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-primary/5">
            <Bot className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm flex-1">AI Assistant</span>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary/40" />
                <p>Hi! I'm your AI assistant.</p>
                <p className="text-xs mt-1">Ask me anything about the platform.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  )}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-muted-foreground">
                  Thinking…
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-3 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask anything…"
              rows={1}
              className="flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 max-h-[80px]"
            />
            <Button size="icon" className="h-9 w-9 rounded-full shrink-0" onClick={send} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
});

GlobalAIChatButton.displayName = "GlobalAIChatButton";
