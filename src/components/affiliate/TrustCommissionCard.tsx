import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Shield, AlertTriangle, Info } from "lucide-react";
import { Affiliate } from "@/hooks/useMyAffiliate";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface TrustCommissionCardProps {
  affiliate: Affiliate;
}

export function TrustCommissionCard({ affiliate }: TrustCommissionCardProps) {
  const trustScore = affiliate.trust_score_at_activation || 50;
  const trustWeight = affiliate.current_trust_weight || 1.0;
  const baseRate = affiliate.base_commission_rate || 12;
  const effectiveRate = affiliate.effective_commission_rate || (baseRate * trustWeight);
  const qualityScore = affiliate.referral_quality_score || 100;
  const violationCount = affiliate.violation_count || 0;

  // Determine tier based on trust score
  const getTier = () => {
    if (trustScore >= 80) return { name: "Platinum", color: "text-purple-500", bg: "bg-purple-500/10" };
    if (trustScore >= 60) return { name: "Gold", color: "text-amber-500", bg: "bg-amber-500/10" };
    if (trustScore >= 40) return { name: "Silver", color: "text-slate-400", bg: "bg-slate-500/10" };
    return { name: "Bronze", color: "text-orange-500", bg: "bg-orange-500/10" };
  };

  const tier = getTier();

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trust-Weighted Commission
          </CardTitle>
          <Badge className={`${tier.bg} ${tier.color}`}>{tier.name} Tier</Badge>
        </div>
        <CardDescription>
          Your commission rate is calculated based on your trust score and referral quality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Commission Display */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div>
            <p className="text-sm text-muted-foreground">Your Effective Rate</p>
            <p className="text-4xl font-bold text-primary">{effectiveRate.toFixed(1)}%</p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Base: {baseRate}%</p>
            <p>Trust Multiplier: {trustWeight.toFixed(2)}x</p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-4">
          {/* Trust Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Trust Score
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Your trust score is based on your platform activity, 
                        project completions, and overall reliability.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span className="font-medium">{trustScore}/100</span>
            </div>
            <Progress value={trustScore} className="h-2" />
          </div>

          {/* Referral Quality */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Referral Quality
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Based on how many of your referrals become active users 
                        who complete real outcomes on the platform.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span className={`font-medium ${qualityScore < 50 ? "text-amber-500" : ""}`}>
                {qualityScore}%
              </span>
            </div>
            <Progress 
              value={qualityScore} 
              className={`h-2 ${qualityScore < 50 ? "[&>div]:bg-amber-500" : ""}`} 
            />
          </div>

          {/* Violations Warning */}
          {violationCount > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  {violationCount} Active Violation{violationCount > 1 ? "s" : ""}
                </p>
                <p className="text-muted-foreground text-xs">
                  Violations reduce your trust weight and commission rate.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* How to improve */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">How to increase your rate:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-primary" />
              Refer users who complete projects (not just sign up)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-primary" />
              Maintain zero violations and spam flags
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-primary" />
              Build your own trust score through platform activity
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
