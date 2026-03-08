import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Award, Users, Zap, Globe, Activity } from "lucide-react";
import {
  getInfluenceScore, getInfluenceLeaderboard, getGrowthFeed,
  type VrlInfluenceScore, type VrlGrowthFeedItem,
} from "@/lib/referral/viralReferralService";

const tierColors: Record<string, string> = {
  explorer: "bg-muted text-muted-foreground",
  connector: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  influencer: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  ambassador: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
};

export default function GrowthAnalyticsPage() {
  const { user } = useAuth();
  const [influence, setInfluence] = useState<VrlInfluenceScore | null>(null);
  const [leaderboard, setLeaderboard] = useState<VrlInfluenceScore[]>([]);
  const [feed, setFeed] = useState<VrlGrowthFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [inf, lb, fd] = await Promise.all([
        user ? getInfluenceScore(user.id) : null,
        getInfluenceLeaderboard(10),
        getGrowthFeed(30),
      ]);
      setInfluence(inf);
      setLeaderboard(lb);
      setFeed(fd);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const feedIcon = (type: string) => {
    if (type.includes("member")) return <Users className="h-4 w-4 text-primary" />;
    if (type.includes("institution")) return <Globe className="h-4 w-4 text-primary" />;
    if (type.includes("collaboration")) return <Zap className="h-4 w-4 text-primary" />;
    return <Activity className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Growth Analytics</h1>
        <p className="text-muted-foreground mt-1">Network expansion metrics, influence scores, and viral growth feed.</p>
      </div>

      {/* Influence Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> Your Influence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {influence ? (
              <>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{influence.overall_influence.toFixed(0)}</div>
                  <Badge className={tierColors[influence.tier] || tierColors.explorer}>{influence.tier}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Referrals</span><span>{influence.referral_score}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Collaboration</span><span>{influence.collaboration_score}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Teams</span><span>{influence.team_participation_score}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Institutions</span><span>{influence.institution_invite_score}</span></div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Start referring to build your influence score!</p>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Influence Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No influence data yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, i) => (
                  <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{entry.user_id.slice(0, 8)}...</p>
                      <Badge variant="outline" className="text-xs">{entry.tier}</Badge>
                    </div>
                    <div className="text-lg font-bold text-primary">{entry.overall_influence.toFixed(0)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Growth Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Viral Growth Feed</CardTitle>
        </CardHeader>
        <CardContent>
          {feed.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No growth events yet. The feed will populate as the network expands.</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {feed.map(item => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="mt-0.5">{feedIcon(item.event_type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      {item.actor_name && <span className="text-xs text-muted-foreground">{item.actor_name}</span>}
                      <span className="text-xs text-muted-foreground">· {new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{item.event_type}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
