import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, GraduationCap, Users, Clock, DollarSign, Shield,
  Rocket, Send, CheckCircle, FileText, Building2,
} from "lucide-react";
import { useFYPTopic, useFYPSponsorships, useFYPApplications, useFYPMilestoneTemplates } from "@/hooks/useFYP";
import { useApplyToFYP, useSponsorFYP } from "@/hooks/useFYPActions";
import { useAuth } from "@/contexts/AuthContext";
import { formatPKR } from "@/lib/currency";

export default function FYPTopicDetailPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const { user } = useAuth();
  const { data: topic, isLoading } = useFYPTopic(topicId);
  const { data: sponsorships = [] } = useFYPSponsorships(topicId);
  const { data: applications = [] } = useFYPApplications(topicId);
  const { data: milestones = [] } = useFYPMilestoneTemplates(topicId);
  const applyMutation = useApplyToFYP();
  const sponsorMutation = useSponsorFYP();

  const [applyOpen, setApplyOpen] = useState(false);
  const [sponsorOpen, setSponsorOpen] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [skills, setSkills] = useState("");
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [ipAgreement, setIpAgreement] = useState("shared");

  const totalPledged = sponsorships.reduce((s: number, sp: any) => s + Number(sp.pledge_amount || 0), 0);
  const fundPct = topic?.estimated_budget > 0 ? (totalPledged / topic.estimated_budget) * 100 : 0;
  const hasApplied = applications.some((a: any) => a.user_id === user?.id);

  const handleApply = () => {
    if (!topicId) return;
    applyMutation.mutate(
      {
        topic_id: topicId,
        cover_note: coverNote.trim() || undefined,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      },
      { onSuccess: () => { setApplyOpen(false); setCoverNote(""); setSkills(""); } }
    );
  };

  const handleSponsor = () => {
    if (!topicId || !pledgeAmount) return;
    sponsorMutation.mutate(
      {
        topic_id: topicId,
        pledge_amount: Number(pledgeAmount),
        ip_agreement: ipAgreement,
      },
      { onSuccess: () => { setSponsorOpen(false); setPledgeAmount(""); } }
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-48" />
        </div>
      </MainLayout>
    );
  }

  if (!topic) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold mb-2">Topic Not Found</h2>
          <Link to="/fyp"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to FYP Hub</Button></Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Helmet>
        <title>{topic.title} | FYP Project | RCollab</title>
        <meta name="description" content={topic.description?.slice(0, 160) || `FYP project: ${topic.title}`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back */}
        <Link to="/fyp" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to FYP Hub
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{topic.title}</h1>
              <Badge variant="outline">{topic.status}</Badge>
            </div>
            {topic.funding_type === "sponsor_ready" && (
              <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30">
                <DollarSign className="h-3 w-3 mr-1" /> Sponsor-Ready
              </Badge>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {topic.status === "open" && (
              <>
                <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={hasApplied}>
                      {hasApplied ? <><CheckCircle className="h-4 w-4 mr-1" /> Applied</> : <><Rocket className="h-4 w-4 mr-1" /> Apply</>}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply to "{topic.title}"</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div>
                        <Label>Why are you a good fit? *</Label>
                        <Textarea value={coverNote} onChange={(e) => setCoverNote(e.target.value)} placeholder="Describe your relevant experience and motivation..." rows={4} />
                      </div>
                      <div>
                        <Label>Your Skills (comma-separated)</Label>
                        <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Python, Machine Learning..." />
                      </div>
                      <Button onClick={handleApply} disabled={!coverNote.trim() || applyMutation.isPending} className="w-full">
                        <Send className="h-4 w-4 mr-2" /> {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {topic.funding_type === "sponsor_ready" && (
                  <Dialog open={sponsorOpen} onOpenChange={setSponsorOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline"><DollarSign className="h-4 w-4 mr-1" /> Sponsor</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Sponsor "{topic.title}"</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        <div>
                          <Label>Pledge Amount (PKR) *</Label>
                          <Input type="number" value={pledgeAmount} onChange={(e) => setPledgeAmount(e.target.value)} placeholder="e.g. 50000" min={1000} />
                        </div>
                        <div>
                          <Label>IP Agreement</Label>
                          <Select value={ipAgreement} onValueChange={setIpAgreement}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="shared">Shared IP</SelectItem>
                              <SelectItem value="sponsor_owns">Sponsor Owns</SelectItem>
                              <SelectItem value="institution_owns">Institution Owns</SelectItem>
                              <SelectItem value="open_source">Open Source</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleSponsor} disabled={!pledgeAmount || sponsorMutation.isPending} className="w-full">
                          <Shield className="h-4 w-4 mr-2" /> {sponsorMutation.isPending ? "Pledging..." : "Pledge Sponsorship"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Project Description</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{topic.description || topic.scope || "No description provided."}</p>
              </CardContent>
            </Card>

            {topic.skill_requirements?.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Required Skills</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {topic.skill_requirements.map((skill: string, i: number) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {milestones.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Milestone Roadmap</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {milestones.map((m: any, i: number) => (
                      <div key={m.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{m.title}</p>
                          {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
                          {m.weight_pct > 0 && <Badge variant="outline" className="text-xs mt-1">{m.weight_pct}% of budget</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {applications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Applications ({applications.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {applications.map((app: any) => (
                      <div key={app.id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">{app.status}</Badge>
                          <span className="text-xs text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</span>
                        </div>
                        {app.cover_note && <p className="text-sm text-muted-foreground">{app.cover_note}</p>}
                        {app.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {app.skills.map((s: string, i: number) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Max {topic.max_team_size || "N/A"} members</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{topic.estimated_duration || "TBD"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{formatPKR(topic.estimated_budget || 0)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>IP: {topic.ip_ownership || "TBD"}</span>
                </div>
                {topic.nda_required && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>NDA Required</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {topic.funding_type === "sponsor_ready" && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Funding Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatPKR(totalPledged)} pledged</span>
                      <span>{Math.min(fundPct, 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={Math.min(fundPct, 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {sponsorships.length} sponsor{sponsorships.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Applications</span>
                  <span className="font-medium">{applications.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Milestones</span>
                  <span className="font-medium">{milestones.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
