import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Globe2, Lock, ShieldCheck, SlidersHorizontal, UserCheck } from "lucide-react";

const profileSections = [
  { id: "section-bio", label: "Bio and headline", visibility: "Public", status: "Ready", exposure: 95, note: "Safe public summary with no private team data." },
  { id: "section-projects", label: "Showcase projects", visibility: "Public", status: "Needs Review", exposure: 82, note: "Project descriptions are visible, but media proof needs review." },
  { id: "section-skills", label: "Skill badges", visibility: "Public", status: "Ready", exposure: 88, note: "Skills can be shown as portfolio badges." },
  { id: "section-contact", label: "Contact preference", visibility: "Limited", status: "Needs Review", exposure: 55, note: "Inquiry channel should be selected before publishing." },
  { id: "section-team", label: "Team and supervisor names", visibility: "Hidden", status: "Protected", exposure: 15, note: "Hidden until explicit approval is connected." },
];

const privacyChecks = [
  { label: "Personal contact details", status: "Protected", helper: "Email and phone are hidden by default." },
  { label: "Team member names", status: "Needs Review", helper: "Only show names after clear team approval." },
  { label: "Supervisor details", status: "Needs Review", helper: "Academic reviewer visibility should be confirmed." },
  { label: "Sensitive evidence", status: "Protected", helper: "Private files remain hidden from public profile." },
  { label: "Public publish audit", status: "Locked", helper: "Publish history is demo-only for now." },
];

const consentStates = [
  { label: "Profile owner", status: "Ready", helper: "Owner controls profile visibility." },
  { label: "Project collaborators", status: "Needs Review", helper: "Collaborator approval is required for public display." },
  { label: "Institution branding", status: "Locked", helper: "Institution logos and names should require admin approval." },
];

const statusClass = (status: string) => {
  if (status === "Ready" || status === "Protected") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Needs Review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "Locked") return "bg-muted text-muted-foreground border-border";
  return "bg-red-500/10 text-red-600 border-red-500/30";
};

export function PublicProfilePrivacyControlsPanel() {
  const publicSections = profileSections.filter((section) => section.visibility === "Public").length;
  const hiddenSections = profileSections.filter((section) => section.visibility === "Hidden").length;
  const reviewItems = [...profileSections, ...privacyChecks, ...consentStates].filter((item) => item.status === "Needs Review").length;
  const protectedItems = privacyChecks.filter((check) => check.status === "Protected").length;
  const averageExposure = Math.round(profileSections.reduce((total, section) => total + section.exposure, 0) / profileSections.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Public" value={publicSections.toString()} helper="Visible sections" />
        <MetricCard label="Hidden" value={hiddenSections.toString()} helper="Protected sections" />
        <MetricCard label="Review" value={reviewItems.toString()} helper="Needs approval" danger={reviewItems > 0} />
        <MetricCard label="Protected" value={protectedItems.toString()} helper="Privacy checks" />
        <MetricCard label="Exposure" value={`${averageExposure}%`} helper="Visibility score" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Privacy Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Public Profile Privacy Controls
              </CardTitle>
              <CardDescription>
                Preview what can be public, limited, or hidden before publishing a portfolio profile.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Change Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Publish Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Profile visibility exposure</span>
              <span>{averageExposure}%</span>
            </div>
            <Progress value={averageExposure} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo privacy controls only. Production publishing should enforce user-owned settings, collaborator approval, visibility logs, and revision history.
          </div>

          <ProfileSections />
          <div className="grid gap-4 xl:grid-cols-2">
            <PrivacyChecks />
            <ConsentStates />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileSections() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Globe2 className="h-4 w-4 text-primary" /> Profile Sections
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {profileSections.map((section) => (
          <div key={section.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(section.status)}>{section.status}</Badge>
              <Badge variant="outline" className="gap-1">
                {section.visibility === "Hidden" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {section.visibility}
              </Badge>
            </div>
            <p className="mt-2 font-medium">{section.label}</p>
            <Progress value={section.exposure} className="mt-3 h-2" />
            <p className="mt-2 text-muted-foreground">{section.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrivacyChecks() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Privacy Checks
      </p>
      <div className="mt-3 space-y-3">
        {privacyChecks.map((check) => (
          <div key={check.label} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(check.status)}>{check.status}</Badge>
              <p className="font-medium">{check.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{check.helper}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConsentStates() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <UserCheck className="h-4 w-4 text-primary" /> Approval States
      </p>
      <div className="mt-3 space-y-3">
        {consentStates.map((state) => (
          <div key={state.label} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(state.status)}>{state.status}</Badge>
              <p className="font-medium">{state.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{state.helper}</p>
          </div>
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
        <p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
