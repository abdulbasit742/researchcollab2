import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DollarSign, Brain, Users, Shield, ArrowRight, ArrowLeft } from "lucide-react";

const features = [
  {
    icon: DollarSign,
    title: "Earn Hub",
    description: "Bid on projects and get paid for your skills. Post your own projects to find talent.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Brain,
    title: "AI Research Tools",
    description: "Access AI-powered tools for literature review, writing assistance, and data analysis.",
    gradient: "from-primary/20 to-purple-500/20",
    iconColor: "text-primary",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Find and connect with researchers worldwide. Form teams, share workspaces, and co-author.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Shield,
    title: "Trust System",
    description: "Build your reputation through verified outcomes, endorsements, and on-time delivery.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
];

export function PlatformWalkthrough() {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = features[activeIndex];
  const Icon = current.icon;

  return (
    <div className="space-y-6">
      {/* Feature card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className={`rounded-xl bg-gradient-to-br ${current.gradient} p-6 text-center`}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-background/80 shadow-sm">
            <Icon className={`h-7 w-7 ${current.iconColor}`} />
          </div>
          <h3 className="text-lg font-semibold mb-2">{current.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            {current.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2">
        {features.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === activeIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          disabled={activeIndex === 0}
          onClick={() => setActiveIndex((i) => i - 1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Prev
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={activeIndex === features.length - 1}
          onClick={() => setActiveIndex((i) => i + 1)}
        >
          Next <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
