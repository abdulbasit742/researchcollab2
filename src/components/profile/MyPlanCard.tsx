import { Link } from "react-router-dom";
import { Crown, Briefcase, User, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUserSubscription } from "@/hooks/useSubscriptions";

const planConfig: Record<string, { icon: React.ElementType; color: string; badgeVariant: "default" | "warning" | "premium" }> = {
  basic: { icon: User, color: "text-muted-foreground", badgeVariant: "default" },
  career: { icon: Briefcase, color: "text-amber-500", badgeVariant: "warning" },
  business: { icon: Crown, color: "text-primary", badgeVariant: "premium" },
};

const planLimits: Record<string, { bids: number; aiWords: number; peerReviews: number }> = {
  basic: { bids: 3, aiWords: 1000, peerReviews: 0 },
  career: { bids: 999, aiWords: 10000, peerReviews: 1 },
  business: { bids: 999, aiWords: 50000, peerReviews: 3 },
};

export function MyPlanCard() {
  const { currentTier, loading } = useUserSubscription();

  if (loading) return null;

  // Map existing tier names to new LinkedIn-style names
  const tierName = currentTier?.name?.toLowerCase() || "free";
  const planName = tierName === "free" ? "basic" : tierName === "pro" ? "career" : tierName === "elite" ? "business" : tierName;
  const displayName = planName.charAt(0).toUpperCase() + planName.slice(1);
  const config = planConfig[planName] || planConfig.basic;
  const limits = planLimits[planName] || planLimits.basic;
  const Icon = config.icon;

  // Placeholder usage values
  const usage = { bids: 1, aiWords: 320, peerReviews: 0 };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">My Plan</CardTitle>
          <Badge variant={config.badgeVariant} className="gap-1">
            <Icon className="h-3 w-3" />
            {displayName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bids */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Bids this month</span>
            <span className="font-medium">
              {usage.bids}/{limits.bids >= 999 ? "∞" : limits.bids}
            </span>
          </div>
          <Progress value={limits.bids >= 999 ? 5 : (usage.bids / limits.bids) * 100} className="h-1.5" />
        </div>

        {/* AI Words */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">AI words used</span>
            <span className="font-medium">
              {usage.aiWords.toLocaleString()}/{limits.aiWords >= 50000 ? "50K" : (limits.aiWords / 1000) + "K"}
            </span>
          </div>
          <Progress value={(usage.aiWords / limits.aiWords) * 100} className="h-1.5" />
        </div>

        {/* Peer Reviews */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Peer reviews</span>
            <span className="font-medium">
              {usage.peerReviews}/{limits.peerReviews || "—"}
            </span>
          </div>
          {limits.peerReviews > 0 ? (
            <Progress value={(usage.peerReviews / limits.peerReviews) * 100} className="h-1.5" />
          ) : (
            <Progress value={0} className="h-1.5" />
          )}
        </div>

        <Button variant={planName === "business" ? "outline" : "hero"} size="sm" className="w-full" asChild>
          <Link to="/pricing">
            <Zap className="h-3.5 w-3.5 mr-1" />
            {planName === "business" ? "Manage Plan" : "Upgrade Plan"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}