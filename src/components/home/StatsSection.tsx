import { motion } from "framer-motion";
import { Shield, Zap, Globe, TrendingUp, DollarSign, Award } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

const stats = [
  {
    icon: DollarSign,
    value: 2.4,
    suffix: "M+",
    prefix: "$",
    label: "Escrow-Protected Capital",
    description: "Every transaction secured",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Shield,
    value: 98,
    suffix: "%",
    label: "Delivery Success Rate",
    description: "Verified completions",
    color: "text-primary",
    bg: "bg-primary/10",
    live: true,
  },
  {
    icon: Globe,
    value: 120,
    suffix: "+",
    label: "Countries Connected",
    description: "Global talent network",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Award,
    value: 15000,
    suffix: "+",
    label: "Verified Outcomes",
    description: "Not self-reported claims",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

export function StatsSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-muted/30 border-y border-border/50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.04),transparent_70%)]" />

      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Numbers That <span className="text-primary">Speak Louder</span> Than Profiles
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Real metrics from real professional execution — not inflated social stats.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 md:p-6 text-center transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1">
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} transition-transform duration-300 group-hover:scale-110`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                  {stat.prefix || ""}
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2200} delay={index * 200} />
                </div>
                <div className="mt-1 text-sm font-semibold text-foreground/80 flex items-center justify-center gap-1.5">
                  {stat.label}
                  {stat.live && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
