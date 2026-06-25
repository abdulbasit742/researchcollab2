import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_BUDGET_PLANNER,
  formatBudgetAmount,
  getBudgetApprovalProgress,
  getBudgetFundingSourceLabel,
  getBudgetLineCategoryLabel,
  getBudgetLineStatusClass,
  getBudgetLineStatusLabel,
  getBudgetLineVariance,
  getBudgetPlannerCounts,
  getBudgetReviewStatusClass,
  getBudgetReviewStatusLabel,
  type BudgetLineItem,
  type BudgetPlannerSummary,
  type BudgetReviewCheck,
} from "@/config/budgetPlanner";
import { Calculator, ClipboardCheck, FileSpreadsheet, Lock, ShieldCheck, WalletCards } from "lucide-react";

type BudgetPlannerPanelProps = {
  summary?: BudgetPlannerSummary;
};

export function BudgetPlannerPanel({ summary = DEMO_BUDGET_PLANNER }: BudgetPlannerPanelProps) {
  const counts = getBudgetPlannerCounts(summary);
  const approvalProgress = getBudgetApprovalProgress(summary);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-6">
        <MetricCard label="Requested" value={formatBudgetAmount(summary.totalRequested)} helper="Budget ask" />
        <MetricCard label="Approved" value={formatBudgetAmount(summary.totalApproved)} helper="Demo approved" />
        <MetricCard label="Progress" value={`${approvalProgress}%`} helper="Approval ratio" />
        <MetricCard label="Line Items" value={counts.lines.toString()} helper="Budget rows" />
        <MetricCard label="Variance" value={formatBudgetAmount(counts.variance)} helper="Still unapproved" danger={counts.variance > 0} />
        <MetricCard label="Blocked" value={counts.blockedLines.toString()} helper="Policy gates" danger={counts.blockedLines > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getBudgetLineStatusClass(summary.planStatus)}>{getBudgetLineStatusLabel(summary.planStatus)}</Badge>
                <Badge variant="outline">{summary.periodLabel}</Badge>
                <Badge variant="secondary">{counts.approvedLines} approved</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Budget Planner Placeholder
              </CardTitle>
              <CardDescription>
                Plan project spending by category, source label, requested amount, approved amount, variance, and review readiness.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Budget
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Approve Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatBudgetAmount(summary.totalApproved)} approved of {formatBudgetAmount(summary.totalRequested)}</span>
              <span>{approvalProgress}%</span>
            </div>
            <Progress value={approvalProgress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            {summary.safetyNote}
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <InfoCard label="Project" value={summary.projectTitle} />
            <InfoCard label="Owner" value={summary.owner} />
            <InfoCard label="In review" value={counts.reviewLines.toString()} />
            <InfoCard label="Missing checks" value={counts.missingChecks.toString()} />
          </div>

          <BudgetLineItems lineItems={summary.lineItems} />
          <BudgetReviewChecks checks={summary.reviewChecks} />
        </CardContent>
      </Card>
    </div>
  );
}

function BudgetLineItems({ lineItems }: { lineItems: BudgetLineItem[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <WalletCards className="h-4 w-4 text-primary" /> Budget Line Items
      </p>
      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        {lineItems.map((item) => {
          const variance = getBudgetLineVariance(item);
          const approvedProgress = Math.round((item.approvedAmount / item.requestedAmount) * 100);
          return (
            <div key={item.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getBudgetLineStatusClass(item.status)}>{getBudgetLineStatusLabel(item.status)}</Badge>
                <Badge variant="outline">{getBudgetLineCategoryLabel(item.category)}</Badge>
                <Badge variant="secondary">{getBudgetFundingSourceLabel(item.source)}</Badge>
              </div>
              <p className="mt-2 font-medium">{item.title}</p>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <AmountBox label="Requested" value={formatBudgetAmount(item.requestedAmount)} />
                <AmountBox label="Approved" value={formatBudgetAmount(item.approvedAmount)} />
                <AmountBox label="Variance" value={formatBudgetAmount(variance)} />
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Approved</span>
                  <span>{approvedProgress}%</span>
                </div>
                <Progress value={approvedProgress} className="h-2" />
              </div>
              <p className="mt-2 text-muted-foreground">{item.varianceNote}</p>
              <p className="mt-1 text-xs text-muted-foreground">Evidence: {item.evidence}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BudgetReviewChecks({ checks }: { checks: BudgetReviewCheck[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Budget Review Checks
      </p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {checks.map((check) => (
          <div key={check.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getBudgetReviewStatusClass(check.status)}>{getBudgetReviewStatusLabel(check.status)}</Badge>
              <p className="font-medium">{check.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{check.helper}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg border bg-primary/5 p-3 text-sm">
        <p className="flex items-center gap-2 font-medium">
          <ClipboardCheck className="h-4 w-4 text-primary" /> Production Requirement
        </p>
        <p className="mt-1 text-muted-foreground">
          Real budget approval must connect roles, approval thresholds, invoices, payment provider events, grant rules, sponsor policies, and audit logs.
        </p>
      </div>
    </div>
  );
}

function AmountBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return (
    <Card className={danger ? "border-amber-500/30" : undefined}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
