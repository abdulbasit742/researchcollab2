import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSponsorPipeline, useSponsorROI } from "@/hooks/useRevenueEngine";
import { DollarSign, Target, Users, TrendingUp, Briefcase, Clock, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function SponsorROIDashboardPage() {
  const { sponsors } = useSponsorPipeline();
  const funded = sponsors.filter((s: any) => ["funded", "repeat_funder"].includes(s.stage));
  const [selectedId, setSelectedId] = useState<string>("");
  const { data: roi, isLoading } = useSponsorROI(selectedId || undefined);

  const chartData = roi?.sponsorships?.map((s: any, i: number) => ({
    name: `Project ${i + 1}`,
    pledged: Number(s.pledge_amount || 0),
    funded: Number(s.funded_amount || 0),
  })) ?? [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Sponsor ROI Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Measurable return for every sponsor — capital deployed, completions, hiring</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <label className="text-xs text-muted-foreground block mb-2">Select Sponsor</label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger><SelectValue placeholder="Choose a funded sponsor..." /></SelectTrigger>
              <SelectContent>
                {funded.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>{s.sponsor_name} — {s.organization || "N/A"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedId && !isLoading && roi && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Capital Deployed", value: `PKR ${(roi.totalDeployed / 1000).toFixed(0)}K`, icon: DollarSign },
                { label: "Projects Completed", value: `${roi.completedProjects}/${roi.totalProjects}`, icon: CheckCircle },
                { label: "Completion Rate", value: `${roi.completionRate.toFixed(0)}%`, icon: Target },
                { label: "Hiring Conversion", value: `${roi.hiringConversion.toFixed(0)}%`, icon: Users },
              ].map(kpi => {
                const Icon = kpi.icon;
                return (
                  <Card key={kpi.label}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{kpi.label}</span>
                      </div>
                      <p className="text-2xl font-bold font-mono">{kpi.value}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {chartData.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Funding Distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} className="text-xs" />
                      <Tooltip formatter={(v: number) => `PKR ${v.toLocaleString()}`} />
                      <Bar dataKey="pledged" fill="hsl(var(--muted-foreground))" radius={[4,4,0,0]} name="Pledged" />
                      <Bar dataKey="funded" fill="hsl(var(--primary))" radius={[4,4,0,0]} name="Funded" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle className="text-base">Hiring Conversions</CardTitle></CardHeader>
              <CardContent>
                {roi.hirings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No hiring records yet for this sponsor.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead>Salary Band</TableHead>
                        <TableHead>Offer Made</TableHead>
                        <TableHead>Hired</TableHead>
                        <TableHead>Retention</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roi.hirings.map((h: any) => (
                        <TableRow key={h.id}>
                          <TableCell className="font-medium">{h.role_title || "—"}</TableCell>
                          <TableCell>{h.salary_band || "—"}</TableCell>
                          <TableCell><Badge variant={h.offer_made ? "default" : "outline"}>{h.offer_made ? "Yes" : "No"}</Badge></TableCell>
                          <TableCell><Badge variant={h.hired ? "default" : "secondary"}>{h.hired ? "Hired" : "Pending"}</Badge></TableCell>
                          <TableCell>{h.retention_months ? `${h.retention_months}mo` : "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {selectedId && isLoading && (
          <div className="text-center py-12 text-muted-foreground">Loading ROI data...</div>
        )}

        {!selectedId && (
          <div className="text-center py-12 text-muted-foreground">Select a sponsor above to view their ROI metrics.</div>
        )}
      </div>
    </AdminLayout>
  );
}
