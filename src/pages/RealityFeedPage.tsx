import { useEffect, useRef, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useRealityFeed, useConsequenceLedger, useTrustTrajectory } from "@/hooks/useAccountability";
import { useMyTrustProfile } from "@/hooks/useMyTrustProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, Navigate } from "react-router-dom";
import {
  RealityFeedCard,
  RealityFeedSkeleton,
  EmptyRealityFeed,
  ConsequenceLedgerCard,
  TrustTrajectoryChart,
} from "@/components/accountability";
import {
  Briefcase,
  Award,
  DollarSign,
  RefreshCw,
  Loader2,
  Activity,
  Shield,
  Zap,
  Target,
} from "lucide-react";

export default function RealityFeedPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { events, loading, hasMore, loadMore, refetch } = useRealityFeed();
  const { data: ledger } = useConsequenceLedger();
  const { trustProfile } = useMyTrustProfile();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        loadMore();
      }
    },
    [hasMore, loading, loadMore]
  );

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0,
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [handleObserver]);

  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  const trustScore = trustProfile?.trust_score ?? 0;
  const trustTier = trustScore >= 80 ? "platinum" : trustScore >= 60 ? "gold" : trustScore >= 40 ? "silver" : "bronze";

  return (
    <MainLayout>
      <div className="container px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Consequence Ledger */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              {/* Compact Consequence Ledger */}
              <ConsequenceLedgerCard ledger={ledger || null} isCompact />

              {/* Trust Trajectory */}
              <TrustTrajectoryChart userId={user?.id} isCompact />

              {/* Trust Tier Badge */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 text-center">
                  <Shield className={`h-8 w-8 mx-auto mb-2 ${
                    trustTier === "platinum" ? "text-purple-500" :
                    trustTier === "gold" ? "text-amber-500" :
                    trustTier === "silver" ? "text-gray-400" : "text-orange-400"
                  }`} />
                  <p className="text-sm font-medium capitalize">{trustTier} Tier</p>
                  <p className="text-2xl font-bold">{trustScore}</p>
                  <p className="text-xs text-muted-foreground">Trust Score</p>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Feed - Reality Events Only */}
          <main className="lg:col-span-6 space-y-4">
            {/* Feed Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">Reality Feed</h1>
              </div>
              <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-1.5">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            {/* Philosophy Banner */}
            <Card className="border-dashed bg-muted/30">
              <CardContent className="py-3 text-center">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">System events only.</span>{" "}
                  Projects. Money. Trust. Consequences. No opinions. No noise.
                </p>
              </CardContent>
            </Card>

            {/* Feed Events */}
            {loading && events.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <RealityFeedSkeleton key={i} />
                ))}
              </div>
            ) : events.length === 0 ? (
              <EmptyRealityFeed />
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <RealityFeedCard key={event.id} event={event} />
                ))}

                {/* Load More Trigger */}
                <div ref={loadMoreRef} className="py-4 flex justify-center">
                  {loading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading more...</span>
                    </div>
                  )}
                  {!hasMore && events.length > 0 && (
                    <p className="text-sm text-muted-foreground">All events loaded</p>
                  )}
                </div>
              </div>
            )}
          </main>

          {/* Right Sidebar - Quick Actions & Philosophy */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Take Action
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <Button variant="default" size="sm" asChild className="w-full justify-start">
                    <Link to="/offers">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Browse Projects
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="w-full justify-start">
                    <Link to="/earn">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Post a Project
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="w-full justify-start">
                    <Link to="/grants">
                      <Award className="h-4 w-4 mr-2" />
                      Find Grants
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Platform Philosophy - The Wedge */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Why This Is Different
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      Shows <span className="font-medium text-foreground">failure</span>, not just success
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      Shows <span className="font-medium text-foreground">money moved</span>, not likes
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      Trust <span className="font-medium text-foreground">earned from work</span>, not followers
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span className="font-medium text-foreground">Consequences</span> are permanent
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Anti-LinkedIn Statement */}
              <Card className="bg-muted/50">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground italic">
                    "LinkedIn shows who you claim to be.<br />
                    <span className="font-semibold text-foreground">RCollab proves what you've done.</span>"
                  </p>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
