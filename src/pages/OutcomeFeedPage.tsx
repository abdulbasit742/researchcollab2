import { useEffect, useRef, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useOutcomeFeed, useWorkConnections, useProfileProofMetrics } from "@/hooks/useOutcomeFeed";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, Navigate } from "react-router-dom";
import {
  Briefcase,
  Award,
  FileText,
  Users,
  Building,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Loader2,
  Target,
  DollarSign,
  Star,
  Shield,
} from "lucide-react";

const ITEM_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  project_posted: { icon: Briefcase, color: "text-blue-500", label: "New Project" },
  project_completed: { icon: CheckCircle, color: "text-green-500", label: "Project Completed" },
  grant_opportunity: { icon: Award, color: "text-yellow-500", label: "Grant Opportunity" },
  collaboration_request: { icon: Users, color: "text-purple-500", label: "Collaboration" },
  publication: { icon: FileText, color: "text-primary", label: "Publication" },
  dataset_released: { icon: Target, color: "text-cyan-500", label: "Dataset" },
  institution_announcement: { icon: Building, color: "text-orange-500", label: "Announcement" },
  verification_earned: { icon: Shield, color: "text-green-600", label: "Verification" },
  milestone_completed: { icon: Star, color: "text-yellow-600", label: "Milestone" },
};

export default function OutcomeFeedPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { feedItems, loading, hasMore, loadMore, refetch } = useOutcomeFeed();
  const { connections, getVerifiedConnections } = useWorkConnections();
  const { metrics } = useProfileProofMetrics();

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

  const verifiedConnections = getVerifiedConnections();

  return (
    <MainLayout>
      <div className="container px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Proof-Based Profile Summary */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <Avatar className="h-16 w-16 mx-auto mb-3">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold">Your Proof Profile</h3>
                    <p className="text-sm text-muted-foreground">Activity-based, not self-claimed</p>
                  </div>

                  {metrics ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          Projects Completed
                        </span>
                        <span className="font-semibold">{metrics.projects_completed}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Escrow Success
                        </span>
                        <span className="font-semibold">{metrics.escrow_success_rate.toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Grants Won
                        </span>
                        <span className="font-semibold">{metrics.grants_won}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Verifications
                        </span>
                        <span className="font-semibold">{metrics.verification_count}</span>
                      </div>
                      {metrics.earnings_visibility === "public" && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Total Earned
                          </span>
                          <span className="font-semibold">PKR {metrics.total_earnings.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-sm text-muted-foreground">
                      Complete projects to build your proof profile
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Work Graph
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-sm text-muted-foreground mb-2">
                    {verifiedConnections.length} verified work connections
                  </div>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to="/network">View Network</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Feed - Outcomes Only */}
          <main className="lg:col-span-6 space-y-4">
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

            {/* Feed description */}
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="py-3 text-center text-sm text-muted-foreground">
                <strong>Outcomes only.</strong> Projects, grants, publications, verifications.
                No social posts. No noise.
              </CardContent>
            </Card>

            {/* Feed Items */}
            {loading && feedItems.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : feedItems.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No opportunities yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Projects, grants, and collaborations will appear here
                  </p>
                  <Button asChild>
                    <Link to="/offers">Browse Projects</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {feedItems.map((item) => {
                  const config = ITEM_TYPE_CONFIG[item.item_type] || {
                    icon: Target,
                    color: "text-muted-foreground",
                    label: item.item_type,
                  };
                  const Icon = config.icon;

                  return (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-muted ${config.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {config.label}
                              </Badge>
                              {item.is_verified && (
                                <Badge variant="outline" className="text-xs gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-medium">{item.title}</h4>
                            {item.summary && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {item.summary}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              {item.actor_name && (
                                <span className="flex items-center gap-1">
                                  <Avatar className="h-4 w-4">
                                    <AvatarFallback className="text-[8px]">
                                      {item.actor_name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {item.actor_name}
                                </span>
                              )}
                              <span>•</span>
                              <span>{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Load More */}
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

          {/* Right Sidebar - Quick Actions */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
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

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Platform Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                  <div className="space-y-1">
                    <p>Work completed, not posts shared</p>
                    <p>Trust earned, not followers counted</p>
                    <p>Money moved, not likes accumulated</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
