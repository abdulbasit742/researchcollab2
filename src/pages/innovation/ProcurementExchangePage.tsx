import { useState } from "react";
import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getProcurementRequests, createProcurementRequest, getProcurementAnalytics,
  PROCUREMENT_CATEGORIES,
} from "@/lib/innovation/procurementExchange";
import {
  ShoppingCart, Plus, DollarSign, BarChart3, Package, Clock, FileText,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { toast } from "sonner";

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(142 76% 36%)",
  "hsl(280 65% 60%)", "hsl(30 80% 55%)",
];

const statusBadge: Record<string, string> = {
  open: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  evaluating: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  awarded: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  closed: "bg-muted text-muted-foreground",
};

export default function ProcurementExchangePage() {
  const { user, isLoading: authLoading } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: analytics, isLoading: la } = useQuery({
    queryKey: ["procurement-analytics"],
    queryFn: getProcurementAnalytics,
    enabled: !!user,
  });

  const { data: requests = [], isLoading: lr } = useQuery({
    queryKey: ["procurement-requests"],
    queryFn: () => getProcurementRequests(),
    enabled: !!user,
  });

  const createMut = useMutation({
    mutationFn: createProcurementRequest,
    onSuccess: () => {
      toast.success("Procurement request posted");
      qc.invalidateQueries({ queryKey: ["procurement-requests"] });
      qc.invalidateQueries({ queryKey: ["procurement-analytics"] });
      setShowCreate(false);
    },
    onError: () => toast.error("Failed"),
  });

  if (!authLoading && !user) return <Navigate to="/" replace />;

  return (
    <MainLayout>
      <div className="container py-6 max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Institutional Procurement Exchange
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Equipment, software, and services marketplace for research institutions with RFQ workflow.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {la ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />) : (
            <>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.totalRequests ?? 0}</p><p className="text-xs text-muted-foreground">Total RFQs ({analytics?.openRequests ?? 0} open)</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-emerald-500 shrink-0" />
                <div><p className="text-2xl font-bold">${((analytics?.totalBudget ?? 0) / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Total Budget</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-500 shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.totalBids ?? 0}</p><p className="text-xs text-muted-foreground">Bids Submitted</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-amber-500 shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.byCategory?.length ?? 0}</p><p className="text-xs text-muted-foreground">Categories</p></div>
              </CardContent></Card>
            </>
          )}
        </div>

        {analytics?.byCategory && analytics.byCategory.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Requests by Category</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.byCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {analytics.byCategory.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Procurement Requests</h2>
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Post RFQ</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Post Procurement Request</DialogTitle></DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!user) return;
                  const fd = new FormData(e.currentTarget);
                  createMut.mutate({
                    requester_id: user.id,
                    title: fd.get("title") as string,
                    description: fd.get("description") as string,
                    category: fd.get("category") as string,
                    budget_min: Number(fd.get("min") || 0),
                    budget_max: Number(fd.get("max") || 0),
                  });
                }} className="space-y-4">
                  <div><Label>Title</Label><Input name="title" required /></div>
                  <div><Label>Description</Label><Textarea name="description" rows={3} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Category</Label>
                      <Select name="category"><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{PROCUREMENT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Budget Min ($)</Label><Input name="min" type="number" min={0} /></div>
                  </div>
                  <div><Label>Budget Max ($)</Label><Input name="max" type="number" min={0} /></div>
                  <Button type="submit" disabled={createMut.isPending}>Post Request</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {lr ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />) : !requests.length ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No procurement requests yet.</CardContent></Card>
          ) : requests.map((r: any) => (
            <Card key={r.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  <span className="font-medium">{r.title}</span>
                  <Badge variant="outline" className={statusBadge[r.status] ?? ""}>{r.status}</Badge>
                  <Badge variant="secondary">{r.category}</Badge>
                </div>
                {r.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{r.description}</p>}
                <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                  <span>${(r.budget_min || 0).toLocaleString()} - ${(r.budget_max || 0).toLocaleString()}</span>
                  <span>{r.bid_count || 0} bids</span>
                  {r.deadline && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(r.deadline).toLocaleDateString()}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
