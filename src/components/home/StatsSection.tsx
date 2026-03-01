import { motion } from "framer-motion";
import { Shield, Award, Zap, DollarSign, UserCheck, Briefcase } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

const stats = [
  {
    icon: Briefcase,
    value: 342,
    suffix: "+",
    label: "Active FYPs",
    sublabel: "Student projects in execution",
  },
  {
    icon: DollarSign,
    value: 186,
    suffix: "+",
    label: "Funded Projects",
    sublabel: "Sponsor-backed with escrow",
  },
  {
    icon: Shield,
    value: 2.1,
    suffix: "M+",
    prefix: "PKR ",
    label: "Escrow Volume",
    sublabel: "Capital locked and protected",
    live: true,
  },
  {
    icon: Award,
    value: 891,
    suffix: "",
    label: "Completed Milestones",
    sublabel: "Verified deliverables approved",
  },
  {
    icon: Zap,
    value: 94,
    suffix: "%",
    label: "Milestone Rate",
    sublabel: "On-time delivery performance",
  },
  {
    icon: UserCheck,
    value: 47,
    suffix: "",
    label: "Hiring Conversions",
    sublabel: "FYP → employment outcomes",
  },
];

export function StatsSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Execution Metrics.
            <br />
            <span className="text-primary">Not Vanity.</span>
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Every number is computed from real escrow transactions and verified milestone completions.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              viewport={{ once: true }}
            >
              <div className="rounded-lg border bg-card p-6 md:p-8 transition-shadow duration-200 hover:shadow-md">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>

                <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                  {stat.prefix || ""}
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2200} delay={i * 150} />
                </div>

                <div className="mt-2 text-sm font-semibold text-foreground/80 flex items-center gap-2">
                  {stat.label}
                  {stat.live && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
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
