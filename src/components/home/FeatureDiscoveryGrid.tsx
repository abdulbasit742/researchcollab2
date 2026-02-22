import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Wallet, Trophy, Users, BookOpen, Calendar, Compass,
  FileText, Wrench, Gamepad2, Shield, Scale, Heart,
} from "lucide-react";

const features = [
  { label: "Earn Hub", href: "/earn", icon: Wallet, color: "text-emerald-500" },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy, color: "text-amber-500" },
  { label: "Network", href: "/network", icon: Users, color: "text-blue-500" },
  { label: "Learning", href: "/learning", icon: BookOpen, color: "text-purple-500" },
  { label: "Events", href: "/events", icon: Calendar, color: "text-pink-500" },
  { label: "Career AI", href: "/career", icon: Compass, color: "text-cyan-500" },
  { label: "Research", href: "/research-papers", icon: FileText, color: "text-orange-500" },
  { label: "Tools", href: "/tools", icon: Wrench, color: "text-slate-500" },
  { label: "Games", href: "/games", icon: Gamepad2, color: "text-red-500" },
  { label: "Passport", href: "/passport", icon: Shield, color: "text-green-500" },
  { label: "Governance", href: "/governance", icon: Scale, color: "text-indigo-500" },
  { label: "Social", href: "/social", icon: Heart, color: "text-rose-500" },
];

export function FeatureDiscoveryGrid() {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">Explore Platform</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {features.map((f, i) => (
          <motion.div
            key={f.href}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
          >
            <Link to={f.href}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer group border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-4 px-2 gap-2">
                  <f.icon className={`h-5 w-5 ${f.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-xs font-medium text-center leading-tight">{f.label}</span>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
