import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Users, DollarSign, Clock, Shield, Rocket, Search } from "lucide-react";
import { useFYPTopics, useFYPSponsorships } from "@/hooks/useFYP";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { formatPKR } from "@/lib/currency";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  open: "bg-green-500/10 text-green-700 border-green-500/30",
  assigned: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  in_progress: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  completed: "bg-primary/10 text-primary border-primary/30",
};

const FYPBrowsePage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const { data: topics = [], isLoading } = useFYPTopics({ status: filter === "all" ? undefined : filter });
  const { data: sponsorships = [] } = useFYPSponsorships();

  const filtered = topics.filter((t: any) =>
    !search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getSponsorInfo = (topicId: string) => {
    const topicSponsors = sponsorships.filter((s: any) => s.topic_id === topicId);
    const totalPledged = topicSponsors.reduce((s: number, sp: any) => s + Number(sp.pledge_amount || 0), 0);
    return { count: topicSponsors.length, totalPledged };
  };

  return (
    <>
      <Helmet><title>FYP Projects | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">FYP Project Hub</h1>
              <p className="text-muted-foreground">Browse, apply, and execute Final Year Projects with escrow-backed funding</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 my-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search FYP topics..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "open", "assigned", "in_progress", "completed"].map(s => (
                <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
                  {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
                </Button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card><CardContent className="pt-4">
              <div className="text-3xl font-bold">{topics.length}</div>
              <div className="text-sm text-muted-foreground">Total FYPs</div>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <div className="text-3xl font-bold text-green-600">{topics.filter((t: any) => t.status === "open").length}</div>
              <div className="text-sm text-muted-foreground">Open for Teams</div>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <div className="text-3xl font-bold text-amber-600">{topics.filter((t: any) => t.funding_type === "sponsor_ready").length}</div>
              <div className="text-sm text-muted-foreground">Sponsor-Ready</div>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <div className="text-3xl font-bold text-primary">{formatPKR(sponsorships.reduce((s: number, sp: any) => s + Number(sp.pledge_amount || 0), 0))}</div>
              <div className="text-sm text-muted-foreground">Total Pledged</div>
            </CardContent></Card>
          </div>

          {/* Topic Cards */}
          <div className="space-y-4">
            {isLoading ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">Loading FYP topics...</CardContent></Card>
            ) : filtered.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No FYP topics found.</p>
              </CardContent></Card>
            ) : filtered.map((topic: any) => {
              const sponsor = getSponsorInfo(topic.id);
              const fundPct = topic.estimated_budget > 0 ? (sponsor.totalPledged / topic.estimated_budget) * 100 : 0;
              return (
                <Card key={topic.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{topic.title}</CardTitle>
                          {topic.funding_type === "sponsor_ready" && (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30 text-xs">
                              <DollarSign className="h-3 w-3 mr-1" />Sponsor-Ready
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{topic.description || topic.scope}</p>
                      </div>
                      <Badge variant="outline" className={statusColors[topic.status] || ""}>{topic.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Max {topic.max_team_size} members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{topic.estimated_duration || "TBD"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{formatPKR(topic.estimated_budget || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span>IP: {topic.ip_ownership}</span>
                      </div>
                    </div>
                    {topic.skill_requirements?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {topic.skill_requirements.map((skill: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    )}
                    {topic.funding_type === "sponsor_ready" && topic.estimated_budget > 0 && (
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{formatPKR(sponsor.totalPledged)} pledged</span>
                          <span>{fundPct.toFixed(0)}%</span>
                        </div>
                        <Progress value={Math.min(fundPct, 100)} className="h-2" />
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button size="sm"><Rocket className="h-4 w-4 mr-1" /> Apply</Button>
                      {topic.funding_type === "sponsor_ready" && (
                        <Button size="sm" variant="outline"><DollarSign className="h-4 w-4 mr-1" /> Sponsor</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default FYPBrowsePage;
