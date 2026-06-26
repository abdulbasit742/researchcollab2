import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEMO_RESEARCHER_EARNINGS,
  formatDemoCurrency,
  getDemoEarningStatusClass,
  getDemoEarningStatusLabel,
  getDemoPayoutCheckStatusClass,
  getDemoPayoutCheckStatusLabel,
  getResearcherDemoEarningsCounts,
  type DemoPayoutCheck,
  type ResearcherDemoEarning,
  type ResearcherDemoEarningsSummary,
} from "@/config/researcherDemoEarnings";
import { Clock, Lock, ReceiptText, ShieldCheck, TrendingUp, WalletCards } from "lucide-react";

type ResearcherDemoEarningsPanelProps = {
  summary?: ResearcherDemoEarningsSummary;
};

export function ResearcherDemoEarningsPanel({ summary = DEMO_RESEARCHER_EARNINGS }: ResearcherDemoEarningsPanelProps) {
  const counts = getResearcherDemoEarningsCounts(summary);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Orders" value={counts.orders.toString()} helper="Demo earnings" />
        <MetricCard label="Gross" value={formatDemoCurrency(counts.gross)} helper="Before fee" />
        <MetricCard label="Platform Fee" value={formatDemoCurrency(counts.fees)} helper="Demo fee" />
        <MetricCard label="Net" value={formatDemoCurrency(counts.net)} helper="After fee" />
        <MetricCard label="On Hold" value={counts.onHold.toString()} helper="Needs review" danger={counts.onHold > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getDemoEarningStatusClass(summary.payoutStatus)}>{getDemoEarningStatusLabel(summary.payoutStatus)}</Badge>
                <Badge variant="outline">{summary.periodLabel}</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <WalletCards className="h-5 w-5 text-primary" />
                Researcher Demo Earnings Dashboard
              </CardTitle>
              <CardDescription>
                Track demo service earnings, platform fee labels, held orders, payout readiness checks, and locked withdrawal actions.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <ReceiptText className="mr-2 h-4 w-4" /> Export Statement
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Request Payout
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            {summary.payoutNote}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard label="Researcher" value={summary.researcherName} />
            <InfoCard label="Missing payout checks" value={counts.missingChecks.toString()} />
            <InfoCard label="Net demo total" value={formatDemoCurrency(counts.net)} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <EarningsList earnings={summary.earnings} />
            <PayoutChecks checks={summary.payoutChecks} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EarningsList({ earnings }: { earnings: ResearcherDemoEarning[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <TrendingUp className="h-4 w-4 text-primary" /> Earnings by Order
      </p>
      <div className="mt-3 space-y-3">
        {earnings.map((earning) => (
          <div key={earning.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getDemoEarningStatusClass(earning.status)}>{getDemoEarningStatusLabel(earning.status)}</Badge>
              <Badge variant="outline">{earning.packageLabel}</Badge>
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" /> {earning.completedLabel}
              </Badge>
            </div>
            <p className="mt-2 font-semibold">{earning.orderTitle}</p>
            <p className="text-xs text-muted-foreground">Buyer: {earning.buyerName}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <AmountBox label="Gross" value={formatDemoCurrency(earning.grossAmount)} />
              <AmountBox label="Fee" value={formatDemoCurrency(earning.platformFee)} />
              <AmountBox label="Net" value={formatDemoCurrency(earning.netAmount)} />
            </div>
            <p className="mt-2 text-muted-foreground">{earning.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PayoutChecks({ checks }: { checks: DemoPayoutCheck[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Payout Readiness Checks
      </p>
      <div className="mt-3 space-y-3">
        {checks.map((check) => (
          <div key={check.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getDemoPayoutCheckStatusClass(check.status)}>{getDemoPayoutCheckStatusLabel(check.status)}</Badge>
              <p className="font-medium">{check.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{check.helper}</p>
          </div>
        ))}
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
