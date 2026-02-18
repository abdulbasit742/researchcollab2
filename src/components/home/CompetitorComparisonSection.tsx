import { motion } from "framer-motion";
import { Check, X, Minus, Shield, TrendingUp, Brain, Banknote, Scale, Award, Microscope, GraduationCap, Globe } from "lucide-react";

const platforms = ["LinkedIn", "Upwork", "Fiverr", "G. Scholar", "ResearchGate"];

const categories = [
  {
    icon: Shield,
    label: "Escrow Payment Protection",
    scores: ["none", "partial", "partial", "none", "none"],
    rcollab: "full",
    detail: "Milestone-triggered escrow with atomic release",
  },
  {
    icon: TrendingUp,
    label: "Verified Trust Scores",
    scores: ["none", "basic", "basic", "none", "none"],
    rcollab: "full",
    detail: "Non-gameable, outcome-based with velocity caps",
  },
  {
    icon: Brain,
    label: "AI Matching & Intelligence",
    scores: ["basic", "basic", "none", "none", "none"],
    rcollab: "full",
    detail: "Skills + trust + timing + success probability",
  },
  {
    icon: Banknote,
    label: "Fair Trust-Based Pricing",
    scores: ["none", "none", "none", "none", "none"],
    rcollab: "full",
    detail: "6-12% commission — top performers pay least",
  },
  {
    icon: Scale,
    label: "Digital Arbitration Court",
    scores: ["none", "basic", "basic", "none", "none"],
    rcollab: "full",
    detail: "Evidence-based verdicts with faculty mediation",
  },
  {
    icon: Award,
    label: "Portable Credentials (DID)",
    scores: ["basic", "none", "none", "none", "none"],
    rcollab: "full",
    detail: "W3C Verifiable Credentials you own forever",
  },
  {
    icon: Microscope,
    label: "Research Intelligence",
    scores: ["none", "none", "none", "basic", "basic"],
    rcollab: "full",
    detail: "AI gap detection, lit review, paper analysis",
  },
  {
    icon: GraduationCap,
    label: "Academic Integration",
    scores: ["none", "none", "none", "partial", "partial"],
    rcollab: "full",
    detail: "FYP tracking, course linking, supervisor tools",
  },
  {
    icon: Globe,
    label: "Sovereign Data Ownership",
    scores: ["none", "none", "none", "none", "none"],
    rcollab: "full",
    detail: "Your data, your identity, exportable anytime",
  },
];

function StatusCell({ status }: { status: string }) {
  if (status === "full") return <Check className="h-5 w-5 text-emerald-400" />;
  if (status === "partial" || status === "basic")
    return <Minus className="h-4 w-4 text-amber-400/60" />;
  return <X className="h-4 w-4 text-white/15" />;
}

export function CompetitorComparisonSection() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#030712]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[#030712] to-background" />

      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6 uppercase tracking-wider">
            Competitive Analysis
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
            One Platform.
            <br />
            <span className="bg-gradient-to-r from-primary via-[hsl(200,80%,60%)] to-primary bg-clip-text text-transparent">
              Six Platforms Replaced.
            </span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-white/40 max-w-2xl mx-auto">
            We don't compete on features. We make entire categories obsolete.
          </p>
        </motion.div>

        {/* Desktop table */}
        <div className="hidden lg:block max-w-6xl mx-auto">
          <div className="rounded-2xl border border-white/8 overflow-hidden backdrop-blur-sm">
            {/* Header */}
            <div className="grid grid-cols-8 gap-0 border-b border-white/8 bg-white/3">
              <div className="col-span-2 p-5 text-sm font-bold text-white/80">Capability</div>
              {platforms.map((p) => (
                <div key={p} className="p-5 text-center text-xs font-medium text-white/30 uppercase tracking-wider">{p}</div>
              ))}
              <div className="p-5 text-center text-sm font-bold text-primary bg-primary/8 border-l border-primary/20">RCollab</div>
            </div>

            {categories.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="grid grid-cols-8 gap-0 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <div className="col-span-2 p-4 flex items-center gap-3">
                  <cat.icon className="h-4 w-4 text-white/30 shrink-0" />
                  <span className="text-sm font-medium text-white/70">{cat.label}</span>
                </div>
                {cat.scores.map((s, j) => (
                  <div key={j} className="p-4 flex items-center justify-center">
                    <StatusCell status={s} />
                  </div>
                ))}
                <div className="p-4 flex flex-col items-center justify-center gap-1 bg-primary/5 border-l border-primary/10">
                  <StatusCell status={cat.rcollab} />
                  <span className="text-[10px] text-primary/60 font-medium text-center leading-tight max-w-[140px]">{cat.detail}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden space-y-3 max-w-lg mx-auto">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              viewport={{ once: true }}
              className="rounded-xl border border-white/8 bg-white/[0.02] p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <cat.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-white/80">{cat.label}</span>
              </div>
              <div className="grid grid-cols-6 gap-2 text-center mb-2">
                {platforms.map((p, j) => (
                  <div key={p} className="flex flex-col items-center gap-1">
                    <StatusCell status={cat.scores[j]} />
                    <span className="text-[9px] text-white/25">{p.split(" ")[0]}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-1 bg-primary/10 rounded-lg py-1">
                  <StatusCell status={cat.rcollab} />
                  <span className="text-[9px] text-primary font-bold">RCollab</span>
                </div>
              </div>
              <p className="text-[11px] text-primary/50 font-medium">{cat.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
