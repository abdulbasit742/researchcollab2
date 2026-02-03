import { Link, useParams, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useSinglePost } from "@/hooks/useFeed";
import { useAuth } from "@/contexts/AuthContext";
import { FeedPostCard, FeedPostSkeleton } from "@/components/feed";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const { data: post, isLoading, error } = useSinglePost(postId || "");

  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainLayout>
      <div className="container py-6 max-w-2xl">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/feed">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Link>
        </Button>

        {isLoading ? (
          <FeedPostSkeleton />
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h2 className="text-lg font-semibold mb-2">Post Not Found</h2>
              <p className="text-muted-foreground mb-4">
                This post may have been deleted or you don't have permission to view it.
              </p>
              <Button asChild>
                <Link to="/feed">Return to Feed</Link>
              </Button>
            </CardContent>
          </Card>
        ) : post ? (
          <FeedPostCard post={post} showComments />
        ) : null}
      </div>
    </MainLayout>
  );
}
