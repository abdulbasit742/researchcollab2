import { Lightbulb, Brain, Users, GitMerge, BookOpen } from "lucide-react";

const steps = [
  { n: "01", icon: Lightbulb, title: "Create your research idea", desc: "Spin up an FYP or research project with a guided brief." },
  { n: "02", icon: Brain, title: "AI checks feasibility & novelty", desc: "Get an instant gap analysis, scope score, and risk flags." },
  { n: "03", icon: Users, title: "Find your team & supervisor", desc: "Match with researchers, supervisors, or funders that fit." },
  { n: "04", icon: GitMerge, title: "Execute with milestones", desc: "Track tasks, files, and escrow-backed milestone payouts." },
  { n: "05", icon: BookOpen, title: "Publish & defend", desc: "Generate reports, prepare viva, and ship to your portfolio." },
];

export function HowItWorksSection() {
  return (
    <section className="relative border-b border-border/60 bg-[hsl(220_30%_98%)] dark:bg-[hsl(220_25%_8%)] py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">How it works</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            From idea to defense in one platform.
          </h2>
          <p className="mt-3 text-muted-foreground">
            A guided 5-step journey with AI assistance, supervision, funding, and publishing built-in.
          </p>
        </div>

        <div className="relative mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {steps.map(({ n, icon: Icon, title, desc }, i) => (
            <div
              key={n}
              className="relative rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground/70">{n}</span>
              </div>
              <h3 className="mt-5 text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{desc}</p>

              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 z-10 h-px w-6 bg-gradient-to-r from-border to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
