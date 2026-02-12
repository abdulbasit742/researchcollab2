import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield, TrendingUp, Eye, Zap } from "lucide-react";

const TIER_ICONS: Record<string, React.ReactNode> = {
  bronze: <Shield className="h-4 w-4 text-amber-700" />,
  silver: <Shield className="h-4 w-4 text-gray-400" />,
  gold: <Shield className="h-4 w-4 text-yellow-500" />,
  platinum: <Shield className="h-4 w-4 text-blue-400" />,
};

interface TrustTierFeeCardProps {
  currentTier?: string;
}

export function TrustTierFeeCard({ currentTier = "bronze" }: TrustTierFeeCardProps) {
  const { data: tiers } = useQuery({
    queryKey: ["trust-tier-fees"],
    queryFn: async () => {
      const { data } = await supabase.from("trust_tier_fees").select("*").eq("is_active", true).order("fee_percentage", { ascending: false });
      return data || [];
    },
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" /> Trust-Tier Benefits
        </CardTitle>
        <CardDescription>Higher trust = lower fees + more visibility</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {(tiers || []).map(t => {
          const isCurrent = t.tier === currentTier;
          return (
            <div
              key={t.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                isCurrent ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center gap-2">
                {TIER_ICONS[t.tier] || <Shield className="h-4 w-4" />}
                <span className="font-medium capitalize text-sm">{t.tier}</span>
                {isCurrent && <Badge variant="default" className="text-xs">You</Badge>}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" /> {Number(t.fee_percentage)}% fee
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> +{Number(t.visibility_boost || 0)}% visibility
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
