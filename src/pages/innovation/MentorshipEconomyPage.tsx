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
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  getMentorshipListings, createMentorshipListing, getMentorshipAnalytics,
} from "@/lib/innovation/mentorshipEconomy";
import {
  GraduationCap, Plus, DollarSign, BarChart3, Star, Users, BookOpen, Heart,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { toast } from "sonner";

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(142 76% 36%)",
  "hsl(280 65% 60%)", "hsl(30 80% 55%)",
];

export default function MentorshipEconomyPage() {
  const { user, isLoading: authLoading } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: analytics, isLoading: la } = useQuery({
    queryKey: ["mentorship-analytics"],
    queryFn: getMentorshipAnalytics,
    enabled: !!user,
  });

  const { data: listings = [], isLoading: ll } = useQuery({
    queryKey: ["mentorship-listings"],
    queryFn: () => getMentorshipListings({ is_active: true }),
    enabled: !!user,
  });

  const createMut = useMutation({
    mutationFn: createMentorshipListing,
    onSuccess: () => {
      toast.success("Mentorship listing created");
      qc.invalidateQueries({ queryKey: ["mentorship-listings"] });
      qc.invalidateQueries({ queryKey: ["mentorship-analytics"] });
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
            <GraduationCap className="h-6 w-6 text-primary" />
            Mentorship Economy
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Trust-verified mentorship marketplace with structured outcome tracking.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {la ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />) : (
            <>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <Users className="h-8 w-8 text-primary shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.totalMentors ?? 0}</p><p className="text-xs text-muted-foreground">Mentors ({analytics?.activeMentors ?? 0} active)</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <Heart className="h-8 w-8 text-rose-500 shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.activeEngagements ?? 0}</p><p className="text-xs text-muted-foreground">Active Engagements</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-500 shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.totalSessions ?? 0}</p><p className="text-xs text-muted-foreground">Sessions Completed</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <Star className="h-8 w-8 text-amber-500 shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.avgRating ?? 0}</p><p className="text-xs text-muted-foreground">Avg Rating</p></div>
              </CardContent></Card>
            </>
          )}
        </div>

        {/* Chart */}
        {analytics?.byDomain && analytics.byDomain.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Mentors by Domain</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.byDomain}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="domain" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {analytics.byDomain.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Listing grid */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Available Mentors</h2>
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Offer Mentorship</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Mentorship Listing</DialogTitle></DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!user) return;
                  const fd = new FormData(e.currentTarget);
                  createMut.mutate({
                    mentor_id: user.id,
                    title: fd.get("title") as string,
                    description: fd.get("description") as string,
                    domain: fd.get("domain") as string,
                    session_rate_amount: Number(fd.get("rate") || 0),
                    session_duration_minutes: Number(fd.get("duration") || 60),
                    max_mentees: Number(fd.get("max") || 5),
                  });
                }} className="space-y-4">
                  <div><Label>Title</Label><Input name="title" required placeholder="e.g. AI Research Mentorship" /></div>
                  <div><Label>Description</Label><Textarea name="description" rows={2} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Domain</Label><Input name="domain" placeholder="e.g. ML, Biotech" /></div>
                    <div><Label>Session Rate ($)</Label><Input name="rate" type="number" min={0} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Duration (min)</Label><Input name="duration" type="number" min={15} defaultValue={60} /></div>
                    <div><Label>Max Mentees</Label><Input name="max" type="number" min={1} defaultValue={5} /></div>
                  </div>
                  <Button type="submit" disabled={createMut.isPending}>Create Listing</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {ll ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
            </div>
          ) : !listings.length ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No mentorship listings yet. Be the first mentor!</CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((l: any) => (
                <Card key={l.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{l.title}</p>
                        <p className="text-xs text-muted-foreground">User {l.mentor_id?.slice(0, 8)}…</p>
                      </div>
                      {l.domain && <Badge variant="secondary">{l.domain}</Badge>}
                    </div>
                    {l.description && <p className="text-xs text-muted-foreground line-clamp-2">{l.description}</p>}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" />{l.avg_rating || "New"}</span>
                      <span>•</span>
                      <span>{l.total_sessions} sessions</span>
                      <span>•</span>
                      <span>{l.session_duration_minutes}min</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{l.current_mentees}/{l.max_mentees} mentees</span>
                      <span className="font-medium">${l.session_rate_amount}/session</span>
                    </div>
                    <Progress value={(l.current_mentees / l.max_mentees) * 100} className="h-1.5" />
                    <div className="flex gap-1 flex-wrap">
                      {(l.expertise_areas || []).slice(0, 4).map((s: string) => (
                        <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
