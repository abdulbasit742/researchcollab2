import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useHiringConversions } from "@/hooks/useRevenueEngine";
import { Users, Target, TrendingUp, Clock, CheckCircle, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function HiringConversionPage() {
  const { hirings, isLoading, updateHiring, stats } = useHiringConversions();
  const s = stats();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            Hiring Conversion Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Turn execution into employment proof — track every FYP-to-hire conversion</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Records", value: s.total, icon: Users },
            { label: "Offers Made", value: s.totalOffers, icon: Target },
            { label: "Hired", value: s.totalHired, icon: CheckCircle },
            { label: "Conversion Rate", value: `${s.conversionRate.toFixed(0)}%`, icon: TrendingUp },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{kpi.label}</span>
                    </div>
                    <p className="text-2xl font-bold font-mono">{kpi.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">All Conversion Records</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : hirings.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No hiring records yet. Conversions are prompted when FYPs complete.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Salary Band</TableHead>
                    <TableHead>Offer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Retention</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hirings.map((h: any) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium">{h.role_title || "—"}</TableCell>
                      <TableCell>{h.salary_band || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={h.offer_made ? "default" : "outline"}>
                          {h.offer_made ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={h.hired ? "default" : "secondary"}>
                          {h.hired ? "Hired" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{h.retention_months ? `${h.retention_months}mo` : "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(h.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        {!h.offer_made && (
                          <Button size="sm" variant="ghost" className="text-xs"
                            onClick={() => updateHiring.mutate({ id: h.id, offer_made: true, offer_date: new Date().toISOString() })}>
                            Mark Offer
                          </Button>
                        )}
                        {h.offer_made && !h.hired && (
                          <Button size="sm" variant="ghost" className="text-xs"
                            onClick={() => updateHiring.mutate({ id: h.id, hired: true, hired_date: new Date().toISOString() })}>
                            Mark Hired
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
