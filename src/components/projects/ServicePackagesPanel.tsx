import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SERVICE_PACKAGE_DEFINITIONS,
  getServicePackageCounts,
  getServicePackageStatusClass,
  getServicePackageStatusLabel,
  getServicePackageTierClass,
  getServicePackageTierLabel,
  type ServicePackageDefinition,
} from "@/config/servicePackages";
import { CheckCircle2, Circle, Clock, Lock, PackageCheck, ShieldCheck, Sparkles, WalletCards, type LucideIcon } from "lucide-react";

type ServicePackagesPanelProps = {
  packages?: ServicePackageDefinition[];
};

export function ServicePackagesPanel({ packages = SERVICE_PACKAGE_DEFINITIONS }: ServicePackagesPanelProps) {
  const counts = getServicePackageCounts(packages);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Packages" value={counts.total.toString()} helper="Pricing tiers" />
        <MetricCard label="Active" value={counts.active.toString()} helper="Visible tiers" />
        <MetricCard label="Needs Review" value={counts.review.toString()} helper="Before launch" danger={counts.review > 0} />
        <MetricCard label="Deliverables" value={counts.totalDeliverables.toString()} helper="Across tiers" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-primary" />
                Service Packages — Basic / Standard / Premium
              </CardTitle>
              <CardDescription>
                Compare service tiers by price, delivery time, revisions, included deliverables, buyer requirements, and feature coverage.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Sparkles className="mr-2 h-4 w-4" /> Recommend Package
              </Button>
              <Button disabled>
                <WalletCards className="mr-2 h-4 w-4" /> Checkout Locked
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This is a demo package comparison. Real package checkout should connect to approved services, buyer requirements, order terms, payment rules, and dispute policy.
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {packages.map((servicePackage) => (
              <ServicePackageCard key={servicePackage.id} servicePackage={servicePackage} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ServicePackageCard({ servicePackage }: { servicePackage: ServicePackageDefinition }) {
  return (
    <div className="flex flex-col rounded-xl border bg-background p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={getServicePackageTierClass(servicePackage.tier)}>{getServicePackageTierLabel(servicePackage.tier)}</Badge>
          <Badge className={getServicePackageStatusClass(servicePackage.status)}>{getServicePackageStatusLabel(servicePackage.status)}</Badge>
        </div>
        <div>
          <h4 className="text-xl font-semibold">{servicePackage.name}</h4>
          <p className="text-sm text-muted-foreground">{servicePackage.subtitle}</p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-lg font-bold">{servicePackage.priceLabel}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {servicePackage.deliveryLabel} · {servicePackage.revisionLabel}
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{servicePackage.bestFor}</p>

      <Checklist title="Deliverables" icon={CheckCircle2} items={servicePackage.deliverables} />
      <Checklist title="Buyer Requirements" icon={ShieldCheck} items={servicePackage.buyerRequirements} />

      <div className="rounded-lg border p-3">
        <p className="text-sm font-medium">Feature Coverage</p>
        <div className="mt-2 space-y-2">
          {servicePackage.features.map((feature) => (
            <p key={feature.id} className="flex items-start gap-2 text-sm text-muted-foreground">
              {feature.included ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> : <Circle className="mt-0.5 h-4 w-4 text-muted-foreground" />}
              {feature.label}
            </p>
          ))}
        </div>
      </div>

      <Button className="mt-auto w-full" disabled>
        <Lock className="mr-2 h-4 w-4" /> Select {servicePackage.name}
      </Button>
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
