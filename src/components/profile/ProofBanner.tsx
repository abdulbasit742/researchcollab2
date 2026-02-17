import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Briefcase,
  TrendingUp,
  DollarSign,
  Building,
  Award,
  Shield,
} from "lucide-react";

interface ProofMetrics {
  projects_completed: number;
  escrow_success_rate: number;
  grants_won: number;
  total_earnings: number;
  peer_reviews_received: number;
  institutions_worked_with: string[];
  verification_count: number;
}

interface ProvenSkill {
  skill_name: string;
  endorsement_count: number;
}

function useProofMetrics(userId?: string) {
  return useQuery({
    queryKey: ["proof-metrics", userId],
    queryFn: async () => {
      if (!userId) return null;

      const [metricsRes, skillsRes] = await Promise.all([
        supabase
          .from("profile_proof_metrics")
          .select("projects_completed, escrow_success_rate, grants_won, total_earnings, peer_reviews_received, institutions_worked_with, verification_count")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("user_skills")
          .select("skill_name, endorsement_count")
          .eq("user_id", userId)
          .order("endorsement_count", { ascending: false })
          .limit(5),
      ]);

      return {
        metrics: metricsRes.data as ProofMetrics | null,
        topSkills: (skillsRes.data || []) as ProvenSkill[],
      };
    },
    enabled: !!userId,
  });
}

interface ProofBannerProps {
  userId?: string;
  className?: string;
}

export function ProofBanner({ userId, className }: ProofBannerProps) {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  const { data, isLoading } = useProofMetrics(targetId);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-4">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const metrics = data?.metrics;
  const topSkills = data?.topSkills || [];

  // Don't render if no data at all
  if (!metrics && topSkills.length === 0) return null;

  const provenSkills = topSkills.filter((s) => s.endorsement_count > 0);
  const institutions = metrics?.institutions_worked_with?.filter(Boolean) || [];

  return (
    <Card className={`border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5 ${className || ""}`}>
      <CardContent className="py-4 px-5">
        {/* Top row — Key stats */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {metrics && metrics.projects_completed > 0 && (
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-primary" />
              <span className="font-bold">{metrics.projects_completed}</span>
              <span className="text-muted-foreground">Projects Delivered</span>
            </div>
          )}
          {metrics && metrics.escrow_success_rate > 0 && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="font-bold">{Math.round(metrics.escrow_success_rate)}%</span>
              <span className="text-muted-foreground">On-Time</span>
            </div>
          )}
          {metrics && metrics.total_earnings > 0 && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-amber-500" />
              <span className="font-bold">
                PKR {metrics.total_earnings >= 1000000
                  ? `${(metrics.total_earnings / 1000000).toFixed(1)}M`
                  : metrics.total_earnings >= 1000
                  ? `${(metrics.total_earnings / 1000).toFixed(0)}K`
                  : metrics.total_earnings.toLocaleString()}
              </span>
              <span className="text-muted-foreground">Earned</span>
            </div>
          )}
          {metrics && metrics.verification_count > 0 && (
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="font-bold">{metrics.verification_count}</span>
              <span className="text-muted-foreground">Verifications</span>
            </div>
          )}
        </div>

        {/* Skills row */}
        {provenSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Award className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-xs text-muted-foreground mr-1">Top Skills:</span>
            {provenSkills.slice(0, 4).map((skill) => (
              <Badge
                key={skill.skill_name}
                variant="secondary"
                className="text-xs gap-1"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                {skill.skill_name}
                {skill.endorsement_count > 0 && (
                  <span className="text-muted-foreground">
                    ({skill.endorsement_count})
                  </span>
                )}
              </Badge>
            ))}
          </div>
        )}

        {/* Institutions row */}
        {institutions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground">
              Trusted by: {institutions.slice(0, 3).join(", ")}
              {institutions.length > 3 && ` +${institutions.length - 3} more`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
