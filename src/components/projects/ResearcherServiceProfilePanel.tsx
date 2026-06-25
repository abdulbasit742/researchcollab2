import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_RESEARCHER_SERVICE_PROFILE,
  getResearchServiceCategoryLabel,
  getResearcherServiceStatusClass,
  getResearcherServiceStatusLabel,
  getResearcherVerificationClass,
  getResearcherVerificationLabel,
  type ResearcherServicePackage,
  type ResearcherServiceProfile,
} from "@/config/researcherServiceProfile";
import { BriefcaseBusiness, CheckCircle2, Clock, Lock, PackageCheck, Star, UserRoundCheck, WalletCards, type LucideIcon } from "lucide-react";

type ResearcherServiceProfilePanelProps = {
  profile?: ResearcherServiceProfile;
};

export function ResearcherServiceProfilePanel({ profile = DEMO_RESEARCHER_SERVICE_PROFILE }: ResearcherServiceProfilePanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Profile Readiness" value={`${profile.profileReadiness}%`} helper="Marketplace setup" danger={profile.profileReadiness < 80} />
        <MetricCard label="Rating" value={profile.rating.toFixed(1)} helper="Demo score" />
        <MetricCard label="Completed" value={profile.completedOrders.toString()} helper="Demo orders" />
        <MetricCard label="Packages" value={profile.packages.length.toString()} helper="Service tiers" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getResearcherServiceStatusClass(profile.status)}>{getResearcherServiceStatusLabel(profile.status)}</Badge>
                <Badge className={getResearcherVerificationClass(profile.verification)}>{getResearcherVerificationLabel(profile.verification)}</Badge>
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3" /> {profile.rating.toFixed(1)}
                </Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <BriefcaseBusiness className="h-5 w-5 text-primary" />
                Researcher Service Profile
              </CardTitle>
              <CardDescription>{profile.title}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Lock className="mr-2 h-4 w-4" /> Publish Profile
              </Button>
              <Button disabled>
                <WalletCards className="mr-2 h-4 w-4" /> Configure Payouts
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Profile readiness</span>
              <span>{profile.profileReadiness}%</span>
            </div>
            <Progress value={profile.profileReadiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            {profile.reviewNote}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Checklist title="Expertise" icon={UserRoundCheck} items={profile.expertise} />
            <Checklist title="Portfolio Signals" icon={CheckCircle2} items={profile.portfolioSignals} />
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.categories.map((category) => (
              <Badge key={category} variant="outline">
                {getResearchServiceCategoryLabel(category)}
              </Badge>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {profile.packages.map((servicePackage) => (
              <ResearcherServicePackageCard key={servicePackage.id} servicePackage={servicePackage} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResearcherServicePackageCard({ servicePackage }: { servicePackage: ResearcherServicePackage }) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-3">
      <div>
        <p className="flex items-center gap-2 font-semibold">
          <PackageCheck className="h-4 w-4 text-primary" /> {servicePackage.name}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{servicePackage.priceLabel}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> {servicePackage.deliveryLabel}
        </p>
      </div>
      <div className="space-y-2">
        {servicePackage.includes.map((item) => (
          <p key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> {item}
          </p>
        ))}
      </div>
      <Button className="w-full" variant="outline" disabled>
        <Lock className="mr-2 h-4 w-4" /> Select Package
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
