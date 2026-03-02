import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Shield, Activity, Server, Globe, ToggleLeft,
  DollarSign, FileText, ChevronRight, LogOut, ShieldCheck, GitBranch,
  Stethoscope, Flame, Search, Gauge, Bell,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { label: "Overview", href: "/super-admin/overview", icon: LayoutDashboard },
  { label: "Risk Clusters", href: "/super-admin/risk-clusters", icon: Shield },
  { label: "Performance", href: "/super-admin/performance", icon: Activity },
  { label: "Integrity", href: "/super-admin/integrity", icon: Server },
  { label: "Federation", href: "/super-admin/federation", icon: Globe },
  { label: "Features", href: "/super-admin/features", icon: ToggleLeft },
  { label: "Revenue", href: "/super-admin/revenue", icon: DollarSign },
  { label: "Audit Log", href: "/super-admin/audit-log", icon: FileText },
  { label: "SLA Overview", href: "/super-admin/sla-overview", icon: ShieldCheck },
  { label: "Audit Map", href: "/super-admin/audit-map", icon: GitBranch },
  { label: "Diagnostics", href: "/super-admin/diagnostics", icon: Stethoscope },
  { label: "Perf Heatmap", href: "/super-admin/performance-heatmap", icon: Flame },
  { label: "Event Trace", href: "/super-admin/event-trace", icon: Search },
  { label: "Stress Test", href: "/super-admin/stress-simulation", icon: Gauge },
  { label: "Alerts", href: "/super-admin/alert-thresholds", icon: Bell },
];

export function SuperAdminLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 border-r bg-card flex-col">
        <div className="p-4 border-b">
          <h2 className="text-sm font-bold tracking-tight">Super Admin</h2>
          <p className="text-[10px] text-muted-foreground">Global Control Layer</p>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-0.5 px-2">
            {NAV_ITEMS.map(item => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} to={item.href}>
                  <div className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}>
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="p-3 border-t">
          <Link to="/home">
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs gap-2">
              <LogOut className="h-3.5 w-3.5" /> Exit Super Admin
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-2 p-3 border-b overflow-x-auto">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <div className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium whitespace-nowrap",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  <item.icon className="h-3 w-3" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
