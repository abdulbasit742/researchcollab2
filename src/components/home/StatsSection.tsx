import { motion } from "framer-motion";
import { Building, Globe, BookOpen, Users } from "lucide-react";
import { CountUpNumber } from "@/components/decorations/CountUpNumber";

const stats = [
  {
    icon: Building,
    value: 50,
    suffix: "+",
    label: "Universities",
    description: "Partner institutions",
  },
  {
    icon: Globe,
    value: 80,
    suffix: "+",
    label: "Countries",
    description: "Global reach",
  },
  {
    icon: BookOpen,
    value: 100,
    suffix: "+",
    label: "Research Areas",
    description: "Diverse fields",
  },
  {
    icon: Users,
    value: 1000,
    suffix: "+",
    label: "Members",
    description: "Active researchers",
  },
];

export function StatsSection() {
  return (
    <section className="py-10 md:py-16 lg:py-24 border-y bg-muted/30 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--primary)/0.15)_1px,transparent_0)] bg-[length:24px_24px]" />
      </div>

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
                className="mx-auto mb-2 md:mb-4 flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-2xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <stat.icon className="h-5 w-5 md:h-7 md:w-7 text-primary" />
              </motion.div>
              <div className="text-2xl md:text-4xl font-extrabold text-gradient">
                <CountUpNumber value={stat.value} suffix={stat.suffix} delay={index * 0.15} />
              </div>
              <div className="mt-0.5 md:mt-1 text-sm md:text-base font-semibold">{stat.label}</div>
              <div className="text-xs md:text-sm text-muted-foreground">{stat.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
