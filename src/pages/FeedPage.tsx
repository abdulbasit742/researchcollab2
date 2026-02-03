import { useEffect, useRef, useCallback, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useRealityFeed, useConsequenceLedger } from "@/hooks/useAccountability";
import { useOutcomeFeed } from "@/hooks/useOutcomeFeed";
import { useProfessionalSignalFeed } from "@/hooks/useProfessionalSignals";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigate } from "react-router-dom";
import {
  OutcomeFeedCard,
  OutcomeFeedSkeleton,
  EmptyOutcomeFeed,
} from "@/components/outcome";
import {
  RealityFeedCard,
  RealityFeedSkeleton,
  EmptyRealityFeed,
} from "@/components/accountability";
import { StructuredUpdateComposer, ProfessionalSignalCard } from "@/components/signals";
import {
  ProfessionalIdentityCard,
  OpportunitySuggestions,
  PeopleYouMayKnow,
  InstitutionsToFollow,
  CareerCopilotCard,
} from "@/components/feed";
import {
  RefreshCw,
  Loader2,
  Target,
  Activity,
  Radio,
} from "lucide-react";

export default function FeedPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"signals" | "reality" | "opportunities">("signals");
  
  // Professional Signal Feed
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

  return (
    <MainLayout>
      <div className="bg-muted/30 min-h-screen">
        <div className="container py-4 sm:py-6">
          {/* LinkedIn-inspired 3-column layout */}
          <div className="grid lg:grid-cols-12 gap-5">
            
            {/* ===== LEFT COLUMN: Identity Card ===== */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-20 space-y-4">
                {/* Professional Identity Card */}
                <ProfessionalIdentityCard />
                
                {/* Career Co-pilot */}
                <CareerCopilotCard />
              </div>
            </aside>

            {/* ===== CENTER COLUMN: Main Feed ===== */}
            <main className="lg:col-span-6 space-y-4">
              {/* Structured Update Composer */}
              <StructuredUpdateComposer />

              {/* Feed Philosophy Banner */}
              <Card className="border-dashed bg-card">
                <CardContent className="py-3 text-center">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">RCollab is not social media.</span>{" "}
                    Only work updates, outcomes, and professional signals.
                  </p>
                </CardContent>
              </Card>

              {/* Feed Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <div className="flex items-center justify-between bg-card rounded-lg border p-1">
                  <TabsList className="grid w-full grid-cols-3 bg-transparent">
                    <TabsTrigger value="signals" className="gap-1.5 data-[state=active]:bg-muted">
                      <Radio className="h-4 w-4" />
                      <span className="hidden sm:inline">Signals</span>
                    </TabsTrigger>
                    <TabsTrigger value="reality" className="gap-1.5 data-[state=active]:bg-muted">
                      <Activity className="h-4 w-4" />
                      <span className="hidden sm:inline">Reality</span>
                    </TabsTrigger>
                    <TabsTrigger value="opportunities" className="gap-1.5 data-[state=active]:bg-muted">
                      <Target className="h-4 w-4" />
                      <span className="hidden sm:inline">Opps</span>
                    </TabsTrigger>
                  </TabsList>
                  <Button variant="ghost" size="icon" onClick={() => refetch()} className="shrink-0 ml-2">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

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
                    <p className="text-sm text-muted-foreground">You're all caught up</p>
                  )}
                </div>
              </Tabs>
            </main>

            {/* ===== RIGHT COLUMN: Suggestions ===== */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-20 space-y-4">
                {/* Opportunity Suggestions */}
                <OpportunitySuggestions />
                
                {/* People In Your Domain */}
                <PeopleYouMayKnow />
                
                {/* Institutions to Follow */}
                <InstitutionsToFollow />

                {/* Platform Philosophy Note */}
                <Card className="bg-muted/50 border-dashed">
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
      </div>
    </MainLayout>
  );
}
