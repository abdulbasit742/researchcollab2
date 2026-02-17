import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FlaskConical, Rocket, DollarSign, Users, Globe, CheckCircle2, Clock, BarChart3, TrendingUp } from "lucide-react";
import { useExecutionTracks } from "@/hooks/useResearchExecution";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  funding: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  active: "bg-green-500/10 text-green-700 border-green-500/30",
  completed: "bg-blue-500/10 text-blue-700 border-blue-500/30",
};

const ResearchExecutionPage = () => {
  const { data: tracks = [], isLoading } = useExecutionTracks();

  const activeCount = tracks.filter((t) => t.status === "active").length;
  const totalFunding = tracks.reduce((s, t) => s + Number(t.funding_secured || 0), 0);
  const totalRequired = tracks.reduce((s, t) => s + Number(t.funding_required || 0), 0);

  return (
    <>
      <Helmet><title>Research Execution | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <FlaskConical className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Research Execution Engine</h1>
              <p className="text-muted-foreground">From paper to product — verified implementation pipeline</p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1"><Rocket className="h-4 w-4 text-primary" /></div>
                <div className="text-3xl font-bold">{tracks.length}</div>
                <div className="text-sm text-muted-foreground">Execution Tracks</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="h-4 w-4 text-green-600" /></div>
                <div className="text-3xl font-bold text-green-600">{activeCount}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1"><DollarSign className="h-4 w-4 text-amber-600" /></div>
                <div className="text-3xl font-bold">PKR {(totalFunding / 1000).toFixed(0)}K</div>
                <div className="text-sm text-muted-foreground">Funding Secured</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-blue-600" /></div>
                <div className="text-3xl font-bold">{totalRequired > 0 ? ((totalFunding / totalRequired) * 100).toFixed(0) : 0}%</div>
                <div className="text-sm text-muted-foreground">Funding Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Tracks */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Implementation Tracks</h2>
            {isLoading ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">Loading tracks...</CardContent></Card>
            ) : tracks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-4">No execution tracks yet. Open your research for implementation.</p>
                  <Button>Launch Implementation Track</Button>
                </CardContent>
              </Card>
            ) : (
              tracks.map((track) => {
                const fundPct = Number(track.funding_required) > 0 ? (Number(track.funding_secured) / Number(track.funding_required)) * 100 : 0;
                return (
                  <Card key={track.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{track.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{track.description}</p>
                        </div>
                        <Badge variant="outline" className={statusColors[track.status] || ""}>{track.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>PKR {Number(track.funding_secured || 0).toLocaleString()} / {Number(track.funding_required || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{track.talent_allocated} talent allocated</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span>{track.region_code || "Global"}</span>
                        </div>
                      </div>
                      <Progress value={fundPct} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{fundPct.toFixed(0)}% funded</p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ResearchExecutionPage;
