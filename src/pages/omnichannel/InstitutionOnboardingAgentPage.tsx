import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Building2, MessageSquare, CheckCircle2, Send } from "lucide-react";
import { getOnboardingSessions, startOnboarding, continueOnboarding, ONBOARDING_STEPS } from "@/lib/omnichannel/intakeService";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function InstitutionOnboardingAgentPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => { loadSessions(); }, []);

  async function loadSessions() {
    setLoading(true);
    try { setSessions(await getOnboardingSessions()); }
    catch { toast.error("Failed to load sessions"); }
    finally { setLoading(false); }
  }

  async function handleStartNew() {
    setSending(true);
    try {
      const result = await startOnboarding("Hello, I want to register my institution on RCollab");
      setActiveSession(result);
      setChatMessages([
        { role: "user", content: "Hello, I want to register my institution on RCollab" },
        { role: "assistant", content: result.response_message },
      ]);
      loadSessions();
    } catch (e: any) { toast.error(e?.message || "Failed to start onboarding"); }
    finally { setSending(false); }
  }

  async function handleSend() {
    if (!input.trim() || !activeSession?.session_id) return;
    const userMsg = input.trim();
    setInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setSending(true);
    try {
      const result = await continueOnboarding(activeSession.session_id, userMsg);
      setActiveSession(result);
      setChatMessages(prev => [...prev, { role: "assistant", content: result.response_message }]);
      loadSessions();
    } catch (e: any) { toast.error(e?.message || "Failed to process"); }
    finally { setSending(false); }
  }

  const stepIndex = activeSession ? ONBOARDING_STEPS.indexOf(activeSession.current_step) : -1;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-7 w-7 text-primary" /> Institution Onboarding Agent
        </h1>
        <p className="text-sm text-muted-foreground">AI-guided university and institution registration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm"><MessageSquare className="h-4 w-4" /> Onboarding Chat</CardTitle>
            <Button size="sm" variant="outline" onClick={handleStartNew} disabled={sending}>New Session</Button>
          </CardHeader>
          <CardContent>
            {activeSession && (
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Step: <Badge variant="outline" className="text-[10px] capitalize">{activeSession.current_step}</Badge></span>
                  <span className="text-muted-foreground">{activeSession.completion_pct || 0}% complete</span>
                </div>
                <Progress value={activeSession.completion_pct || 0} className="h-1.5" />
              </div>
            )}
            <ScrollArea className="h-[350px] mb-3 pr-2">
              {chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Click "New Session" to start onboarding an institution
                </div>
              ) : (
                <div className="space-y-3">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                placeholder="Type your response..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={!activeSession || sending}
              />
              <Button onClick={handleSend} disabled={!activeSession || sending || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sessions Sidebar */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Onboarding Sessions</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 rounded animate-pulse bg-muted" />)}</div>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No sessions yet</p>
            ) : (
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-2">
                  {sessions.map(s => (
                    <div key={s.id} className="p-2 rounded border cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        setActiveSession({ session_id: s.id, current_step: s.onboarding_step, completion_pct: s.completion_pct });
                        setChatMessages(s.ai_summary ? [{ role: "assistant", content: s.ai_summary }] : []);
                      }}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{s.institution_name || "New Institution"}</p>
                        {s.onboarding_step === "complete" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <Badge variant="outline" className="text-[9px] capitalize shrink-0">{s.onboarding_step}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {s.country && <span className="text-[10px] text-muted-foreground">{s.country}</span>}
                        <Progress value={s.completion_pct || 0} className="h-1 flex-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
