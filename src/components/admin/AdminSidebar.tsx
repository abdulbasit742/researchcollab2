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
  Key,
  Sparkles,
  TrendingUp,
  GraduationCap,
  Calendar,
  UserCog,
  Workflow,
  FolderKanban,
  Layers,
  Camera,
  Lightbulb,
  Brain,
  Volume2,
  Bot,
  Radio,
  Activity,
  Clock,
  Star,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Radio, label: "Operations Center", href: "/admin/operations" },
  { icon: Activity, label: "Operational Health", href: "/admin/operational-health" },
  { icon: TrendingUp, label: "Conversion Metrics", href: "/admin/conversion-metrics" },
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
  { icon: Building2, label: "Institution Intelligence", href: "/admin/institution-intelligence" },
  { icon: Building2, label: "Institution Activation", href: "/admin/institution-activation" },
  { icon: DollarSign, label: "Revenue Dashboard", href: "/admin/revenue-dashboard" },
  { icon: TrendingUp, label: "Profit Dashboard", href: "/admin/profit-dashboard" },
  { icon: Settings, label: "Pricing Optimizer", href: "/admin/pricing-optimizer" },
  { icon: Database, label: "Infrastructure Costs", href: "/admin/infrastructure-costs" },
  { icon: Package, label: "Fulfillment", href: "/admin/fulfillment" },
  { icon: DollarSign, label: "Subscriptions", href: "/admin/subscriptions" },
  { icon: Briefcase, label: "AI Pricing", href: "/admin/ai-pricing" },
  // Premium & Pricing Intelligence
  { icon: Sparkles, label: "Premium Analytics", href: "/admin/premium-analytics" },
  { icon: TrendingUp, label: "Pricing", href: "/admin/pricing" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: History, label: "Activity Log", href: "/admin/audit-log" },
  // Phase 5 & 6 - Infrastructure & Governance
  { icon: Landmark, label: "Government", href: "/admin/government" },
  { icon: Globe, label: "National Insights", href: "/admin/national-insights" },
  { icon: Shield, label: "Infrastructure", href: "/admin/infrastructure" },
  { icon: Vote, label: "Governance", href: "/admin/governance" },
  { icon: Database, label: "Resilience", href: "/admin/resilience" },
  { icon: BookOpen, label: "Knowledge", href: "/admin/knowledge" },
  // Phase 7 - Security, AI, Reproducibility, Federation
  { icon: Shield, label: "Security Audit", href: "/admin/security" },
  { icon: Settings, label: "AI Governance", href: "/admin/ai-governance" },
  { icon: Database, label: "Reproducibility", href: "/admin/reproducibility" },
  { icon: Globe, label: "Federation", href: "/admin/federation" },
  { icon: ShieldCheck, label: "Systemic Risk", href: "/admin/systemic-risk" },
  { icon: Vote, label: "Governance Oversight", href: "/admin/governance-oversight" },
  { icon: Shield, label: "Constitutional Guardian", href: "/admin/constitutional-guardian" },
  { icon: Globe, label: "Global Expansion", href: "/admin/global-expansion" },
  { icon: ShieldCheck, label: "Power Audit", href: "/admin/power-audit" },
  { icon: Layers, label: "Feature Governance", href: "/admin/feature-governance" },
  { icon: Shield, label: "Crisis Mode", href: "/admin/crisis-mode" },
  { icon: Sparkles, label: "Evolution Simulator", href: "/admin/evolution-simulator" },
  { icon: GraduationCap, label: "FYP Hub", href: "/fyp/dashboard" },
  { icon: UserCog, label: "Supervisor Panel", href: "/faculty/supervisor-dashboard" },
  { icon: Activity, label: "Academic Output", href: "/analytics/academic-output" },
  { icon: Clock, label: "Review Queue", href: "/faculty/review-queue" },
  { icon: BarChart3, label: "Student Performance", href: "/profile/performance" },
  { icon: Briefcase, label: "Academic Tasks", href: "/academic/tasks" },
  { icon: Star, label: "Supervisor Performance", href: "/faculty/performance" },
  { icon: GraduationCap, label: "Employability Export", href: "/profile/employability" },
  { icon: Trophy, label: "Academic Rankings", href: "/academic/rankings" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

const platformItems = [
  { icon: Layers, label: "Features Showcase", href: "/features" },
  { icon: Camera, label: "Social Features", href: "/social" },
  { icon: Lightbulb, label: "Ambient Intelligence", href: "/ambient" },
  { icon: Brain, label: "Collective Intelligence", href: "/collective" },
   { icon: Volume2, label: "Audio Briefings", href: "/briefings" },
   { icon: Bot, label: "Career Co-pilot", href: "/career" },
  { icon: GraduationCap, label: "Learning", href: "/learning" },
  { icon: Calendar, label: "Events", href: "/events" },
  { icon: UserCog, label: "HR & Talent", href: "/hr" },
  { icon: Workflow, label: "Automation", href: "/automation" },
  { icon: FolderKanban, label: "Project Management", href: "/projects" },
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
          
          <Separator className="my-3" />
          <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Platform Features
          </p>
          
          {platformItems.map((item) => {
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
