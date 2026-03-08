import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, Star, Brain, Bookmark, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  getTalentProfiles, upsertTalentProfile, saveCandidate, runTalentMatching, getGTEXAnalytics, AVAILABILITY_STATUSES,
} from "@/lib/innovation/talentExchange";

export default function TalentMarketplacePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [domainFilter, setDomainFilter] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [domains, setDomains] = useState("");
  const [availability, setAvailability] = useState("available");

  const { data: talent = [], isLoading } = useQuery({
    queryKey: ["gtex-talent", domainFilter],
    queryFn: () => getTalentProfiles(domainFilter ? { domain: domainFilter } : undefined),
  });

  const { data: analytics } = useQuery({
    queryKey: ["gtex-analytics"],
    queryFn: getGTEXAnalytics,
  });

  const profileMut = useMutation({
    mutationFn: upsertTalentProfile,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gtex-talent"] }); toast.success("Profile saved"); setShowProfile(false); },
  });

  const saveMut = useMutation({
    mutationFn: ({ talentId }: { talentId: string }) => saveCandidate(user?.id || "", talentId),
    onSuccess: () => toast.success("Candidate saved"),
    onError: () => toast.error("Already saved or error"),
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" /> Talent Execution Exchange
          </h1>
          <p className="text-muted-foreground mt-1">Discover professionals by verified execution, not resumes</p>
        </div>
        <Dialog open={showProfile} onOpenChange={setShowProfile}>
          <DialogTrigger asChild><Button>Create/Edit My Profile</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Talent Profile</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              <Textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
              <Input placeholder="Skills (comma separated)" value={skills} onChange={(e) => setSkills(e.target.value)} />
              <Input placeholder="Domain expertise (comma separated)" value={domains} onChange={(e) => setDomains(e.target.value)} />
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AVAILABILITY_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button className="w-full" disabled={!displayName || profileMut.isPending}
                onClick={() => profileMut.mutate({
                  user_id: user?.id || "",
                  display_name: displayName,
                  bio,
                  skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
                  domain_expertise: domains.split(",").map((s) => s.trim()).filter(Boolean),
                  availability_status: availability,
                })}>
                {profileMut.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">{analytics?.totalTalent ?? 0}</p>
          <p className="text-sm text-muted-foreground">Professionals</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-primary">{analytics?.totalOpportunities ?? 0}</p>
          <p className="text-sm text-muted-foreground">Opportunities</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">{analytics?.totalContracts ?? 0}</p>
          <p className="text-sm text-muted-foreground">Contracts</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">{analytics?.avgTrustScore ?? 0}</p>
          <p className="text-sm text-muted-foreground">Avg Trust Score</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="discover">
        <TabsList>
          <TabsTrigger value="discover"><Search className="h-4 w-4 mr-1" /> Discover</TabsTrigger>
          <TabsTrigger value="analytics"><Star className="h-4 w-4 mr-1" /> Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          <Input placeholder="Filter by domain..." value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="max-w-sm" />

          {isLoading ? <p className="text-muted-foreground">Loading...</p> : talent.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No talent profiles yet. Create yours above.</CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {talent.map((t: any) => (
                <Card key={t.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-foreground text-lg">{t.display_name}</h3>
                        {t.bio && <p className="text-sm text-muted-foreground line-clamp-2">{t.bio}</p>}
                        <div className="flex gap-1 flex-wrap">
                          {(t.skills || []).slice(0, 4).map((s: string) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                        </div>
                        <div className="flex gap-2 items-center text-sm text-muted-foreground">
                          <Shield className="h-3 w-3" /> Trust: {t.trust_score_snapshot}
                          <span>•</span> {t.total_projects_completed} projects
                          <span>•</span> {t.execution_reliability}% reliable
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant={t.availability_status === "available" ? "default" : "outline"}>
                          {t.availability_status?.replace("_", " ")}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => saveMut.mutate({ talentId: t.id })}>
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader><CardTitle className="text-sm">Talent by Domain</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.byDomain || []}>
                  <XAxis dataKey="domain" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
