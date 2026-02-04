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
  Menu,
  History,
  BarChart3,
  Package,
  GraduationCap,
  Calendar,
  UserCog,
  Workflow,
  FolderKanban,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
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
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

const platformItems = [
  { icon: Layers, label: "Features Showcase", href: "/features" },
  { icon: GraduationCap, label: "Learning", href: "/learning" },
  { icon: Calendar, label: "Events", href: "/events" },
  { icon: UserCog, label: "HR & Talent", href: "/hr" },
  { icon: Workflow, label: "Automation", href: "/automation" },
  { icon: FolderKanban, label: "Project Management", href: "/projects" },
];

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="p-4 border-b border-border">
          Admin Navigation
        </SheetTitle>
        <ScrollArea className="h-[calc(100vh-60px)]">
          <nav className="p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
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
                  onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  );
}
