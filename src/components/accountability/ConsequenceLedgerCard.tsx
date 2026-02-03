import { ConsequenceLedger } from "@/hooks/useAccountability";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Award,
  Building,
  Clock,
} from "lucide-react";

interface ConsequenceLedgerCardProps {
  ledger: ConsequenceLedger | null;
  isCompact?: boolean;
}

export function ConsequenceLedgerCard({ ledger, isCompact = false }: ConsequenceLedgerCardProps) {
  if (!ledger) {
    return (
      <Card className={isCompact ? "" : "border-dashed"}>
        <CardContent className={isCompact ? "p-4" : "py-8"}>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Briefcase className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="font-medium text-sm mb-1">No Track Record Yet</h4>
            <p className="text-xs text-muted-foreground">
              Complete your first project to build your consequence ledger.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const trajectoryConfig = {
    rising: { icon: TrendingUp, color: "text-emerald-600", label: "Rising" },
    stable: { icon: Minus, color: "text-amber-600", label: "Stable" },
    declining: { icon: TrendingDown, color: "text-red-600", label: "Declining" },
  };

  const trajectory = trajectoryConfig[ledger.trust_trajectory as keyof typeof trajectoryConfig] || trajectoryConfig.stable;
  const TrajectoryIcon = trajectory.icon;

  // Calculate failure rate (LinkedIn can't show this!)
  const failureRate = ledger.projects_attempted > 0
    ? ((ledger.projects_failed / ledger.projects_attempted) * 100).toFixed(1)
    : "0";

  if (isCompact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Consequence Ledger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Key Stats Row */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="h-3 w-3 text-emerald-600" />
              </div>
              <p className="text-lg font-bold">{ledger.projects_completed}</p>
              <p className="text-[10px] text-muted-foreground">Completed</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 mb-1">
                <XCircle className="h-3 w-3 text-red-600" />
              </div>
              <p className="text-lg font-bold">{ledger.projects_failed}</p>
              <p className="text-[10px] text-muted-foreground">Failed</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrajectoryIcon className={`h-3 w-3 ${trajectory.color}`} />
              </div>
              <p className="text-lg font-bold">{ledger.trust_score_current}</p>
              <p className="text-[10px] text-muted-foreground">Trust</p>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Completion Rate</span>
              <span className="font-medium">{ledger.completion_rate.toFixed(0)}%</span>
            </div>
            <Progress value={ledger.completion_rate} className="h-1.5" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Consequence Ledger
        </CardTitle>
        <CardDescription>
          Your permanent professional record — successes AND failures visible
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Projects Section */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Project Record
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox
              label="Attempted"
              value={ledger.projects_attempted}
              icon={Briefcase}
              color="text-muted-foreground"
            />
            <StatBox
              label="Completed"
              value={ledger.projects_completed}
              icon={CheckCircle}
              color="text-emerald-600"
            />
            <StatBox
              label="Failed"
              value={ledger.projects_failed}
              icon={XCircle}
              color="text-red-600"
              highlight={ledger.projects_failed > 0}
            />
            <StatBox
              label="Abandoned"
              value={ledger.projects_abandoned}
              icon={AlertTriangle}
              color="text-amber-600"
              highlight={ledger.projects_abandoned > 0}
            />
          </div>

          {/* Rates */}
          <div className="mt-4 space-y-3">
            <RateBar label="Completion Rate" value={ledger.completion_rate} />
            <RateBar label="On-Time Rate" value={ledger.on_time_rate} />
            <RateBar
              label="Failure Rate"
              value={parseFloat(failureRate)}
              isNegative
            />
          </div>
        </div>

        {/* Money Section */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial Truth
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Escrow Handled</p>
              <p className="font-bold">${ledger.total_escrow_handled.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center">
              <p className="text-xs text-emerald-600 mb-1">Released</p>
              <p className="font-bold text-emerald-700">${ledger.total_escrow_released.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
              <p className="text-xs text-red-600 mb-1">Disputed</p>
              <p className="font-bold text-red-700">${ledger.total_escrow_disputed.toLocaleString()}</p>
            </div>
          </div>

          {/* Escrow Success Rate */}
          <div className="mt-3">
            <RateBar label="Escrow Success Rate" value={ledger.escrow_success_rate} />
          </div>
        </div>

        {/* Disputes Section */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Dispute History
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Raised</p>
              <p className="font-bold">{ledger.disputes_raised}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center">
              <p className="text-xs text-emerald-600 mb-1">Won</p>
              <p className="font-bold text-emerald-700">{ledger.disputes_won}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
              <p className="text-xs text-red-600 mb-1">Lost</p>
              <p className="font-bold text-red-700">{ledger.disputes_lost}</p>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Trust Trajectory
          </h4>
          <div className="flex items-center gap-4">
            <div className="flex-1 grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground mb-1">Current</p>
                <p className="font-bold">{ledger.trust_score_current}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center">
                <p className="text-xs text-emerald-600 mb-1">Peak</p>
                <p className="font-bold text-emerald-700">{ledger.trust_score_peak}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
                <p className="text-xs text-red-600 mb-1">Lowest</p>
                <p className="font-bold text-red-700">{ledger.trust_score_lowest}</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`p-3 rounded-full ${trajectory.color.replace("text-", "bg-").replace("-600", "-100")} dark:bg-opacity-20`}>
                <TrajectoryIcon className={`h-6 w-6 ${trajectory.color}`} />
              </div>
              <p className={`text-xs font-medium mt-1 ${trajectory.color}`}>
                {trajectory.label}
              </p>
            </div>
          </div>
        </div>

        {/* Institutions */}
        {ledger.institutions_worked_with.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Institutions
            </h4>
            <div className="flex flex-wrap gap-2">
              {ledger.institutions_worked_with.map((inst) => (
                <Badge key={inst} variant="outline">
                  {inst}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Last Activity */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t">
          {ledger.last_completed_project_at && (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-emerald-600" />
              <span>
                Last completed: {new Date(ledger.last_completed_project_at).toLocaleDateString()}
              </span>
            </div>
          )}
          {ledger.last_failure_at && (
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-600" />
              <span>
                Last failure: {new Date(ledger.last_failure_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatBox({
  label,
  value,
  icon: Icon,
  color,
  highlight = false,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-3 rounded-lg text-center ${
      highlight ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" : "bg-muted/50"
    }`}>
      <div className="flex items-center justify-center gap-1 mb-1">
        <Icon className={`h-3 w-3 ${color}`} />
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function RateBar({
  label,
  value,
  isNegative = false,
}: {
  label: string;
  value: number;
  isNegative?: boolean;
}) {
  const displayValue = Math.min(100, Math.max(0, value));

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${
          isNegative
            ? value > 20 ? "text-red-600" : "text-muted-foreground"
            : value >= 80 ? "text-emerald-600" : value >= 50 ? "text-amber-600" : "text-red-600"
        }`}>
          {value.toFixed(1)}%
        </span>
      </div>
      <Progress
        value={displayValue}
        className={`h-1.5 ${isNegative ? "[&>div]:bg-red-500" : ""}`}
      />
    </div>
  );
}
