import { useEffect, useRef, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useOutcomeFeed, useWorkConnections, useProfileProofMetrics } from "@/hooks/useOutcomeFeed";
import { useMyTrustProfile } from "@/hooks/useMyTrustProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, Navigate } from "react-router-dom";
import {
  OutcomeFeedCard,
  OutcomeFeedSkeleton,
  EmptyOutcomeFeed,
  ProofProfileCard,
  WorkGraphCard,
  TrustEngineDisplay,
} from "@/components/outcome";
import {
  Briefcase,
  Award,
  DollarSign,
  RefreshCw,
  Loader2,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function FeedPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { feedItems, loading, hasMore, loadMore, refetch } = useOutcomeFeed();
  const { connections, getVerifiedConnections } = useWorkConnections();
  const { metrics } = useProfileProofMetrics();
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
      <div className="container py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Proof-Based Profile Summary */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              {/* Compact Proof Profile */}
              <ProofProfileCard
                userId={user?.id}
                userEmail={user?.email}
                userName={profile?.full_name || undefined}
                metrics={metrics}
                trustScore={trustScore}
                trustTier={trustTier}
                isCompact
              />

              {/* Compact Trust Display */}
              <TrustEngineDisplay
                totalScore={trustScore}
                tier={trustTier}
                trend="stable"
                isCompact
              />

              {/* Compact Work Graph */}
              <WorkGraphCard
                connections={connections}
                isCompact
              />
            </div>
          </aside>

          {/* Main Feed - Outcomes Only */}
          <main className="lg:col-span-6 space-y-4">
            {/* Feed Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">Opportunity Radar</h1>
              </div>
              <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-1.5">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            {/* Platform Philosophy Banner */}
            <Card className="border-dashed bg-muted/30">
              <CardContent className="py-3 text-center">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Outcomes only.</span>{" "}
                  Projects, grants, publications, verifications. No social posts. No noise.
                </p>
              </CardContent>
            </Card>

            {/* Feed Items */}
            {loading && feedItems.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <OutcomeFeedSkeleton key={i} />
                ))}
              </div>
            ) : feedItems.length === 0 ? (
              <EmptyOutcomeFeed />
            ) : (
              <div className="space-y-4">
                {feedItems.map((item) => (
                  <OutcomeFeedCard key={item.id} item={item} />
                ))}

                {/* Load More Trigger */}
                <div ref={loadMoreRef} className="py-4 flex justify-center">
                  {loading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading more...</span>
                    </div>
                  )}
                  {!hasMore && feedItems.length > 0 && (
                    <p className="text-sm text-muted-foreground">All opportunities loaded</p>
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

              {/* Platform Philosophy */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    What Matters Here
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-medium">•</span>
                      Work completed, not posts shared
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-medium">•</span>
                      Trust earned, not followers counted
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-medium">•</span>
                      Money moved, not likes accumulated
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-medium">•</span>
                      Proof over claims
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
