import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Target, Banknote, Plus } from "lucide-react";
import { fetchImpactBonds, getBondAnalytics, createImpactBond } from "@/lib/innovation/researchImpactBonds";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function ResearchImpactBondsPage() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", research_domain: "AI", target_outcome: "", bond_amount: "" });

  const { data: bonds = [], refetch } = useQuery({
    queryKey: ["impact-bonds"],
    queryFn: () => fetchImpactBonds(),
  });

  const analytics = getBondAnalytics(bonds);
  const domainData = Object.entries(analytics.byDomain).map(([name, value]) => ({ name, value }));

  const handleCreate = async () => {
    if (!user) return;
    try {
      await createImpactBond({
        title: form.title,
        description: form.description,
        issuer_id: user.id,
        institution_id: null,
        research_domain: form.research_domain,
        target_outcome: form.target_outcome,
        bond_amount: parseFloat(form.bond_amount) || 0,
        min_investment: 100,
        max_return_rate: 0.15,
        outcome_metrics: [],
        status: "published",
        maturity_date: null,
      });
      toast.success("Impact Bond created");
      setIsCreateOpen(false);
      refetch();
    } catch { toast.error("Failed to create bond"); }
  };

  return (
    <>
      <Helmet><title>Research Impact Bonds | RCollab</title></Helmet>
      <div className="min-h-screen bg-background p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Research Impact Bonds</h1>
            <p className="text-muted-foreground">Outcome-linked funding instruments for verified research</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Issue Bond</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Issue Impact Bond</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Bond Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                <Textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                <Select value={form.research_domain} onValueChange={v => setForm(f => ({ ...f, research_domain: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["AI", "Biotech", "Climate", "Energy", "Healthcare", "Materials Science"].map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Target Outcome" value={form.target_outcome} onChange={e => setForm(f => ({ ...f, target_outcome: e.target.value }))} />
                <Input type="number" placeholder="Bond Amount ($)" value={form.bond_amount} onChange={e => setForm(f => ({ ...f, bond_amount: e.target.value }))} />
                <Button onClick={handleCreate} className="w-full">Issue Bond</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Bonds", value: bonds.length, icon: Banknote },
            { label: "Total Capital", value: `$${analytics.totalCapital.toLocaleString()}`, icon: DollarSign },
            { label: "Funded", value: `$${analytics.totalFunded.toLocaleString()}`, icon: TrendingUp },
            { label: "Funding Rate", value: `${(analytics.fundingRate * 100).toFixed(1)}%`, icon: Target },
          ].map(kpi => (
            <Card key={kpi.label}>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10"><kpi.icon className="h-5 w-5 text-primary" /></div>
                <div><p className="text-sm text-muted-foreground">{kpi.label}</p><p className="text-2xl font-bold text-foreground">{kpi.value}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="bonds">
          <TabsList><TabsTrigger value="bonds">Active Bonds</TabsTrigger><TabsTrigger value="analytics">Analytics</TabsTrigger></TabsList>
          <TabsContent value="bonds" className="space-y-4">
            {bonds.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No bonds issued yet. Issue your first Impact Bond to get started.</CardContent></Card>
            ) : bonds.map(bond => (
              <Card key={bond.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground text-lg">{bond.title}</h3>
                      <p className="text-sm text-muted-foreground">{bond.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{bond.research_domain}</Badge>
                        <Badge variant="outline">{bond.status}</Badge>
                        <Badge variant="outline">Max Return: {(Number(bond.max_return_rate) * 100).toFixed(0)}%</Badge>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xl font-bold text-foreground">${Number(bond.bond_amount).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Target</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Funded</span>
                      <span className="text-foreground">${Number(bond.funded_amount).toLocaleString()} / ${Number(bond.bond_amount).toLocaleString()}</span>
                    </div>
                    <Progress value={Number(bond.bond_amount) > 0 ? (Number(bond.funded_amount) / Number(bond.bond_amount)) * 100 : 0} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card><CardHeader><CardTitle>Bonds by Domain</CardTitle></CardHeader><CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={domainData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart>
                </ResponsiveContainer>
              </CardContent></Card>
              <Card><CardHeader><CardTitle>Domain Distribution</CardTitle></CardHeader><CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart><Pie data={domainData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name }) => name}>
                    {domainData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              </CardContent></Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
