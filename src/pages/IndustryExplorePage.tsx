import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Building, Handshake, DollarSign, Target, ShieldCheck, TrendingUp } from "lucide-react";
import { useIndustryPartnerships } from "@/hooks/useResearchCommercialization";
import { useExecutionTracks } from "@/hooks/useResearchExecution";

const IndustryExplorePage = () => {
  const { data: partnerships = [], isLoading: loadingP } = useIndustryPartnerships();
  const { data: tracks = [], isLoading: loadingT } = useExecutionTracks();

  const implementationReady = tracks.filter((t) => t.status === "active" || t.status === "funding");
  const totalPartnerFunding = partnerships.reduce((s, p) => s + Number(p.funding_pledged || 0), 0);

  return (
    <>
      <Helmet><title>Industry Research Explorer | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <Building className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Industry Research Explorer</h1>
              <p className="text-muted-foreground">Browse implementation-ready research · Pledge funding · Co-develop</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4">
                <Target className="h-4 w-4 text-primary mb-1" />
                <div className="text-3xl font-bold">{implementationReady.length}</div>
                <div className="text-sm text-muted-foreground">Implementation-Ready</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <Handshake className="h-4 w-4 text-green-600 mb-1" />
                <div className="text-3xl font-bold">{partnerships.length}</div>
                <div className="text-sm text-muted-foreground">Active Partnerships</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <DollarSign className="h-4 w-4 text-amber-600 mb-1" />
                <div className="text-3xl font-bold">PKR {(totalPartnerFunding / 1000).toFixed(0)}K</div>
                <div className="text-sm text-muted-foreground">Industry Funding</div>
              </CardContent>
            </Card>
          </div>

          {/* Implementation-Ready Research */}
          <h2 className="text-xl font-semibold mb-4">Implementation-Ready Research</h2>
          {loadingT ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent></Card>
          ) : implementationReady.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">No implementation-ready research available yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 mb-8">
              {implementationReady.map((track) => {
                const fundPct = Number(track.funding_required) > 0 ? (Number(track.funding_secured) / Number(track.funding_required)) * 100 : 0;
                return (
                  <Card key={track.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{track.title}</h3>
                          <p className="text-sm text-muted-foreground">{track.description}</p>
                        </div>
                        <Badge variant="outline">{track.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm mb-2">
                        <span>PKR {Number(track.funding_required || 0).toLocaleString()} required</span>
                        <span className="text-muted-foreground">·</span>
                        <span>{track.region_code || "Global"}</span>
                      </div>
                      <Progress value={fundPct} className="h-2 mb-1" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{fundPct.toFixed(0)}% funded</span>
                        <Button size="sm" variant="outline">Pledge Funding</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <Separator className="mb-8" />

          {/* Active Partnerships */}
          <h2 className="text-xl font-semibold mb-4">Active Industry Partnerships</h2>
          {partnerships.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No industry partnerships yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {partnerships.map((p) => (
                <Card key={p.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{p.company_name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{p.partnership_type} · {p.milestones_completed}/{p.milestone_count} milestones</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">PKR {Number(p.funding_pledged).toLocaleString()}</p>
                        <div className="flex gap-2 items-center">
                          {p.nda_signed && <Badge variant="outline" className="text-xs"><ShieldCheck className="h-3 w-3 mr-1" />NDA</Badge>}
                          <Badge variant="outline">{p.status}</Badge>
                        </div>
                      </div>
                    </div>
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

export default IndustryExplorePage;
