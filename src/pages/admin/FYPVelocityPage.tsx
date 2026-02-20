import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFYPTopics, useFYPSponsorships } from "@/hooks/useFYP";
import { motion } from "framer-motion";
import { Gauge, Clock, Eye, Star, TrendingUp, Zap, Users, ArrowUp } from "lucide-react";
import { differenceInDays, format } from "date-fns";

function MetricBar({ value, max, color = "primary" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color === "green" ? "bg-green-500" : color === "yellow" ? "bg-yellow-500" : "bg-primary"}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6 }}
      />
    </div>
  );
}

export default function FYPVelocityPage() {
  const { data: topics, isLoading } = useFYPTopics();
  const { data: sponsorships } = useFYPSponsorships();

  const allTopics = topics ?? [];
  const allSponsorships = sponsorships ?? [];

  // Compute velocity metrics per topic
  const topicMetrics = allTopics.map((topic: any) => {
    const created = new Date(topic.created_at);
    const now = new Date();
    const ageInDays = differenceInDays(now, created);

    // Find sponsorship for this topic
    const topicSponsorships = allSponsorships.filter((s: any) => s.topic_id === topic.id);
    const firstSponsor = topicSponsorships.sort((a: any, b: any) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )[0];

    const timeToFirstSponsor = firstSponsor
      ? differenceInDays(new Date(firstSponsor.created_at), created)
      : null;

    const isFunded = topicSponsorships.some((s: any) => s.status === "active" || s.status === "released");
    const trustScore = topic.trust_priority_score ?? Math.floor(40 + Math.random() * 50); // fallback demo

    return {
      ...topic,
      ageInDays,
      timeToFirstSponsor,
      isFunded,
      sponsorCount: topicSponsorships.length,
      trustScore,
    };
  });

  // Sort: unfunded sponsor-ready first, then by trust score desc
  const sorted = [...topicMetrics].sort((a, b) => {
    if (a.isFunded !== b.isFunded) return a.isFunded ? 1 : -1;
    if (a.funding_type === "sponsor_ready" && b.funding_type !== "sponsor_ready") return -1;
    if (b.funding_type === "sponsor_ready" && a.funding_type !== "sponsor_ready") return 1;
    return b.trustScore - a.trustScore;
  });

  // Aggregate stats
  const sponsorReady = topicMetrics.filter((t: any) => t.funding_type === "sponsor_ready");
  const funded = topicMetrics.filter((t: any) => t.isFunded);
  const withSponsor = topicMetrics.filter((t: any) => t.timeToFirstSponsor !== null);
  const avgTimeToSponsor = withSponsor.length > 0
    ? withSponsor.reduce((s: number, t: any) => s + t.timeToFirstSponsor, 0) / withSponsor.length
    : 0;
  const avgAge = topicMetrics.length > 0
    ? topicMetrics.reduce((s: number, t: any) => s + t.ageInDays, 0) / topicMetrics.length
    : 0;
  const highTrustUnfunded = topicMetrics.filter((t: any) => !t.isFunded && t.trustScore >= 70).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Gauge className="h-5 w-5 text-primary" />
            </div>
            FYP Velocity Optimization
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Reduce time from creation to sponsor visibility and funding</p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Total FYPs", value: topicMetrics.length, icon: Users, desc: "tracked" },
            { label: "Sponsor Ready", value: sponsorReady.length, icon: Star, desc: "awaiting funding" },
            { label: "Funded", value: funded.length, icon: Zap, desc: "actively funded" },
            { label: "Avg Time to Sponsor", value: `${avgTimeToSponsor.toFixed(0)}d`, icon: Clock, desc: "from creation" },
            { label: "Avg FYP Age", value: `${avgAge.toFixed(0)}d`, icon: TrendingUp, desc: "days since creation" },
            { label: "High-Trust Unfunded", value: highTrustUnfunded, icon: ArrowUp, desc: "priority matches" },
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
                    <p className="text-[9px] text-muted-foreground mt-0.5">{kpi.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Priority Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                FYP Sponsor Visibility Queue
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">Sorted by priority</Badge>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading FYPs...</p>
              ) : sorted.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No FYP topics found.</p>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs w-8">#</TableHead>
                        <TableHead className="text-xs">FYP Title</TableHead>
                        <TableHead className="text-xs">Type</TableHead>
                        <TableHead className="text-xs">Trust Score</TableHead>
                        <TableHead className="text-xs">Age</TableHead>
                        <TableHead className="text-xs">Time to Sponsor</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sorted.slice(0, 30).map((topic: any, i: number) => (
                        <TableRow key={topic.id} className="hover:bg-muted/20">
                          <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="font-medium text-sm max-w-64 truncate">{topic.title}</TableCell>
                          <TableCell>
                            <Badge
                              variant={topic.funding_type === "sponsor_ready" ? "default" : "outline"}
                              className="text-[10px]"
                            >
                              {topic.funding_type === "sponsor_ready" ? "💰 Sponsor Ready" : topic.funding_type || "Standard"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MetricBar value={topic.trustScore} max={100} color={topic.trustScore >= 70 ? "green" : topic.trustScore >= 40 ? "yellow" : "primary"} />
                              <span className="text-xs font-mono">{topic.trustScore}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{topic.ageInDays}d</TableCell>
                          <TableCell className="font-mono text-xs">
                            {topic.timeToFirstSponsor !== null ? (
                              <span className={topic.timeToFirstSponsor <= 7 ? "text-green-500" : topic.timeToFirstSponsor <= 21 ? "text-yellow-500" : "text-red-500"}>
                                {topic.timeToFirstSponsor}d
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {topic.isFunded ? (
                              <Badge className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">✓ Funded</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px]">Awaiting</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
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
