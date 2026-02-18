import { motion } from "framer-motion";
import { Shield, Globe, Award, Zap, DollarSign, Brain } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

const stats = [
  {
    icon: DollarSign,
    value: 4.7,
    suffix: "M+",
    prefix: "$",
    label: "Capital Protected",
    sublabel: "Every transaction escrow-backed",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    icon: Shield,
    value: 98,
    suffix: "%",
    label: "Delivery Rate",
    sublabel: "Verified milestone completions",
    gradient: "from-primary to-blue-500",
    live: true,
  },
  {
    icon: Globe,
    value: 120,
    suffix: "+",
    label: "Countries",
    sublabel: "Global professional network",
    gradient: "from-violet-400 to-purple-500",
  },
  {
    icon: Award,
    value: 15000,
    suffix: "+",
    label: "Verified Outcomes",
    sublabel: "Not self-reported claims",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    icon: Brain,
    value: 850,
    suffix: "K+",
    label: "AI Decisions Made",
    sublabel: "Matching, risk, trust scoring",
    gradient: "from-pink-400 to-rose-500",
  },
  {
    icon: Zap,
    value: 0,
    suffix: "",
    label: "Disputes Unresolved",
    sublabel: "Digital arbitration court",
    gradient: "from-cyan-400 to-blue-500",
    displayValue: "0",
  },
];

export function StatsSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.03),transparent_70%)]" />

      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Numbers Don't Lie.
            <br />
            <span className="text-primary">Platforms Do.</span>
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Every metric is computed from real transactions — not surveys, not estimates, not self-reports.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 md:p-8 transition-all duration-500 hover:shadow-2xl hover:border-primary/20 hover:-translate-y-2 overflow-hidden">
                {/* Hover glow */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />
                
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>

                <div className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                  {stat.displayValue !== undefined ? stat.displayValue : (
                    <>
                      {stat.prefix || ""}
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2200} delay={i * 150} />
                    </>
                  )}
                </div>

                <div className="mt-2 text-sm font-bold text-foreground/80 flex items-center gap-2">
                  {stat.label}
                  {stat.live && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.sublabel}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
