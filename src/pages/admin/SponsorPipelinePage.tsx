import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSponsorPipeline } from "@/hooks/useRevenueEngine";
import { motion } from "framer-motion";
import { Users, TrendingUp, DollarSign, Clock, Plus, ArrowRight, Building2, Target, Repeat } from "lucide-react";
import { format } from "date-fns";

const STAGES = [
  { key: "contacted", label: "Contacted", color: "text-muted-foreground" },
  { key: "meeting_scheduled", label: "Meeting", color: "text-blue-400" },
  { key: "proposal_sent", label: "Proposal", color: "text-amber-400" },
  { key: "onboarded", label: "Onboarded", color: "text-cyan-400" },
  { key: "funded", label: "Funded", color: "text-green-400" },
  { key: "repeat_funder", label: "Repeat", color: "text-emerald-400" },
  { key: "churned", label: "Churned", color: "text-destructive" },
];

export default function SponsorPipelinePage() {
  const { sponsors, isLoading, addSponsor, updateStage, pipelineStats } = useSponsorPipeline();
  const stats = pipelineStats();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ sponsor_name: "", contact_email: "", contact_person: "", organization: "", notes: "" });

  const handleAdd = () => {
    if (!form.sponsor_name) return;
    addSponsor.mutate(form, { onSuccess: () => { setOpen(false); setForm({ sponsor_name: "", contact_email: "", contact_person: "", organization: "", notes: "" }); } });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Sponsor Acquisition Pipeline
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Track every sponsor from first contact to repeat funding</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />Add Sponsor</Button>
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

        {/* Pipeline Funnel */}
        <div className="grid grid-cols-7 gap-2">
          {STAGES.map((stage, i) => (
            <motion.div key={stage.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="text-center">
                <CardContent className="p-3">
                  <p className={`text-2xl font-bold font-mono ${stage.color}`}>{stats.counts[stage.key] ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{stage.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Pipeline", value: stats.total, icon: Users },
            { label: "Total Funded", value: `PKR ${(stats.totalFunded / 1000).toFixed(0)}K`, icon: DollarSign },
            { label: "Avg Funding Size", value: `PKR ${(stats.avgFundingSize / 1000).toFixed(0)}K`, icon: TrendingUp },
            { label: "Repeat Rate", value: `${stats.repeatRate.toFixed(0)}%`, icon: Repeat },
            { label: "Avg Time to Deposit", value: `${stats.avgTimeToDeposit.toFixed(0)}d`, icon: Clock },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{kpi.label}</span>
                  </div>
                  <p className="text-xl font-bold font-mono">{kpi.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Sponsor Table */}
        <Card>
          <CardHeader><CardTitle className="text-base">All Sponsors</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading pipeline...</div>
            ) : sponsors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No sponsors yet. Add your first one above.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sponsor</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead className="text-right">Funded</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sponsors.map((s: any) => {
                    const currentIdx = STAGES.findIndex(st => st.key === s.stage);
                    const nextStage = STAGES[currentIdx + 1];
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.sponsor_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.organization || "—"}</TableCell>
                        <TableCell className="text-sm">{s.contact_person || s.contact_email || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={s.stage === "churned" ? "destructive" : s.stage === "funded" || s.stage === "repeat_funder" ? "default" : "outline"}>
                            {STAGES.find(st => st.key === s.stage)?.label}
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
                              className="text-xs"
                              onClick={() => updateStage.mutate({ id: s.id, stage: nextStage.key })}
                            >
                              <ArrowRight className="h-3 w-3 mr-1" />{nextStage.label}
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
