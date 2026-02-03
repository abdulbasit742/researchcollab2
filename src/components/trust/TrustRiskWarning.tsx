import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustRiskWarningProps {
  counterpartyTrustScore: number;
  dealAmount: number;
  hasDisputes?: boolean;
  missedDeadlines?: number;
}

export function TrustRiskWarning({
  counterpartyTrustScore,
  dealAmount,
  hasDisputes = false,
  missedDeadlines = 0,
}: TrustRiskWarningProps) {
  const riskFactors: { message: string; severity: "low" | "medium" | "high" }[] = [];

  // Check risk factors
  if (counterpartyTrustScore < 30) {
    riskFactors.push({
      message: "Low trust score - limited track record",
      severity: "high",
    });
  } else if (counterpartyTrustScore < 50) {
    riskFactors.push({
      message: "Moderate trust score - some verified work",
      severity: "medium",
    });
  }

  if (hasDisputes) {
    riskFactors.push({
      message: "Has unresolved disputes",
      severity: "high",
    });
  }

  if (missedDeadlines > 0) {
    riskFactors.push({
      message: `${missedDeadlines} deadline(s) missed in past deals`,
      severity: missedDeadlines > 2 ? "high" : "medium",
    });
  }

  if (dealAmount > 100000 && counterpartyTrustScore < 60) {
    riskFactors.push({
      message: "Large deal with moderate trust profile",
      severity: "medium",
    });
  }

  if (riskFactors.length === 0) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Low Risk Deal</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Counterparty has a strong trust profile.
          </p>
        </CardContent>
      </Card>
    );
  }

  const highRiskCount = riskFactors.filter(r => r.severity === "high").length;
  const overallRisk = highRiskCount > 0 ? "high" : "medium";

  return (
    <Card className={cn(
      "border-2",
      overallRisk === "high" 
        ? "border-destructive/50 bg-destructive/5" 
        : "border-amber-500/50 bg-amber-500/5"
    )}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className={cn(
            "h-4 w-4",
            overallRisk === "high" ? "text-destructive" : "text-amber-600"
          )} />
          <span className={cn(
            "text-sm font-medium",
            overallRisk === "high" ? "text-destructive" : "text-amber-600"
          )}>
            {overallRisk === "high" ? "High Risk Factors" : "Moderate Risk Factors"}
          </span>
        </div>

        <ul className="space-y-1">
          {riskFactors.map((factor, i) => (
            <li key={i} className="flex items-start gap-2 text-xs">
              <Badge 
                variant="outline" 
                className={cn(
                  "h-4 text-[10px] px-1",
                  factor.severity === "high" 
                    ? "border-destructive text-destructive" 
                    : "border-amber-500 text-amber-600"
                )}
              >
                {factor.severity}
              </Badge>
              <span className="text-muted-foreground">{factor.message}</span>
            </li>
          ))}
        </ul>

        <div className="mt-2 pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Use milestone payments for added protection
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
