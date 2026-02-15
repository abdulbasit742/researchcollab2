import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Globe, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";

export default function GlobalRankingsPage() {
  const { data: rankings = [], isLoading } = useQuery({
    queryKey: ["global-trust-rankings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("global_trust_rankings")
        .select("*, profiles(full_name, university)")
        .order("global_rank", { ascending: true })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const getRankIcon = (rank: number | null) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-primary" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-muted-foreground" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-primary/70" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Global Trust Rankings</h1>
            <p className="text-muted-foreground">Top trusted professionals worldwide</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading rankings...</p>
            ) : rankings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Rankings will appear as the platform grows.</p>
            ) : (
              <div className="space-y-2">
                {rankings.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 text-center">{getRankIcon(r.global_rank)}</div>
                      <div>
                        <p className="font-medium">{r.profiles?.full_name ?? "Anonymous"}</p>
                        <p className="text-xs text-muted-foreground">{r.profiles?.university ?? r.region}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {r.regional_rank && <Badge variant="outline">Regional #{r.regional_rank}</Badge>}
                      {r.category && <Badge variant="secondary">{r.category}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
