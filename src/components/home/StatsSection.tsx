import { motion } from "framer-motion";
import { Building, Globe, BookOpen, Users } from "lucide-react";

const stats = [
  {
    icon: Building,
    value: "50+",
    label: "Universities",
    description: "Partner institutions",
  },
  {
    icon: Globe,
    value: "80+",
    label: "Countries",
    description: "Global reach",
  },
  {
    icon: BookOpen,
    value: "100+",
    label: "Research Areas",
    description: "Diverse fields",
  },
  {
    icon: Users,
    value: "1000+",
    label: "Members",
    description: "Active researchers",
  },
];

export function StatsSection() {
  return (
    <section className="py-10 md:py-16 lg:py-24 border-y bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="mx-auto mb-2 md:mb-4 flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-2xl bg-primary/10">
                <stat.icon className="h-5 w-5 md:h-7 md:w-7 text-primary" />
              </div>
              <div className="text-2xl md:text-4xl font-extrabold text-gradient">{stat.value}</div>
              <div className="mt-0.5 md:mt-1 text-sm md:text-base font-semibold">{stat.label}</div>
              <div className="text-xs md:text-sm text-muted-foreground">{stat.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
