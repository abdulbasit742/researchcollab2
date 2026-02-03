import { useEffect, useRef, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useFeed } from "@/hooks/useFeed";
import { useAuth } from "@/contexts/AuthContext";
import { PostComposer, FeedPostCard, FeedSkeleton, EmptyFeed } from "@/components/feed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, Users, Newspaper, RefreshCw } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

export default function FeedPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { posts, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = useFeed();
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
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

  // Redirect to landing if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Profile Quick View */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold text-primary">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <h3 className="font-semibold">Welcome back!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Share updates with your network
                  </p>
                  <div className="flex justify-center gap-4 mt-4 text-sm">
                    <div className="text-center">
                      <p className="font-semibold">0</p>
                      <p className="text-muted-foreground text-xs">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">0</p>
                      <p className="text-muted-foreground text-xs">Connections</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    {["Machine Learning", "Climate Research", "Data Analysis", "Neuroscience"].map((topic) => (
                      <Badge key={topic} variant="secondary" className="mr-1 mb-1 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                        #{topic.toLowerCase().replace(" ", "")}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-6 space-y-4">
            {/* Feed Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">Activity Feed</h1>
              </div>
              <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-1.5">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            {/* Sort Tabs */}
            <Tabs defaultValue="recent" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="relevant">Relevant</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Post Composer */}
            <PostComposer />

            {/* Feed Posts */}
            {isLoading ? (
              <FeedSkeleton />
            ) : posts.length === 0 ? (
              <EmptyFeed />
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <FeedPostCard key={post.id} post={post} />
                ))}

                {/* Load More Trigger */}
                <div ref={loadMoreRef} className="py-4 flex justify-center">
                  {isFetchingNextPage && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading more...</span>
                    </div>
                  )}
                  {!hasNextPage && posts.length > 0 && (
                    <p className="text-sm text-muted-foreground">You've reached the end</p>
                  )}
                </div>
              </div>
            )}
          </main>

          {/* Right Sidebar - Suggestions */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    People to Follow
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground mb-3">
                    Connect with researchers in your field
                  </p>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to="/matches">Find Connections</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                    <Link to="/offers">Browse Projects</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                    <Link to="/tools">AI Tools</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                    <Link to="/earn">Earn Money</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
