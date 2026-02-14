import { motion } from "framer-motion";

const nodes = [
  { x: 20, y: 35, label: "MIT", delay: 0, showOnMobile: true },
  { x: 25, y: 42, label: "Stanford", delay: 0.5, showOnMobile: false },
  { x: 30, y: 55, label: "São Paulo", delay: 1.2, showOnMobile: false },
  { x: 48, y: 30, label: "Oxford", delay: 0.3, showOnMobile: true },
  { x: 52, y: 32, label: "Berlin", delay: 0.8, showOnMobile: false },
  { x: 50, y: 38, label: "Zurich", delay: 1.5, showOnMobile: false },
  { x: 72, y: 35, label: "Tokyo", delay: 0.6, showOnMobile: true },
  { x: 68, y: 42, label: "Beijing", delay: 1.0, showOnMobile: false },
  { x: 65, y: 50, label: "Mumbai", delay: 1.8, showOnMobile: true },
  { x: 80, y: 65, label: "Sydney", delay: 1.3, showOnMobile: false },
  { x: 52, y: 55, label: "Nairobi", delay: 2.0, showOnMobile: false },
];

const connections = [
  [0, 3], [1, 4], [2, 10], [3, 7], [4, 5],
  [6, 7], [7, 8], [8, 9], [0, 1], [5, 8],
  [3, 6], [10, 8],
];

export function GlobalNetworkMap() {
  return (
    <section className="py-10 md:py-20 relative overflow-hidden">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-6 md:mb-12"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-2 sm:mb-3">
            Researchers Connected{" "}
            <span className="text-primary">Worldwide</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-xl mx-auto">
            Live collaborations forming across continents, every minute.
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-4xl aspect-[2/1] sm:aspect-[2/1]">
          {/* World outline dots */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,hsl(var(--primary))_0.5px,transparent_0)] bg-[length:12px_12px] sm:bg-[length:16px_16px]" />
          </div>

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80">
            {connections.map(([from, to], i) => (
              <motion.line
                key={i}
                x1={nodes[from].x}
                y1={nodes[from].y}
                x2={nodes[to].x}
                y2={nodes[to].y}
                stroke="hsl(var(--primary))"
                strokeWidth="0.15"
                strokeOpacity="0.4"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: i * 0.15 }}
                viewport={{ once: true }}
              />
            ))}
          </svg>

          {/* Nodes */}
          {nodes.map((node, i) => (
            <motion.div
              key={i}
              className="absolute group"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: node.delay }}
              viewport={{ once: true }}
            >
              {/* Pulse ring */}
              <motion.div
                className="absolute -inset-2 sm:-inset-3 rounded-full bg-primary/20"
                animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, delay: node.delay }}
              />
              {/* Dot - larger on mobile for touch */}
              <div className="relative h-3 w-3 sm:h-2.5 sm:w-2.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)] -translate-x-1/2 -translate-y-1/2" />
              {/* Label - always visible for key nodes on mobile, hover for others */}
              <div
                className={`absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] sm:text-[10px] md:text-xs font-medium text-primary bg-card/80 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 rounded-md border border-border/50 transition-opacity ${
                  node.showOnMobile
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                {node.label}
              </div>
            </motion.div>
          ))}

          {/* Animated traveling dots */}
          {connections.slice(0, 6).map(([from, to], i) => (
            <motion.div
              key={`travel-${i}`}
              className="absolute h-1 w-1 rounded-full bg-primary shadow-[0_0_4px_hsl(var(--primary)/0.8)]"
              initial={{
                left: `${nodes[from].x}%`,
                top: `${nodes[from].y}%`,
              }}
              animate={{
                left: [`${nodes[from].x}%`, `${nodes[to].x}%`],
                top: [`${nodes[from].y}%`, `${nodes[to].y}%`],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 1.2,
                ease: "linear",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
