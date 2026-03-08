import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Bot, Send, Plus, Archive, Sparkles, MessageSquare, Loader2,
  Lightbulb, Target, Users, TrendingUp, ChevronLeft
} from "lucide-react";
import {
  streamChat, getConversations, createConversation, archiveConversation,
  getMessages, saveMessage, generateRecommendations, type PAIMessage,
} from "@/lib/ai/personalAssistant";

const SUGGESTION_PROMPTS = [
  { icon: Target, text: "What opportunities match my skills?", color: "text-blue-500" },
  { icon: Users, text: "Find me potential collaborators", color: "text-green-500" },
  { icon: TrendingUp, text: "How can I improve my execution score?", color: "text-amber-500" },
  { icon: Lightbulb, text: "What funded challenges should I join?", color: "text-purple-500" },
];

export default function AIAssistantPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<PAIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  // Load conversations
  useEffect(() => {
    getConversations().then(setConversations).catch(() => {});
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConvoId) { setMessages([]); return; }
    getMessages(activeConvoId).then((msgs) => {
      setMessages(msgs.map((m: any) => ({ role: m.role, content: m.content })));
      scrollToBottom();
    }).catch(() => {});
  }, [activeConvoId, scrollToBottom]);

  const handleNewConversation = async () => {
    try {
      const convo = await createConversation();
      setConversations((prev) => [convo, ...prev]);
      setActiveConvoId(convo.id);
      setMessages([]);
    } catch { toast.error("Failed to create conversation"); }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvoId === id) { setActiveConvoId(null); setMessages([]); }
    } catch { toast.error("Failed to archive"); }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    let convoId = activeConvoId;
    if (!convoId) {
      try {
        const convo = await createConversation(text.slice(0, 60));
        setConversations((prev) => [convo, ...prev]);
        convoId = convo.id;
        setActiveConvoId(convo.id);
      } catch { toast.error("Failed to start conversation"); return; }
    }

    const userMsg: PAIMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    scrollToBottom();

    // Persist user message
    saveMessage(convoId, "user", text).catch(() => {});

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
      scrollToBottom();
    };

    const allMessages = [...messages, userMsg];

    await streamChat({
      messages: allMessages,
      onDelta: upsertAssistant,
      onDone: () => {
        setIsLoading(false);
        if (convoId && assistantSoFar) {
          saveMessage(convoId, "assistant", assistantSoFar).catch(() => {});
        }
      },
      onError: (err) => {
        setIsLoading(false);
        toast.error(err.message || "AI assistant error");
      },
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-72 border-r border-border bg-muted/30 flex flex-col">
          <div className="p-4 flex items-center justify-between">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" /> Conversations
            </h2>
            <Button size="icon" variant="ghost" onClick={handleNewConversation}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Separator />
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
                    activeConvoId === c.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                  onClick={() => setActiveConvoId(c.id)}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate flex-1">{c.title}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); handleArchive(c.id); }}
                  >
                    <Archive className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {conversations.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No conversations yet. Start one!
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border px-6 py-3 flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">RCollab AI Assistant</h1>
              <p className="text-xs text-muted-foreground">Your personal execution advisor</p>
            </div>
          </div>
          <Badge variant="secondary" className="ml-auto text-xs">Advisory Only</Badge>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">How can I help you today?</h2>
                <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
                  I can help you discover opportunities, find collaborators, improve your execution score, and navigate the RCollab ecosystem.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                  {SUGGESTION_PROMPTS.map((s, i) => (
                    <Card
                      key={i}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => sendMessage(s.text)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
                        <span className="text-sm text-left">{s.text}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border p-4">
          <form
            className="max-w-3xl mx-auto flex gap-2"
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about opportunities, collaborators, or how to improve your score..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={!input.trim() || isLoading} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
