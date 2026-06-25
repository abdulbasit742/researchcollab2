import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_ORDER_CHECKOUT,
  getDemoOrderCheckoutCounts,
  getDemoOrderCheckoutStatusClass,
  getDemoOrderCheckoutStatusLabel,
  getDemoOrderRequirementStatusClass,
  getDemoOrderRequirementStatusLabel,
  type DemoOrderCheckout,
  type DemoOrderRequirement,
  type DemoOrderStep,
} from "@/config/demoOrderCheckout";
import { AlertTriangle, CheckCircle2, ClipboardCheck, CreditCard, FileUp, Lock, PackageCheck, ShoppingCart, type LucideIcon } from "lucide-react";

type DemoOrderCheckoutPanelProps = {
  order?: DemoOrderCheckout;
};

export function DemoOrderCheckoutPanel({ order = DEMO_ORDER_CHECKOUT }: DemoOrderCheckoutPanelProps) {
  const counts = getDemoOrderCheckoutCounts(order);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Checkout Readiness" value={`${order.readiness}%`} helper="Demo order setup" danger={order.readiness < 80} />
        <MetricCard label="Requirements" value={`${counts.completedRequirements}/${counts.totalRequirements}`} helper="Buyer inputs" />
        <MetricCard label="Missing" value={counts.missingRequirements.toString()} helper="Before order" danger={counts.missingRequirements > 0} />
        <MetricCard label="Locked Steps" value={counts.lockedSteps.toString()} helper="Safety gates" danger={counts.lockedSteps > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getDemoOrderCheckoutStatusClass(order.status)}>{getDemoOrderCheckoutStatusLabel(order.status)}</Badge>
                <Badge variant="outline">{order.selectedPackage}</Badge>
                <Badge variant="secondary">{order.deliveryLabel}</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Demo Order Checkout
              </CardTitle>
              <CardDescription>{order.orderSummary}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <FileUp className="mr-2 h-4 w-4" /> Upload Files
              </Button>
              <Button disabled>
                <CreditCard className="mr-2 h-4 w-4" /> Place Demo Order
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Checkout readiness</span>
              <span>{order.readiness}%</span>
            </div>
            <Progress value={order.readiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo-only checkout: no real payment, escrow, payout, or order fulfillment happens here. Production checkout needs verified users, terms acceptance, payment provider setup, invoices, audit logs, and dispute policy.
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <InfoCard label="Service" value={order.serviceTitle} />
            <InfoCard label="Buyer" value={order.buyerName} />
            <InfoCard label="Seller" value={order.sellerName} />
            <InfoCard label="Price" value={order.priceLabel} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <RequirementsList requirements={order.requirements} />
            <InfoCard label="Package Terms" value={`${order.selectedPackage} · ${order.deliveryLabel} · ${order.revisionLabel}`} />
          </div>

          <div className="grid gap-4">
            {order.steps.map((step) => (
              <DemoOrderStepCard key={step.id} step={step} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RequirementsList({ requirements }: { requirements: DemoOrderRequirement[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ClipboardCheck className="h-4 w-4 text-primary" /> Buyer Requirements
      </p>
      <div className="mt-3 space-y-3">
        {requirements.map((requirement) => (
          <div key={requirement.id} className="rounded-lg border bg-muted/20 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getDemoOrderRequirementStatusClass(requirement.status)}>
                {getDemoOrderRequirementStatusLabel(requirement.status)}
              </Badge>
              <p className="text-sm font-medium">{requirement.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{requirement.helper}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemoOrderStepCard({ step }: { step: DemoOrderStep }) {
  const locked = step.status === "locked";

  return (
    <div className="rounded-xl border bg-background p-4 space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Badge className={getDemoOrderCheckoutStatusClass(step.status)}>{getDemoOrderCheckoutStatusLabel(step.status)}</Badge>
          <div>
            <h4 className="text-lg font-semibold">{step.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
          </div>
        </div>
        <Button variant="outline" disabled>
          {locked ? <Lock className="mr-2 h-4 w-4" /> : <PackageCheck className="mr-2 h-4 w-4" />}
          {locked ? "Locked" : "Preview"}
        </Button>
      </div>
      <Checklist title="Checkout Checklist" icon={locked ? AlertTriangle : CheckCircle2} items={step.checklist} warning={locked} />
    </div>
  );
}

function Checklist({ title, icon: Icon, items, warning = false }: { title: string; icon: LucideIcon; items: string[]; warning?: boolean }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon className={`h-4 w-4 ${warning ? "text-amber-500" : "text-primary"}`} /> {title}
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
