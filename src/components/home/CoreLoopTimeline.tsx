import { motion } from "framer-motion";
import { Briefcase, DollarSign, Lock, CheckCircle2, Shield, UserCheck } from "lucide-react";

const steps = [
  { icon: Briefcase, label: "Create", sublabel: "Student submits FYP", color: "from-primary to-blue-500" },
  { icon: DollarSign, label: "Fund", sublabel: "Sponsor deposits capital", color: "from-emerald-500 to-teal-500" },
  { icon: Lock, label: "Lock", sublabel: "Escrow secures funds", color: "from-amber-500 to-orange-500" },
  { icon: CheckCircle2, label: "Execute", sublabel: "Milestones delivered", color: "from-primary to-blue-500" },
  { icon: Shield, label: "Trust", sublabel: "Scores updated", color: "from-violet-500 to-purple-500" },
  { icon: UserCheck, label: "Hire", sublabel: "Outcome captured", color: "from-emerald-500 to-teal-500" },
];

export function CoreLoopTimeline() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
      
      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">The Engine</p>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            One Loop. Six Steps. Zero Noise.
          </h2>
        </motion.div>

        {/* Desktop: horizontal pipeline */}
        <div className="hidden md:flex items-center justify-center max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center"
            >
              <div className="flex flex-col items-center group cursor-default">
                <motion.div
                  whileHover={{ scale: 1.15, y: -4 }}
                  className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg transition-shadow duration-300 group-hover:shadow-xl`}
                >
                  <step.icon className="h-6 w-6 text-white" />
                </motion.div>
                <p className="mt-3 text-sm font-bold text-foreground">{step.label}</p>
                <p className="text-[11px] text-muted-foreground max-w-[100px] text-center leading-tight">{step.sublabel}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-3 flex items-center">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                    viewport={{ once: true }}
                    className="h-[2px] w-10 bg-gradient-to-r from-border to-primary/30 origin-left"
                  />
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/40 -ml-0.5" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Mobile: vertical pipeline */}
        <div className="md:hidden max-w-sm mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              viewport={{ once: true }}
              className="flex items-start gap-4"
            >
              <div className="flex flex-col items-center">
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md shrink-0`}>
                  <step.icon className="h-5 w-5 text-white" />
                </div>
                {i < steps.length - 1 && (
                  <div className="w-[2px] h-8 bg-gradient-to-b from-primary/20 to-border mt-1" />
                )}
              </div>
              <div className="pt-2 pb-4">
                <p className="text-sm font-bold text-foreground">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.sublabel}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Loop indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-5 py-2.5 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Every completed cycle compounds trust, revenue, and hiring outcomes
          </div>
        </motion.div>
      </div>
    </section>
  );
}
