import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, GitBranch, Package, Rocket } from "lucide-react";

type ReleaseInfoStatus = "ready" | "review" | "manual";

type ReleaseInfoItem = {
  id: string;
  area: string;
  label: string;
  status: ReleaseInfoStatus;
  value: string;
  action: string;
};

const releaseInfoItems: ReleaseInfoItem[] = [
  {
    id: "app-name",
    area: "Brand",
    label: "App name",
    status: "ready",
    value: "ResearchCollabPro / RCollab",
    action: "Keep naming consistent across README, SEO, PWA, and landing pages.",
  },
  {
    id: "stack",
    area: "Stack",
    label: "Frontend stack",
    status: "ready",
    value: "Vite + React + TypeScript + Tailwind + shadcn/ui",
    action: "Keep new admin panels inside existing component conventions.",
  },
  {
    id: "build-command",
    area: "Build",
    label: "Production build command",
    status: "manual",
    value: "npm run build",
    action: "Run before every release or demo branch.",
  },
  {
    id: "dev-command",
    area: "Build",
    label: "Local development command",
    status: "ready",
    value: "npm run dev",
    action: "Use for local UI checks and route smoke testing.",
  },
  {
    id: "lint-command",
    area: "Quality",
    label: "Lint command",
    status: "manual",
    value: "npm run lint",
    action: "Run before merging larger route, auth, or admin changes.",
  },
  {
    id: "preview-command",
    area: "Release",
    label: "Preview command",
    status: "manual",
    value: "npm run preview",
    action: "Use after a successful build to manually review the production bundle.",
  },
  {
    id: "ci-status",
    area: "Automation",
    label: "CI build workflow",
    status: "review",
    value: "Not verified from this panel",
    action: "Add GitHub Actions for install, build, and lint.",
  },
  {
    id: "lovable-sync",
    area: "Lovable",
    label: "Lovable sync safety",
    status: "ready",
    value: "Component-based admin additions",
    action: "Avoid risky rewrites of App.tsx when adding admin-only panels.",
  },
  {
    id: "release-notes",
    area: "Documentation",
    label: "Release notes",
    status: "review",
    value: "Manual changelog required",
    action: "Create a release note after each batch of 10 features.",
  },
  {
    id: "demo-mode",
    area: "Trust",
    label: "Demo mode review",
    status: "review",
    value: "Required for money-facing modules",
    action: "Keep demo labels visible for billing, escrow, funding, wallet, refunds, and payouts.",
  },
];

const getStatusLabel = (status: ReleaseInfoStatus) => {
  switch (status) {
    case "ready":
      return "Ready";
    case "review":
      return "Review";
    case "manual":
      return "Manual";
    default:
      return "Unknown";
  }
};

const getStatusClass = (status: ReleaseInfoStatus) => {
  switch (status) {
    case "ready":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "review":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "manual":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function VersionBuildInfoPanel() {
  const readyItems = releaseInfoItems.filter((item) => item.status === "ready");
  const reviewItems = releaseInfoItems.filter((item) => item.status === "review");
  const manualItems = releaseInfoItems.filter((item) => item.status === "manual");
  const releaseScore = Math.round(
    releaseInfoItems.reduce((total, item) => {
      if (item.status === "ready") return total + 100;
      if (item.status === "review") return total + 60;
      return total + 45;
    }, 0) / releaseInfoItems.length
  );

  return (
    <div className="space-y-4">
      <Card className="border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Version & Build Info Panel
          </CardTitle>
          <CardDescription>
            Admin release reference for app identity, build commands, CI readiness, Lovable sync, and demo-mode release notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Release Score</p>
              <p className="text-2xl font-bold">{releaseScore}%</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Ready</p>
              <p className="text-2xl font-bold text-green-600">{readyItems.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Review</p>
              <p className="text-2xl font-bold text-amber-600">{reviewItems.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Manual</p>
              <p className="text-2xl font-bold text-blue-600">{manualItems.length}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 font-medium"><Rocket className="h-4 w-4" /> Build</div>
              <p className="mt-2 text-sm text-muted-foreground">Use build and preview commands before investor, pilot, or university demos.</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 font-medium"><GitBranch className="h-4 w-4" /> Release</div>
              <p className="mt-2 text-sm text-muted-foreground">Keep release notes after batches of features so QA and pilots can track changes.</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 font-medium"><CheckCircle className="h-4 w-4" /> Demo Safety</div>
              <p className="mt-2 text-sm text-muted-foreground">Money-facing flows should stay clearly demo-only until full production review.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Version & Build Matrix</CardTitle>
          <CardDescription>Release information and next actions for admins and founders.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {releaseInfoItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.area}</TableCell>
                    <TableCell>{item.label}</TableCell>
                    <TableCell>
                      <Badge className={getStatusClass(item.status)}>{getStatusLabel(item.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.value}</TableCell>
                    <TableCell className="max-w-lg text-sm text-muted-foreground">{item.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
