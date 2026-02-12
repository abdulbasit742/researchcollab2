import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/lib/currency";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, DollarSign, TrendingUp, FileText } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

export default function InstitutionContractPage() {
  const { id } = useParams<{ id: string }>();

  const { data: contracts } = useQuery({
    queryKey: ["institution-contracts", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("institutional_contracts")
        .select("*")
        .eq("institution_id", id!)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!id,
  });

  const { data: fees } = useQuery({
    queryKey: ["institution-fees", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("platform_fees")
        .select("*")
        .eq("institution_id", id!)
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
    enabled: !!id,
  });

  const activeContract = contracts?.find(c => c.status === "active");
  const totalRevenue = fees?.reduce((s, f) => s + Number(f.gross_amount), 0) || 0;
  const totalFees = fees?.reduce((s, f) => s + Number(f.platform_fee_amount), 0) || 0;
  const avgTrust = activeContract?.trust_average || 0;

  const growthData = [
    { month: "Q1", revenue: totalRevenue * 0.4, fees: totalFees * 0.4 },
    { month: "Q2", revenue: totalRevenue * 0.65, fees: totalFees * 0.65 },
    { month: "Q3", revenue: totalRevenue * 0.85, fees: totalFees * 0.85 },
    { month: "Q4", revenue: totalRevenue, fees: totalFees },
  ];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6" /> Institutional Contract
          </h1>
          <p className="text-muted-foreground">Revenue, fees, and economic growth overview</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPKR(totalRevenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fees Owed</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPKR(totalFees)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Trust Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Number(avgTrust).toFixed(0)}</div>
              <Progress value={Number(avgTrust)} className="mt-1" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Contract Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={activeContract ? "default" : "secondary"} className="text-lg capitalize">
                {activeContract?.status || "No Active Contract"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Active Contract Details */}
        {activeContract && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{activeContract.contract_type.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Base Fee</p>
                <p className="font-medium">{formatPKR(Number(activeContract.base_fee))}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Revenue Share</p>
                <p className="font-medium">{Number(activeContract.revenue_share_percentage || 0)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Period</p>
                <p className="font-medium">{activeContract.start_date} → {activeContract.end_date || "Ongoing"}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Economic Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: number) => formatPKR(v)} />
                <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" />
                <Bar dataKey="fees" name="Fees" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* All Contracts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contract History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Base Fee</TableHead>
                  <TableHead>Rev Share</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(contracts || []).map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="capitalize">{c.contract_type.replace("_", " ")}</TableCell>
                    <TableCell>{formatPKR(Number(c.base_fee))}</TableCell>
                    <TableCell>{Number(c.revenue_share_percentage || 0)}%</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{c.status}</Badge></TableCell>
                    <TableCell className="text-xs">{c.start_date} → {c.end_date || "Ongoing"}</TableCell>
                  </TableRow>
                ))}
                {(!contracts || contracts.length === 0) && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No contracts found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
