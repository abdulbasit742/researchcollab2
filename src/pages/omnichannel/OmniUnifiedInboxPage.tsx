import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Inbox, MessageSquare, Bot, User, Sparkles, FileText, CheckCircle, AlertTriangle, Clock, ChevronRight } from "lucide-react";
import { getConversations, getMessages } from "@/lib/omnichannel/conversationService";
import { getMemories } from "@/lib/omnichannel/memoryService";
import { getConversationSummaries, addOperatorNote, getOperatorNotes } from "@/lib/omnichannel/operatorService";
import { getOfferRecommendations } from "@/lib/omnichannel/offerRecommendationService";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function OmniUnifiedInboxPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [contextTab, setContextTab] = useState("profile");

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => {
    if (selected) {
      Promise.all([
        getMessages(selected.id).then(setMessages),
        selected.contact_id ? getMemories(selected.contact_id).then(setMemories) : Promise.resolve([]),
        selected.contact_id ? getOperatorNotes(selected.contact_id).then(setNotes) : Promise.resolve([]),
        getConversationSummaries(selected.id).then(setSummaries),
        selected.contact_id ? getOfferRecommendations(selected.contact_id).then(setOffers) : Promise.resolve([]),
      ]).catch(() => {});
    }
  }, [selected?.id]);

  async function loadConversations() {
    setLoading(true);
    try { setConversations(await getConversations()); } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }

  async function handleAddNote() {
    if (!noteInput.trim() || !selected?.contact_id) return;
    try {
      await addOperatorNote({ contact_id: selected.contact_id, conversation_id: selected.id, note_text: noteInput, note_type: "operator" });
      setNotes(await getOperatorNotes(selected.contact_id));
      setNoteInput("");
      toast.success("Note added");
    } catch { toast.error("Failed to add note"); }
  }

  const contact = selected?.omni_contacts;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-2 mb-4">
        <Inbox className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Unified Inbox</h1>
          <p className="text-sm text-muted-foreground">Full-context operator workbench with AI copilot</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)]">
        {/* Conversation list */}
        <div className="col-span-3 border rounded-lg flex flex-col">
          <div className="p-2 border-b">
            <Input placeholder="Search conversations..." className="h-8 text-xs" />
          </div>
          <ScrollArea className="flex-1">
            {conversations.map(c => (
              <div key={c.id} onClick={() => setSelected(c)}
                className={`p-3 border-b cursor-pointer hover:bg-accent/50 transition ${selected?.id === c.id ? "bg-accent" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{c.omni_contacts?.display_name || "Unknown"}</span>
                  <Badge variant={c.status === "escalated" ? "destructive" : "secondary"} className="text-[10px]">{c.status}</Badge>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="outline" className="text-[9px]">{c.channel_type}</Badge>
                  {c.current_intent && <span className="text-[10px] text-muted-foreground truncate">{c.current_intent}</span>}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Chat area */}
        <div className="col-span-5 border rounded-lg flex flex-col">
          {selected ? (
            <>
              <div className="p-3 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{contact?.display_name || "Conversation"}</span>
                  <Badge variant="outline" className="text-[10px]">{selected.channel_type}</Badge>
                  {selected.assigned_agent === "ai" && <Badge className="text-[10px] bg-primary/20 text-primary"><Bot className="h-3 w-3 mr-0.5" />AI</Badge>}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="text-xs h-7"><Sparkles className="h-3 w-3 mr-1" />AI Draft</Button>
                  <Button size="sm" variant="outline" className="text-xs h-7"><AlertTriangle className="h-3 w-3 mr-1" />Escalate</Button>
                  <Button size="sm" variant="outline" className="text-xs h-7"><CheckCircle className="h-3 w-3 mr-1" />Resolve</Button>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map(m => (
                    <div key={m.id} className={`flex ${m.direction === "inbound" ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 ${m.direction === "inbound" ? "bg-muted" : "bg-primary text-primary-foreground"}`}>
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
                </div>
              </ScrollArea>
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input placeholder="Type operator reply..." className="flex-1" />
                  <Button size="sm">Send</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Inbox className="h-12 w-12 mx-auto mb-2 opacity-40" />
                <p>Select a conversation to view</p>
              </div>
            </div>
          )}
        </div>

        {/* Context panel */}
        <div className="col-span-4 border rounded-lg flex flex-col">
          {selected ? (
            <>
              <Tabs value={contextTab} onValueChange={setContextTab} className="flex-1 flex flex-col">
                <TabsList className="mx-2 mt-2">
                  <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
                  <TabsTrigger value="memory" className="text-xs">Memory</TabsTrigger>
                  <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
                  <TabsTrigger value="offers" className="text-xs">Offers</TabsTrigger>
                  <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="flex-1 p-3 overflow-auto">
                  <div className="space-y-3">
                    <Card><CardContent className="pt-4 space-y-2">
                      <h3 className="font-semibold text-sm">{contact?.display_name || "Unknown"}</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-muted-foreground">Email:</span> {contact?.email || "N/A"}</div>
                        <div><span className="text-muted-foreground">Phone:</span> {contact?.phone || "N/A"}</div>
                        <div><span className="text-muted-foreground">Type:</span> <Badge variant="outline">{contact?.contact_type || "anonymous"}</Badge></div>
                        <div><span className="text-muted-foreground">Lead Score:</span> <span className="font-bold">{contact?.lead_score || 0}</span></div>
                        <div><span className="text-muted-foreground">Country:</span> {contact?.country || "N/A"}</div>
                        <div><span className="text-muted-foreground">Channel:</span> {contact?.preferred_channel || "N/A"}</div>
                      </div>
                    </CardContent></Card>
                    <Card><CardContent className="pt-4">
                      <h4 className="text-xs font-semibold mb-2">Conversation State</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-muted-foreground">Status:</span> <Badge>{selected.status}</Badge></div>
                        <div><span className="text-muted-foreground">Intent:</span> {selected.current_intent || "N/A"}</div>
                        <div><span className="text-muted-foreground">Sentiment:</span> {selected.sentiment || "neutral"}</div>
                        <div><span className="text-muted-foreground">Sales Stage:</span> {selected.sales_stage || "N/A"}</div>
                      </div>
                    </CardContent></Card>
                  </div>
                </TabsContent>

                <TabsContent value="memory" className="flex-1 p-3 overflow-auto">
                  <div className="space-y-2">
                    {memories.length === 0 ? <p className="text-xs text-muted-foreground text-center py-4">No memory records</p> :
                      memories.map(m => (
                        <Card key={m.id}><CardContent className="pt-3 pb-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium">{m.memory_key}</span>
                            <Badge variant="outline" className="text-[9px]">{m.memory_type}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{m.memory_value}</p>
                        </CardContent></Card>
                      ))
                    }
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="flex-1 p-3 overflow-auto flex flex-col">
                  <div className="flex-1 space-y-2 mb-3">
                    {notes.map(n => (
                      <Card key={n.id}><CardContent className="pt-3 pb-2">
                        <p className="text-xs">{n.note_text}</p>
                        <span className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
                      </CardContent></Card>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Add operator note..." className="text-xs h-16" />
                    <Button size="sm" onClick={handleAddNote} className="self-end">Add</Button>
                  </div>
                </TabsContent>

                <TabsContent value="offers" className="flex-1 p-3 overflow-auto">
                  <div className="space-y-2">
                    {offers.length === 0 ? <p className="text-xs text-muted-foreground text-center py-4">No recommendations</p> :
                      offers.map(o => (
                        <Card key={o.id}><CardContent className="pt-3 pb-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium">{o.offer_name}</span>
                            <Badge variant="outline">{Math.round(o.match_score * 100)}%</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{o.reasoning}</p>
                          <Badge className="mt-1 text-[9px]">{o.status}</Badge>
                        </CardContent></Card>
                      ))
                    }
                  </div>
                </TabsContent>

                <TabsContent value="summary" className="flex-1 p-3 overflow-auto">
                  <div className="space-y-2">
                    {summaries.length === 0 ? <p className="text-xs text-muted-foreground text-center py-4">No summaries generated</p> :
                      summaries.map(s => (
                        <Card key={s.id}><CardContent className="pt-3 pb-2">
                          <p className="text-xs">{s.summary_text}</p>
                          {s.key_topics?.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {s.key_topics.map((t: string) => <Badge key={t} variant="outline" className="text-[9px]">{t}</Badge>)}
                            </div>
                          )}
                        </CardContent></Card>
                      ))
                    }
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Select a conversation</div>
          )}
        </div>
      </div>
    </div>
  );
}
