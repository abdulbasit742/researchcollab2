import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_CREATE_SERVICE_DRAFT,
  getServiceDraftStatusClass,
  getServiceDraftStatusLabel,
  getServiceFlowCounts,
  getServiceFlowStepStatusClass,
  getServiceFlowStepStatusLabel,
  type CreateServiceDraft,
  type CreateServiceFlowStep,
} from "@/config/createServiceFlow";
import { CheckCircle2, ClipboardList, FileCheck2, Lock, PackagePlus, PenLine, Send, ShieldCheck, type LucideIcon } from "lucide-react";

type CreateServiceFlowPanelProps = {
  draft?: CreateServiceDraft;
};

export function CreateServiceFlowPanel({ draft = DEMO_CREATE_SERVICE_DRAFT }: CreateServiceFlowPanelProps) {
  const counts = getServiceFlowCounts(draft);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Draft Readiness" value={`${draft.readiness}%`} helper="Service setup" danger={draft.readiness < 80} />
        <MetricCard label="Steps Complete" value={`${counts.completeSteps}/${counts.totalSteps}`} helper="Flow progress" />
        <MetricCard label="Requirements" value={`${counts.completedRequirements}/${draft.requirements.length}`} helper="Required checks" />
        <MetricCard label="Missing Steps" value={counts.missingSteps.toString()} helper="Before publish" danger={counts.missingSteps > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getServiceDraftStatusClass(draft.status)}>{getServiceDraftStatusLabel(draft.status)}</Badge>
                <Badge variant="outline">{draft.category}</Badge>
                <Badge variant="secondary">{draft.deliveryLabel}</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <PackagePlus className="h-5 w-5 text-primary" />
                Create Service Flow
              </CardTitle>
              <CardDescription>{draft.summary}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <PenLine className="mr-2 h-4 w-4" /> Edit Draft
              </Button>
              <Button disabled>
                <Send className="mr-2 h-4 w-4" /> Submit for Review
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Service readiness</span>
              <span>{draft.readiness}%</span>
            </div>
            <Progress value={draft.readiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This is a read-only creation flow. Real service publishing should connect to verified researcher profiles, portfolio files, moderation checks, order policy, and payment configuration.
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard label="Price" value={draft.priceLabel} />
            <InfoCard label="Delivery" value={draft.deliveryLabel} />
            <InfoCard label="Revisions" value={draft.revisionLabel} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Checklist title="Included Deliverables" icon={FileCheck2} items={draft.includedDeliverables} />
            <RequirementList draft={draft} />
          </div>

          <div className="grid gap-4">
            {draft.steps.map((step) => (
              <ServiceFlowStepCard key={step.id} step={step} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ServiceFlowStepCard({ step }: { step: CreateServiceFlowStep }) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={getServiceFlowStepStatusClass(step.status)}>{getServiceFlowStepStatusLabel(step.status)}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{step.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
          </div>
        </div>
        <Button variant="outline" disabled>
          <Lock className="mr-2 h-4 w-4" /> Locked
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Checklist title="Required Fields" icon={ClipboardList} items={step.requiredFields} />
        <div className="rounded-lg border p-3 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <ShieldCheck className="h-4 w-4 text-primary" /> Review Note
          </p>
          <p className="mt-1 text-muted-foreground">{step.reviewNote}</p>
        </div>
      </div>
    </div>
  );
}

function RequirementList({ draft }: { draft: CreateServiceDraft }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Required Checks
      </p>
      <div className="mt-2 space-y-2">
        {draft.requirements.map((requirement) => (
          <p key={requirement.id} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className={`mt-0.5 h-4 w-4 ${requirement.completed ? "text-primary" : "text-amber-500"}`} />
            {requirement.label}
          </p>
        ))}
      </div>
    </div>
  );
}

function Checklist({ title, icon: Icon, items }: { title: string; icon: LucideIcon; items: string[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </p>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <p key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> {item}
          </p>
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
        <p className={`mt-1 text-2xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
