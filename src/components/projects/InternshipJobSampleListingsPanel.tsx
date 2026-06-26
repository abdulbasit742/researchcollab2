import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BriefcaseBusiness, Building2, CalendarClock, Filter, Lock, MapPin, Search, ShieldCheck, Star } from "lucide-react";

const sampleListings = [
  { id: "listing-ai-intern", title: "AI Research Intern", company: "Demo AI Lab", type: "Internship", mode: "Hybrid", location: "Islamabad / Remote", deadline: "12 days", match: 88, status: "Top Match", skills: ["Python", "Literature Review", "Prompting"], note: "Best fit for students with AI tools hub, research gap finder, and methodology assistant work." },
  { id: "listing-frontend", title: "Frontend Developer Trainee", company: "Demo Product Studio", type: "Job Prep", mode: "Remote", location: "Remote", deadline: "18 days", match: 82, status: "Saved", skills: ["React", "TypeScript", "UI QA"], note: "Good fit for dashboard, component, and responsive UI project evidence." },
  { id: "listing-data", title: "Data Analyst Intern", company: "Demo Data Hub", type: "Internship", mode: "On-site", location: "Lahore", deadline: "3 weeks", match: 76, status: "Recommended", skills: ["SQL", "Dashboards", "Evidence Mapping"], note: "Suitable for outcome mapping, evidence index, and analytics-focused portfolios." },
  { id: "listing-lab", title: "Prototype Validation Assistant", company: "Demo Hardware Lab", type: "Project Role", mode: "On-site", location: "University Lab", deadline: "1 month", match: 64, status: "Needs Review", skills: ["Testing", "Documentation", "Validation"], note: "Requires stronger validation logs and lab approval notes before applying." },
];

const listingFilters = [
  { label: "Internships", count: 2, status: "Active" },
  { label: "Entry-level jobs", count: 1, status: "Preview" },
  { label: "Project roles", count: 1, status: "Needs Review" },
  { label: "Remote options", count: 2, status: "Active" },
  { label: "High match", count: 2, status: "Active" },
];

const applicationChecks = [
  { label: "Portfolio proof", status: "Ready", helper: "Workspace evidence and report sections can support applications." },
  { label: "CV alignment", status: "Needs Review", helper: "CV helper and portfolio builder are upcoming features." },
  { label: "Skill gap review", status: "Needs Review", helper: "Skill gap analyzer will improve readiness scoring later." },
  { label: "Supervisor approval", status: "Needs Review", helper: "Some listings may need supervisor endorsement." },
  { label: "Application tracking", status: "Missing", helper: "Production status history is not connected yet." },
];

const statusClass = (status: string) => {
  if (status === "Ready" || status === "Top Match" || status === "Recommended" || status === "Saved" || status === "Active") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Needs Review" || status === "Preview") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "Missing") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function InternshipJobSampleListingsPanel() {
  const topMatches = sampleListings.filter((listing) => listing.match >= 80).length;
  const saved = sampleListings.filter((listing) => listing.status === "Saved").length;
  const needsReview = [...sampleListings, ...applicationChecks].filter((item) => item.status === "Needs Review").length;
  const missing = applicationChecks.filter((check) => check.status === "Missing").length;
  const remote = sampleListings.filter((listing) => listing.mode === "Remote" || listing.mode === "Hybrid").length;
  const averageMatch = Math.round(sampleListings.reduce((total, listing) => total + listing.match, 0) / sampleListings.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-6">
        <MetricCard label="Listings" value={sampleListings.length.toString()} helper="Demo board" />
        <MetricCard label="Top Match" value={topMatches.toString()} helper="80%+" />
        <MetricCard label="Saved" value={saved.toString()} helper="Shortlist" />
        <MetricCard label="Remote" value={remote.toString()} helper="Options" />
        <MetricCard label="Review" value={needsReview.toString()} helper={`${missing} missing`} danger={needsReview > 0 || missing > 0} />
        <MetricCard label="Avg Match" value={`${averageMatch}%`} helper="Fit score" danger={averageMatch < 75} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Sample Listing Board</Badge>
              <CardTitle className="flex items-center gap-2">
                <BriefcaseBusiness className="h-5 w-5 text-primary" /> Internship / Job Sample Listings
              </CardTitle>
              <CardDescription>
                Preview internships, job-prep roles, project roles, match scores, filters, skill tags, deadlines, and locked apply actions.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Search className="mr-2 h-4 w-4" /> Search Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Apply Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Average listing match</span>
              <span>{averageMatch}%</span>
            </div>
            <Progress value={averageMatch} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo listing board only. Production listings should verify employer authenticity, deadlines, eligibility rules, user consent, privacy settings, and application status history.
          </div>

          <ListingCards />
          <div className="grid gap-4 xl:grid-cols-2">
            <ListingFilters />
            <ApplicationChecks />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ListingCards() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Star className="h-4 w-4 text-primary" /> Sample Listings
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {sampleListings.map((listing) => (
          <div key={listing.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(listing.status)}>{listing.status}</Badge>
              <Badge variant="outline">{listing.type}</Badge>
              <Badge variant="secondary" className="gap-1"><CalendarClock className="h-3 w-3" /> {listing.deadline}</Badge>
            </div>
            <p className="mt-2 font-medium">{listing.title}</p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" /> {listing.company}
            </p>
            <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {listing.location} · {listing.mode}
            </p>
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Match score</span>
                <span>{listing.match}%</span>
              </div>
              <Progress value={listing.match} className="h-2" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {listing.skills.map((skill) => (
                <Badge key={skill} variant="outline">{skill}</Badge>
              ))}
            </div>
            <p className="mt-2 text-muted-foreground">{listing.note}</p>
            <Button className="mt-3 w-full" variant="outline" disabled>
              <Lock className="mr-2 h-4 w-4" /> Save / Apply Locked
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListingFilters() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Filter className="h-4 w-4 text-primary" /> Listing Filters
      </p>
      <div className="mt-3 space-y-3">
        {listingFilters.map((filter) => (
          <div key={filter.label} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(filter.status)}>{filter.status}</Badge>
              <Badge variant="outline">{filter.count} items</Badge>
            </div>
            <p className="mt-2 font-medium">{filter.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApplicationChecks() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Application Checks
      </p>
      <div className="mt-3 space-y-3">
        {applicationChecks.map((check) => (
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
