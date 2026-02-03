import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, TrendingUp, Clock, ExternalLink } from "lucide-react";
import { useProfileViews } from "@/hooks/useNetwork";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ProfileViewsCardProps {
  className?: string;
}

export function ProfileViewsCard({ className }: ProfileViewsCardProps) {
  const { data: views, isLoading } = useProfileViews();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-primary" />
            Who Viewed Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const viewCount = views?.length || 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-primary" />
            Who Viewed Your Profile
          </span>
          {viewCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {viewCount} view{viewCount !== 1 ? "s" : ""} this month
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {viewCount === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Eye className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No profile views yet</p>
            <p className="text-sm mt-1">
              Complete your profile to increase visibility
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {views?.slice(0, 10).map((view: any) => (
              <Link
                key={view.id}
                to={view.viewer?.id ? `/u/${view.viewer.id}` : "#"}
                className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm">
                    {view.viewer
                      ? (view.viewer.full_name || view.viewer.first_name || "U")
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {view.viewer?.full_name ||
                      `${view.viewer?.first_name || ""} ${view.viewer?.last_name || ""}`.trim() ||
                      "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize truncate">
                    {view.viewer?.role || "Member"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(view.created_at), { addSuffix: true })}
                  </p>
                </div>
              </Link>
            ))}

            {viewCount > 10 && (
              <div className="text-center pt-2">
                <span className="text-sm text-muted-foreground">
                  +{viewCount - 10} more views
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact inline version for profile page
interface ProfileViewsInlineProps {
  className?: string;
}

export function ProfileViewsInline({ className }: ProfileViewsInlineProps) {
  const { data: views, isLoading } = useProfileViews();

  if (isLoading) {
    return <Skeleton className="h-5 w-24" />;
  }

  const viewCount = views?.length || 0;

  if (viewCount === 0) return null;

  return (
    <div className={cn("flex items-center gap-1.5 text-sm text-muted-foreground", className)}>
      <Eye className="h-4 w-4" />
      <span>
        {viewCount} profile view{viewCount !== 1 ? "s" : ""} this month
      </span>
      {viewCount > 5 && (
        <TrendingUp className="h-3.5 w-3.5 text-emerald-500 ml-1" />
      )}
    </div>
  );
}
