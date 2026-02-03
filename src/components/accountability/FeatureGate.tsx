import { useState, useEffect, ReactNode } from "react";
import { useFeatureAccess, useTrustScoreComponents, type FeatureAccessGate } from "@/hooks/useTrustEngine";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Shield, TrendingUp, Briefcase, CheckCircle, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface FeatureGateProps {
  featureName: string;
  children: ReactNode;
  fallback?: ReactNode;
  showRequirements?: boolean;
}

export function FeatureGate({ featureName, children, fallback, showRequirements = true }: FeatureGateProps) {
  const { checkAccess, getGateRequirements, loading: gatesLoading } = useFeatureAccess();
  const { components, loading: componentsLoading } = useTrustScoreComponents();
  const [accessState, setAccessState] = useState<{ allowed: boolean; reason?: string } | null>(null);

  useEffect(() => {
    async function check() {
      const result = await checkAccess(featureName);
      setAccessState(result);
    }
    if (!gatesLoading) {
      check();
    }
  }, [featureName, checkAccess, gatesLoading]);

  if (gatesLoading || componentsLoading || accessState === null) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (accessState.allowed) {
    return <>{children}</>;
  }

  // Show fallback or locked state
  if (fallback) {
    return <>{fallback}</>;
  }

  const requirements = getGateRequirements(featureName);

  if (!showRequirements) {
    return null;
  }

  return (
    <Card className="border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10">
      <CardContent className="py-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="font-semibold mb-2">Feature Locked</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {accessState.reason || "You don't have access to this feature yet."}
        </p>

        {requirements && (
          <div className="space-y-3 max-w-xs mx-auto text-left mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Requirements:</p>
            
            <RequirementRow
              icon={Shield}
              label="Trust Score"
              required={requirements.minimum_trust_score}
              current={components?.total_trust_score ?? 0}
              isMet={(components?.total_trust_score ?? 0) >= requirements.minimum_trust_score}
            />
            
            {requirements.minimum_projects_completed > 0 && (
              <RequirementRow
                icon={Briefcase}
                label="Projects Completed"
                required={requirements.minimum_projects_completed}
                current={components?.projects_completed ?? 0}
                isMet={(components?.projects_completed ?? 0) >= requirements.minimum_projects_completed}
              />
            )}
            
            {requirements.minimum_account_age_days > 0 && (
              <RequirementRow
                icon={TrendingUp}
                label="Account Age (days)"
                required={requirements.minimum_account_age_days}
                current={0} // Would need to calculate
                isMet={false}
              />
            )}
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" asChild>
            <Link to="/offers">
              <Briefcase className="h-4 w-4 mr-2" />
              Complete Projects
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/verification">
              <Shield className="h-4 w-4 mr-2" />
              Get Verified
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RequirementRow({
  icon: Icon,
  label,
  required,
  current,
  isMet,
}: {
  icon: LucideIcon;
  label: string;
  required: number;
  current: number;
  isMet: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", isMet ? "text-primary" : "text-muted-foreground")} />
        <span className={cn(isMet ? "text-primary" : "text-muted-foreground")}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("font-mono", isMet ? "text-primary" : "text-destructive")}>
          {current}/{required}
        </span>
        {isMet && <CheckCircle className="h-4 w-4 text-primary" />}
      </div>
    </div>
  );
}

// Simple access check wrapper
export function useFeatureGate(featureName: string) {
  const { checkAccess, getGateRequirements } = useFeatureAccess();
  const [state, setState] = useState<{ allowed: boolean; reason?: string; loading: boolean }>({
    allowed: false,
    loading: true,
  });

  useEffect(() => {
    async function check() {
      const result = await checkAccess(featureName);
      setState({ ...result, loading: false });
    }
    check();
  }, [featureName, checkAccess]);

  return {
    ...state,
    requirements: getGateRequirements(featureName),
  };
}
