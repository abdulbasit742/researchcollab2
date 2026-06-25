import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_SPONSORSHIP_PROPOSAL,
  formatSponsorshipAmount,
  getSponsorshipBenefitTypeLabel,
  getSponsorshipPackageTierClass,
  getSponsorshipPackageTierLabel,
  getSponsorshipProposalCounts,
  getSponsorshipProposalStatusClass,
  getSponsorshipProposalStatusLabel,
  getSponsorshipSectionStatusClass,
  getSponsorshipSectionStatusLabel,
  type SponsorshipBenefit,
  type SponsorshipPackage,
  type SponsorshipProposalBuilderSummary,
  type SponsorshipProposalSection,
} from "@/config/sponsorshipProposalBuilder";
import { Building2, CheckCircle2, FileText, Handshake, Lock, Mail, Megaphone, ShieldCheck } from "lucide-react";

type SponsorshipProposalBuilderPanelProps = {
  summary?: SponsorshipProposalBuilderSummary;
};

export function SponsorshipProposalBuilderPanel({ summary = DEMO_SPONSORSHIP_PROPOSAL }: SponsorshipProposalBuilderPanelProps) {
  const counts = getSponsorshipProposalCounts(summary);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-6">
        <MetricCard label="Ask" value={formatSponsorshipAmount(summary.askAmount)} helper="Target sponsor" />
        <MetricCard label="Readiness" value={`${summary.readiness}%`} helper="Proposal score" />
        <MetricCard label="Sections" value={`${counts.completeSections}/${counts.sections}`} helper="Complete" />
        <MetricCard label="Packages" value={counts.packages.toString()} helper="Sponsor tiers" />
        <MetricCard label="Review" value={counts.reviewItems.toString()} helper="Needs review" danger={counts.reviewItems > 0} />
        <MetricCard label="Missing" value={counts.missingItems.toString()} helper="Before send" danger={counts.missingItems > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getSponsorshipProposalStatusClass(summary.status)}>
                  {getSponsorshipProposalStatusLabel(summary.status)}
                </Badge>
                <Badge variant="outline">{summary.targetSponsor}</Badge>
                <Badge variant="secondary">{formatSponsorshipAmount(summary.askAmount)}</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="h-5 w-5 text-primary" />
                Sponsorship Proposal Builder
              </CardTitle>
              <CardDescription>{summary.pitchSummary}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <FileText className="mr-2 h-4 w-4" /> Export Proposal
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Send Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Proposal readiness</span>
              <span>{summary.readiness}%</span>
            </div>
            <Progress value={summary.readiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            {summary.safetyNote}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard label="Project" value={summary.projectTitle} />
            <InfoCard label="Owner" value={summary.owner} />
            <InfoCard label="Target sponsor" value={summary.targetSponsor} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ProposalSections sections={summary.sections} />
            <SponsorBenefits benefits={summary.benefits} />
          </div>

          <SponsorshipPackages packages={summary.packages} />
        </CardContent>
      </Card>
    </div>
  );
}

function ProposalSections({ sections }: { sections: SponsorshipProposalSection[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Megaphone className="h-4 w-4 text-primary" /> Proposal Sections
      </p>
      <div className="mt-3 space-y-3">
        {sections.map((section) => (
          <div key={section.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getSponsorshipSectionStatusClass(section.status)}>
                {getSponsorshipSectionStatusLabel(section.status)}
              </Badge>
              <p className="font-medium">{section.title}</p>
            </div>
            <p className="mt-1 text-muted-foreground">{section.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SponsorBenefits({ benefits }: { benefits: SponsorshipBenefit[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Sponsor Benefits and Boundaries
      </p>
      <div className="mt-3 space-y-3">
        {benefits.map((benefit) => (
          <div key={benefit.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getSponsorshipSectionStatusClass(benefit.status)}>
                {getSponsorshipSectionStatusLabel(benefit.status)}
              </Badge>
              <Badge variant="outline">{getSponsorshipBenefitTypeLabel(benefit.type)}</Badge>
              <p className="font-medium">{benefit.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{benefit.helper}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SponsorshipPackages({ packages }: { packages: SponsorshipPackage[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Building2 className="h-4 w-4 text-primary" /> Sponsorship Packages
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {packages.map((pkg) => (
          <div key={pkg.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getSponsorshipPackageTierClass(pkg.tier)}>{getSponsorshipPackageTierLabel(pkg.tier)}</Badge>
              <Badge variant="outline">{pkg.timelineLabel}</Badge>
            </div>
            <p className="mt-2 font-semibold">{pkg.title}</p>
            <p className="text-lg font-bold">{formatSponsorshipAmount(pkg.amount)}</p>
            <p className="mt-1 text-muted-foreground">{pkg.bestFor}</p>
            <div className="mt-3 space-y-1">
              {pkg.benefits.map((benefit) => (
                <p key={benefit} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 text-primary" /> {benefit}
                </p>
              ))}
            </div>
            <Button className="mt-3 w-full" variant="outline" disabled>
              <Mail className="mr-2 h-4 w-4" /> Send Package Locked
            </Button>
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
