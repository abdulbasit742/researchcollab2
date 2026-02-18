import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const outcomes = [
  {
    metric: "3.2x",
    label: "Higher Delivery Rates",
    versus: "vs. Upwork / Fiverr average",
    description: "Escrow + trust scoring eliminates low-quality bids, no-shows, and payment disputes.",
    gradient: "from-emerald-400 to-teal-500",
    bar: { rcollab: 96, competitor: 30, rcollabLabel: "RCollab 96%", competitorLabel: "Others 30%", unit: "%" },
  },
  {
    metric: "67%",
    label: "Faster Talent Matching",
    versus: "vs. manual search platforms",
    description: "AI matching with fit scoring replaces hours of manual search and evaluation.",
    gradient: "from-[hsl(215,65%,55%)] to-blue-500",
    bar: { rcollab: 67, competitor: 0, rcollabLabel: "67% faster", competitorLabel: "", unit: "%" },
  },
  {
    metric: "0",
    label: "Disputes Left Unresolved",
    versus: "100% resolution rate",
    description: "Digital arbitration court with evidence-based verdicts and faculty mediation.",
    gradient: "from-violet-400 to-purple-500",
    bar: { rcollab: 100, competitor: 0, rcollabLabel: "100% resolved", competitorLabel: "", unit: "%" },
  },
  {
    metric: "6-12%",
    label: "Commission Rates",
    versus: "vs. 20-30% on competitors",
    description: "Trust-weighted fees that reward reliability. Top performers pay the absolute least.",
    gradient: "from-amber-400 to-orange-500",
    bar: { rcollab: 12, competitor: 30, rcollabLabel: "RCollab 6-12%", competitorLabel: "Others 20-30%", unit: "%" },
  },
];

function ComparisonBar({ bar, gradient, index }: { bar: typeof outcomes[0]["bar"]; gradient: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="mt-5 space-y-2.5">
      {/* RCollab bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-medium text-white/50">{bar.rcollabLabel}</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
            initial={{ width: 0 }}
            animate={isInView ? { width: `${bar.rcollab}%` } : { width: 0 }}
            transition={{ duration: 1.2, delay: 0.3 + index * 0.15, type: "spring", damping: 20, stiffness: 60 }}
          />
        </div>
      </div>

      {/* Competitor bar (only if there's a value) */}
      {bar.competitor > 0 && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-medium text-white/25">{bar.competitorLabel}</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-white/10"
              initial={{ width: 0 }}
              animate={isInView ? { width: `${bar.competitor}%` } : { width: 0 }}
              transition={{ duration: 1, delay: 0.5 + index * 0.15, type: "spring", damping: 20, stiffness: 60 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function OutcomeCard({ outcome, index }: { outcome: typeof outcomes[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <div className="relative h-full rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-7 md:p-9 hover:border-white/20 transition-all duration-500 overflow-hidden">
        {/* Gradient accent line */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${outcome.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

        {/* Hover glow */}
        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br ${outcome.gradient} opacity-0 group-hover:opacity-[0.06] blur-3xl transition-opacity duration-700`} />

        <div className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r ${outcome.gradient} bg-clip-text text-transparent mb-2`}>
          {outcome.metric}
        </div>
        <h3 className="text-lg md:text-xl font-bold text-white mb-1">{outcome.label}</h3>
        <p className="text-xs font-medium text-white/30 mb-3">{outcome.versus}</p>
        <p className="text-sm text-white/45 leading-relaxed">{outcome.description}</p>

        <ComparisonBar bar={outcome.bar} gradient={outcome.gradient} index={index} />
      </div>
    </motion.div>
  );
}

export function WhyChooseSection() {
  return (
    <section className="relative py-24 md:py-36 overflow-hidden bg-gradient-to-b from-[#030712] via-[#0a1628] to-[#030712]">
      {/* Scan lines */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,100,255,0.015)_50%)] bg-[size:100%_4px] pointer-events-none" />

      {/* Radial glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[200px]"
        style={{ background: "radial-gradient(circle, hsl(215 65% 45% / 0.12), transparent 70%)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(hsl(215 65% 55%) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="container relative z-10 px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-white/60 mb-6 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Verified Data
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
            The Proof Engine.
          </h2>
          <p className="mt-4 text-base md:text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">
            Every metric below is computed from real transactions — not surveys, not marketing decks.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {outcomes.map((outcome, i) => (
            <OutcomeCard key={outcome.label} outcome={outcome} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
