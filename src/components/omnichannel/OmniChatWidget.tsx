import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, X, Bot, User, Minimize2 } from "lucide-react";
import { createContact, resolveIdentity } from "@/lib/omnichannel/contactService";
import { createConversation, sendMessage } from "@/lib/omnichannel/conversationService";
import ReactMarkdown from "react-markdown";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/omni-agent`;

type Msg = { id: string; role: "user" | "assistant"; content: string; timestamp: string };

export function OmniChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [contactId, setContactId] = useState<string | null>(null);
  const [convId, setConvId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function ensureConversation() {
    if (contactId && convId) return { contactId, convId };
    const contact = await createContact({ display_name: "Website Visitor", contact_type: "anonymous", preferred_channel: "webchat" });
    const conv = await createConversation(contact.id, "webchat");
    setContactId(contact.id);
    setConvId(conv.id);
    return { contactId: contact.id, convId: conv.id };
  }

  async function handleSend() {
    if (!input.trim() || sending) return;
    setSending(true);
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    const text = input;
    setInput("");

    try {
      const ids = await ensureConversation();
      await sendMessage({
        conversation_id: ids.convId, contact_id: ids.contactId, content: text,
        direction: "inbound", sender_type: "user", channel_type: "webchat",
      });

      const apiMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: apiMessages, contact_id: ids.contactId, conversation_id: ids.convId, channel_type: "webchat" }),
      });

      if (!resp.ok || !resp.body) throw new Error("AI error");

      let assistantContent = "";
      const aId = crypto.randomUUID();
      setMessages(prev => [...prev, { id: aId, role: "assistant", content: "", timestamp: new Date().toISOString() }]);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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
              setMessages(prev => prev.map(m => m.id === aId ? { ...m, content: assistantContent } : m));
            }
          } catch {}
        }
      }

      await sendMessage({
        conversation_id: ids.convId, contact_id: ids.contactId, content: assistantContent,
        direction: "outbound", sender_type: "ai", channel_type: "webchat",
      });
    } catch {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again.", timestamp: new Date().toISOString() }]);
    } finally { setSending(false); }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50" size="icon">
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[520px] bg-background border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
      <div className="bg-primary text-primary-foreground px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <div>
            <p className="font-semibold text-sm">RCollab Assistant</p>
            <p className="text-[10px] opacity-80">AI-powered support</p>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Bot className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>Hi! How can I help you today?</p>
              <p className="text-xs mt-1">Ask about research, funding, hiring, or onboarding.</p>
            </div>
          )}
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{m.content || "..."}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..."
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleSend(); } }}
            disabled={sending} className="flex-1 text-sm" />
          <Button size="icon" onClick={handleSend} disabled={sending || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
