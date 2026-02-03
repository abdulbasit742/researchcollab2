import { TrustGateResult, TrustAccessGate } from "@/hooks/useAccountability";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Lock,
  Unlock,
  Shield,
  TrendingUp,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

interface TrustGateCardProps {
  gateName: string;
  gateResult: TrustGateResult | null;
  isLoading?: boolean;
  actionPath?: string;
  actionLabel?: string;
}

export function TrustGateCard({
  gateName,
  gateResult,
  isLoading = false,
  actionPath,
  actionLabel = "Proceed",
}: TrustGateCardProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-12 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!gateResult) {
    return null;
  }

  const { allowed, requirements, current, denial_reasons, denial_message } = gateResult;

  if (allowed) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Unlock className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Access Granted</p>
                <p className="text-xs text-muted-foreground">
                  Your trust level meets the requirements
                </p>
              </div>
            </div>
            {actionPath && (
              <Button size="sm" asChild>
                <Link to={actionPath}>
                  {actionLabel}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Denied - show what's needed
  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lock className="h-4 w-4 text-amber-600" />
          Access Restricted
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {denial_message && (
          <p className="text-sm text-muted-foreground">{denial_message}</p>
        )}

        {/* Requirements vs Current */}
        {requirements && current && (
          <div className="space-y-3">
            {/* Trust Score */}
            {requirements.min_trust_score > 0 && (
              <RequirementRow
                label="Trust Score"
                required={requirements.min_trust_score}
                current={current.trust_score}
                icon={Shield}
                suffix=" pts"
              />
            )}

            {/* Projects */}
            {requirements.min_projects > 0 && (
              <RequirementRow
                label="Completed Projects"
                required={requirements.min_projects}
                current={current.projects_completed}
                icon={Briefcase}
              />
            )}

            {/* Success Rate */}
            {requirements.min_success_rate > 0 && (
              <RequirementRow
                label="Escrow Success Rate"
                required={requirements.min_success_rate}
                current={current.escrow_success_rate}
                icon={CheckCircle}
                suffix="%"
              />
            )}
          </div>
        )}

        {/* Denial Reasons */}
        {denial_reasons && denial_reasons.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Requirements not met:
            </p>
            <ul className="space-y-1">
              {denial_reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* How to unlock */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">
            <TrendingUp className="h-3 w-3 inline mr-1" />
            Complete more projects successfully to unlock this feature.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/offers">
              Find Projects
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RequirementRow({
  label,
  required,
  current,
  icon: Icon,
  suffix = "",
}: {
  label: string;
  required: number;
  current: number;
  icon: React.ElementType;
  suffix?: string;
}) {
  const isMet = current >= required;
  const progress = Math.min(100, (current / required) * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Icon className={`h-3 w-3 ${isMet ? "text-emerald-600" : "text-muted-foreground"}`} />
          <span className="text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={isMet ? "text-emerald-600 font-medium" : ""}>
            {current}{suffix}
          </span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{required}{suffix}</span>
          {isMet && <CheckCircle className="h-3 w-3 text-emerald-600" />}
        </div>
      </div>
      <Progress
        value={progress}
        className={`h-1 ${isMet ? "[&>div]:bg-emerald-500" : ""}`}
      />
    </div>
  );
}

// List of all gates for admin/display
interface TrustGatesListProps {
  gates: TrustAccessGate[];
}

export function TrustGatesList({ gates }: TrustGatesListProps) {
  return (
    <div className="space-y-3">
      {gates.map((gate) => (
        <Card key={gate.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-sm mb-1">{gate.gate_name}</h4>
                {gate.gate_description && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {gate.gate_description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    Trust ≥ {gate.min_trust_score}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    Projects ≥ {gate.min_projects_completed}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    Success ≥ {gate.min_escrow_success_rate}%
                  </Badge>
                  {gate.requires_verification && (
                    <Badge variant="secondary" className="text-[10px]">
                      <Shield className="h-3 w-3 mr-1" />
                      Verification Required
                    </Badge>
                  )}
                </div>
              </div>
              <Badge
                variant={gate.is_active ? "default" : "secondary"}
                className="text-[10px]"
              >
                {gate.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
