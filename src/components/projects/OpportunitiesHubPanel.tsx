import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BriefcaseBusiness, CalendarClock, ExternalLink, GraduationCap, Lock, ShieldCheck, Sparkles, Target } from "lucide-react";

const opportunities = [
  { id: "opp-intern-ai", title: "AI Research Intern", type: "Internship", provider: "Demo AI Lab", fit: 88, deadline: "12 days", status: "Recommended", note: "Strong fit for literature assistant, methodology, and AI workflow projects." },
  { id: "opp-data-fellow", title: "Data Systems Fellowship", type: "Fellowship", provider: "Demo Data Hub", fit: 81, deadline: "3 weeks", status: "Saved", note: "Good match for dashboard, analytics, and evidence-mapping skills." },
  { id: "opp-innovation", title: "Student Innovation Challenge", type: "Challenge", provider: "Demo Tech Network", fit: 76, deadline: "1 month", status: "Needs Review", note: "Prototype teams can apply after validation evidence improves." },
  { id: "opp-grant", title: "Mini Research Grant", type: "Grant", provider: "Demo Department Fund", fit: 69, deadline: "2 weeks", status: "Needs Review", note: "Budget planner and sponsorship proposal need stronger approval notes first." },
];

const eligibilityChecks = [
  { label: "Project portfolio", status: "Ready", helper: "Workspace includes reports, methodology, and evidence sections." },
  { label: "CV / profile readiness", status: "Needs Review", helper: "Public profile and portfolio features will be expanded in upcoming tasks." },
  { label: "Supervisor endorsement", status: "Needs Review", helper: "Supervisor review queue has pending items before endorsement." },
  { label: "Evidence quality", status: "Blocked", helper: "Validation logs and privacy notes are still incomplete." },
  { label: "Application audit", status: "Missing", helper: "Production tracking should store timestamps and status history." },
];

const opportunityBuckets = [
  { label: "Internships", count: 6, status: "Active" },
  { label: "Jobs", count: 4, status: "Preview" },
  { label: "Fellowships", count: 3, status: "Saved" },
  { label: "Challenges", count: 5, status: "Needs Review" },
  { label: "Grants", count: 2, status: "Needs Review" },
];

const statusClass = (status: string) => {
  if (status === "Ready" || status === "Recommended" || status === "Saved" || status === "Active") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Needs Review" || status === "Preview") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "Blocked" || status === "Missing") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function OpportunitiesHubPanel() {
  const recommended = opportunities.filter((opportunity) => opportunity.status === "Recommended").length;
  const saved = opportunities.filter((opportunity) => opportunity.status === "Saved").length;
  const needsReview = [...opportunities, ...eligibilityChecks].filter((item) => item.status === "Needs Review").length;
  const blocked = eligibilityChecks.filter((check) => check.status === "Blocked" || check.status === "Missing").length;
  const totalBucketItems = opportunityBuckets.reduce((total, bucket) => total + bucket.count, 0);
  const averageFit = Math.round(opportunities.reduce((total, opportunity) => total + opportunity.fit, 0) / opportunities.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-6">
        <MetricCard label="Opportunities" value={totalBucketItems.toString()} helper="Demo listings" />
        <MetricCard label="Recommended" value={recommended.toString()} helper="Top matches" />
        <MetricCard label="Saved" value={saved.toString()} helper="Shortlist" />
        <MetricCard label="Review" value={needsReview.toString()} helper="Items" danger={needsReview > 0} />
        <MetricCard label="Blocked" value={blocked.toString()} helper="Checks" danger={blocked > 0} />
        <MetricCard label="Avg Fit" value={`${averageFit}%`} helper="Match score" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Career Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <BriefcaseBusiness className="h-5 w-5 text-primary" /> Opportunities Hub
              </CardTitle>
              <CardDescription>
                Track internships, jobs, fellowships, challenges, grants, match score, eligibility readiness, and saved opportunities.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Sparkles className="mr-2 h-4 w-4" /> Match Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Apply Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Average opportunity fit</span>
              <span>{averageFit}%</span>
            </div>
            <Progress value={averageFit} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo opportunities hub only. Production listings should verify source authenticity, eligibility rules, privacy settings, application consent, timestamps, and status history.
          </div>

          <OpportunityCards />
          <div className="grid gap-4 xl:grid-cols-2">
            <OpportunityBuckets />
            <EligibilityChecks />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OpportunityCards() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Target className="h-4 w-4 text-primary" /> Recommended Opportunities
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {opportunities.map((opportunity) => (
          <div key={opportunity.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(opportunity.status)}>{opportunity.status}</Badge>
              <Badge variant="outline">{opportunity.type}</Badge>
              <Badge variant="secondary" className="gap-1"><CalendarClock className="h-3 w-3" /> {opportunity.deadline}</Badge>
            </div>
            <p className="mt-2 font-medium">{opportunity.title}</p>
            <p className="text-xs text-muted-foreground">{opportunity.provider}</p>
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Fit score</span>
                <span>{opportunity.fit}%</span>
              </div>
              <Progress value={opportunity.fit} className="h-2" />
            </div>
            <p className="mt-2 text-muted-foreground">{opportunity.note}</p>
            <Button className="mt-3 w-full" variant="outline" disabled>
              <ExternalLink className="mr-2 h-4 w-4" /> View / Apply Locked
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpportunityBuckets() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <GraduationCap className="h-4 w-4 text-primary" /> Opportunity Buckets
      </p>
      <div className="mt-3 space-y-3">
        {opportunityBuckets.map((bucket) => (
          <div key={bucket.label} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(bucket.status)}>{bucket.status}</Badge>
              <Badge variant="outline">{bucket.count} items</Badge>
            </div>
            <p className="mt-2 font-medium">{bucket.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EligibilityChecks() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Eligibility Checks
      </p>
      <div className="mt-3 space-y-3">
        {eligibilityChecks.map((check) => (
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
