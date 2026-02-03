import { Link, useLocation } from "react-router-dom";
import { 
  Users, 
  Wrench, 
  Briefcase, 
  ShieldCheck, 
  DollarSign, 
  Flag, 
  Settings, 
  LayoutDashboard,
  MessageSquare,
  Building2,
  Heart,
  History,
  BarChart3,
  Package,
  Landmark,
  Globe,
  Shield,
  BookOpen,
  Vote,
  Database,
  Key
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Key, label: "Permissions", href: "/admin/permissions" },
  { icon: MessageSquare, label: "Feed Moderation", href: "/admin/feed" },
  { icon: Wrench, label: "Tools", href: "/admin/tools" },
  { icon: Briefcase, label: "Projects", href: "/admin/projects" },
  { icon: ShieldCheck, label: "Verifications", href: "/admin/verifications" },
  { icon: DollarSign, label: "Finance", href: "/admin/finance" },
  { icon: Flag, label: "Reports", href: "/admin/reports" },
  { icon: MessageSquare, label: "Support", href: "/admin/support" },
  { icon: Heart, label: "Affiliates", href: "/admin/affiliates" },
  { icon: Building2, label: "Enterprise", href: "/admin/enterprise" },
  { icon: Package, label: "Fulfillment", href: "/admin/fulfillment" },
  { icon: DollarSign, label: "Subscriptions", href: "/admin/subscriptions" },
  { icon: Briefcase, label: "AI Pricing", href: "/admin/ai-pricing" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: History, label: "Activity Log", href: "/admin/audit-log" },
  // Phase 5 & 6 - Infrastructure & Governance
  { icon: Landmark, label: "Government", href: "/admin/government" },
  { icon: Globe, label: "National Insights", href: "/admin/national-insights" },
  { icon: Shield, label: "Infrastructure", href: "/admin/infrastructure" },
  { icon: Vote, label: "Governance", href: "/admin/governance" },
  { icon: Database, label: "Resilience", href: "/admin/resilience" },
  { icon: BookOpen, label: "Knowledge", href: "/admin/knowledge" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export function AdminSidebar() {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Admin Portal</h2>
        <p className="text-sm text-muted-foreground">Manage your platform</p>
      </div>
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
