import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, CheckCircle2, Users, Sparkles } from "lucide-react";
import { useEarnStats } from "@/hooks/useEarnStats";

function formatStatValue(count: number): string {
  if (count === 0) return "New";
  if (count < 10) return `${count}`;
  if (count < 100) return `${count}+`;
  if (count < 1000) return `${Math.floor(count / 10) * 10}+`;
  return `${(count / 1000).toFixed(1)}K+`;
}

export function EarnStatsBar() {
  const { data: stats } = useEarnStats();

  const items = [
    {
      label: "Open Projects",
      value: formatStatValue(stats?.activeProjects ?? 0),
      icon: Briefcase,
    },
    {
      label: "Community Members",
      value: formatStatValue(stats?.totalEarners ?? 0),
      icon: Users,
    },
    {
      label: "Deals Completed",
      value: formatStatValue(stats?.completedDeals ?? 0),
      icon: CheckCircle2,
    },
    {
      label: "Platform Status",
      value: "Live",
      icon: Sparkles,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
    >
      {items.map((stat) => (
        <Card key={stat.label} variant="glass">
          <CardContent className="p-4 md:p-6 text-center">
            <stat.icon className="h-6 w-6 md:h-8 md:w-8 mx-auto text-primary mb-2" />
            <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
            <div className="text-xs md:text-sm text-muted-foreground">
              {stat.label}
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
