import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FlaskConical, Shield, DollarSign, Globe, Target, Building2 } from "lucide-react";
import { useExecutionTracks } from "@/hooks/useResearchExecution";

const ResearchMatchPage = () => {
  const { data: tracks = [], isLoading } = useExecutionTracks();
  const openTracks = tracks.filter((t) => t.status === "funding" || t.status === "active");

  return (
    <>
      <Helmet><title>Research Talent Matching | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <Target className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Research Talent Routing</h1>
              <p className="text-muted-foreground">Match researchers, students & capital to implementation-ready research</p>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">All Skills</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">Trust ≥ Silver</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">Funded Only</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">Cross-Border</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">Institutional</Badge>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Loading opportunities...</CardContent></Card>
          ) : openTracks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No implementation-ready research available for matching.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {openTracks.map((track) => (
                <Card key={track.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{track.title}</CardTitle>
                      <Badge variant="outline" className={track.status === "active" ? "bg-green-500/10 text-green-700" : "bg-amber-500/10 text-amber-700"}>
                        {track.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{track.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> PKR {Number(track.funding_required || 0).toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {track.talent_allocated} slots</span>
                      <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {track.region_code || "Global"}</span>
                    </div>
                    <Button size="sm" className="w-full">Apply to Implement</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ResearchMatchPage;
