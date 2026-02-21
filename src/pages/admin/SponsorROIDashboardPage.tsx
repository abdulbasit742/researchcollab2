import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSponsorPipeline, useSponsorROI } from "@/hooks/useRevenueEngine";
import { DollarSign, Target, Users, TrendingUp, CheckCircle, Briefcase, Award, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useReportExport } from "@/hooks/useReportExport";
import { SponsorROIReport } from "@/components/reports/SponsorROIReport";

function RingGauge({ value, size = 80, label }: { value: number; size?: number; label: string }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={6} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke="hsl(var(--primary))" strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (circ * pct / 100) }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
        <text x={size/2} y={size/2} textAnchor="middle" dy="0.35em" className="fill-foreground text-sm font-bold font-mono">
          {pct.toFixed(0)}%
        </text>
      </svg>
      <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function SponsorROIDashboardPage() {
  const { sponsors } = useSponsorPipeline();
  const funded = sponsors.filter((s: any) => ["funded", "repeat_funder"].includes(s.stage));
  const [selectedId, setSelectedId] = useState<string>("");
  const { data: roi, isLoading } = useSponsorROI(selectedId || undefined);
  const { exportToPDF } = useReportExport();

  const chartData = roi?.sponsorships?.map((s: any, i: number) => ({
    name: `P${i + 1}`,
    pledged: Number(s.pledge_amount || 0),
    funded: Number(s.funded_amount || 0),
  })) ?? [];

  const selectedSponsor = sponsors.find((s: any) => s.id === selectedId);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            Sponsor ROI Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Measurable return for every sponsor</p>
        </motion.div>

        {selectedId && roi && (
          <Button variant="outline" size="sm" onClick={() => exportToPDF(`Sponsor ROI - ${selectedSponsor?.sponsor_name || "Report"}`)} className="gap-2 print:hidden">
            <Printer className="h-4 w-4" />Export Report
          </Button>
        )}

        {/* Sponsor Selector */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <Award className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Choose a funded sponsor..." /></SelectTrigger>
                  <SelectContent>
                    {funded.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="font-medium">{s.sponsor_name}</span>
                        <span className="text-muted-foreground ml-2">— {s.organization || "N/A"}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedSponsor && (
                <Badge variant="outline" className="text-xs">
                  {selectedSponsor.stage === "repeat_funder" ? "🔄 Repeat Funder" : "💰 Funded"}
                </Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedId && !isLoading && roi && (
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* KPIs + Gauges */}
              <div className="grid grid-cols-6 gap-3">
                <Card className="col-span-2">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Capital Deployed</p>
                      <p className="text-2xl font-bold font-mono">PKR {(roi.totalDeployed / 1000).toFixed(0)}K</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-2 flex items-center justify-center">
                  <CardContent className="p-4 flex gap-6">
                    <RingGauge value={roi.completionRate} label="Completion" />
                    <RingGauge value={roi.hiringConversion} label="Hiring" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-2xl font-bold font-mono">{roi.completedProjects}/{roi.totalProjects}</p>
                    <p className="text-[9px] text-muted-foreground uppercase">Completed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-2xl font-bold font-mono">{roi.hiredCount}</p>
                    <p className="text-[9px] text-muted-foreground uppercase">Hires</p>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              {chartData.length > 0 && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Funding Distribution</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={chartData} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} className="text-xs" />
                        <Tooltip formatter={(v: number) => `PKR ${v.toLocaleString()}`} />
                        <Bar dataKey="pledged" fill="hsl(var(--muted-foreground)/0.3)" radius={[4,4,0,0]} name="Pledged" />
                        <Bar dataKey="funded" fill="hsl(var(--primary))" radius={[4,4,0,0]} name="Funded" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Hiring Table */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Briefcase className="h-4 w-4" />Hiring Conversions</CardTitle></CardHeader>
                <CardContent>
                  {roi.hirings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No hiring records yet for this sponsor.</p>
                  ) : (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="text-xs">Role</TableHead>
                            <TableHead className="text-xs">Salary Band</TableHead>
                            <TableHead className="text-xs">Offer</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs">Retention</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {roi.hirings.map((h: any) => (
                            <TableRow key={h.id} className="hover:bg-muted/20">
                              <TableCell className="font-medium">{h.role_title || "—"}</TableCell>
                              <TableCell className="font-mono text-sm">{h.salary_band || "—"}</TableCell>
                              <TableCell><Badge variant={h.offer_made ? "default" : "outline"} className="text-[10px]">{h.offer_made ? "✓ Yes" : "No"}</Badge></TableCell>
                              <TableCell><Badge variant={h.hired ? "default" : "secondary"} className="text-[10px]">{h.hired ? "✓ Hired" : "Pending"}</Badge></TableCell>
                              <TableCell className="font-mono text-sm">{h.retention_months ? `${h.retention_months}mo` : "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedId && isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-muted-foreground">
            Loading ROI data...
          </motion.div>
        )}

        {!selectedId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Award className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Select a funded sponsor above to view their ROI metrics</p>
          </motion.div>
        )}
      </div>

      {/* Print-only report */}
      {selectedId && roi && selectedSponsor && (
        <SponsorROIReport
          sponsorName={selectedSponsor.sponsor_name}
          organization={selectedSponsor.organization}
          totalDeployed={roi.totalDeployed}
          totalProjects={roi.totalProjects}
          completedProjects={roi.completedProjects}
          completionRate={roi.completionRate}
          hiringConversion={roi.hiringConversion}
          hiredCount={roi.hiredCount}
          offersM={roi.offersM}
          hirings={roi.hirings}
        />
      )}
    </AdminLayout>
  );
}
