import { Sparkles, LayoutGrid, ShoppingBag, Building2, ShieldCheck, FileText } from "lucide-react";

const mockups = [
  {
    icon: Sparkles,
    tag: "AI Roadmap",
    title: "Research Roadmap, generated",
    body: [
      { l: "Phase 1 · Literature", v: "12 papers · 2 gaps" },
      { l: "Phase 2 · Methodology", v: "Recommended: CNN+LSTM" },
      { l: "Phase 3 · Experiments", v: "3 datasets matched" },
    ],
  },
  {
    icon: LayoutGrid,
    tag: "Workspace",
    title: "Project workspace",
    body: [
      { l: "Tasks", v: "18 open · 32 done" },
      { l: "Files", v: "47 · 3 under review" },
      { l: "Team", v: "4 members · 1 supervisor" },
    ],
  },
  {
    icon: ShoppingBag,
    tag: "Marketplace",
    title: "Research services",
    body: [
      { l: "Data analysis (Python)", v: "$80 · 4.9★" },
      { l: "Literature review", v: "$60 · 4.8★" },
      { l: "Viva preparation", v: "$45 · 5.0★" },
    ],
  },
  {
    icon: Building2,
    tag: "Department",
    title: "Department dashboard",
    body: [
      { l: "Active FYP groups", v: "84" },
      { l: "Supervisor load", v: "balanced" },
      { l: "Defense queue", v: "12 this week" },
    ],
  },
  {
    icon: ShieldCheck,
    tag: "Escrow",
    title: "Funding & milestones",
    body: [
      { l: "Locked in escrow", v: "$12,400" },
      { l: "Released this month", v: "$3,800" },
      { l: "Disputes", v: "0 open" },
    ],
  },
  {
    icon: FileText,
    tag: "Reports",
    title: "Report builder",
    body: [
      { l: "Sections", v: "6 / 8 complete" },
      { l: "Citations", v: "42 auto-formatted" },
      { l: "AI integrity", v: "passed" },
    ],
  },
];

export function ProductMockupsSection() {
  return (
    <section className="border-b border-border/60 bg-background py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">The product</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            Everything you need, beautifully integrated.
          </h2>
          <p className="mt-3 text-muted-foreground">
            From AI roadmaps to escrow-backed milestones — one premium surface for the entire research lifecycle.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mockups.map(({ icon: Icon, tag, title, body }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              {/* subtle gradient glow on hover */}
              <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  <Icon className="h-3 w-3" />
                  {tag}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>

              <div className="mt-5 space-y-2">
                {body.map((row) => (
                  <div
                    key={row.l}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs"
                  >
                    <span className="text-muted-foreground">{row.l}</span>
                    <span className="font-semibold text-foreground">{row.v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
