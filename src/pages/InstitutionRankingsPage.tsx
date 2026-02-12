import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Shield, Zap, Award, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const badgeLabels: Record<string, { label: string; icon: typeof Trophy }> = {
  verified_economic_contributor: { label: "Economic Contributor", icon: TrendingUp },
  high_trust_institution: { label: "High Trust", icon: Shield },
  zero_dispute_institution: { label: "Zero Dispute", icon: Zap },
  emerging_talent_hub: { label: "Emerging Talent", icon: Award },
  elite_execution_campus: { label: "Elite Execution", icon: Trophy },
};

const InstitutionRankingsPage = () => {
  const { data: rankings = [], isLoading } = useQuery({
    queryKey: ["institution-rankings"],
    queryFn: async () => {
      const { data: scores } = await supabase
        .from("institutional_economic_scores")
        .select("*")
        .order("economic_output_score", { ascending: false });

      if (!scores?.length) return [];

      const instIds = scores.map((s: any) => s.institution_id);
      const { data: orgs } = await supabase
        .from("organizations")
        .select("id, name")
        .in("id", instIds);

      const { data: badges } = await supabase
        .from("institutional_badges")
        .select("institution_id, badge_type")
        .in("institution_id", instIds);

      const orgMap = new Map((orgs || []).map((o: any) => [o.id, o.name]));
      const badgeMap = new Map<string, string[]>();
      (badges || []).forEach((b: any) => {
        const arr = badgeMap.get(b.institution_id) || [];
        arr.push(b.badge_type);
        badgeMap.set(b.institution_id, arr);
      });

      return scores.map((s: any, i: number) => ({
        ...s,
        name: orgMap.get(s.institution_id) || "Unknown",
        rank: i + 1,
        badges: badgeMap.get(s.institution_id) || [],
      }));
    },
  });

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Institution Rankings</h1>
            <p className="text-muted-foreground">Ranked by economic output, trust, and deal success</p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-center py-12">Loading rankings...</p>
        ) : rankings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No institutions ranked yet. Rankings populate as institutions generate economic activity.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rankings.map((inst: any) => (
              <Card key={inst.institution_id} className={inst.rank <= 3 ? "border-primary/30 bg-primary/5" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                      #{inst.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate">{inst.name}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {inst.badges.map((b: string) => {
                          const info = badgeLabels[b];
                          return info ? (
                            <Badge key={b} variant="secondary" className="text-xs">
                              {info.label}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-2xl font-bold">{Math.round(inst.economic_output_score)}</p>
                      <p className="text-xs text-muted-foreground">Economic Score</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Trust Avg</p>
                      <p className="font-semibold">{Math.round(inst.trust_score_average)}</p>
                      <Progress value={inst.trust_score_average} className="h-1 mt-1" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Deal Completion</p>
                      <p className="font-semibold">{Math.round(inst.deal_completion_rate)}%</p>
                      <Progress value={inst.deal_completion_rate} className="h-1 mt-1" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Deals</p>
                      <p className="font-semibold">{inst.total_deals}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Active Members</p>
                      <p className="font-semibold">{inst.active_members}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default InstitutionRankingsPage;
