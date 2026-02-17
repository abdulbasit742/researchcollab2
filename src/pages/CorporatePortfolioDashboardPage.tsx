import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, DollarSign, GraduationCap, TrendingUp, Users, Briefcase, Target, AlertTriangle } from "lucide-react";

const CorporatePortfolioDashboardPage = () => {
  const { data: accounts } = useQuery({
    queryKey: ["corporate-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("corporate_accounts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: briefs } = useQuery({
    queryKey: ["innovation-briefs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("innovation_pipeline_briefs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: hiring } = useQuery({
    queryKey: ["corporate-hiring"],
    queryFn: async () => {
      const { data, error } = await supabase.from("corporate_hiring_pipeline").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const totalBudget = (accounts || []).reduce((s, a) => s + Number(a.annual_rnd_budget || 0), 0);
  const totalAllocated = (accounts || []).reduce((s, a) => s + Number(a.allocated_budget || 0), 0);
  const activeProjects = (briefs || []).filter(b => b.status === "in_progress").length;
  const completedProjects = (briefs || []).filter(b => b.status === "completed").length;
  const hiredCount = (hiring || []).filter(h => h.status === "hired").length;
  const utilization = totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0;

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    published: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    matched: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    in_progress: "bg-primary/10 text-primary",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    cancelled: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Corporate R&D Portfolio</h1>
          <p className="text-muted-foreground mt-1">Enterprise innovation execution infrastructure</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: DollarSign, label: "Total R&D Budget", value: `PKR ${(totalBudget / 1000000).toFixed(1)}M`, sub: `${(accounts || []).length} accounts` },
            { icon: Target, label: "Budget Utilization", value: `${utilization.toFixed(0)}%`, sub: `PKR ${(totalAllocated / 1000000).toFixed(1)}M allocated` },
            { icon: Briefcase, label: "Active Projects", value: activeProjects, sub: `${completedProjects} completed` },
            { icon: Users, label: "Talent Hired", value: hiredCount, sub: `${(hiring || []).length} in pipeline` },
          ].map((kpi, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <kpi.icon className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{kpi.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="accounts">
          <TabsList>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="pipeline">Innovation Pipeline</TabsTrigger>
            <TabsTrigger value="hiring">Hiring Pipeline</TabsTrigger>
            <TabsTrigger value="risk">Risk & Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-4 mt-4">
            {(accounts || []).length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No corporate accounts yet.</CardContent></Card>
            ) : (accounts || []).map(account => (
              <Card key={account.id} className="border-border/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground">{account.company_name}</h3>
                        <p className="text-xs text-muted-foreground">{account.contract_type} contract</p>
                      </div>
                    </div>
                    <Badge variant="outline">{account.status}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Annual Budget</p>
                      <p className="font-semibold text-foreground">PKR {Number(account.annual_rnd_budget || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Allocated</p>
                      <p className="font-semibold text-foreground">PKR {Number(account.allocated_budget || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining</p>
                      <p className="font-semibold text-foreground">PKR {Number(account.remaining_budget || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <Progress value={Number(account.annual_rnd_budget) > 0 ? (Number(account.allocated_budget) / Number(account.annual_rnd_budget)) * 100 : 0} className="mt-3 h-2" />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-4 mt-4">
            {(briefs || []).length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No innovation briefs submitted.</CardContent></Card>
            ) : (briefs || []).map(brief => (
              <Card key={brief.id} className="border-border/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{brief.title}</h3>
                    <Badge className={statusColors[brief.status] || ""}>{brief.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{brief.description || "No description"}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {brief.sector && <span>Sector: {brief.sector}</span>}
                    {brief.innovation_theme && <span>Theme: {brief.innovation_theme}</span>}
                    <span>Budget: PKR {Number(brief.budget_allocated || 0).toLocaleString()}</span>
                    {brief.risk_score > 0 && (
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />Risk: {Number(brief.risk_score).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="hiring" className="space-y-4 mt-4">
            {(hiring || []).length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No talent in pipeline yet.</CardContent></Card>
            ) : (
              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-lg">Talent Pipeline</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-2 text-center">
                    {["identified", "tagged", "talent_pool", "interview_invited", "hired", "declined"].map(status => {
                      const count = (hiring || []).filter(h => h.status === status).length;
                      return (
                        <div key={status} className="p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold text-foreground">{count}</p>
                          <p className="text-xs text-muted-foreground capitalize">{status.replace("_", " ")}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="risk" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-4 w-4" /> ROI Proxy Metrics</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Prototype Delivery Rate", value: completedProjects > 0 ? `${((completedProjects / Math.max((briefs || []).length, 1)) * 100).toFixed(0)}%` : "N/A" },
                    { label: "Hiring Conversion", value: `${hiredCount} hires` },
                    { label: "Avg Budget per Brief", value: `PKR ${(briefs || []).length > 0 ? ((briefs || []).reduce((s, b) => s + Number(b.budget_allocated || 0), 0) / (briefs || []).length).toLocaleString() : "0"}` },
                    { label: "Active Accounts", value: (accounts || []).filter(a => a.status === "active").length },
                  ].map((m, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                      <span className="text-sm text-muted-foreground">{m.label}</span>
                      <span className="text-sm font-semibold text-foreground">{m.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Risk Distribution</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {["Low (0-30%)", "Medium (30-60%)", "High (60%+)"].map((label, i) => {
                    const ranges = [[0, 30], [30, 60], [60, 100]];
                    const count = (briefs || []).filter(b => Number(b.risk_score) >= ranges[i][0] && Number(b.risk_score) < ranges[i][1]).length;
                    return (
                      <div key={label} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <span className="text-sm font-semibold text-foreground">{count} projects</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CorporatePortfolioDashboardPage;
