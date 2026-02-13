import { motion, useTransform } from "framer-motion";
import { Cpu, Shield, Users, Globe } from "lucide-react";
import { useParallax } from "@/hooks/useParallax";

const capabilities = [
  {
    icon: Cpu,
    label: "AI-Powered Tools",
    description: "Research assistance built in",
  },
  {
    icon: Shield,
    label: "Secure Escrow",
    description: "Protected payments",
  },
  {
    icon: Users,
    label: "Trust-Based Matching",
    description: "Verified collaborators",
  },
  {
    icon: Globe,
    label: "Global Access",
    description: "Work with anyone, anywhere",
  },
];

export function StatsSection() {
  const { scrollY, isDisabled } = useParallax({ speed: 0.2 });

  // Background pattern parallax (moves slower)
  const patternY = useTransform(scrollY, (v) => (isDisabled ? 0 : v * 0.05));

  return (
    <section data-tour="stats" className="py-10 md:py-16 lg:py-24 border-y bg-muted/30 relative overflow-hidden">
      {/* Subtle background pattern with parallax */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{ y: patternY }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--primary)/0.15)_1px,transparent_0)] bg-[length:24px_24px]" />
      </motion.div>

      <div className="container px-4 md:px-6 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {capabilities.map((cap, index) => (
            <motion.div
              key={cap.label}
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
                <cap.icon className="h-5 w-5 md:h-7 md:w-7 text-primary" />
              </motion.div>
              <div className="mt-0.5 md:mt-1 text-sm md:text-base font-semibold">
                {cap.label}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">
                {cap.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
