import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useHiringConversions } from "@/hooks/useRevenueEngine";
import { Users, Target, TrendingUp, CheckCircle, UserPlus, ArrowRight, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

function ConversionFunnel({ total, offers, hired }: { total: number; offers: number; hired: number }) {
  const steps = [
    { label: "FYP Completed", value: total, emoji: "📋" },
    { label: "Offer Made", value: offers, emoji: "📨" },
    { label: "Hired", value: hired, emoji: "🎉" },
  ];
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2">
          <motion.div
            className="text-center px-5 py-3 rounded-xl bg-primary/5 border border-primary/15"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.12, type: "spring" }}
          >
            <span className="text-xl">{step.emoji}</span>
            <p className="text-2xl font-bold font-mono mt-1">{step.value}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{step.label}</p>
          </motion.div>
          {i < steps.length - 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.12 }}>
              <ArrowRight className="h-5 w-5 text-primary/30" />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function HiringConversionPage() {
  const { hirings, isLoading, updateHiring, stats } = useHiringConversions();
  const s = stats();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            Hiring Conversion Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Turn execution into employment proof</p>
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConversionFunnel total={s.total} offers={s.totalOffers} hired={s.totalHired} />
            </CardContent>
          </Card>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Records", value: s.total, icon: Users, sub: "tracked" },
            { label: "Offers Made", value: s.totalOffers, icon: Target, sub: "formal" },
            { label: "Hired", value: s.totalHired, icon: CheckCircle, sub: "confirmed" },
            { label: "Conversion Rate", value: `${s.conversionRate.toFixed(0)}%`, icon: TrendingUp, sub: "offer → hire" },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div key={kpi.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.04 }}>
                <Card className="group hover:border-primary/30 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                    </div>
                    <p className="text-2xl font-bold font-mono">{kpi.value}</p>
                    <p className="text-[9px] text-muted-foreground">{kpi.sub}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader><CardTitle className="text-base">All Conversion Records</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8 text-muted-foreground">Loading...</p>
              ) : hirings.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No hiring records yet. Conversions are prompted when FYPs complete.</p>
                </div>
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
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {hirings.map((h: any, i: number) => (
                          <motion.tr
                            key={h.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                          >
                            <TableCell className="font-medium">{h.role_title || "—"}</TableCell>
                            <TableCell className="font-mono text-sm">{h.salary_band || "—"}</TableCell>
                            <TableCell>
                              <Badge variant={h.offer_made ? "default" : "outline"} className="text-[10px]">
                                {h.offer_made ? "✓ Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={h.hired ? "default" : "secondary"} className="text-[10px]">
                                {h.hired ? "✓ Hired" : "Pending"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{h.retention_months ? `${h.retention_months}mo` : "—"}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{format(new Date(h.created_at), "MMM d, yyyy")}</TableCell>
                            <TableCell>
                              {!h.offer_made && (
                                <Button size="sm" variant="ghost" className="text-xs gap-1 hover:bg-primary/10 hover:text-primary"
                                  onClick={() => updateHiring.mutate({ id: h.id, offer_made: true, offer_date: new Date().toISOString() })}>
                                  <ArrowRight className="h-3 w-3" /> Mark Offer
                                </Button>
                              )}
                              {h.offer_made && !h.hired && (
                                <Button size="sm" variant="ghost" className="text-xs gap-1 hover:bg-primary/10 hover:text-primary"
                                  onClick={() => updateHiring.mutate({ id: h.id, hired: true, hired_date: new Date().toISOString() })}>
                                  <CheckCircle className="h-3 w-3" /> Mark Hired
                                </Button>
                              )}
                            </TableCell>
                          </motion.tr>
                        ))}
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
