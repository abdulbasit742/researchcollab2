import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CountUpNumber } from "@/components/decorations/CountUpNumber";
import { useLeaderboardData, SortField } from "@/hooks/useLeaderboardData";
import { formatPKR } from "@/lib/currency";
import { Trophy, Medal, Award, Users, TrendingUp, DollarSign, RotateCcw, ExternalLink, Search, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const tierColors: Record<string, string> = {
  platinum: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  gold: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  silver: "bg-slate-200 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300",
  bronze: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-amber-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-orange-500" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>;
}

export default function LeaderboardPage() {
  const { entries, stats, userRank, isLoading, filters, setFilters, resetFilters } = useLeaderboardData();

  const hasFilters = filters.skill || filters.institution || filters.region || filters.sortBy !== "trust_score";

  return (
    <MainLayout>
      <Helmet>
        <title>Reputation Leaderboard | RCollab</title>
        <meta name="description" content="See top-ranked professionals by verified trust score, delivery rate, and earnings." />
      </Helmet>

      <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reputation Leaderboard</h1>
            <p className="text-sm text-muted-foreground">Top professionals ranked by verified outcomes</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="glass">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ranked Users</p>
                {isLoading ? <Skeleton className="h-6 w-12" /> : (
                  <p className="text-lg font-bold"><CountUpNumber value={stats.totalUsers} /></p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Trust Score</p>
                {isLoading ? <Skeleton className="h-6 w-12" /> : (
                  <p className="text-lg font-bold"><CountUpNumber value={stats.avgTrustScore} suffix="/100" /></p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Platform Earnings</p>
                {isLoading ? <Skeleton className="h-6 w-12" /> : (
                  <p className="text-lg font-bold">{formatPKR(stats.totalEarnings)}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1 min-w-[140px]">
                <label className="text-xs font-medium text-muted-foreground">Sort By</label>
                <Select value={filters.sortBy} onValueChange={(v) => setFilters((f) => ({ ...f, sortBy: v as SortField }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trust_score">Trust Score</SelectItem>
                    <SelectItem value="successful_rate">Delivery Rate</SelectItem>
                    <SelectItem value="total_earnings">Earnings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 flex-1 min-w-[120px]">
                <label className="text-xs font-medium text-muted-foreground">Skill</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input className="h-9 text-xs pl-8" placeholder="e.g. React" value={filters.skill} onChange={(e) => setFilters((f) => ({ ...f, skill: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1 flex-1 min-w-[120px]">
                <label className="text-xs font-medium text-muted-foreground">Institution</label>
                <Input className="h-9 text-xs" placeholder="e.g. LUMS" value={filters.institution} onChange={(e) => setFilters((f) => ({ ...f, institution: e.target.value }))} />
              </div>
              <div className="space-y-1 flex-1 min-w-[120px]">
                <label className="text-xs font-medium text-muted-foreground">Region</label>
                <Input className="h-9 text-xs" placeholder="e.g. Lahore" value={filters.region} onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))} />
              </div>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 gap-1.5 text-xs">
                  <RotateCcw className="h-3 w-3" /> Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Your Position */}
        {userRank && (
          <Card variant="glow" className="border-primary/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  #{userRank.rank}
                </div>
                <div>
                  <p className="text-sm font-semibold">Your Position</p>
                  <p className="text-xs text-muted-foreground">Trust: {userRank.trust_score} · Delivery: {userRank.successful_rate}%</p>
                </div>
              </div>
              <Badge className={tierColors[userRank.trust_tier] ?? tierColors.bronze}>
                {userRank.trust_tier}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No professionals match your filters</p>
              {hasFilters && (
                <Button variant="link" size="sm" onClick={resetFilters} className="mt-2">Clear filters</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <Card key={entry.id} variant="elevated" className="group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div className="w-8 flex justify-center shrink-0">
                      <RankIcon rank={entry.rank} />
                    </div>

                    {/* Name + Institution */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{entry.full_name ?? "Anonymous"}</p>
                      {entry.university && (
                        <p className="text-xs text-muted-foreground truncate">{entry.university}</p>
                      )}
                    </div>

                    {/* Stats (hidden on mobile, visible on sm+) */}
                    <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="text-center">
                        <p className="font-semibold text-foreground">{entry.trust_score}</p>
                        <p>Trust</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground">{entry.successful_rate}%</p>
                        <p>Delivery</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground">{formatPKR(entry.total_earnings)}</p>
                        <p>Earned</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground">{entry.projects_completed}</p>
                        <p>Projects</p>
                      </div>
                    </div>

                    {/* Tier Badge */}
                    <Badge className={`${tierColors[entry.trust_tier] ?? tierColors.bronze} text-[10px] capitalize`}>
                      {entry.trust_tier}
                    </Badge>

                    {/* Profile Link */}
                    <Link to={`/u/${entry.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Link>
                  </div>

                  {/* Mobile stats row */}
                  <div className="flex sm:hidden items-center gap-4 mt-2 ml-11 text-[11px] text-muted-foreground">
                    <span><strong className="text-foreground">{entry.trust_score}</strong> Trust</span>
                    <span><strong className="text-foreground">{entry.successful_rate}%</strong> Delivery</span>
                    <span><strong className="text-foreground">{formatPKR(entry.total_earnings)}</strong></span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
