import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEMO_FUNDING_LEDGER,
  formatLedgerAmount,
  getDemoFundingLedgerCounts,
  getFundingLedgerAuditStatusClass,
  getFundingLedgerAuditStatusLabel,
  getFundingLedgerEntryStatusClass,
  getFundingLedgerEntryStatusLabel,
  getFundingLedgerEntryTypeLabel,
  type DemoFundingLedgerAuditCheck,
  type DemoFundingLedgerEntry,
  type DemoFundingLedgerSummary,
} from "@/config/demoFundingLedger";
import { BookOpenCheck, CheckCircle2, FileSpreadsheet, Lock, ShieldCheck, WalletCards } from "lucide-react";

type DemoFundingLedgerPanelProps = {
  summary?: DemoFundingLedgerSummary;
};

export function DemoFundingLedgerPanel({ summary = DEMO_FUNDING_LEDGER }: DemoFundingLedgerPanelProps) {
  const counts = getDemoFundingLedgerCounts(summary);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Entries" value={counts.entries.toString()} helper="Ledger rows" />
        <MetricCard label="Contributions" value={counts.contributions.toString()} helper="Support labels" />
        <MetricCard label="Held" value={counts.held.toString()} helper="Needs provider" danger={counts.held > 0} />
        <MetricCard label="Blocked" value={counts.blocked.toString()} helper="Release gates" danger={counts.blocked > 0} />
        <MetricCard label="Audit Missing" value={counts.missingAuditChecks.toString()} helper="Setup gaps" danger={counts.missingAuditChecks > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{summary.periodLabel}</Badge>
                <Badge className="bg-muted text-muted-foreground border-border">Demo Only</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <BookOpenCheck className="h-5 w-5 text-primary" />
                Demo Funding Ledger
              </CardTitle>
              <CardDescription>
                Track contribution labels, release previews, held entries, refund previews, and audit readiness without moving real money.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Ledger
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Reconcile Locked
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            {summary.safetyNote}
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <InfoCard label="Opening" value={formatLedgerAmount(summary.openingBalance)} />
            <InfoCard label="Contributions" value={formatLedgerAmount(summary.totalContributions)} />
            <InfoCard label="Held" value={formatLedgerAmount(summary.totalHeld)} />
            <InfoCard label="Release preview" value={formatLedgerAmount(summary.totalReleasePreview)} />
            <InfoCard label="Closing" value={formatLedgerAmount(summary.closingBalance)} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <LedgerEntries entries={summary.entries} />
            <AuditChecks checks={summary.auditChecks} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LedgerEntries({ entries }: { entries: DemoFundingLedgerEntry[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <WalletCards className="h-4 w-4 text-primary" /> Ledger Entries
      </p>
      <div className="mt-3 space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getFundingLedgerEntryStatusClass(entry.status)}>{getFundingLedgerEntryStatusLabel(entry.status)}</Badge>
              <Badge variant="outline">{getFundingLedgerEntryTypeLabel(entry.type)}</Badge>
              <Badge variant="secondary">{entry.dateLabel}</Badge>
            </div>
            <div className="mt-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">{entry.campaignTitle}</p>
                <p className="text-xs text-muted-foreground">{entry.actor} · {entry.reference}</p>
              </div>
              <p className="text-lg font-semibold">{formatLedgerAmount(entry.amount)}</p>
            </div>
            <p className="mt-2 text-muted-foreground">{entry.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditChecks({ checks }: { checks: DemoFundingLedgerAuditCheck[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Ledger Audit Checks
      </p>
      <div className="mt-3 space-y-3">
        {checks.map((check) => (
          <div key={check.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getFundingLedgerAuditStatusClass(check.status)}>{getFundingLedgerAuditStatusLabel(check.status)}</Badge>
              <p className="font-medium">{check.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{check.helper}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg border bg-primary/5 p-3 text-sm">
        <p className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-primary" /> Production Requirement
        </p>
        <p className="mt-1 text-muted-foreground">
          Real funding ledger must reconcile database entries, payment provider events, refunds, releases, sponsor receipts, and admin approvals.
        </p>
      </div>
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
