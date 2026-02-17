import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, Users, DollarSign, CheckCircle2, Clock, AlertTriangle, BarChart3, TrendingUp } from "lucide-react";
import { useFYPTopics, useFYPExecutionTracks, useFYPSponsorships, useFYPTeams } from "@/hooks/useFYP";

const milestoneStatusColors: Record<string, string> = {
  pending: "text-muted-foreground",
  in_progress: "text-amber-600",
  submitted: "text-blue-600",
  under_review: "text-purple-600",
  approved: "text-green-600",
  released: "text-primary",
  revision_requested: "text-destructive",
  disputed: "text-destructive",
};

const FacultyFYPMonitorPage = () => {
  const { data: topics = [], isLoading } = useFYPTopics();
  const { data: execTracks = [] } = useFYPExecutionTracks();
  const { data: sponsorships = [] } = useFYPSponsorships();
  const { data: teams = [] } = useFYPTeams();

  const activeTopics = topics.filter((t: any) => t.status === "in_progress" || t.status === "assigned");
  const totalFunding = sponsorships.reduce((s: number, sp: any) => s + Number(sp.pledge_amount || 0), 0);
  const completedMilestones = execTracks.filter((t: any) => t.status === "approved" || t.status === "released").length;
  const delayedMilestones = execTracks.filter((t: any) => t.status === "revision_requested" || t.status === "disputed").length;

  return (
    <>
      <Helmet><title>Faculty FYP Monitor | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Faculty FYP Monitor</h1>
              <p className="text-muted-foreground">Oversee teams, milestones, funding, and execution across your FYP projects</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card><CardContent className="pt-4">
              <BarChart3 className="h-4 w-4 text-primary mb-1" />
              <div className="text-3xl font-bold">{topics.length}</div>
              <div className="text-sm text-muted-foreground">Total FYPs</div>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <Users className="h-4 w-4 text-blue-600 mb-1" />
              <div className="text-3xl font-bold text-blue-600">{teams.length}</div>
              <div className="text-sm text-muted-foreground">Active Teams</div>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <DollarSign className="h-4 w-4 text-green-600 mb-1" />
              <div className="text-3xl font-bold text-green-600">PKR {(totalFunding / 1000).toFixed(0)}K</div>
              <div className="text-sm text-muted-foreground">Funding Secured</div>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <AlertTriangle className="h-4 w-4 text-destructive mb-1" />
              <div className="text-3xl font-bold text-destructive">{delayedMilestones}</div>
              <div className="text-sm text-muted-foreground">At Risk</div>
            </CardContent></Card>
          </div>

          {/* Project Cards */}
          <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
          <div className="space-y-4">
            {isLoading ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent></Card>
            ) : topics.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No FYP topics created yet.</CardContent></Card>
            ) : topics.map((topic: any) => {
              const topicTracks = execTracks.filter((t: any) => t.topic_id === topic.id);
              const topicTeams = teams.filter((t: any) => t.topic_id === topic.id);
              const topicSponsors = sponsorships.filter((s: any) => s.topic_id === topic.id);
              const completed = topicTracks.filter((t: any) => t.status === "approved" || t.status === "released").length;
              const total = topicTracks.length;
              const progress = total > 0 ? (completed / total) * 100 : 0;
              const funding = topicSponsors.reduce((s: number, sp: any) => s + Number(sp.pledge_amount || 0), 0);
              const risks = topicTracks.filter((t: any) => t.status === "revision_requested" || t.status === "disputed");

              return (
                <Card key={topic.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{topic.title}</CardTitle>
                      <Badge variant="outline">{topic.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{topicTeams.length} team(s)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>PKR {funding.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>{completed}/{total} milestones</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {risks.length > 0 ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <TrendingUp className="h-4 w-4 text-green-600" />}
                        <span>{risks.length > 0 ? `${risks.length} at risk` : "On track"}</span>
                      </div>
                    </div>
                    <Progress value={progress} className="h-2 mb-1" />
                    <p className="text-xs text-muted-foreground">{progress.toFixed(0)}% complete</p>

                    {/* Milestone breakdown */}
                    {topicTracks.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {topicTracks.map((track: any) => (
                          <div key={track.id} className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0">
                            <span className="flex items-center gap-2">
                              <span className="text-muted-foreground">M{track.milestone_order}</span>
                              <span>{track.title}</span>
                            </span>
                            <span className={`font-medium ${milestoneStatusColors[track.status] || ""}`}>
                              {track.status?.replace("_", " ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
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

export default FacultyFYPMonitorPage;
