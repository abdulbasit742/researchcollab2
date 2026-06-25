import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_CONTRIBUTION_FLOW,
  formatContributionAmount,
  getDemoContributionCounts,
  getDemoContributionProgress,
  getDemoContributionStatusClass,
  getDemoContributionStatusLabel,
  getDemoContributionStepStatusClass,
  getDemoContributionStepStatusLabel,
  getDemoContributorTypeLabel,
  type DemoContributionFlow,
  type DemoContributionOption,
  type DemoContributionPolicyCheck,
  type DemoContributionStep,
} from "@/config/demoContributionFlow";
import { CheckCircle2, ClipboardCheck, CreditCard, HandCoins, Lock, ShieldCheck, UserRoundCheck, WalletCards, type LucideIcon } from "lucide-react";

type DemoContributionFlowPanelProps = {
  flow?: DemoContributionFlow;
};

export function DemoContributionFlowPanel({ flow = DEMO_CONTRIBUTION_FLOW }: DemoContributionFlowPanelProps) {
  const counts = getDemoContributionCounts(flow);
  const progress = getDemoContributionProgress(flow);
  const selectedOption = flow.options.find((option) => option.id === flow.selectedOptionId);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Selected" value={formatContributionAmount(flow.selectedAmount)} helper="Demo amount" />
        <MetricCard label="After Contribution" value={`${progress}%`} helper="Campaign progress" />
        <MetricCard label="Options" value={counts.options.toString()} helper="Sponsor tiers" />
        <MetricCard label="Steps" value={`${counts.completeSteps}/${counts.steps}`} helper="Flow progress" />
        <MetricCard label="Locked" value={counts.lockedItems.toString()} helper="Payment gates" danger={counts.lockedItems > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getDemoContributionStatusClass(flow.status)}>{getDemoContributionStatusLabel(flow.status)}</Badge>
                <Badge variant="outline">{getDemoContributorTypeLabel(flow.contributorType)}</Badge>
                <Badge variant="secondary">{selectedOption?.label ?? "No option"}</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <HandCoins className="h-5 w-5 text-primary" />
                Demo Contribution Flow
              </CardTitle>
              <CardDescription>{flow.summary}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <WalletCards className="mr-2 h-4 w-4" /> Save Sponsor Draft
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Confirm Contribution
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatContributionAmount(flow.currentRaised)} raised + {formatContributionAmount(flow.selectedAmount)} selected</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo contribution preview only. It does not charge cards, move funds, issue receipts, create a ledger entry, or release campaign money.
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <InfoCard label="Campaign" value={flow.campaignTitle} />
            <InfoCard label="Contributor" value={flow.contributorName} />
            <InfoCard label="Selected amount" value={formatContributionAmount(flow.selectedAmount)} />
            <InfoCard label="Pending policy checks" value={counts.pendingChecks.toString()} />
          </div>

          <ContributionOptions options={flow.options} selectedOptionId={flow.selectedOptionId} />

          <div className="grid gap-4 xl:grid-cols-2">
            <ContributionSteps steps={flow.steps} />
            <PolicyChecks checks={flow.policyChecks} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ContributionOptions({ options, selectedOptionId }: { options: DemoContributionOption[]; selectedOptionId: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <CreditCard className="h-4 w-4 text-primary" /> Contribution Options
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {options.map((option) => (
          <div key={option.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={option.id === selectedOptionId ? "bg-primary/10 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border"}>
                {option.id === selectedOptionId ? "Selected" : "Option"}
              </Badge>
              <Badge variant="outline">{formatContributionAmount(option.amount)}</Badge>
            </div>
            <p className="mt-2 font-medium">{option.label}</p>
            <p className="mt-1 text-muted-foreground">{option.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContributionSteps({ steps }: { steps: DemoContributionStep[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ClipboardCheck className="h-4 w-4 text-primary" /> Contribution Steps
      </p>
      <div className="mt-3 space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getDemoContributionStepStatusClass(step.status)}>{getDemoContributionStepStatusLabel(step.status)}</Badge>
              <p className="font-medium">{step.title}</p>
            </div>
            <p className="mt-1 text-muted-foreground">{step.description}</p>
            <Checklist items={step.checklist} icon={CheckCircle2} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PolicyChecks({ checks }: { checks: DemoContributionPolicyCheck[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Policy and Payment Checks
      </p>
      <div className="mt-3 space-y-3">
        {checks.map((check) => (
          <div key={check.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getDemoContributionStepStatusClass(check.status)}>{getDemoContributionStepStatusLabel(check.status)}</Badge>
              <p className="font-medium">{check.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{check.helper}</p>
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
