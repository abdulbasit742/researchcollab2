import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  FlaskConical, Search, DollarSign, BarChart3, TrendingUp, Rocket, Briefcase,
  Target, Users, Globe, Lightbulb, Building2, GraduationCap, Sparkles, Crown,
  ArrowRight, Shield, BookOpen, FileText, Zap, Award, ChevronRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";

// Hooks
function useFundingRequests() {
  return useQuery({
    queryKey: ["research-funding-requests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("research_funding_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

function useQualityScores() {
  return useQuery({
    queryKey: ["research-quality-scores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("research_quality_scores").select("*").order("execution_credibility_index", { ascending: false }).limit(20);
      if (error) throw error;
      return data || [];
    },
  });
}

function useGapFindings() {
  return useQuery({
    queryKey: ["research-gap-findings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("research_gap_findings").select("*").order("opportunity_score", { ascending: false }).limit(20);
      if (error) throw error;
      return data || [];
    },
  });
}

function useCorporateProblems() {
  return useQuery({
    queryKey: ["corporate-research-problems"],
    queryFn: async () => {
      const { data, error } = await supabase.from("corporate_research_problems").select("*").order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data || [];
    },
  });
}

function useImpactIndex() {
  return useQuery({
    queryKey: ["research-impact-index"],
    queryFn: async () => {
      const { data, error } = await supabase.from("research_impact_index").select("*").order("impact_score", { ascending: false }).limit(20);
      if (error) throw error;
      return data || [];
    },
  });
}

function useEmployability() {
  return useQuery({
    queryKey: ["research-employability-scores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("research_employability_scores").select("*").order("employment_conversion_probability", { ascending: false }).limit(20);
      if (error) throw error;
      return data || [];
    },
  });
}

function useLifecycleStages() {
  return useQuery({
    queryKey: ["research-lifecycle-stages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("research_lifecycle_stages").select("*").order("updated_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data || [];
    },
  });
}

function useIntelReports() {
  return useQuery({
    queryKey: ["research-intelligence-reports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("research_intelligence_reports").select("*").order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data || [];
    },
  });
}

const STAGE_LABELS: Record<string, string> = {
  discovery: "Discovery",
  funded: "Funded Execution",
  prototype: "Prototype",
  startup: "Startup",
  funding_round: "Funding Round",
  exit: "Exit",
};

const STAGE_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--chart-1))"];

const ResearchDominationPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: fundingRequests = [] } = useFundingRequests();
  const { data: qualityScores = [] } = useQualityScores();
  const { data: gapFindings = [] } = useGapFindings();
  const { data: corporateProblems = [] } = useCorporateProblems();
  const { data: impactEntries = [] } = useImpactIndex();
  const { data: employabilityScores = [] } = useEmployability();
  const { data: lifecycleStages = [] } = useLifecycleStages();
  const { data: intelReports = [] } = useIntelReports();

  const totalFundingVolume = fundingRequests.reduce((s, r) => s + Number(r.estimated_budget || 0), 0);
  const fundedCount = fundingRequests.filter(r => r.status === "funded").length;
  const avgImpact = impactEntries.length > 0 ? (impactEntries.reduce((s, e) => s + Number(e.impact_score || 0), 0) / impactEntries.length) : 0;

  // Lifecycle stage distribution for pie chart
  const stageCounts: Record<string, number> = {};
  lifecycleStages.forEach(l => {
    const stage = l.current_stage || "discovery";
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  });
  const pieData = Object.entries(stageCounts).map(([name, value]) => ({ name: STAGE_LABELS[name] || name, value }));

  // Quality radar data
  const avgQuality = qualityScores.length > 0 ? {
    completion: qualityScores.reduce((s, q) => s + Number(q.completion_consistency || 0), 0) / qualityScores.length,
    peer: qualityScores.reduce((s, q) => s + Number(q.peer_validation_score || 0), 0) / qualityScores.length,
    sponsor: qualityScores.reduce((s, q) => s + Number(q.sponsor_feedback_score || 0), 0) / qualityScores.length,
    milestone: qualityScores.reduce((s, q) => s + Number(q.milestone_discipline || 0), 0) / qualityScores.length,
    citation: qualityScores.reduce((s, q) => s + Number(q.citation_growth_rate || 0), 0) / qualityScores.length,
    industry: qualityScores.reduce((s, q) => s + Number(q.industry_engagement || 0), 0) / qualityScores.length,
    replication: qualityScores.reduce((s, q) => s + Number(q.replication_success || 0), 0) / qualityScores.length,
  } : null;

  const radarData = avgQuality ? [
    { metric: "Completion", value: avgQuality.completion * 100 },
    { metric: "Peer Review", value: avgQuality.peer * 100 },
    { metric: "Sponsor", value: avgQuality.sponsor * 100 },
    { metric: "Milestone", value: avgQuality.milestone * 100 },
    { metric: "Citations", value: avgQuality.citation * 100 },
    { metric: "Industry", value: avgQuality.industry * 100 },
    { metric: "Replication", value: avgQuality.replication * 100 },
  ] : [];

  // Gap bar chart
  const gapChartData = gapFindings.slice(0, 8).map(g => ({
    name: (g.gap_title || "").slice(0, 20),
    opportunity: Number(g.opportunity_score || 0) * 100,
    underinvestment: Number(g.underinvestment_score || 0) * 100,
  }));

  return (
    <>
      <Helmet><title>Research Domination Engine | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FlaskConical className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Research Domination Engine</h1>
              <p className="text-muted-foreground">Beyond discovery — from paper to capital-backed execution</p>
            </div>
          </div>

          {/* Discovery search */}
          <div className="relative my-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              className="pl-10 h-12 text-base"
              placeholder="Semantic search: keywords, gaps, underfunded topics, emerging sectors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">Semantic</Badge>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">Gap Finder</Badge>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">Underfunded</Badge>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1"><DollarSign className="h-4 w-4 text-primary" /></div>
                <div className="text-2xl font-bold">PKR {(totalFundingVolume / 1000).toFixed(0)}K</div>
                <div className="text-xs text-muted-foreground">Capital Demand</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1"><Rocket className="h-4 w-4 text-green-600" /></div>
                <div className="text-2xl font-bold text-green-600">{fundedCount}</div>
                <div className="text-xs text-muted-foreground">Funded Projects</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1"><BarChart3 className="h-4 w-4 text-amber-600" /></div>
                <div className="text-2xl font-bold">{avgImpact.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Avg Impact Score</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1"><Lightbulb className="h-4 w-4 text-blue-600" /></div>
                <div className="text-2xl font-bold">{gapFindings.length}</div>
                <div className="text-xs text-muted-foreground">Gaps Identified</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="funding" className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="funding" className="gap-1.5"><DollarSign className="h-3.5 w-3.5" />Fund Research</TabsTrigger>
              <TabsTrigger value="quality" className="gap-1.5"><Award className="h-3.5 w-3.5" />Quality Index</TabsTrigger>
              <TabsTrigger value="gaps" className="gap-1.5"><Target className="h-3.5 w-3.5" />Gap Finder</TabsTrigger>
              <TabsTrigger value="corporate" className="gap-1.5"><Building2 className="h-3.5 w-3.5" />Corporate R&D</TabsTrigger>
              <TabsTrigger value="lifecycle" className="gap-1.5"><Rocket className="h-3.5 w-3.5" />R2S Pipeline</TabsTrigger>
              <TabsTrigger value="impact" className="gap-1.5"><TrendingUp className="h-3.5 w-3.5" />Impact Index</TabsTrigger>
              <TabsTrigger value="employability" className="gap-1.5"><GraduationCap className="h-3.5 w-3.5" />Employability</TabsTrigger>
              <TabsTrigger value="intel" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" />Intelligence</TabsTrigger>
            </TabsList>

            {/* FUND THIS RESEARCH */}
            <TabsContent value="funding" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Fund This Research</h2>
                <Button className="gap-1.5"><DollarSign className="h-4 w-4" />Create Funding Request</Button>
              </div>
              {fundingRequests.length === 0 ? (
                <Card><CardContent className="py-12 text-center">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-4">No funding requests yet. Make your research capital-ready.</p>
                  <Button>Create First Funding Request</Button>
                </CardContent></Card>
              ) : (
                <div className="grid gap-4">
                  {fundingRequests.map(req => (
                    <Card key={req.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{req.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>{req.timeline_weeks} weeks</span>
                              <span>•</span>
                              <span>{req.team_size} members</span>
                              <span>•</span>
                              <span>IP: {req.ip_preference}</span>
                            </div>
                          </div>
                          <Badge variant={req.status === "funded" ? "default" : "outline"}>{req.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-muted-foreground">Budget</div>
                            <div className="font-semibold">PKR {Number(req.estimated_budget || 0).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Survival Forecast</div>
                            <div className="font-semibold">{(Number(req.survival_forecast || 0) * 100).toFixed(0)}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Risk</div>
                            <div className="font-semibold">{(Number(req.risk_probability || 0) * 100).toFixed(0)}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Escrow</div>
                            <div className="font-semibold">PKR {Number(req.escrow_deposit_amount || 0).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="gap-1.5"><DollarSign className="h-3.5 w-3.5" />Fund This Research</Button>
                          <Button size="sm" variant="outline" className="gap-1.5"><FileText className="h-3.5 w-3.5" />View Milestones</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* QUALITY INDEX */}
            <TabsContent value="quality" className="space-y-4">
              <h2 className="text-xl font-semibold">Execution Credibility Index</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-base">Quality Radar — Platform Average</CardTitle></CardHeader>
                  <CardContent>
                    {radarData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                          <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">No quality data yet</div>
                    )}
                  </CardContent>
                </Card>
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground">Top Researchers by Credibility</h3>
                  {qualityScores.length === 0 ? (
                    <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No credibility scores computed yet.</CardContent></Card>
                  ) : qualityScores.slice(0, 6).map((q, i) => (
                    <Card key={q.id}>
                      <CardContent className="py-3 px-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                          <div>
                            <div className="text-sm font-medium">Researcher {(q.researcher_id || "").slice(0, 8)}</div>
                            <div className="text-xs text-muted-foreground">ECI: {(Number(q.execution_credibility_index || 0) * 100).toFixed(1)}</div>
                          </div>
                        </div>
                        <Progress value={Number(q.execution_credibility_index || 0) * 100} className="w-24 h-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* GAP FINDER */}
            <TabsContent value="gaps" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">High-Opportunity Research Gaps</h2>
                <Button variant="outline" className="gap-1.5"><Sparkles className="h-4 w-4" />Run AI Gap Analysis</Button>
              </div>
              {gapChartData.length > 0 && (
                <Card>
                  <CardContent className="pt-4">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={gapChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="opportunity" name="Opportunity Score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="underinvestment" name="Underinvestment" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
              <div className="grid gap-3">
                {gapFindings.length === 0 ? (
                  <Card><CardContent className="py-12 text-center">
                    <Target className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No research gaps identified yet. Run AI analysis to detect opportunities.</p>
                  </CardContent></Card>
                ) : gapFindings.map(gap => (
                  <Card key={gap.id}>
                    <CardContent className="py-4 px-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-sm">{gap.gap_title}</div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{gap.gap_description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            {gap.sector && <Badge variant="secondary" className="text-xs">{gap.sector}</Badge>}
                            <span>Corporate Signals: {gap.corporate_demand_signals}</span>
                            <span>Gov Priority: {(Number(gap.government_priority_score || 0) * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{(Number(gap.opportunity_score || 0) * 100).toFixed(0)}</div>
                          <div className="text-xs text-muted-foreground">Opportunity</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* CORPORATE R&D MARKETPLACE */}
            <TabsContent value="corporate" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Corporate Research Marketplace</h2>
                <Button className="gap-1.5"><Building2 className="h-4 w-4" />Post R&D Problem</Button>
              </div>
              {corporateProblems.length === 0 ? (
                <Card><CardContent className="py-12 text-center">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-4">No corporate research problems posted yet.</p>
                  <Button variant="outline">Invite Corporates</Button>
                </CardContent></Card>
              ) : corporateProblems.map(prob => (
                <Card key={prob.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2">{prob.corporate_name}</Badge>
                        <CardTitle className="text-base">{prob.problem_title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{prob.problem_description}</p>
                      </div>
                      <Badge variant={prob.status === "matched" ? "default" : "secondary"}>{prob.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Budget Range</div>
                        <div className="font-semibold">PKR {Number(prob.budget_min || 0).toLocaleString()} - {Number(prob.budget_max || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Timeline</div>
                        <div className="font-semibold">{prob.timeline_weeks} weeks</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">IP</div>
                        <div className="font-semibold">{prob.ip_preference}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Escrow</div>
                        <div className="font-semibold">{prob.escrow_deposited ? "✅ Deposited" : "Pending"}</div>
                      </div>
                    </div>
                    <Button size="sm" className="mt-3 gap-1.5"><ArrowRight className="h-3.5 w-3.5" />Apply with University</Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* RESEARCH-TO-STARTUP PIPELINE */}
            <TabsContent value="lifecycle" className="space-y-4">
              <h2 className="text-xl font-semibold">Research → Startup Pipeline</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-base">Lifecycle Stage Distribution</CardTitle></CardHeader>
                  <CardContent>
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                            {pieData.map((_, i) => <Cell key={i} fill={STAGE_COLORS[i % STAGE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[280px] flex items-center justify-center text-muted-foreground">No lifecycle data yet</div>
                    )}
                  </CardContent>
                </Card>
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground">Pipeline Stages</h3>
                  {["discovery", "funded", "prototype", "startup", "funding_round", "exit"].map((stage, i) => (
                    <Card key={stage}>
                      <CardContent className="py-3 px-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground" style={{ background: STAGE_COLORS[i] }}>{i + 1}</div>
                          <div>
                            <div className="text-sm font-medium">{STAGE_LABELS[stage]}</div>
                            <div className="text-xs text-muted-foreground">{stageCounts[stage] || 0} projects</div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* IMPACT INDEX */}
            <TabsContent value="impact" className="space-y-4">
              <h2 className="text-xl font-semibold">Research Impact Index</h2>
              {impactEntries.length === 0 ? (
                <Card><CardContent className="py-12 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No impact data yet. Impact is computed as research progresses through execution.</p>
                </CardContent></Card>
              ) : (
                <div className="grid gap-3">
                  {impactEntries.map(entry => (
                    <Card key={entry.id}>
                      <CardContent className="py-4 px-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium">Research {(entry.research_id || "").slice(0, 8)}</div>
                          <div className="text-lg font-bold text-primary">{(Number(entry.impact_score || 0)).toFixed(1)}</div>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 text-xs">
                          <div><span className="text-muted-foreground">Citations</span><div className="font-semibold">{entry.citation_count}</div></div>
                          <div><span className="text-muted-foreground">Industry Adoption</span><div className="font-semibold">{entry.industry_adoption_count}</div></div>
                          <div><span className="text-muted-foreground">Spin-offs</span><div className="font-semibold">{entry.startup_spinoffs}</div></div>
                          <div><span className="text-muted-foreground">Jobs Created</span><div className="font-semibold">{entry.employment_created}</div></div>
                          <div><span className="text-muted-foreground">Patents</span><div className="font-semibold">{entry.patents_generated}</div></div>
                        </div>
                        <Progress value={Number(entry.survival_probability || 0) * 100} className="h-1.5 mt-3" />
                        <div className="text-xs text-muted-foreground mt-1">Survival: {(Number(entry.survival_probability || 0) * 100).toFixed(0)}%</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* EMPLOYABILITY */}
            <TabsContent value="employability" className="space-y-4">
              <h2 className="text-xl font-semibold">Research → Employment Conversion</h2>
              {employabilityScores.length === 0 ? (
                <Card><CardContent className="py-12 text-center">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No employability scores yet. Scores are computed as research demonstrates industry relevance.</p>
                </CardContent></Card>
              ) : (
                <div className="grid gap-3">
                  {employabilityScores.map(score => (
                    <Card key={score.id}>
                      <CardContent className="py-4 px-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium">Researcher {(score.researcher_id || "").slice(0, 8)}</div>
                          <Badge variant={Number(score.employment_conversion_probability || 0) > 0.7 ? "default" : "secondary"}>
                            {(Number(score.employment_conversion_probability || 0) * 100).toFixed(0)}% Conversion
                          </Badge>
                        </div>
                        <div className="grid grid-cols-5 gap-2 text-xs">
                          <div><span className="text-muted-foreground">Industry</span><Progress value={Number(score.industry_relevance || 0) * 100} className="h-1.5 mt-1" /></div>
                          <div><span className="text-muted-foreground">Sponsor</span><Progress value={Number(score.sponsor_involvement || 0) * 100} className="h-1.5 mt-1" /></div>
                          <div><span className="text-muted-foreground">Deliverable</span><Progress value={Number(score.deliverable_quality || 0) * 100} className="h-1.5 mt-1" /></div>
                          <div><span className="text-muted-foreground">Trust</span><Progress value={Number(score.trust_score || 0) * 100} className="h-1.5 mt-1" /></div>
                          <div><span className="text-muted-foreground">Demand</span><Progress value={Number(score.skill_match_demand || 0) * 100} className="h-1.5 mt-1" /></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* INTELLIGENCE REPORTS */}
            <TabsContent value="intel" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Research Intelligence Reports</h2>
                <Badge variant="outline" className="gap-1"><Crown className="h-3 w-3" />Subscription Only</Badge>
              </div>
              {intelReports.length === 0 ? (
                <Card><CardContent className="py-12 text-center">
                  <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-4">Intelligence reports will appear as the data engine matures.</p>
                </CardContent></Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {intelReports.map(report => (
                    <Card key={report.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="py-4 px-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge variant="secondary" className="mb-2 text-xs">{report.report_type?.replace(/_/g, " ")}</Badge>
                            <div className="font-medium text-sm">{report.report_title}</div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{report.content_summary}</p>
                          </div>
                          <Badge variant="outline">{report.access_tier}</Badge>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">{report.downloads} downloads</span>
                          <Button size="sm" variant="outline" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" />View Report</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Competitive Advantage Summary */}
          <Card className="mt-8 border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><BookOpen className="h-4 w-4" />Google Scholar</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Indexes papers</li>
                    <li>• Shows citations</li>
                    <li>• Static listings</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />RCollab Research Engine</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2"><Shield className="h-3 w-3 text-primary" />Funds research</li>
                    <li className="flex items-center gap-2"><Shield className="h-3 w-3 text-primary" />Executes with milestones</li>
                    <li className="flex items-center gap-2"><Shield className="h-3 w-3 text-primary" />Routes capital</li>
                    <li className="flex items-center gap-2"><Shield className="h-3 w-3 text-primary" />Measures impact</li>
                    <li className="flex items-center gap-2"><Shield className="h-3 w-3 text-primary" />Creates startups</li>
                    <li className="flex items-center gap-2"><Shield className="h-3 w-3 text-primary" />Predicts survival</li>
                    <li className="flex items-center gap-2"><Shield className="h-3 w-3 text-primary" />Generates intelligence revenue</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ResearchDominationPage;
