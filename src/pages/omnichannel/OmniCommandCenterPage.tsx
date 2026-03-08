import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Bot, User, Phone, Mail, Globe, Instagram, Linkedin, ArrowUpRight, AlertTriangle } from "lucide-react";
import { getConversations, getMessages, sendMessage, createConversation, updateConversation, escalateConversation } from "@/lib/omnichannel/conversationService";
import { createContact, resolveIdentity, getContacts } from "@/lib/omnichannel/contactService";
import { getConversationStats } from "@/lib/omnichannel/analyticsService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const CHANNEL_ICONS: Record<string, any> = {
  webchat: Globe, whatsapp: Phone, email: Mail, instagram: Instagram, linkedin: Linkedin,
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/omni-agent`;

export default function OmniCommandCenterPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [tab, setTab] = useState("inbox");
  const [filterStatus, setFilterStatus] = useState("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (selectedConv) loadMessages(selectedConv.id); }, [selectedConv?.id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel("omni-messages").on("postgres_changes", { event: "INSERT", schema: "public", table: "omni_messages" }, (payload) => {
      if (payload.new && (payload.new as any).conversation_id === selectedConv?.id) {
        setMessages(prev => [...prev, payload.new]);
      }
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConv?.id]);

  async function loadData() {
    setLoading(true);
    try {
      const [convs, s] = await Promise.all([getConversations(), getConversationStats()]);
      setConversations(convs);
      setStats(s);
    } catch { toast.error("Failed to load data"); }
    finally { setLoading(false); }
  }

  async function loadMessages(convId: string) {
    try { setMessages(await getMessages(convId)); } catch { toast.error("Failed to load messages"); }
  }

  async function handleSend() {
    if (!input.trim()) return;
    setSending(true);
    try {
      let conv = selectedConv;
      let contactId = conv?.contact_id;
      // If no conversation, create one
      if (!conv) {
        const contact = await createContact({ display_name: "Web Visitor", contact_type: "anonymous", preferred_channel: "webchat" });
        contactId = contact.id;
        conv = await createConversation(contact.id, "webchat");
        setSelectedConv(conv);
        setConversations(prev => [conv, ...prev]);
      }
      // Save user message
      await sendMessage({
        conversation_id: conv.id, contact_id: contactId, content: input,
        direction: "inbound", sender_type: "user", channel_type: conv.channel_type || "webchat",
      });
      setMessages(prev => [...prev, { id: crypto.randomUUID(), direction: "inbound", content: input, sender_type: "user", created_at: new Date().toISOString() }]);

      const userMessages = [...messages.filter(m => m.direction !== "system").map(m => ({
        role: m.direction === "inbound" ? "user" as const : "assistant" as const,
        content: m.content || "",
      })), { role: "user" as const, content: input }];
      setInput("");

      // Stream AI response
      let assistantContent = "";
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: userMessages, contact_id: contactId, conversation_id: conv.id, channel_type: conv.channel_type }),
      });
      if (!resp.ok) {
        if (resp.status === 429) { toast.error("Rate limited. Try again shortly."); setSending(false); return; }
        if (resp.status === 402) { toast.error("AI credits exhausted."); setSending(false); return; }
        throw new Error("AI error");
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const assistantId = crypto.randomUUID();
      setMessages(prev => [...prev, { id: assistantId, direction: "outbound", content: "", sender_type: "ai", created_at: new Date().toISOString() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m));
            }
          } catch {}
        }
      }

      // Save AI message
      await sendMessage({
        conversation_id: conv.id, contact_id: contactId, content: assistantContent,
        direction: "outbound", sender_type: "ai", channel_type: conv.channel_type || "webchat",
      });
    } catch (e) {
      toast.error("Failed to send message");
      console.error(e);
    } finally { setSending(false); }
  }

  const filteredConvs = filterStatus === "all" ? conversations : conversations.filter(c => c.status === filterStatus);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-primary" /> Omnichannel Command Center
          </h1>
          <p className="text-sm text-muted-foreground">Unified AI agent inbox across all channels</p>
        </div>
        {stats && (
          <div className="flex gap-3">
            {[
              { label: "Total", value: stats.total },
              { label: "AI Handled", value: stats.aiHandled },
              { label: "Escalated", value: stats.escalated },
            ].map(s => (
              <Card key={s.label} className="px-3 py-2">
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="leads">Lead Pipeline</TabsTrigger>
          <TabsTrigger value="escalations">Escalations</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-4">
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-220px)]">
            {/* Conversation List */}
            <div className="col-span-4 border rounded-lg flex flex-col">
              <div className="p-2 border-b flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={() => { setSelectedConv(null); setMessages([]); }}>
                  + New
                </Button>
              </div>
              <ScrollArea className="flex-1">
                {filteredConvs.map(c => {
                  const Icon = CHANNEL_ICONS[c.channel_type] || Globe;
                  return (
                    <div key={c.id} onClick={() => setSelectedConv(c)}
                      className={`p-3 border-b cursor-pointer hover:bg-accent/50 transition ${selectedConv?.id === c.id ? "bg-accent" : ""}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium truncate">{c.omni_contacts?.display_name || "Unknown"}</span>
                        </div>
                        <Badge variant={c.status === "escalated" ? "destructive" : c.status === "resolved" ? "secondary" : "default"} className="text-[10px]">
                          {c.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground truncate">{c.current_intent || c.channel_type}</span>
                        <span className="text-[10px] text-muted-foreground">{c.last_message_at ? new Date(c.last_message_at).toLocaleDateString() : ""}</span>
                      </div>
                    </div>
                  );
                })}
                {filteredConvs.length === 0 && !loading && (
                  <p className="text-center text-sm text-muted-foreground py-8">No conversations yet. Start one!</p>
                )}
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="col-span-8 border rounded-lg flex flex-col">
              {selectedConv ? (
                <>
                  <div className="p-3 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      <span className="font-medium">{selectedConv.omni_contacts?.display_name || "Conversation"}</span>
                      <Badge variant="outline" className="text-[10px]">{selectedConv.channel_type}</Badge>
                      {selectedConv.assigned_agent === "ai" && <Badge className="text-[10px] bg-primary/20 text-primary">AI</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { escalateConversation(selectedConv.id, "Manual escalation", "Operator requested human handoff"); toast.success("Escalated"); loadData(); }}>
                        <AlertTriangle className="h-3 w-3 mr-1" /> Escalate
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { updateConversation(selectedConv.id, { status: "resolved", resolved_at: new Date().toISOString() }); toast.success("Resolved"); loadData(); }}>
                        Resolve
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {messages.map(m => (
                        <div key={m.id} className={`flex ${m.direction === "inbound" ? "justify-start" : "justify-end"}`}>
                          <div className={`max-w-[75%] rounded-lg px-3 py-2 ${m.direction === "inbound" ? "bg-muted" : "bg-primary text-primary-foreground"}`}>
                            <div className="flex items-center gap-1 mb-1">
                              {m.sender_type === "ai" ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                              <span className="text-[10px] opacity-70">{m.sender_type} • {new Date(m.created_at).toLocaleTimeString()}</span>
                            </div>
                            <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                              <ReactMarkdown>{m.content || ""}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-40" />
                    <p>Select a conversation or start a new one</p>
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..."
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    disabled={sending} className="flex-1" />
                  <Button onClick={handleSend} disabled={sending || !input.trim()} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="mt-4">
          <LeadPipeline conversations={conversations} />
        </TabsContent>

        <TabsContent value="escalations" className="mt-4">
          <EscalationQueue conversations={conversations.filter(c => c.status === "escalated")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LeadPipeline({ conversations }: { conversations: any[] }) {
  const stages = ["new", "qualified", "demo_scheduled", "proposal_sent", "negotiating", "won"];
  return (
    <div className="grid grid-cols-6 gap-3">
      {stages.map(stage => (
        <div key={stage} className="space-y-2">
          <h3 className="text-sm font-semibold capitalize px-2">{stage.replace("_", " ")}</h3>
          {conversations.filter(c => c.sales_stage === stage).map(c => (
            <Card key={c.id} className="p-2">
              <p className="text-sm font-medium truncate">{c.omni_contacts?.display_name || "Unknown"}</p>
              <div className="flex justify-between items-center mt-1">
                <Badge variant="outline" className="text-[10px]">{c.channel_type}</Badge>
                <span className="text-[10px] text-muted-foreground">{c.omni_contacts?.lead_score || 0}pts</span>
              </div>
            </Card>
          ))}
          {conversations.filter(c => c.sales_stage === stage).length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Empty</p>
          )}
        </div>
      ))}
    </div>
  );
}

function EscalationQueue({ conversations }: { conversations: any[] }) {
  return (
    <div className="space-y-3">
      {conversations.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No escalations pending</CardContent></Card>
      ) : conversations.map(c => (
        <Card key={c.id}>
          <CardContent className="pt-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{c.omni_contacts?.display_name || "Unknown"}</p>
              <p className="text-sm text-muted-foreground">{c.current_intent || "Unclassified"} • {c.channel_type}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="destructive">Escalated</Badge>
              <Button size="sm" variant="outline"><ArrowUpRight className="h-3 w-3 mr-1" /> Take Over</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
