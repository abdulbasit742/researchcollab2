import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Users, FileText, Brain, BarChart3, Bookmark } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  getOpportunities, getApplications, getSavedCandidates, getContracts,
  runTalentMatching, getTalentProfiles, getGTEXAnalytics,
} from "@/lib/innovation/talentExchange";

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#f59e0b", "#8b5cf6", "#10b981"];

export default function OrgDashboardPage() {
  const { user } = useAuth();
  const [selectedOpp, setSelectedOpp] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<any>(null);

  const { data: myOpps = [] } = useQuery({
    queryKey: ["gtex-my-opps", user?.id],
    queryFn: () => getOpportunities(),
  });

  const { data: saved = [] } = useQuery({
    queryKey: ["gtex-saved", user?.id],
    queryFn: () => getSavedCandidates(user?.id || ""),
    enabled: !!user?.id,
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["gtex-contracts"],
    queryFn: () => getContracts(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["gtex-applications", selectedOpp],
    queryFn: () => getApplications(selectedOpp),
    enabled: !!selectedOpp,
  });

  const { data: analytics } = useQuery({
    queryKey: ["gtex-analytics-org"],
    queryFn: getGTEXAnalytics,
  });

  const runAIMatch = async (opp: any) => {
    setAiLoading(true);
    try {
      const candidates = await getTalentProfiles();
      if (candidates.length === 0) { toast.error("No talent profiles available"); return; }
      const result = await runTalentMatching(opp, candidates.slice(0, 20));
      setAiResults(result);
      toast.success(`Found ${result.matches?.length || 0} AI matches`);
    } catch (e: any) {
      toast.error(e.message || "AI matching failed");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Building className="h-8 w-8 text-primary" /> Organization Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Manage hiring, talent, and execution contracts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">{myOpps.length}</p>
          <p className="text-sm text-muted-foreground">My Opportunities</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-primary">{saved.length}</p>
          <p className="text-sm text-muted-foreground">Saved Candidates</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">{contracts.length}</p>
          <p className="text-sm text-muted-foreground">Contracts</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">${(analytics?.totalCompensation ?? 0).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Compensation</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="opportunities">
        <TabsList>
          <TabsTrigger value="opportunities"><FileText className="h-4 w-4 mr-1" /> Opportunities</TabsTrigger>
          <TabsTrigger value="saved"><Bookmark className="h-4 w-4 mr-1" /> Saved</TabsTrigger>
          <TabsTrigger value="contracts"><Users className="h-4 w-4 mr-1" /> Contracts</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-1" /> Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          {myOpps.map((opp: any) => (
            <Card key={opp.id} className={selectedOpp === opp.id ? "ring-2 ring-primary" : ""}>
              <CardContent className="pt-6 flex items-start justify-between">
                <div className="cursor-pointer" onClick={() => setSelectedOpp(opp.id)}>
                  <h3 className="font-semibold text-foreground">{opp.title}</h3>
                  <div className="flex gap-2 mt-1">
                    <Badge>{opp.status}</Badge>
                    <Badge variant="outline">{opp.applications_count} applicants</Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline" disabled={aiLoading} onClick={() => runAIMatch(opp)}>
                  <Brain className="h-4 w-4 mr-1" /> {aiLoading ? "Matching..." : "AI Match"}
                </Button>
              </CardContent>
            </Card>
          ))}
          {aiResults?.matches?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4" /> AI Matches</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {aiResults.matches.map((m: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">Candidate #{m.candidate_index + 1}</p>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {(m.match_reasons || []).map((r: string, j: number) => <Badge key={j} variant="secondary" className="text-xs">{r}</Badge>)}
                      </div>
                    </div>
                    <Badge className="text-lg">{m.confidence_score}%</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          {saved.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No saved candidates yet.</CardContent></Card>
          ) : saved.map((s: any) => (
            <Card key={s.id}>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground">{s.gtex_talent_profiles?.display_name || "Unknown"}</h3>
                <p className="text-sm text-muted-foreground">Trust: {s.gtex_talent_profiles?.trust_score_snapshot} • {s.gtex_talent_profiles?.total_projects_completed} projects</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          {contracts.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No contracts yet.</CardContent></Card>
          ) : contracts.map((c: any) => (
            <Card key={c.id}>
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{c.title}</h3>
                  <Badge variant="outline">{c.status}</Badge>
                </div>
                <p className="font-bold text-foreground">${(c.total_compensation || 0).toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-sm">Talent by Domain</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics?.byDomain || []}>
                    <XAxis dataKey="domain" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Opportunity Status</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={analytics?.byOppStatus || []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                      {(analytics?.byOppStatus || []).map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
