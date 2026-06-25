import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, ClipboardList, PlayCircle } from "lucide-react";

type SmokeStatus = "ready" | "manual" | "review" | "blocked";
type SmokeArea = "Public" | "Auth" | "Dashboard" | "Admin" | "Project" | "Finance Demo" | "AI" | "Mobile" | "Release";

type SmokeTest = {
  id: string;
  area: SmokeArea;
  scenario: string;
  status: SmokeStatus;
  testerAction: string;
  expectedResult: string;
};

const smokeTests: SmokeTest[] = [
  {
    id: "public-home",
    area: "Public",
    scenario: "Open landing page",
    status: "manual",
    testerAction: "Open / in a fresh browser session.",
    expectedResult: "Landing page loads, CTAs are visible, and no blank screen appears.",
  },
  {
    id: "auth-page",
    area: "Auth",
    scenario: "Open sign-in page",
    status: "manual",
    testerAction: "Open /auth and review sign-in/sign-up UI.",
    expectedResult: "Auth UI loads and public roles/copy are understandable.",
  },
  {
    id: "protected-redirect",
    area: "Auth",
    scenario: "Protected route redirect",
    status: "manual",
    testerAction: "Open /home while logged out.",
    expectedResult: "User is redirected to auth instead of seeing protected content.",
  },
  {
    id: "home-dashboard",
    area: "Dashboard",
    scenario: "Authenticated dashboard load",
    status: "manual",
    testerAction: "Log in with a test account and open /home.",
    expectedResult: "Dashboard loads with user-safe empty states or real data.",
  },
  {
    id: "admin-health",
    area: "Admin",
    scenario: "Admin health dashboard tabs",
    status: "ready",
    testerAction: "Open /admin/health and click Build, RC Checklist, Version, Diagnostics, Blockers, Routes, Alerts, Events, Integrity, and Jobs tabs.",
    expectedResult: "Every tab renders a useful panel/table without layout overflow on desktop.",
  },
  {
    id: "project-flow",
    area: "Project",
    scenario: "Project/workflow routes smoke test",
    status: "review",
    testerAction: "Open projects/deals/workroom routes with demo-safe test data.",
    expectedResult: "Routes are protected, empty states are clear, and no private data leaks.",
  },
  {
    id: "finance-demo-copy",
    area: "Finance Demo",
    scenario: "Money-facing pages show demo safety",
    status: "blocked",
    testerAction: "Open billing, checkout, wallet, subscription, funding, and escrow-style pages.",
    expectedResult: "All money-facing flows clearly state demo-only or not-live status.",
  },
  {
    id: "ai-tools-copy",
    area: "AI",
    scenario: "AI-assisted research pages show limitations",
    status: "review",
    testerAction: "Open AI/research tool routes and review generated-copy guidance.",
    expectedResult: "AI output is positioned as assistance and does not claim guaranteed correctness.",
  },
  {
    id: "mobile-tabs",
    area: "Mobile",
    scenario: "Admin panels on mobile viewport",
    status: "manual",
    testerAction: "Use a mobile viewport and open /admin/health.",
    expectedResult: "Tabs wrap, cards remain readable, and tables scroll horizontally.",
  },
  {
    id: "release-build",
    area: "Release",
    scenario: "Build and preview smoke test",
    status: "manual",
    testerAction: "Run npm run build, then npm run preview in a suitable environment.",
    expectedResult: "Build finishes successfully and preview app opens without immediate runtime errors.",
  },
];

const getStatusLabel = (status: SmokeStatus) => {
  switch (status) {
    case "ready":
      return "Ready";
    case "manual":
      return "Manual";
    case "review":
      return "Review";
    case "blocked":
      return "Blocked";
    default:
      return "Unknown";
  }
};

const getStatusClass = (status: SmokeStatus) => {
  switch (status) {
    case "ready":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "manual":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "review":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "blocked":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function SmokeTestChecklistPanel() {
  const readyTests = smokeTests.filter((test) => test.status === "ready");
  const manualTests = smokeTests.filter((test) => test.status === "manual");
  const reviewTests = smokeTests.filter((test) => test.status === "review");
  const blockedTests = smokeTests.filter((test) => test.status === "blocked");
  const smokeScore = Math.round(
    smokeTests.reduce((total, test) => {
      if (test.status === "ready") return total + 100;
      if (test.status === "manual") return total + 55;
      if (test.status === "review") return total + 60;
      return total;
    }, 0) / smokeTests.length
  );

  return (
    <div className="space-y-4">
      <Card className={blockedTests.length > 0 ? "border-red-500/40" : "border-green-500/30"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {blockedTests.length > 0 ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <CheckCircle className="h-5 w-5 text-green-500" />}
            Smoke Test Checklist
          </CardTitle>
          <CardDescription>
            Manual smoke-test plan for public pages, auth, dashboard, admin tabs, project routes, demo-money copy, AI copy, mobile, and release build.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Smoke Score</p>
              <p className="text-2xl font-bold">{smokeScore}%</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Ready</p>
              <p className="text-2xl font-bold text-green-600">{readyTests.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Manual</p>
              <p className="text-2xl font-bold text-blue-600">{manualTests.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Review</p>
              <p className="text-2xl font-bold text-amber-600">{reviewTests.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Blocked</p>
              <p className="text-2xl font-bold text-red-600">{blockedTests.length}</p>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            Run smoke tests after every batch of features. Keep finance/funding/escrow-style checks blocked until demo labels are consistent everywhere.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Smoke Test Matrix
          </CardTitle>
          <CardDescription>
            Use this as a quick QA script before sending the app to a tester, investor, or university pilot reviewer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area</TableHead>
                  <TableHead>Scenario</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tester Action</TableHead>
                  <TableHead>Expected Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {smokeTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.area}</TableCell>
                    <TableCell className="min-w-56">{test.scenario}</TableCell>
                    <TableCell>
                      <Badge className={getStatusClass(test.status)}>{getStatusLabel(test.status)}</Badge>
                    </TableCell>
                    <TableCell className="min-w-72 text-sm text-muted-foreground">{test.testerAction}</TableCell>
                    <TableCell className="min-w-72 text-sm">{test.expectedResult}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-blue-500" />
            Smoke Test Rule
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Smoke testing confirms that the most important paths open and behave safely.</p>
          <p>It does not replace detailed QA, security review, data-rule testing, or accessibility testing.</p>
          <p>For each failed smoke test, create a bug task and keep the release candidate blocked until the issue is fixed.</p>
        </CardContent>
      </Card>
    </div>
  );
}
