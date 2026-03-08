import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Briefcase, Brain, TrendingUp, Target, Zap, Star, Send } from "lucide-react";
import { getSponsorIntakeSessions, captureSponsorProblem, updateIntakeStatus, getIntakeStats, INTAKE_STATUSES } from "@/lib/omnichannel/intakeService";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function SponsorIntakePage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rawInput, setRawInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSession, setSelectedSession] = useState<any>(null);

  useEffect(() => { loadData(); }, [statusFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter !== "all") filters.intake_status = statusFilter;
      const [s, st] = await Promise.all([getSponsorIntakeSessions(filters), getIntakeStats()]);
      setSessions(s);
      setStats(st);
    } catch { toast.error("Failed to load intake data"); }
    finally { setLoading(false); }
  }

  async function handleCapture() {
    if (!rawInput.trim()) return;
    setProcessing(true);
    try {
      const result = await captureSponsorProblem(rawInput);
      toast.success("Problem captured and structured by AI");
      setRawInput("");
      setSelectedSession(result);
      loadData();
    } catch (e: any) {
      toast.error(e?.message || "Failed to process intake");
    } finally { setProcessing(false); }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      await updateIntakeStatus(id, status);
      toast.success(`Status updated to ${status}`);
      loadData();
    } catch { toast.error("Failed to update"); }
  }

  const domainData = stats ? Object.entries(stats.byDomain).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-primary" /> Sponsor Intake Agent
          </h1>
          <p className="text-sm text-muted-foreground">AI-powered problem capture — convert sponsor messages into structured GPE challenges</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {INTAKE_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[
          { label: "Total Intakes", value: stats?.total || 0, icon: Briefcase },
          { label: "Avg Clarity", value: `${stats?.avgClarity || 0}%`, icon: Brain },
          { label: "Avg Fundability", value: `${stats?.avgFundability || 0}%`, icon: TrendingUp },
          { label: "AI Confidence", value: `${stats?.avgConfidence || 0}%`, icon: Zap },
          { label: "Approved", value: stats?.byStatus?.approved || 0, icon: Target },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4 flex items-center gap-3">
              <m.icon className="h-6 w-6 text-primary" />
              <div><p className="text-xl font-bold">{m.value}</p><p className="text-xs text-muted-foreground">{m.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Capture Form */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> Capture Sponsor Problem</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder='Paste a sponsor message, e.g. "We want AI to detect crop disease in wheat fields across Punjab using drone imagery..."'
              value={rawInput}
              onChange={e => setRawInput(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <Button onClick={handleCapture} disabled={processing || !rawInput.trim()} className="w-full">
              {processing ? "AI Structuring..." : "Capture & Structure with AI"}
            </Button>
            {selectedSession?.structured_problem && (
              <div className="mt-4 p-4 rounded-lg border bg-muted/30 space-y-2">
                <h4 className="font-semibold text-sm">AI Structured Output</h4>
                <p className="text-sm"><strong>Title:</strong> {selectedSession.structured_problem.problem_title}</p>
                <p className="text-sm"><strong>Domain:</strong> {selectedSession.structured_problem.domain_category}</p>
                <p className="text-sm"><strong>Description:</strong> {selectedSession.structured_problem.problem_description}</p>
                {selectedSession.structured_problem.required_expertise?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedSession.structured_problem.required_expertise.map((e: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{e}</Badge>
                    ))}
                  </div>
                )}
                {selectedSession.structured_problem.follow_up_questions?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-muted-foreground">Suggested follow-up questions:</p>
                    <ul className="text-xs list-disc ml-4 mt-1 space-y-1">
                      {selectedSession.structured_problem.follow_up_questions.map((q: string, i: number) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Domain Distribution */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Domain Distribution</CardTitle></CardHeader>
          <CardContent>
            {domainData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={domainData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name}>
                    {domainData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>}
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Intake Sessions</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 rounded animate-pulse bg-muted" />)}</div>
          ) : sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No intake sessions yet</p>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2">
                {sessions.map(s => (
                  <div key={s.id} className="p-3 rounded-lg border hover:shadow transition-shadow flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{s.problem_title || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.raw_input?.substring(0, 100)}...</p>
                      <div className="flex items-center gap-2 mt-1">
                        {s.domain_category && <Badge variant="outline" className="text-[10px]">{s.domain_category}</Badge>}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span>Clarity: {s.clarity_score}%</span>
                          <span>• Fund: {s.fundability_score}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Badge className="text-[10px]" variant={s.intake_status === "approved" ? "default" : "secondary"}>
                        {s.intake_status}
                      </Badge>
                      <Select value={s.intake_status} onValueChange={v => handleStatusChange(s.id, v)}>
                        <SelectTrigger className="h-7 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {INTAKE_STATUSES.map(st => <SelectItem key={st} value={st} className="text-xs capitalize">{st.replace(/_/g, " ")}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
