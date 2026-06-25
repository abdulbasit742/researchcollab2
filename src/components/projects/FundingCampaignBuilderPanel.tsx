import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_FUNDING_CAMPAIGN,
  formatCampaignAmount,
  getFundingCampaignCounts,
  getFundingCampaignProgress,
  getFundingCampaignStatusClass,
  getFundingCampaignStatusLabel,
  getFundingMilestoneStatusClass,
  getFundingMilestoneStatusLabel,
  getFundingSectionStatusClass,
  getFundingSectionStatusLabel,
  type FundingCampaignDraft,
  type FundingCampaignMilestone,
  type FundingCampaignReadinessCheck,
  type FundingCampaignSection,
} from "@/config/fundingCampaignBuilder";
import { CheckCircle2, ClipboardCheck, Goal, HandCoins, Lock, Megaphone, Rocket, ShieldCheck, type LucideIcon } from "lucide-react";

type FundingCampaignBuilderPanelProps = {
  campaign?: FundingCampaignDraft;
};

export function FundingCampaignBuilderPanel({ campaign = DEMO_FUNDING_CAMPAIGN }: FundingCampaignBuilderPanelProps) {
  const counts = getFundingCampaignCounts(campaign);
  const progress = getFundingCampaignProgress(campaign);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Goal" value={formatCampaignAmount(campaign.goalAmount)} helper="Campaign target" />
        <MetricCard label="Raised" value={formatCampaignAmount(campaign.raisedAmount)} helper="Demo progress" />
        <MetricCard label="Progress" value={`${progress}%`} helper="Funding label" />
        <MetricCard label="Sections" value={`${counts.completeSections}/${counts.sections}`} helper="Story readiness" />
        <MetricCard label="Blocked" value={counts.blockedMilestones.toString()} helper="Milestones" danger={counts.blockedMilestones > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getFundingCampaignStatusClass(campaign.status)}>{getFundingCampaignStatusLabel(campaign.status)}</Badge>
                <Badge variant="outline">{campaign.category}</Badge>
                <Badge variant="secondary">{campaign.durationLabel}</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Funding Campaign Builder
              </CardTitle>
              <CardDescription>{campaign.pitchSummary}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Rocket className="mr-2 h-4 w-4" /> Preview Campaign
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Publish Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatCampaignAmount(campaign.raisedAmount)} raised of {formatCampaignAmount(campaign.goalAmount)}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo campaign builder only. Real funding campaigns need verified owners, sponsor terms, payment provider setup, moderation, contribution records, and usage accountability.
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard label="Campaign" value={campaign.title} />
            <InfoCard label="Owner" value={campaign.owner} />
            <InfoCard label="Missing checks" value={counts.missingChecks.toString()} />
          </div>

          <div className="rounded-lg border bg-primary/5 p-4 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <Goal className="h-4 w-4 text-primary" /> Impact Statement
            </p>
            <p className="mt-1 text-muted-foreground">{campaign.impactStatement}</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <CampaignSections sections={campaign.sections} />
            <ReadinessChecks checks={campaign.readinessChecks} />
          </div>

          <MilestoneFundingList milestones={campaign.milestones} />
        </CardContent>
      </Card>
    </div>
  );
}

function CampaignSections({ sections }: { sections: FundingCampaignSection[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ClipboardCheck className="h-4 w-4 text-primary" /> Campaign Story Sections
      </p>
      <div className="mt-3 space-y-3">
        {sections.map((section) => (
          <div key={section.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getFundingSectionStatusClass(section.status)}>{getFundingSectionStatusLabel(section.status)}</Badge>
              <p className="font-medium">{section.title}</p>
            </div>
            <p className="mt-2 text-muted-foreground">{section.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReadinessChecks({ checks }: { checks: FundingCampaignReadinessCheck[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Launch Readiness Checks
      </p>
      <div className="mt-3 space-y-3">
        {checks.map((check) => (
          <div key={check.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getFundingSectionStatusClass(check.status)}>{getFundingSectionStatusLabel(check.status)}</Badge>
              <p className="font-medium">{check.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{check.helper}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MilestoneFundingList({ milestones }: { milestones: FundingCampaignMilestone[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <HandCoins className="h-4 w-4 text-primary" /> Milestone Funding Labels
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {milestones.map((milestone) => (
          <div key={milestone.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getFundingMilestoneStatusClass(milestone.status)}>{getFundingMilestoneStatusLabel(milestone.status)}</Badge>
              <Badge variant="outline">{milestone.amountLabel}</Badge>
            </div>
            <p className="mt-2 font-medium">{milestone.title}</p>
            <p className="mt-1 text-muted-foreground">{milestone.releaseCondition}</p>
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
