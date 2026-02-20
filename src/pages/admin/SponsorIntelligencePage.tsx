import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSponsorPipeline } from "@/hooks/useRevenueEngine";
import { useSponsorFollowUps, useSponsorScores, useSponsorEngagement } from "@/hooks/useSponsorIntelligence";
import { motion } from "framer-motion";
import { Bell, Clock, CheckCircle, AlertTriangle, BarChart3, Users, Zap, Calendar, Plus, TrendingUp, Target } from "lucide-react";
import { format, formatDistanceToNow, addDays } from "date-fns";

function ScoreBar({ value, max = 100, color = "primary" }: { value: number; max?: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
      <span className="text-xs font-mono">{value.toFixed(0)}</span>
    </div>
  );
}

export default function SponsorIntelligencePage() {
  const { sponsors } = useSponsorPipeline();
  const { followUps, pending, overdue, scheduleFollowUp, completeFollowUp } = useSponsorFollowUps();
  const { data: scores } = useSponsorScores();
  const { heatmapData } = useSponsorEngagement();
  const heatmap = heatmapData();

  const [followUpDialog, setFollowUpDialog] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");

  const handleScheduleFollowUp = () => {
    if (!selectedSponsor) return;
    scheduleFollowUp.mutate({
      sponsor_id: selectedSponsor,
      scheduled_at: addDays(new Date(), 3).toISOString(),
      notes: followUpNotes,
    }, {
      onSuccess: () => { setFollowUpDialog(false); setFollowUpNotes(""); setSelectedSponsor(""); }
    });
  };

  // Merge scores into sponsors
  const enriched = sponsors.map((s: any) => {
    const score = (scores ?? []).find((sc: any) => sc.sponsor_id === s.id);
    return { ...s, score };
  });

  // Segment counts
  const segments: Record<string, number> = {};
  enriched.forEach((s: any) => {
    const seg = s.segment || s.score?.segment || "unclassified";
    segments[seg] = (segments[seg] || 0) + 1;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            Sponsor Intelligence Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Scoring, segmentation, follow-ups, and engagement analytics</p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "Total Sponsors", value: sponsors.length, icon: Users },
            { label: "Pending Follow-ups", value: pending.length, icon: Clock },
            { label: "Overdue", value: overdue.length, icon: AlertTriangle },
            { label: "Segments", value: Object.keys(segments).length, icon: Target },
            { label: "Scored", value: (scores ?? []).length, icon: TrendingUp },
            { label: "Engagement Days", value: heatmap.length, icon: Zap },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                    </div>
                    <p className="text-xl font-bold font-mono">{kpi.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Follow-up Reminders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Follow-up Reminders
                {overdue.length > 0 && <Badge variant="destructive" className="text-[10px]">{overdue.length} overdue</Badge>}
              </CardTitle>
              <Dialog open={followUpDialog} onOpenChange={setFollowUpDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1 text-xs"><Plus className="h-3 w-3" />Schedule</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Schedule Follow-up</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <select
                      className="w-full border rounded-md p-2 text-sm bg-background"
                      value={selectedSponsor}
                      onChange={e => setSelectedSponsor(e.target.value)}
                    >
                      <option value="">Select sponsor...</option>
                      {sponsors.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.sponsor_name}</option>
                      ))}
                    </select>
                    <Input placeholder="Notes (optional)" value={followUpNotes} onChange={e => setFollowUpNotes(e.target.value)} />
                    <Button className="w-full" onClick={handleScheduleFollowUp} disabled={scheduleFollowUp.isPending}>
                      Schedule (3 days from now)
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {pending.length === 0 ? (
                <p className="text-center text-muted-foreground py-6 text-sm">No pending follow-ups.</p>
              ) : (
                <div className="space-y-2">
                  {pending.slice(0, 10).map((f: any) => {
                    const sponsor = sponsors.find((s: any) => s.id === f.sponsor_id);
                    const isOverdue = new Date(f.scheduled_at) < new Date();
                    return (
                      <div key={f.id} className={`flex items-center justify-between p-3 rounded-lg border ${isOverdue ? "border-red-500/30 bg-red-500/5" : "border-border"}`}>
                        <div className="flex items-center gap-3">
                          {isOverdue ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <Calendar className="h-4 w-4 text-muted-foreground" />}
                          <div>
                            <p className="text-sm font-medium">{sponsor?.sponsor_name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">
                              {isOverdue ? "Overdue — " : "Due "}
                              {formatDistanceToNow(new Date(f.scheduled_at), { addSuffix: true })}
                              {f.notes && ` · ${f.notes}`}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => completeFollowUp.mutate(f.id)}>
                          <CheckCircle className="h-3 w-3" /> Done
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Engagement Heatmap */}
        {heatmap.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Engagement Heatmap (Last 90 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {heatmap.slice(-90).map((d) => {
                    const intensity = Math.min(4, d.count);
                    const bg = intensity === 0 ? "bg-muted" : intensity === 1 ? "bg-primary/20" : intensity === 2 ? "bg-primary/40" : intensity === 3 ? "bg-primary/60" : "bg-primary";
                    return (
                      <div key={d.date} className={`w-3 h-3 rounded-sm ${bg}`} title={`${d.date}: ${d.count} events`} />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sponsor Scoring Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Sponsor Scoring & Segmentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs">Sponsor</TableHead>
                      <TableHead className="text-xs">Segment</TableHead>
                      <TableHead className="text-xs">Engagement</TableHead>
                      <TableHead className="text-xs">Funding Likelihood</TableHead>
                      <TableHead className="text-xs">Retention Prob.</TableHead>
                      <TableHead className="text-xs">Avg Response</TableHead>
                      <TableHead className="text-xs">Industry</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enriched.slice(0, 20).map((s: any) => (
                      <TableRow key={s.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium text-sm">{s.sponsor_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {s.score?.segment || s.segment || "unclassified"}
                          </Badge>
                        </TableCell>
                        <TableCell><ScoreBar value={s.score?.engagement_score || 0} /></TableCell>
                        <TableCell><ScoreBar value={s.score?.funding_likelihood || 0} /></TableCell>
                        <TableCell><ScoreBar value={s.score?.retention_probability || 0} /></TableCell>
                        <TableCell className="font-mono text-xs">
                          {s.score?.response_time_avg_hours ? `${s.score.response_time_avg_hours.toFixed(0)}h` : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{s.score?.industry || s.industry || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Segment Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Sponsor Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {Object.entries(segments).map(([seg, count]) => (
                  <div key={seg} className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/20">
                    <span className="text-sm font-medium capitalize">{seg}</span>
                    <Badge variant="secondary" className="text-[10px]">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
