import { useEffect, useRef, useCallback, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useRealityFeed } from "@/hooks/useAccountability";
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
  CareerCopilotCard,
} from "@/components/feed";
import {
  RefreshCw,
  Loader2,
  Target,
  Activity,
  Radio,
  Briefcase,
} from "lucide-react";

export default function FeedPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"signals" | "reality" | "opportunities">("signals");
  
  const {
    signals,
    isLoading: signalsLoading,
    hasMore: signalsHasMore,
    loadMore: loadMoreSignals,
    refetch: refetchSignals,
  } = useProfessionalSignalFeed();

  const { 
    events: realityEvents, 
    loading: realityLoading, 
    hasMore: realityHasMore, 
    loadMore: loadMoreReality, 
    refetch: refetchReality 
  } = useRealityFeed();
  
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
      <div className="bg-muted/20 min-h-screen">
        <div className="container px-4 py-4 sm:py-6">
          {/* 3-column professional layout */}
          <div className="grid lg:grid-cols-12 gap-5">
            
            {/* Left Column: Identity */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-20 space-y-4">
                <ProfessionalIdentityCard />
                <CareerCopilotCard />
              </div>
            </aside>

            {/* Center Column: Feed */}
            <main className="lg:col-span-6 space-y-4">
              {/* Update Composer */}
              <StructuredUpdateComposer />

              {/* Feed Tabs - Clean, minimal */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <div className="flex items-center justify-between bg-card rounded-lg border p-1">
                  <TabsList className="grid w-full grid-cols-3 bg-transparent">
                    <TabsTrigger value="signals" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-muted">
                      <Radio className="h-4 w-4" />
                      <span className="hidden sm:inline">Updates</span>
                    </TabsTrigger>
                    <TabsTrigger value="reality" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-muted">
                      <Activity className="h-4 w-4" />
                      <span className="hidden sm:inline">Activity</span>
                    </TabsTrigger>
                    <TabsTrigger value="opportunities" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-muted">
                      <Target className="h-4 w-4" />
                      <span className="hidden sm:inline">Work</span>
                    </TabsTrigger>
                  </TabsList>
                  <Button variant="ghost" size="icon" onClick={() => refetch()} className="shrink-0 ml-2">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Professional Signals */}
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
                        <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Radio className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold mb-2">No professional updates yet</h3>
                        <p className="text-sm text-muted-foreground mb-2 max-w-sm mx-auto">
                          Share work milestones, research outcomes, or lessons learned.
                        </p>
                        <p className="text-xs text-muted-foreground/70 italic mb-4">
                          This is not social media. Only professional signals appear here.
                        </p>
                        <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                          Share Your First Update
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

                {/* Reality Feed */}
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

                {/* Opportunities */}
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

                {/* Load More */}
                <div ref={loadMoreRef} className="py-4 flex justify-center">
                  {loading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  )}
                  {!hasMore && (
                    activeTab === "signals" ? signals.length > 0 :
                    activeTab === "reality" ? realityEvents.length > 0 : 
                    feedItems.length > 0
                  ) && (
                    <p className="text-xs text-muted-foreground">You're all caught up</p>
                  )}
                </div>
              </Tabs>
            </main>

            {/* Right Column: Suggestions */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-20 space-y-4">
                <OpportunitySuggestions />
                <PeopleYouMayKnow />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
