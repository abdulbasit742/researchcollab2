import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSponsorPipeline } from "@/hooks/useRevenueEngine";
import { motion, AnimatePresence } from "framer-motion";
import { Users, TrendingUp, DollarSign, Clock, Plus, ArrowRight, Target, Repeat, ChevronDown, Search, Zap } from "lucide-react";
import { format } from "date-fns";

const STAGES = [
  { key: "contacted", label: "Contacted", emoji: "📞" },
  { key: "meeting_scheduled", label: "Meeting", emoji: "🤝" },
  { key: "proposal_sent", label: "Proposal", emoji: "📄" },
  { key: "onboarded", label: "Onboarded", emoji: "✅" },
  { key: "funded", label: "Funded", emoji: "💰" },
  { key: "repeat_funder", label: "Repeat", emoji: "🔄" },
  { key: "churned", label: "Churned", emoji: "⛔" },
];

function FunnelBar({ stages, counts, total }: { stages: typeof STAGES; counts: Record<string, number>; total: number }) {
  const activeStages = stages.filter(s => s.key !== "churned");
  return (
    <div className="relative">
      <div className="flex gap-1 h-16 items-end">
        {activeStages.map((stage, i) => {
          const count = counts[stage.key] ?? 0;
          const pct = total > 0 ? Math.max(8, (count / total) * 100) : 14;
          return (
            <motion.div
              key={stage.key}
              className="relative flex-1 rounded-t-lg bg-gradient-to-t from-primary/20 to-primary/5 border border-b-0 border-primary/20 flex flex-col items-center justify-end overflow-hidden group cursor-default"
              initial={{ height: 0 }}
              animate={{ height: `${pct}%` }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 120 }}
              style={{ minHeight: 32 }}
            >
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
              <span className="text-lg font-bold font-mono text-primary relative z-10">{count}</span>
            </motion.div>
          );
        })}
      </div>
      <div className="flex gap-1">
        {activeStages.map((stage) => (
          <div key={stage.key} className="flex-1 text-center pt-2">
            <span className="text-base">{stage.emoji}</span>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{stage.label}</p>
          </div>
        ))}
      </div>
      {/* Connector arrows */}
      <div className="absolute top-1/2 left-0 right-0 flex items-center justify-between px-8 -translate-y-4 pointer-events-none">
        {activeStages.slice(0, -1).map((_, i) => (
          <ArrowRight key={i} className="h-3 w-3 text-primary/30" />
        ))}
      </div>
    </div>
  );
}

export default function SponsorPipelinePage() {
  const { sponsors, isLoading, addSponsor, updateStage, pipelineStats } = useSponsorPipeline();
  const stats = pipelineStats();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ sponsor_name: "", contact_email: "", contact_person: "", organization: "", notes: "" });

  const filtered = sponsors.filter((s: any) =>
    !search || s.sponsor_name?.toLowerCase().includes(search.toLowerCase()) || s.organization?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.sponsor_name) return;
    addSponsor.mutate(form, { onSuccess: () => { setOpen(false); setForm({ sponsor_name: "", contact_email: "", contact_person: "", organization: "", notes: "" }); } });
  };

  const conversionRate = stats.total > 0
    ? ((stats.counts["funded"] + stats.counts["repeat_funder"]) / stats.total * 100).toFixed(0)
    : "0";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              Sponsor Acquisition Pipeline
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Track every sponsor from first contact to repeat funding</p>
          </motion.div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />Add Sponsor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Sponsor to Pipeline</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Sponsor Name *" value={form.sponsor_name} onChange={e => setForm({ ...form, sponsor_name: e.target.value })} />
                <Input placeholder="Organization" value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} />
                <Input placeholder="Contact Person" value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} />
                <Input placeholder="Email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} />
                <Input placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                <Button className="w-full" onClick={handleAdd} disabled={addSponsor.isPending}>
                  {addSponsor.isPending ? "Adding..." : "Add to Pipeline"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Funnel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Pipeline Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <FunnelBar stages={STAGES} counts={stats.counts} total={stats.total} />
            </CardContent>
          </Card>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Total Pipeline", value: stats.total, icon: Users, sub: "sponsors" },
            { label: "Total Funded", value: `PKR ${(stats.totalFunded / 1000).toFixed(0)}K`, icon: DollarSign, sub: "deployed" },
            { label: "Avg Size", value: `PKR ${(stats.avgFundingSize / 1000).toFixed(0)}K`, icon: TrendingUp, sub: "per deal" },
            { label: "Conversion", value: `${conversionRate}%`, icon: Target, sub: "to funded" },
            { label: "Repeat Rate", value: `${stats.repeatRate.toFixed(0)}%`, icon: Repeat, sub: "re-funders" },
            { label: "Time to Deposit", value: `${stats.avgTimeToDeposit.toFixed(0)}d`, icon: Clock, sub: "average" },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div key={kpi.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.04 }}>
                <Card className="group hover:border-primary/30 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                    </div>
                    <p className="text-xl font-bold font-mono">{kpi.value}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{kpi.sub}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Search + Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">All Sponsors</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search sponsors..."
                  className="pl-9 h-8 text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading pipeline...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {search ? "No sponsors match your search." : "No sponsors yet. Add your first one above."}
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs">Sponsor</TableHead>
                        <TableHead className="text-xs">Organization</TableHead>
                        <TableHead className="text-xs">Contact</TableHead>
                        <TableHead className="text-xs">Stage</TableHead>
                        <TableHead className="text-xs text-right">Funded</TableHead>
                        <TableHead className="text-xs">Added</TableHead>
                        <TableHead className="text-xs">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filtered.map((s: any, i: number) => {
                          const currentIdx = STAGES.findIndex(st => st.key === s.stage);
                          const nextStage = STAGES[currentIdx + 1];
                          const stageInfo = STAGES.find(st => st.key === s.stage);
                          return (
                            <motion.tr
                              key={s.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.02 }}
                              className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                            >
                              <TableCell className="font-medium">{s.sponsor_name}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{s.organization || "—"}</TableCell>
                              <TableCell className="text-sm">{s.contact_person || s.contact_email || "—"}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={s.stage === "churned" ? "destructive" : s.stage === "funded" || s.stage === "repeat_funder" ? "default" : "outline"}
                                  className="gap-1 text-[11px]"
                                >
                                  <span>{stageInfo?.emoji}</span>
                                  {stageInfo?.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm">
                                {Number(s.total_funded) > 0 ? `PKR ${(Number(s.total_funded) / 1000).toFixed(0)}K` : "—"}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">{format(new Date(s.created_at), "MMM d")}</TableCell>
                              <TableCell>
                                {nextStage && s.stage !== "churned" ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs gap-1 hover:bg-primary/10 hover:text-primary"
                                    onClick={() => updateStage.mutate({ id: s.id, stage: nextStage.key })}
                                  >
                                    <ArrowRight className="h-3 w-3" />{nextStage.label}
                                  </Button>
                                ) : null}
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
