import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Building2, DollarSign, TrendingUp, BarChart3, FileText, Users, Target, Briefcase } from "lucide-react";
import { useCommercializationProfile, useResearchLiquidityPools, useRoyaltyContracts, useResearchRevenueStreams } from "@/hooks/useResearchCommercialization";

const InstitutionCommercializationPage = () => {
  const { data: profiles = [], isLoading: loadingProfiles } = useCommercializationProfile();
  const { data: pools = [] } = useResearchLiquidityPools();
  const { data: contracts = [] } = useRoyaltyContracts();
  const { data: streams = [] } = useResearchRevenueStreams();

  const profile = profiles[0];
  const totalPoolCapital = pools.reduce((s, p) => s + Number(p.total_capital || 0), 0);
  const totalRevenue = streams.reduce((s, r) => s + Number(r.gross_amount || 0), 0);

  return (
    <>
      <Helmet><title>University Commercialization OS | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">University Commercialization OS</h1>
              <p className="text-muted-foreground">Research pipeline → Revenue infrastructure</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4">
                <FileText className="h-4 w-4 text-primary mb-1" />
                <div className="text-3xl font-bold">{profile?.total_research_uploaded || 0}</div>
                <div className="text-sm text-muted-foreground">Research Uploaded</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <Target className="h-4 w-4 text-green-600 mb-1" />
                <div className="text-3xl font-bold text-green-600">{profile?.implementation_ready_count || 0}</div>
                <div className="text-sm text-muted-foreground">Implementation Ready</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <DollarSign className="h-4 w-4 text-amber-600 mb-1" />
                <div className="text-3xl font-bold">PKR {(totalRevenue / 1000).toFixed(0)}K</div>
                <div className="text-sm text-muted-foreground">Revenue Generated</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <TrendingUp className="h-4 w-4 text-blue-600 mb-1" />
                <div className="text-3xl font-bold">{profile?.commercialization_grade || "B"}</div>
                <div className="text-sm text-muted-foreground">Commercialization Grade</div>
              </CardContent>
            </Card>
          </div>

          {/* Liquidity Pools */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5" /> Research Liquidity Pools
            </h2>
            {pools.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-4">No liquidity pools created yet.</p>
                  <Button>Create Liquidity Pool</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {pools.map((pool) => {
                  const utilization = Number(pool.total_capital) > 0 ? (Number(pool.deployed_capital) / Number(pool.total_capital)) * 100 : 0;
                  return (
                    <Card key={pool.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{pool.pool_name}</CardTitle>
                          <Badge variant="outline">{pool.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Total Capital</span><span>PKR {Number(pool.total_capital).toLocaleString()}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Deployed</span><span>PKR {Number(pool.deployed_capital).toLocaleString()}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Active Projects</span><span>{pool.active_projects}</span></div>
                          <Progress value={utilization} className="h-2" />
                          <p className="text-xs text-muted-foreground">{utilization.toFixed(0)}% utilized</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <Separator className="mb-8" />

          {/* Royalty Contracts */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> Active Royalty Contracts
            </h2>
            {contracts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No royalty contracts configured yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {contracts.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{c.contract_type} Contract</p>
                          <p className="text-sm text-muted-foreground">
                            Institution: {c.institution_share_pct}% · Researcher: {c.researcher_share_pct}% · Students: {c.student_share_pct}% · Platform: {c.platform_share_pct}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">PKR {Number(c.total_revenue || 0).toLocaleString()}</p>
                          <Badge variant="outline" className="text-xs">{c.status}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator className="mb-8" />

          {/* Revenue Streams */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" /> Revenue Streams
            </h2>
            {streams.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No revenue streams recorded yet. Execute research to generate revenue.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {streams.slice(0, 20).map((s) => (
                  <Card key={s.id}>
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline">{s.revenue_type}</Badge>
                        <div className="flex gap-4">
                          <span>Gross: PKR {Number(s.gross_amount).toLocaleString()}</span>
                          <span className="text-muted-foreground">Fee: PKR {Number(s.platform_fee).toLocaleString()}</span>
                          <span className="font-medium">Net: PKR {Number(s.net_amount).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InstitutionCommercializationPage;
