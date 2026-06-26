import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_CAMPAIGN_MILESTONE_FUNDING,
  formatMilestoneFundingAmount,
  getCampaignFundingLedgerStatusClass,
  getCampaignFundingLedgerStatusLabel,
  getCampaignMilestoneFundingCounts,
  getCampaignMilestoneFundingProgress,
  getCampaignMilestoneFundingStatusClass,
  getCampaignMilestoneFundingStatusLabel,
  getCampaignMilestoneItemProgress,
  getCampaignReleaseCheckStatusClass,
  getCampaignReleaseCheckStatusLabel,
  type CampaignFundingLedgerEntry,
  type CampaignMilestoneFundingItem,
  type CampaignMilestoneFundingSummary,
  type CampaignReleaseCheck,
} from "@/config/campaignMilestoneFunding";
import { CheckCircle2, HandCoins, Landmark, Lock, ReceiptText, ShieldCheck, WalletCards, type LucideIcon } from "lucide-react";

type CampaignMilestoneFundingPanelProps = {
  summary?: CampaignMilestoneFundingSummary;
};

export function CampaignMilestoneFundingPanel({ summary = DEMO_CAMPAIGN_MILESTONE_FUNDING }: CampaignMilestoneFundingPanelProps) {
  const counts = getCampaignMilestoneFundingCounts(summary);
  const progress = getCampaignMilestoneFundingProgress(summary);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Funded" value={formatMilestoneFundingAmount(summary.totalFundedAmount)} helper="Demo total" />
        <MetricCard label="Progress" value={`${progress}%`} helper="Milestone funding" />
        <MetricCard label="Milestones" value={counts.milestones.toString()} helper="Release stages" />
        <MetricCard label="Ready" value={counts.readyToRelease.toString()} helper="Release preview" />
        <MetricCard label="Blocked" value={counts.blocked.toString()} helper="Needs setup" danger={counts.blocked > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getCampaignMilestoneFundingStatusClass(summary.status)}>
                  {getCampaignMilestoneFundingStatusLabel(summary.status)}
                </Badge>
                <Badge variant="outline">{summary.sponsorLabel}</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary" />
                Campaign Milestone Funding
              </CardTitle>
              <CardDescription>
                Track milestone funding labels, release conditions, evidence requirements, checks, and contribution ledger previews.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <ReceiptText className="mr-2 h-4 w-4" /> Export Ledger
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Release Funds Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatMilestoneFundingAmount(summary.totalFundedAmount)} funded of {formatMilestoneFundingAmount(summary.totalMilestoneAmount)}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            {summary.releaseNote}
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <InfoCard label="Campaign" value={summary.campaignTitle} />
            <InfoCard label="Owner" value={summary.owner} />
            <InfoCard label="Missing checks" value={counts.missingChecks.toString()} />
            <InfoCard label="Ledger entries" value={counts.ledgerEntries.toString()} />
          </div>

          <MilestoneFundingList milestones={summary.milestones} />

          <div className="grid gap-4 xl:grid-cols-2">
            <ReleaseChecks checks={summary.releaseChecks} />
            <FundingLedger ledger={summary.ledger} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MilestoneFundingList({ milestones }: { milestones: CampaignMilestoneFundingItem[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <HandCoins className="h-4 w-4 text-primary" /> Funding Milestones
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {milestones.map((milestone) => {
          const progress = getCampaignMilestoneItemProgress(milestone);
          return (
            <div key={milestone.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getCampaignMilestoneFundingStatusClass(milestone.status)}>
                  {getCampaignMilestoneFundingStatusLabel(milestone.status)}
                </Badge>
                <Badge variant="outline">{milestone.dueLabel}</Badge>
              </div>
              <p className="mt-2 font-medium">{milestone.title}</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatMilestoneFundingAmount(milestone.fundedAmount)}</span>
                  <span>{formatMilestoneFundingAmount(milestone.amount)}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <p className="mt-2 text-muted-foreground">{milestone.releaseCondition}</p>
              <Checklist items={milestone.evidenceRequired} icon={CheckCircle2} />
              <Button className="mt-3 w-full" variant="outline" disabled>
                <Lock className="mr-2 h-4 w-4" /> Release Locked
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReleaseChecks({ checks }: { checks: CampaignReleaseCheck[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Release Checks
      </p>
      <div className="mt-3 space-y-3">
        {checks.map((check) => (
          <div key={check.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getCampaignReleaseCheckStatusClass(check.status)}>{getCampaignReleaseCheckStatusLabel(check.status)}</Badge>
              <p className="font-medium">{check.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{check.helper}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FundingLedger({ ledger }: { ledger: CampaignFundingLedgerEntry[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <WalletCards className="h-4 w-4 text-primary" /> Funding Ledger Preview
      </p>
      <div className="mt-3 space-y-3">
        {ledger.map((entry) => (
          <div key={entry.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getCampaignFundingLedgerStatusClass(entry.status)}>{getCampaignFundingLedgerStatusLabel(entry.status)}</Badge>
              <Badge variant="outline">{formatMilestoneFundingAmount(entry.amount)}</Badge>
            </div>
            <p className="mt-2 font-medium">{entry.label}</p>
            <p className="mt-1 text-muted-foreground">{entry.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Checklist({ items, icon: Icon }: { items: string[]; icon: LucideIcon }) {
  return (
    <div className="mt-2 space-y-1">
      {items.map((item) => (
        <p key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
          <Icon className="mt-0.5 h-3 w-3 text-primary" /> {item}
        </p>
      ))}
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
