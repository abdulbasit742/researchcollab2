import { motion, useTransform } from "framer-motion";
import { FileText, Users, Microscope, Cpu } from "lucide-react";
import { useParallax } from "@/hooks/useParallax";
import { AnimatedCounter } from "@/components/ui/animated-counter";

const stats = [
  {
    icon: FileText,
    value: 12400,
    suffix: "+",
    label: "Research Papers",
    description: "Published & in progress",
  },
  {
    icon: Users,
    value: 5200,
    suffix: "+",
    label: "Active Researchers",
    description: "Across 120+ countries",
    live: true,
  },
  {
    icon: Microscope,
    value: 53,
    suffix: "",
    label: "Research Fields",
    description: "And growing weekly",
  },
  {
    icon: Cpu,
    value: 15,
    suffix: "+",
    label: "AI-Powered Tools",
    description: "Built for academics",
  },
];

export function StatsSection() {
  const { scrollY, isDisabled } = useParallax({ speed: 0.2 });
  const patternY = useTransform(scrollY, (v) => (isDisabled ? 0 : v * 0.05));

  return (
    <section data-tour="stats" className="py-10 md:py-16 lg:py-24 border-y bg-muted/30 relative overflow-hidden">
      <motion.div className="absolute inset-0 opacity-30" style={{ y: patternY }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--primary)/0.15)_1px,transparent_0)] bg-[length:24px_24px]" />
      </motion.div>

      <div className="container px-4 md:px-6 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <motion.div
                className="mx-auto mb-2 md:mb-4 flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-2xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110 will-change-transform"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <stat.icon className="h-5 w-5 md:h-7 md:w-7 text-primary" />
              </motion.div>
              <div className="text-xl md:text-3xl font-bold text-foreground">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2200} delay={index * 200} />
              </div>
              <div className="mt-0.5 md:mt-1 text-sm md:text-base font-semibold flex items-center justify-center gap-1.5">
                {stat.label}
                {stat.live && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                )}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
