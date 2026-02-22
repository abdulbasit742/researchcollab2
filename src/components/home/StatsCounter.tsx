import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

const stats: StatItem[] = [
  { label: "Active Projects", value: 2400, suffix: "+" },
  { label: "Trust Score Avg", value: 87, suffix: "%" },
  { label: "Escrow Protected", value: 12, prefix: "$", suffix: "M+" },
  { label: "Hiring Rate", value: 94, suffix: "%" },
];

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref} className="text-3xl sm:text-4xl font-bold text-foreground">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export function StatsCounter() {
  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="container px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
