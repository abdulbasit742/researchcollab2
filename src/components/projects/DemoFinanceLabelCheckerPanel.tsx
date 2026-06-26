import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrustCenterPanel } from "@/components/projects/TrustCenterPanel";
import { Banknote, CheckCircle2, FileWarning, HandCoins, Lock, ReceiptText, ShieldCheck, Tag, WalletCards } from "lucide-react";

const financeLabels = [
  { id: "FIN-001", label: "Demo contribution", surface: "Funding Campaign", status: "Demo Safe", risk: "Low", score: 95, note: "Contribution is clearly labeled as demo and does not move real money." },
  { id: "FIN-002", label: "Payout request", surface: "Researcher Earnings", status: "Locked", risk: "Medium", score: 78, note: "Payout actions remain locked until verified payment setup exists." },
  { id: "FIN-003", label: "Escrow release", surface: "Milestone Funding", status: "Locked", risk: "Medium", score: 74, note: "Escrow wording is demo-only and should not imply real custody of funds." },
  { id: "FIN-004", label: "Sponsor invoice", surface: "Sponsorship Proposal", status: "Needs Review", risk: "Medium", score: 69, note: "Invoice-like language should be reviewed before public release." },
];

const complianceChecks = [
  { label: "No real funds disclaimer", status: "Demo Safe", helper: "Every funding/payment surface should show demo-safe wording." },
  { label: "Payout disabled state", status: "Locked", helper: "Payouts stay disabled until real payment accounts are verified." },
  { label: "Escrow label clarity", status: "Needs Review", helper: "Use milestone labels without implying regulated escrow custody." },
  { label: "Receipt wording", status: "Needs Review", helper: "Receipts should be demo records, not tax or payment documents." },
  { label: "Financial claims review", status: "Locked", helper: "Production finance language needs policy and legal review." },
];

const financeSurfaces = [
  { label: "Funding builder", status: "Demo Safe", count: 4 },
  { label: "Contribution flow", status: "Demo Safe", count: 3 },
  { label: "Funding ledger", status: "Needs Review", count: 4 },
  { label: "Earnings dashboard", status: "Locked", count: 2 },
];

const statusClass = (status: string) => {
  if (status === "Demo Safe") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Needs Review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function DemoFinanceLabelCheckerPanel() {
  const demoSafe = [...financeLabels, ...complianceChecks, ...financeSurfaces].filter((item) => item.status === "Demo Safe").length;
  const reviewItems = [...financeLabels, ...complianceChecks, ...financeSurfaces].filter((item) => item.status === "Needs Review").length;
  const lockedItems = [...financeLabels, ...complianceChecks, ...financeSurfaces].filter((item) => item.status === "Locked").length;
  const averageScore = Math.round(financeLabels.reduce((total, item) => total + item.score, 0) / financeLabels.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Demo Safe" value={demoSafe.toString()} helper="Labels" />
        <MetricCard label="Review" value={reviewItems.toString()} helper="Items" danger={reviewItems > 0} />
        <MetricCard label="Locked" value={lockedItems.toString()} helper="Actions" />
        <MetricCard label="Score" value={`${averageScore}%`} helper="Label safety" danger={averageScore < 80} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Finance Label Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <WalletCards className="h-5 w-5 text-primary" /> Demo Finance Label Checker
              </CardTitle>
              <CardDescription>
                Preview funding, contribution, ledger, payout, and proposal labels to keep demo finance surfaces clearly non-transactional.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Tag className="mr-2 h-4 w-4" /> Relabel Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Finance Action Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Finance label safety</span>
              <span>{averageScore}%</span>
            </div>
            <Progress value={averageScore} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo finance label checker only. This does not process payments, hold funds, create invoices, issue receipts, or provide financial/legal advice.
          </div>
          <FinanceLabels />
          <div className="grid gap-4 xl:grid-cols-2">
            <ComplianceChecks />
            <FinanceSurfaces />
          </div>
        </CardContent>
      </Card>
      <TrustCenterPanel />
    </div>
  );
}

function FinanceLabels() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><Banknote className="h-4 w-4 text-primary" /> Finance Labels</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{financeLabels.map((item) => <div key={item.id} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.risk}</Badge><Badge variant="secondary">{item.id}</Badge></div><p className="mt-2 font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.surface}</p><Progress value={item.score} className="mt-3 h-2" /><p className="mt-1 text-xs text-muted-foreground">{item.score}% label safety</p><p className="mt-2 text-muted-foreground">{item.note}</p></div>)}</div></div>;
}

function ComplianceChecks() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-primary" /> Compliance Checks</p><div className="mt-3 space-y-3">{complianceChecks.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><p className="font-medium">{item.label}</p></div><p className="mt-1 text-xs text-muted-foreground">{item.helper}</p></div>)}</div></div>;
}

function FinanceSurfaces() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ReceiptText className="h-4 w-4 text-primary" /> Finance Surfaces</p><div className="mt-3 space-y-3">{financeSurfaces.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.count} checks</Badge></div><p className="mt-2 font-medium">{item.label}</p></div>)}</div><div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3"><span className="inline-flex items-center gap-1"><HandCoins className="h-3 w-3" /> Demo</span><span className="inline-flex items-center gap-1"><FileWarning className="h-3 w-3" /> Labels</span><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Review</span></div></div>;
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return <Card className={danger ? "border-amber-500/30" : undefined}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p><p className="text-xs text-muted-foreground">{helper}</p></CardContent></Card>;
}
