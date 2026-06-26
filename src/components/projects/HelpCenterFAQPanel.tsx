import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle2, FileQuestion, HelpCircle, LifeBuoy, Lock, MessageCircle, Search, TicketCheck } from "lucide-react";

const helpTopics = [
  { id: "help-projects", title: "Projects and workspace", audience: "Students", status: "Ready", score: 90, note: "Explains milestones, tasks, evidence, reports, and portfolio flow." },
  { id: "help-funding", title: "Funding demo flows", audience: "Founders", status: "Review", score: 76, note: "Needs clear demo-only labels before public use." },
  { id: "help-ai", title: "AI assistant usage", audience: "Researchers", status: "Ready", score: 86, note: "Explains saved AI outputs, review expectations, and prompt library." },
  { id: "help-trust", title: "Trust and safety", audience: "All users", status: "Review", score: 80, note: "Summarizes privacy, moderation, certificates, and audit notes." },
];

const faqItems = [
  { question: "How do I create a project?", status: "Ready", answer: "Use the project creation flow, choose a template, then complete milestones and tasks." },
  { question: "Are payments real?", status: "Ready", answer: "No. Demo finance surfaces are non-transactional and locked." },
  { question: "Can AI write final submissions?", status: "Review", answer: "AI output should be reviewed, edited, and approved by the user or supervisor." },
  { question: "How are reports reviewed?", status: "Review", answer: "Report flow is demo-only; production needs moderation policy and audit review." },
];

const supportPaths = [
  { label: "Search articles", status: "Ready", count: 12 },
  { label: "Contact support", status: "Locked", count: 1 },
  { label: "Report issue", status: "Review", count: 3 },
  { label: "Trust resources", status: "Ready", count: 4 },
];

const statusClass = (status: string) => {
  if (status === "Ready") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function HelpCenterFAQPanel() {
  const readyItems = [...helpTopics, ...faqItems, ...supportPaths].filter((item) => item.status === "Ready").length;
  const reviewItems = [...helpTopics, ...faqItems, ...supportPaths].filter((item) => item.status === "Review").length;
  const lockedItems = supportPaths.filter((item) => item.status === "Locked").length;
  const averageScore = Math.round(helpTopics.reduce((total, item) => total + item.score, 0) / helpTopics.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Topics" value={helpTopics.length.toString()} helper="Help areas" />
        <MetricCard label="Ready" value={readyItems.toString()} helper="Items" />
        <MetricCard label="Review" value={reviewItems.toString()} helper="Items" danger={reviewItems > 0} />
        <MetricCard label="Locked" value={lockedItems.toString()} helper="Support paths" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Help Center Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-primary" /> Help Center + FAQ
              </CardTitle>
              <CardDescription>
                Central support preview for project guides, demo finance questions, AI usage, trust notes, and support paths.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Search className="mr-2 h-4 w-4" /> Search Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Ticket Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Help readiness</span>
              <span>{averageScore}%</span>
            </div>
            <Progress value={averageScore} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo Help Center only. Production support should connect real article search, support ownership, response SLAs, privacy-safe tickets, and verified contact paths.
          </div>
          <HelpTopics />
          <div className="grid gap-4 xl:grid-cols-2">
            <FAQItems />
            <SupportPaths />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HelpTopics() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><BookOpen className="h-4 w-4 text-primary" /> Help Topics</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{helpTopics.map((item) => <div key={item.id} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.audience}</Badge></div><p className="mt-2 font-medium">{item.title}</p><Progress value={item.score} className="mt-3 h-2" /><p className="mt-1 text-xs text-muted-foreground">{item.score}% guide readiness</p><p className="mt-2 text-muted-foreground">{item.note}</p></div>)}</div></div>;
}

function FAQItems() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><FileQuestion className="h-4 w-4 text-primary" /> FAQ Items</p><div className="mt-3 space-y-3">{faqItems.map((item) => <div key={item.question} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><p className="font-medium">{item.question}</p></div><p className="mt-1 text-xs text-muted-foreground">{item.answer}</p></div>)}</div></div>;
}

function SupportPaths() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><TicketCheck className="h-4 w-4 text-primary" /> Support Paths</p><div className="mt-3 space-y-3">{supportPaths.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.count} items</Badge></div><p className="mt-2 font-medium">{item.label}</p></div>)}</div><div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3"><span className="inline-flex items-center gap-1"><HelpCircle className="h-3 w-3" /> Help</span><span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" /> Contact</span><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Review</span></div></div>;
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return <Card className={danger ? "border-amber-500/30" : undefined}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p><p className="text-xs text-muted-foreground">{helper}</p></CardContent></Card>;
}
