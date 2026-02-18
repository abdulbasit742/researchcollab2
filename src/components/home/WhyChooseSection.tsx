import { motion } from "framer-motion";
import { Zap, Shield, TrendingUp, Scale, ArrowRight } from "lucide-react";

const outcomes = [
  {
    metric: "3.2x",
    label: "Higher delivery rates",
    versus: "vs. Upwork / Fiverr average",
    description: "Escrow + trust scoring eliminates low-quality bids, no-shows, and payment disputes.",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    metric: "67%",
    label: "Faster talent matching",
    versus: "vs. manual search platforms",
    description: "AI matching with fit scoring replaces hours of manual search and evaluation.",
    gradient: "from-primary to-blue-500",
  },
  {
    metric: "0",
    label: "Disputes left unresolved",
    versus: "100% resolution rate",
    description: "Digital arbitration court with evidence-based verdicts and faculty mediation.",
    gradient: "from-violet-400 to-purple-500",
  },
  {
    metric: "6-12%",
    label: "Commission rates",
    versus: "vs. 20-30% on competitors",
    description: "Trust-weighted fees that reward reliability. Top performers pay the absolute least.",
    gradient: "from-amber-400 to-orange-500",
  },
];

export function WhyChooseSection() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-6 uppercase tracking-wider">
            Proof, Not Promises
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Results That Make
            <br />
            <span className="text-primary">Competitors Irrelevant.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {outcomes.map((outcome, i) => (
            <motion.div
              key={outcome.label}
              initial={{ opacity: 0, y: 25, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-full rounded-2xl border border-border/50 bg-card/80 p-7 md:p-9 hover:border-primary/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${outcome.gradient} opacity-0 group-hover:opacity-[0.08] blur-3xl transition-opacity duration-500`} />
                
                <div className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r ${outcome.gradient} bg-clip-text text-transparent mb-3`}>
                  {outcome.metric}
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-1">{outcome.label}</h3>
                <p className="text-xs font-medium text-primary/60 mb-3">{outcome.versus}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{outcome.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
