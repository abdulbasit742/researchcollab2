import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, DollarSign, Star, Users } from "lucide-react";
import { motion } from "framer-motion";

const activities = [
  { icon: DollarSign, text: "Escrow funded for ML Research FYP", time: "2m ago", type: "funding" },
  { icon: CheckCircle, text: "Milestone 3 approved by sponsor", time: "15m ago", type: "milestone" },
  { icon: Star, text: "Trust score increased to 78", time: "1h ago", type: "trust" },
  { icon: Users, text: "New connection: Dr. Ahmad Khan", time: "3h ago", type: "network" },
  { icon: CheckCircle, text: "Research paper review completed", time: "5h ago", type: "milestone" },
];

const typeColors: Record<string, string> = {
  funding: "bg-green-500/10 text-green-600",
  milestone: "bg-blue-500/10 text-blue-600",
  trust: "bg-amber-500/10 text-amber-600",
  network: "bg-purple-500/10 text-purple-600",
};

export function RecentActivityWidget() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3"
          >
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${typeColors[item.type]}`}>
              <item.icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs leading-snug">{item.text}</p>
              <span className="text-[10px] text-muted-foreground">{item.time}</span>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
