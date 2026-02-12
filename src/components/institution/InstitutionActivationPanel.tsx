import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, Zap, TrendingUp, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  orgId: string;
}

export function InstitutionActivationPanel({ orgId }: Props) {
  const { data: enrollments = [] } = useQuery({
    queryKey: ["inst-activation", orgId],
    queryFn: async () => {
      const { data } = await supabase
        .from("institutional_enrollment_records")
        .select("enrollment_status, profile_completion_pct, activation_score, first_bid_at, first_deal_at")
        .eq("institution_id", orgId);
      return data || [];
    },
    enabled: !!orgId,
  });

  const { data: targets = [] } = useQuery({
    queryKey: ["inst-targets", orgId],
    queryFn: async () => {
      const { data } = await supabase
        .from("institutional_targets")
        .select("*")
        .eq("institution_id", orgId)
        .order("quarter", { ascending: false })
        .limit(1);
      return data || [];
    },
    enabled: !!orgId,
  });

  const total = enrollments.length;
  const active = enrollments.filter((e: any) => e.enrollment_status === "active").length;
  const profileComplete = total ? Math.round(enrollments.filter((e: any) => (e.profile_completion_pct || 0) >= 80).length / total * 100) : 0;
  const firstBid = total ? Math.round(enrollments.filter((e: any) => e.first_bid_at).length / total * 100) : 0;
  const firstDeal = total ? Math.round(enrollments.filter((e: any) => e.first_deal_at).length / total * 100) : 0;
  const activationPct = total ? Math.round((active / total) * 100) : 0;

  const target = targets[0] as any;

  const getStatusColor = (current: number, targetVal: number) => {
    const ratio = targetVal > 0 ? current / targetVal : 0;
    if (ratio >= 0.9) return "default";
    if (ratio >= 0.5) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {/* Activation Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Activation Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Activated</span>
                <span className="font-medium">{activationPct}%</span>
              </div>
              <Progress value={activationPct} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Profile ≥ 80%</span>
                <span className="font-medium">{profileComplete}%</span>
              </div>
              <Progress value={profileComplete} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>First Bid Submitted</span>
                <span className="font-medium">{firstBid}%</span>
              </div>
              <Progress value={firstBid} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>First Deal Completed</span>
                <span className="font-medium">{firstDeal}%</span>
              </div>
              <Progress value={firstDeal} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Tracker */}
      {target && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Q{target.quarter} Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Deals</span>
                  <Badge variant={getStatusColor(target.current_deals, target.target_deals) as any}>
                    {target.current_deals}/{target.target_deals}
                  </Badge>
                </div>
                <Progress value={target.target_deals > 0 ? (target.current_deals / target.target_deals) * 100 : 0} className="h-2" />
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Revenue</span>
                  <Badge variant={getStatusColor(Number(target.current_revenue), Number(target.target_revenue)) as any}>
                    {Math.round(Number(target.current_revenue))}/{Math.round(Number(target.target_revenue))}
                  </Badge>
                </div>
                <Progress value={Number(target.target_revenue) > 0 ? (Number(target.current_revenue) / Number(target.target_revenue)) * 100 : 0} className="h-2" />
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Trust Avg</span>
                  <Badge variant={getStatusColor(target.current_trust_average, target.target_trust_average) as any}>
                    {target.current_trust_average}/{target.target_trust_average}
                  </Badge>
                </div>
                <Progress value={target.target_trust_average > 0 ? (target.current_trust_average / target.target_trust_average) * 100 : 0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
