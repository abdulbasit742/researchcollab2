import { Link } from "react-router-dom";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Wallet, Trophy, BookOpen, Calendar, FileText, Wrench,
  Shield, Scale, Briefcase, Zap, Heart, BarChart3,
} from "lucide-react";

const quickLinks = [
  { label: "Earn", href: "/earn", icon: Wallet },
  { label: "Learn", href: "/learning", icon: BookOpen },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Research", href: "/research-papers", icon: FileText },
  { label: "Tools", href: "/tools", icon: Wrench },
  { label: "Passport", href: "/passport", icon: Shield },
  { label: "Governance", href: "/governance", icon: Scale },
  { label: "HR", href: "/hr", icon: Briefcase },
  { label: "Automation", href: "/automation", icon: Zap },
  { label: "Social", href: "/social", icon: Heart },
  { label: "Impact", href: "/impact", icon: BarChart3 },
];

export function QuickLinksBar() {
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 pb-2">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-xs font-medium whitespace-nowrap touch-manipulation"
          >
            <link.icon className="h-3.5 w-3.5" />
            {link.label}
          </Link>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
