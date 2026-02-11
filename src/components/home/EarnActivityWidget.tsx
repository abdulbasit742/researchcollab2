import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, ArrowRight, Briefcase, TrendingUp } from "lucide-react";
import { useMyBids } from "@/hooks/useEarning";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export function EarnActivityWidget() {
  const { user } = useAuth();
  const { bids, loading } = useMyBids();

  if (!user) return null;

  const activeBids = bids.filter(b => b.status === "pending" || b.status === "viewed" || b.status === "shortlisted");
  const acceptedBids = bids.filter(b => b.status === "accepted");
  const recentUpdates = bids.filter(b => b.status !== "pending").slice(0, 3);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Earn Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            Active Bids
          </span>
          <Badge variant="secondary" className="text-xs">
            {activeBids.length}
          </Badge>
        </div>

        {acceptedBids.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Accepted
            </span>
            <Badge variant="success" className="text-xs">
              {acceptedBids.length}
            </Badge>
          </div>
        )}

        {recentUpdates.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t">
            {recentUpdates.map(bid => (
              <div key={bid.id} className="text-xs text-muted-foreground truncate">
                <span className="capitalize font-medium text-foreground">{bid.status}</span>
                {" — "}
                {bid.project_title}
              </div>
            ))}
          </div>
        )}

        <Button variant="ghost" size="sm" asChild className="w-full gap-1 text-xs">
          <Link to="/earn">
            View All
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
