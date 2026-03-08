import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileCheck, Users, Clock, DollarSign, Plus, Shield } from "lucide-react";
import { fetchReviewRequests, getReviewAnalytics, createReviewRequest } from "@/lib/innovation/peerReviewNetwork";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function PeerReviewNetworkPage() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: "", abstract: "", research_domain: "AI", review_type: "standard", urgency: "normal", reward_amount: "0" });

  const { data: requests = [], refetch } = useQuery({
    queryKey: ["peer-review-requests"],
    queryFn: () => fetchReviewRequests(),
  });

  const analytics = getReviewAnalytics(requests);
  const domainData = Object.entries(analytics.byDomain).map(([name, value]) => ({ name, value }));

  const handleCreate = async () => {
    if (!user) return;
    try {
      await createReviewRequest({
        submitter_id: user.id,
        title: form.title,
        abstract: form.abstract,
        research_domain: form.research_domain,
        review_type: form.review_type,
        urgency: form.urgency,
        reward_amount: parseFloat(form.reward_amount) || 0,
        status: "open",
      });
      toast.success("Review request submitted");
      setIsCreateOpen(false);
      refetch();
    } catch { toast.error("Failed to submit request"); }
  };

  const urgencyColor = (u: string) => u === "urgent" ? "destructive" : u === "high" ? "secondary" : "outline";

  return (
    <>
      <Helmet><title>AI Peer Review Network | RCollab</title></Helmet>
      <div className="min-h-screen bg-background p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Peer Review Network</h1>
            <p className="text-muted-foreground">Trust-verified, AI-augmented peer review for research outputs</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Request Review</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Submit for Peer Review</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Paper/Output Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                <Textarea placeholder="Abstract" value={form.abstract} onChange={e => setForm(f => ({ ...f, abstract: e.target.value }))} />
                <Select value={form.research_domain} onValueChange={v => setForm(f => ({ ...f, research_domain: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["AI", "Biotech", "Climate", "Healthcare", "Engineering", "Physics", "Chemistry"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-4">
                  <Select value={form.review_type} onValueChange={v => setForm(f => ({ ...f, review_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="expedited">Expedited</SelectItem>
                      <SelectItem value="double_blind">Double Blind</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={form.urgency} onValueChange={v => setForm(f => ({ ...f, urgency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input type="number" placeholder="Reviewer Reward ($)" value={form.reward_amount} onChange={e => setForm(f => ({ ...f, reward_amount: e.target.value }))} />
                <Button onClick={handleCreate} className="w-full">Submit for Review</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Requests", value: analytics.total, icon: FileCheck },
            { label: "Open Reviews", value: analytics.open, icon: Clock },
            { label: "Completed", value: analytics.completed, icon: Users },
            { label: "Total Rewards", value: `$${analytics.totalRewards.toLocaleString()}`, icon: DollarSign },
          ].map(kpi => (
            <Card key={kpi.label}>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10"><kpi.icon className="h-5 w-5 text-primary" /></div>
                <div><p className="text-sm text-muted-foreground">{kpi.label}</p><p className="text-2xl font-bold text-foreground">{kpi.value}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="requests">
          <TabsList><TabsTrigger value="requests">Review Requests</TabsTrigger><TabsTrigger value="analytics">Analytics</TabsTrigger></TabsList>
          <TabsContent value="requests" className="space-y-4">
            {requests.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No review requests yet. Submit your research for peer review.</CardContent></Card>
            ) : requests.map(req => (
              <Card key={req.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground text-lg">{req.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{req.abstract}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{req.research_domain}</Badge>
                        <Badge variant="outline">{req.review_type.replace(/_/g, " ")}</Badge>
                        <Badge variant={urgencyColor(req.urgency)}>{req.urgency}</Badge>
                        <Badge variant="outline"><Shield className="inline h-3 w-3 mr-1" />Min Trust: {req.min_reviewer_trust_score}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">${Number(req.reward_amount).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Reward</p>
                      <Badge variant="outline" className="mt-2">{req.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="analytics">
            <Card><CardHeader><CardTitle>Reviews by Domain</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={domainData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart>
              </ResponsiveContainer>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
