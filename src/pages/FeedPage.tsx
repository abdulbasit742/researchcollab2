import { useEffect, useRef, useCallback, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useRealityFeed, useConsequenceLedger } from "@/hooks/useAccountability";
import { useOutcomeFeed, useWorkConnections, useProfileProofMetrics } from "@/hooks/useOutcomeFeed";
import { useProfessionalSignalFeed } from "@/hooks/useProfessionalSignals";
import { useMyTrustProfile } from "@/hooks/useMyTrustProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, Navigate } from "react-router-dom";
import {
  OutcomeFeedCard,
  OutcomeFeedSkeleton,
  EmptyOutcomeFeed,
} from "@/components/outcome";
import {
  RealityFeedCard,
  RealityFeedSkeleton,
  EmptyRealityFeed,
  ConsequenceLedgerCard,
} from "@/components/accountability";
import { ProfileReadinessCard } from "@/components/opportunity";
import { StructuredUpdateComposer, ProfessionalSignalCard } from "@/components/signals";
import {
  Briefcase,
  Award,
  DollarSign,
  RefreshCw,
  Loader2,
  Target,
  TrendingUp,
  Zap,
  Activity,
  Shield,
  Radio,
} from "lucide-react";

export default function FeedPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"signals" | "reality" | "opportunities">("signals");
  
  // Professional Signal Feed (new)
  const {
    signals,
    isLoading: signalsLoading,
    hasMore: signalsHasMore,
    loadMore: loadMoreSignals,
    refetch: refetchSignals,
  } = useProfessionalSignalFeed();

  // Reality Feed (system events)
  const { 
    events: realityEvents, 
    loading: realityLoading, 
    hasMore: realityHasMore, 
    loadMore: loadMoreReality, 
    refetch: refetchReality 
  } = useRealityFeed();
  
  // Outcome Feed (opportunities)
  const { 
    feedItems, 
    loading: outcomeLoading, 
    hasMore: outcomeHasMore, 
    loadMore: loadMoreOutcome, 
    refetch: refetchOutcome 
  } = useOutcomeFeed();
  
  const { connections } = useWorkConnections();
  const { metrics } = useProfileProofMetrics();
  const { trustProfile } = useMyTrustProfile();
  const { data: ledger } = useConsequenceLedger();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loading = activeTab === "signals" ? signalsLoading :
                  activeTab === "reality" ? realityLoading : outcomeLoading;
  const hasMore = activeTab === "signals" ? signalsHasMore :
                  activeTab === "reality" ? realityHasMore : outcomeHasMore;
  const loadMore = activeTab === "signals" ? loadMoreSignals :
                   activeTab === "reality" ? loadMoreReality : loadMoreOutcome;
  const refetch = activeTab === "signals" ? refetchSignals :
                  activeTab === "reality" ? refetchReality : refetchOutcome;

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
          {/* Left Sidebar - Consequence Ledger Summary */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              {/* Profile Readiness */}
              <ProfileReadinessCard compact />

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

              {/* Compact Consequence Ledger */}
              <ConsequenceLedgerCard ledger={ledger || null} isCompact />
            </div>
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-6 space-y-4">
            {/* Structured Update Composer */}
            <StructuredUpdateComposer />

            {/* Feed Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <div className="flex items-center justify-between">
                <TabsList className="grid w-auto grid-cols-3">
                  <TabsTrigger value="signals" className="gap-1.5">
                    <Radio className="h-4 w-4" />
                    Signals
                  </TabsTrigger>
                  <TabsTrigger value="reality" className="gap-1.5">
                    <Activity className="h-4 w-4" />
                    Reality
                  </TabsTrigger>
                  <TabsTrigger value="opportunities" className="gap-1.5">
                    <Target className="h-4 w-4" />
                    Opportunities
                  </TabsTrigger>
                </TabsList>
                <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-1.5">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>

              {/* Philosophy Banner */}
              <Card className="border-dashed bg-muted/30 mt-4">
                <CardContent className="py-3 text-center">
                  <p className="text-sm text-muted-foreground">
                    {activeTab === "signals" ? (
                      <>
                        <span className="font-medium text-foreground">Professional signals only.</span>{" "}
                        Work updates, outcomes, lessons. No opinions, no likes.
                      </>
                    ) : activeTab === "reality" ? (
                      <>
                        <span className="font-medium text-foreground">System events only.</span>{" "}
                        Projects. Money. Trust. Consequences. No opinions.
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-foreground">Opportunities only.</span>{" "}
                        Projects, grants, publications. No social noise.
                      </>
                    )}
                  </p>
                </CardContent>
              </Card>

              {/* Professional Signals Tab */}
              <TabsContent value="signals" className="mt-4 space-y-4">
                {signalsLoading && signals.length === 0 ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <OutcomeFeedSkeleton key={i} />
                    ))}
                  </div>
                ) : signals.length === 0 ? (
                  <Card className="py-12">
                    <CardContent className="text-center">
                      <Radio className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="font-semibold mb-2">No Professional Signals Yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Share your first work update, research milestone, or lesson learned.
                      </p>
                      <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        Create Your First Signal
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {signals.map((signal) => (
                      <ProfessionalSignalCard key={signal.id} signal={signal} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Reality Feed Tab */}
              <TabsContent value="reality" className="mt-4 space-y-4">
                {realityLoading && realityEvents.length === 0 ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <RealityFeedSkeleton key={i} />
                    ))}
                  </div>
                ) : realityEvents.length === 0 ? (
                  <EmptyRealityFeed />
                ) : (
                  <div className="space-y-4">
                    {realityEvents.map((event) => (
                      <RealityFeedCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Opportunities Feed Tab */}
              <TabsContent value="opportunities" className="mt-4 space-y-4">
                {outcomeLoading && feedItems.length === 0 ? (
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
                  </div>
                )}
              </TabsContent>

              {/* Load More Trigger */}
              <div ref={loadMoreRef} className="py-4 flex justify-center">
                {loading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading more...</span>
                  </div>
                )}
                {!hasMore && (
                  activeTab === "signals" ? signals.length > 0 :
                  activeTab === "reality" ? realityEvents.length > 0 : 
                  feedItems.length > 0
                ) && (
                  <p className="text-sm text-muted-foreground">All loaded</p>
                )}
              </div>
            </Tabs>
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
                    <TrendingUp className="h-4 w-4" />
                    Why This Is Different
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><span className="font-medium text-foreground">No likes</span> — professional reactions only</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Shows <span className="font-medium text-foreground">failure</span>, not just success</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Trust <span className="font-medium text-foreground">earned from work</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><span className="font-medium text-foreground">Peer review</span>, not comments</span>
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
