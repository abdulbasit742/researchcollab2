import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, XCircle, Clock, Shield, TrendingUp, 
  AlertTriangle, Briefcase, Calendar, MessageSquare
} from "lucide-react";
import { 
  EligibilityResult, 
  useEligibilityRules,
  useCommissionTiers 
} from "@/hooks/useAffiliateApplication";
import { formatDistanceToNow } from "date-fns";

interface EligibilityStatusProps {
  eligibility: EligibilityResult | null;
  isLoading?: boolean;
}

export function EligibilityStatus({ eligibility, isLoading }: EligibilityStatusProps) {
  const { data: rules } = useEligibilityRules();
  const { data: tiers } = useCommissionTiers();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 animate-pulse text-muted-foreground" />
            <span>Checking eligibility...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!eligibility) {
    return null;
  }

  const { eligible, reasons, snapshot } = eligibility;

  // Calculate eligibility progress
  const totalRules = rules?.length || 5;
  const passedRules = totalRules - (reasons?.length || 0);
  const progressPercent = (passedRules / totalRules) * 100;

  // Find applicable commission tier
  const applicableTier = tiers?.find(
    (tier) =>
      tier.min_trust_score <= snapshot.trust_score &&
      (tier.max_trust_score === null || tier.max_trust_score >= snapshot.trust_score)
  );

  return (
    <div className="space-y-6">
      {/* Eligibility Overview */}
      <Card className={eligible ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {eligible ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  You're Eligible!
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Not Yet Eligible
                </>
              )}
            </CardTitle>
            <Badge variant={eligible ? "default" : "secondary"}>
              {passedRules}/{totalRules} Requirements Met
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercent} className="h-2 mb-4" />
          
          {eligible ? (
            <p className="text-sm text-muted-foreground">
              You meet all requirements to apply for the affiliate program. Complete your application to get started.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete the requirements below to become eligible for the affiliate program.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Requirements Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Eligibility Requirements</CardTitle>
          <CardDescription>
            These requirements ensure only trusted users become affiliates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trust Score */}
          <RequirementRow
            icon={Shield}
            label="Trust Score"
            required={rules?.find((r) => r.rule_key === "min_trust_score")?.rule_value || 40}
            current={snapshot.trust_score}
            passed={!reasons?.some((r) => r.rule === "Minimum Trust Score")}
            suffix=" points"
          />

          {/* Account Age */}
          <RequirementRow
            icon={Calendar}
            label="Account Age"
            required={rules?.find((r) => r.rule_key === "min_account_age_days")?.rule_value || 14}
            current={snapshot.account_age_days}
            passed={!reasons?.some((r) => r.rule === "Minimum Account Age (Days)")}
            suffix=" days"
          />

          {/* Completed Outcomes */}
          <RequirementRow
            icon={Briefcase}
            label="Completed Outcomes"
            required={rules?.find((r) => r.rule_key === "min_outcomes_required")?.rule_value || 1}
            current={snapshot.outcomes_count}
            passed={!reasons?.some((r) => r.rule === "Required Outcomes")}
            suffix=" project(s)"
          />

          {/* No Disputes */}
          <RequirementRow
            icon={MessageSquare}
            label="Unresolved Disputes"
            required={0}
            current={snapshot.unresolved_disputes}
            passed={snapshot.unresolved_disputes === 0}
            isMaximum
            suffix=""
          />

          {/* No Spam Flags */}
          <RequirementRow
            icon={AlertTriangle}
            label="Spam Flags"
            required={0}
            current={snapshot.spam_flags}
            passed={snapshot.spam_flags === 0}
            isMaximum
            suffix=""
          />
        </CardContent>
      </Card>

      {/* Commission Preview */}
      {eligible && applicableTier && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Your Commission Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="secondary">{applicableTier.tier_name}</Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {applicableTier.description}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {(applicableTier.base_commission_rate * applicableTier.trust_weight).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Base: {applicableTier.base_commission_rate}% × {applicableTier.trust_weight}x weight
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commission Tiers Preview */}
      {!eligible && tiers && tiers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Commission Tiers</CardTitle>
            <CardDescription>
              Higher trust scores unlock better commission rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div>
                    <p className="font-medium text-sm">{tier.tier_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Trust Score: {tier.min_trust_score}
                      {tier.max_trust_score ? ` - ${tier.max_trust_score}` : "+"}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {(tier.base_commission_rate * tier.trust_weight).toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper component for requirement rows
function RequirementRow({
  icon: Icon,
  label,
  required,
  current,
  passed,
  isMaximum = false,
  suffix = "",
}: {
  icon: React.ElementType;
  label: string;
  required: number;
  current: number;
  passed: boolean;
  isMaximum?: boolean;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
      <div className="flex items-center gap-3">
        {passed ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-amber-500" />
        )}
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">
            {isMaximum ? `Maximum: ${required}` : `Required: ${required}${suffix}`}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${passed ? "text-green-600" : "text-amber-600"}`}>
          {current}{suffix}
        </p>
        <p className="text-xs text-muted-foreground">Current</p>
      </div>
    </div>
  );
}
