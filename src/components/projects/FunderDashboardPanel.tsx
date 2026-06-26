import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_FUNDER_DASHBOARD,
  formatFunderAmount,
  getFunderCampaignProgress,
  getFunderCampaignStatusClass,
  getFunderCampaignStatusLabel,
  getFunderContributionStatusClass,
  getFunderContributionStatusLabel,
  getFunderDashboardCounts,
  getFunderRiskClass,
  getFunderUpdateStatusClass,
  getFunderUpdateStatusLabel,
  type FunderContribution,
  type FunderDashboardSummary,
  type FunderImpactUpdate,
  type FunderSupportedCampaign,
} from "@/config/funderDashboard";
import { BellRing, Eye, HeartHandshake, Lock, ReceiptText, WalletCards } from "lucide-react";

type FunderDashboardPanelProps = {
  summary?: FunderDashboardSummary;
};

export function FunderDashboardPanel({ summary = DEMO_FUNDER_DASHBOARD }: FunderDashboardPanelProps) {
  const counts = getFunderDashboardCounts(summary);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Campaigns" value={counts.campaigns.toString()} helper="Tracked" />
        <MetricCard label="Supported" value={counts.supported.toString()} helper="Has demo amount" />
        <MetricCard label="Total Support" value={formatFunderAmount(counts.totalContributed)} helper="Demo labels" />
        <MetricCard label="Held" value={counts.heldContributions.toString()} helper="Needs setup" danger={counts.heldContributions > 0} />
        <MetricCard label="Updates" value={counts.newUpdates.toString()} helper="Needs review" danger={counts.newUpdates > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getFunderCampaignStatusClass(summary.dashboardStatus)}>
                  {getFunderCampaignStatusLabel(summary.dashboardStatus)}
                </Badge>
                <Badge variant="outline">{summary.funderType}</Badge>
                <Badge variant="secondary">{summary.periodLabel}</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <HeartHandshake className="h-5 w-5 text-primary" />
                Funder Dashboard
              </CardTitle>
              <CardDescription>
                Track supported campaigns, contribution labels, milestone reviews, impact updates, and sponsor-safe actions.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <ReceiptText className="mr-2 h-4 w-4" /> Download Statement
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Add Support Locked
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            {summary.safetyNote}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard label="Funder" value={summary.funderName} />
            <InfoCard label="Demo support total" value={formatFunderAmount(counts.totalContributed)} />
            <InfoCard label="New / action updates" value={counts.newUpdates.toString()} />
          </div>

          <SupportedCampaigns campaigns={summary.campaigns} />

          <div className="grid gap-4 xl:grid-cols-2">
            <ContributionList contributions={summary.contributions} />
            <ImpactUpdates updates={summary.impactUpdates} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SupportedCampaigns({ campaigns }: { campaigns: FunderSupportedCampaign[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Eye className="h-4 w-4 text-primary" /> Supported / Watched Campaigns
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {campaigns.map((campaign) => {
          const progress = getFunderCampaignProgress(campaign);
          return (
            <div key={campaign.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getFunderCampaignStatusClass(campaign.status)}>{getFunderCampaignStatusLabel(campaign.status)}</Badge>
                <Badge className={getFunderRiskClass(campaign.riskLevel)}>{campaign.riskLevel} risk</Badge>
              </div>
              <p className="mt-2 font-medium">{campaign.title}</p>
              <p className="text-xs text-muted-foreground">{campaign.category} · {campaign.owner}</p>
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatFunderAmount(campaign.campaignRaised)}</span>
                  <span>{formatFunderAmount(campaign.campaignGoal)}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <div className="mt-3 rounded-lg border bg-background p-2">
                <p className="text-xs text-muted-foreground">Your support</p>
                <p className="font-medium">{formatFunderAmount(campaign.contributionAmount)}</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Next milestone: {campaign.nextMilestone}</p>
              <p className="mt-1 text-muted-foreground">{campaign.nextAction}</p>
              <Button className="mt-3 w-full" variant="outline" disabled>
                <Lock className="mr-2 h-4 w-4" /> Review Locked
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContributionList({ contributions }: { contributions: FunderContribution[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <WalletCards className="h-4 w-4 text-primary" /> Contribution Summary
      </p>
      <div className="mt-3 space-y-3">
        {contributions.map((contribution) => (
          <div key={contribution.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getFunderContributionStatusClass(contribution.status)}>
                {getFunderContributionStatusLabel(contribution.status)}
              </Badge>
              <Badge variant="outline">{formatFunderAmount(contribution.amount)}</Badge>
              <Badge variant="secondary">{contribution.dateLabel}</Badge>
            </div>
            <p className="mt-2 font-medium">{contribution.campaignTitle}</p>
            <p className="mt-1 text-muted-foreground">{contribution.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImpactUpdates({ updates }: { updates: FunderImpactUpdate[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <BellRing className="h-4 w-4 text-primary" /> Impact Updates
      </p>
      <div className="mt-3 space-y-3">
        {updates.map((update) => (
          <div key={update.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getFunderUpdateStatusClass(update.status)}>{getFunderUpdateStatusLabel(update.status)}</Badge>
              <Badge variant="outline">{update.timeLabel}</Badge>
            </div>
            <p className="mt-2 font-medium">{update.updateTitle}</p>
            <p className="text-xs text-muted-foreground">{update.campaignTitle}</p>
            <p className="mt-1 text-muted-foreground">{update.summary}</p>
          </div>
        ))}
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
