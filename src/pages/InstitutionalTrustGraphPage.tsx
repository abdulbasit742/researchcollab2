import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { MainLayout } from "@/components/layout/MainLayout";
import { useInstitutionalTrustIndex, useComputeInstitutionalTrust } from "@/hooks/useInstitutionalTrust";
import {
  Building2,
  TrendingUp,
  Shield,
  Award,
  BarChart3,
  Globe,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const tierColors: Record<string, string> = {
  AAA: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  AA: "bg-green-500/10 text-green-700 border-green-500/30",
  A: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  BBB: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
  BB: "bg-orange-500/10 text-orange-700 border-orange-500/30",
  B: "bg-red-500/10 text-red-700 border-red-500/30",
  unrated: "bg-muted text-muted-foreground",
};

export default function InstitutionalTrustGraphPage() {
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);
  const { data: institutions = [], isLoading } = useInstitutionalTrustIndex();
  const computeTrust = useComputeInstitutionalTrust();

  const topInstitutions = institutions.slice(0, 20);
  const selected = institutions.find((i) => i.id === selectedInstitution);

  const radarData = selected
    ? [
        { metric: "Execution", value: selected.execution_score },
        { metric: "Capital Eff.", value: selected.capital_efficiency },
        { metric: "Peer Valid.", value: selected.peer_validation_score },
        { metric: "Cross-Border", value: selected.cross_border_collab_score },
        { metric: "Research", value: selected.research_output_score },
        { metric: "Integrity", value: 100 - selected.dispute_ratio },
      ]
    : [];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              Institutional Trust Graph
            </h1>
            <p className="text-muted-foreground mt-1">
              University and institution ranking by execution quality, capital efficiency, and research impact
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{institutions.length}</p>}
                  <p className="text-sm text-muted-foreground">Rated Institutions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-emerald-500" />
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : (
                    <p className="text-2xl font-bold">{institutions.filter((i) => i.tier === "AAA" || i.tier === "AA").length}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Top-Tier (AA+)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : (
                    <p className="text-2xl font-bold">
                      {institutions.length > 0 ? Math.round(institutions.reduce((s, i) => s + i.composite_trust_score, 0) / institutions.length) : 0}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">Avg Trust Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : (
                    <p className="text-2xl font-bold">{institutions.filter((i) => i.tier === "B" || i.tier === "BB").length}</p>
                  )}
                  <p className="text-sm text-muted-foreground">At Risk</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rankings List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Trust Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16" />)}</div>
                ) : topInstitutions.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Institutions Rated Yet</h3>
                    <p className="text-muted-foreground mb-4">Compute trust indices to populate the ranking.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topInstitutions.map((inst, index) => (
                      <div
                        key={inst.id}
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedInstitution === inst.id ? "bg-primary/5 border-primary/30" : ""
                        }`}
                        onClick={() => setSelectedInstitution(inst.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{inst.institution_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={tierColors[inst.tier] || tierColors.unrated}>
                                {inst.tier}
                              </Badge>
                              <span className="text-xs text-muted-foreground">Period: {inst.period}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold">{Math.round(inst.composite_trust_score)}</p>
                            <p className="text-xs text-muted-foreground">Trust Score</p>
                          </div>
                          <Progress value={inst.composite_trust_score} className="w-24 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detail Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {selected ? "Trust Profile" : "Select Institution"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selected ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-primary">{Math.round(selected.composite_trust_score)}</p>
                      <Badge variant="outline" className={`mt-2 text-lg px-4 py-1 ${tierColors[selected.tier]}`}>
                        {selected.tier}
                      </Badge>
                    </div>

                    {/* Radar Chart */}
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" className="text-xs" />
                        <PolarRadiusAxis domain={[0, 100]} tick={false} />
                        <Radar
                          name="Trust"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>

                    {/* Score Breakdown */}
                    <div className="space-y-3">
                      {[
                        { label: "Execution", value: selected.execution_score, icon: TrendingUp },
                        { label: "Capital Efficiency", value: selected.capital_efficiency, icon: BarChart3 },
                        { label: "Dispute Rate", value: selected.dispute_ratio, icon: AlertTriangle, invert: true },
                        { label: "Peer Validation", value: selected.peer_validation_score, icon: Shield },
                        { label: "Cross-Border", value: selected.cross_border_collab_score, icon: Globe },
                      ].map(({ label, value, icon: Icon, invert }) => (
                        <div key={label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {label}
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={invert ? 100 - value : value} className="w-16 h-1.5" />
                            <span className="text-sm font-medium w-10 text-right">
                              {Math.round(value)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full gap-2"
                      variant="outline"
                      onClick={() => computeTrust.mutate(selected.institution_id)}
                      disabled={computeTrust.isPending}
                    >
                      <RefreshCw className={`h-4 w-4 ${computeTrust.isPending ? "animate-spin" : ""}`} />
                      Recompute Trust Index
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-12">
                    Click an institution to view detailed trust breakdown
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
