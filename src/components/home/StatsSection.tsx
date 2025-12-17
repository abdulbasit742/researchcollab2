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
    <section className="py-16 md:py-24 border-y bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <stat.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="text-4xl font-extrabold text-gradient">{stat.value}</div>
              <div className="mt-1 font-semibold">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
