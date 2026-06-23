import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Activity, GitBranch, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PremiumHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {/* Background: deep gradient + grid + glow */}
      <div className="absolute inset-0 -z-10 bg-[hsl(220_40%_8%)]" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(215 60% 70% / 0.15) 1px, transparent 1px), linear-gradient(to bottom, hsl(215 60% 70% / 0.15) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />
      <div className="absolute -top-40 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,hsl(230_80%_55%/0.45),transparent)] blur-3xl" />
      <div className="absolute bottom-0 right-0 -z-10 h-[400px] w-[500px] rounded-full bg-[radial-gradient(closest-side,hsl(265_75%_60%/0.35),transparent)] blur-3xl" />

      <div className="container mx-auto px-4 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left: copy */}
          <div className="lg:col-span-7 text-white animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-[hsl(210_100%_75%)]" />
              AI-native research collaboration platform
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-[1.05]">
              Build, fund, supervise, and publish research projects with{" "}
              <span className="bg-gradient-to-r from-[hsl(210_100%_75%)] via-[hsl(230_100%_80%)] to-[hsl(270_90%_78%)] bg-clip-text text-transparent">
                AI-powered collaboration
              </span>
              .
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70">
              ResearchCollab unifies FYP execution, supervision, funding escrow, and publication into one
              premium workspace—trusted by students, researchers, departments, and funders.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-[hsl(220_40%_10%)] hover:bg-white/90 shadow-lg shadow-black/30">
                <Link to="/auth/register">
                  Start Your Research Project <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link to="/marketplace">Explore Marketplace</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                <Link to="/contact">Request Department Demo</Link>
              </Button>
            </div>

            {/* Animated stats row */}
            <dl className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
              {[
                { k: "12k+", v: "Active projects" },
                { k: "98%", v: "Milestone payouts" },
                { k: "40+", v: "Partner universities" },
              ].map((s) => (
                <div key={s.v} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <dt className="text-2xl font-bold text-white">{s.k}</dt>
                  <dd className="text-xs text-white/60 mt-1">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right: glass dashboard mockup */}
          <div className="lg:col-span-5 animate-fade-in">
            <div className="relative">
              {/* Floating AI assistant card */}
              <div className="absolute -left-6 -top-6 z-20 hidden md:block">
                <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl shadow-2xl shadow-black/40">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(210_100%_60%)] to-[hsl(265_80%_60%)]">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-xs text-white">
                    <div className="font-semibold">AI Copilot</div>
                    <div className="text-white/60">Suggested 3 supervisors</div>
                  </div>
                </div>
              </div>

              {/* Main dashboard card */}
              <div className="relative rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.09] to-white/[0.03] p-5 backdrop-blur-xl shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between text-white/80">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[hsl(0_70%_60%)]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[hsl(38_92%_55%)]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[hsl(152_60%_50%)]" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-white/40">ResearchCollab · workspace</span>
                </div>

                <div className="mt-5 rounded-xl border border-white/10 bg-[hsl(220_40%_6%)]/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/50">FYP-2026-014</div>
                      <div className="text-sm font-semibold text-white mt-0.5">Federated Learning for Edge IoT</div>
                    </div>
                    <span className="rounded-full bg-[hsl(152_60%_50%)]/15 px-2 py-0.5 text-[10px] font-medium text-[hsl(152_70%_70%)]">
                      On track
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-[hsl(210_100%_60%)] to-[hsl(265_85%_65%)]" />
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-white/50">
                    <span>Milestone 4 / 6</span>
                    <span>68%</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    { i: Activity, l: "AI score", v: "92" },
                    { i: ShieldCheck, l: "Escrow", v: "$4.2k" },
                    { i: GitBranch, l: "Commits", v: "47" },
                  ].map(({ i: Icon, l, v }) => (
                    <div key={l} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                      <Icon className="h-3.5 w-3.5 text-white/60" />
                      <div className="mt-2 text-sm font-semibold text-white">{v}</div>
                      <div className="text-[10px] text-white/50">{l}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 space-y-2">
                  {[
                    "Literature review — completed",
                    "Methodology draft — under review",
                    "Dataset acquisition — in progress",
                  ].map((t, i) => (
                    <div key={t} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                      <CheckCircle2 className={`h-3.5 w-3.5 ${i === 0 ? "text-[hsl(152_70%_65%)]" : "text-white/30"}`} />
                      <span className="text-xs text-white/80">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating funding pill */}
              <div className="absolute -bottom-5 -right-4 z-20 hidden md:block">
                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-[hsl(220_40%_10%)]/80 px-4 py-2 backdrop-blur-xl shadow-2xl shadow-black/40">
                  <Zap className="h-3.5 w-3.5 text-[hsl(38_95%_65%)]" />
                  <span className="text-xs text-white">Milestone funded · $1,200</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
