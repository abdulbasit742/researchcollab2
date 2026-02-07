import { AdminLayout } from "@/components/admin/AdminLayout";
import { QuickStats } from "@/components/admin/QuickStats";
import { SystemHealthPanel } from "@/components/admin/SystemHealthPanel";
import { ActionQueuePanel } from "@/components/admin/ActionQueuePanel";
import { RecentAuditActivity } from "@/components/admin/RecentAuditActivity";
import { GrowthMetricsPanel } from "@/components/admin/GrowthMetricsPanel";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Users, 
  Wrench, 
  Briefcase, 
  ShieldCheck, 
  DollarSign, 
  Flag, 
  ArrowRight,
  AlertCircle,
  Wallet,
  Scale
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminPortalPage() {
  const { stats, loading } = useAdminStats();

  const quickStats = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "blue" as const },
    { title: "Active Subscriptions", value: stats.activeSubscriptions, icon: Wrench, color: "green" as const },
    { title: "Pending Verifications", value: stats.pendingVerifications, icon: ShieldCheck, color: "yellow" as const },
    { title: "Revenue (MTD)", value: `PKR ${stats.revenueThisMonth.toLocaleString()}`, icon: DollarSign, color: "primary" as const },
    { title: "Escrow Balance", value: `PKR ${stats.totalEscrowBalance.toLocaleString()}`, icon: Wallet, color: "blue" as const },
    { title: "Open Disputes", value: stats.openDisputes, icon: Scale, color: "red" as const },
    { title: "Active Projects", value: stats.activeProjects, icon: Briefcase, color: "green" as const },
    { title: "Pending Reports", value: stats.pendingReports, icon: Flag, color: "yellow" as const },
  ];

  const actionCards = [
    {
      title: "User Management",
      description: "View, edit, and manage all platform users",
      icon: Users,
      href: "/admin/users",
      badge: stats.totalUsers,
      color: "blue",
    },
    {
      title: "Tools Marketplace",
      description: "Add, edit, feature or remove tools",
      icon: Wrench,
      href: "/admin/tools",
      badge: stats.totalTools,
      color: "green",
    },
    {
      title: "Projects",
      description: "Manage earning projects and assignments",
      icon: Briefcase,
      href: "/admin/projects",
      badge: stats.activeProjects,
      color: "purple",
    },
    {
      title: "Verifications",
      description: "Review pending verification requests",
      icon: ShieldCheck,
      href: "/admin/verifications",
      badge: stats.pendingVerifications,
      badgeVariant: stats.pendingVerifications > 0 ? "destructive" : "secondary",
      color: "yellow",
    },
    {
      title: "Finance",
      description: "View transactions, escrow, and disputes",
      icon: DollarSign,
      href: "/admin/finance",
      badge: stats.openDisputes > 0 ? `${stats.openDisputes} disputes` : undefined,
      badgeVariant: "destructive",
      color: "emerald",
    },
    {
      title: "Reports",
      description: "Handle user reports and moderation",
      icon: Flag,
      href: "/admin/reports",
      badge: stats.pendingReports > 0 ? stats.pendingReports : undefined,
      badgeVariant: stats.pendingReports > 0 ? "destructive" : "secondary",
      color: "red",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your platform.
          </p>
        </div>

        {/* Quick Stats - 8 cards in 2 rows */}
        <QuickStats stats={quickStats} loading={loading} />

        {/* Alerts */}
        {(stats.pendingVerifications > 0 || stats.openDisputes > 0 || stats.pendingReports > 0) && (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium">Action Required</p>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    {stats.pendingVerifications > 0 && (
                      <li>{stats.pendingVerifications} verification(s) pending review</li>
                    )}
                    {stats.openDisputes > 0 && (
                      <li>{stats.openDisputes} dispute(s) need resolution</li>
                    )}
                    {stats.pendingReports > 0 && (
                      <li>{stats.pendingReports} report(s) require attention</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Grid - System Health, Action Queue, Audit Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SystemHealthPanel />
          <ActionQueuePanel />
          <RecentAuditActivity />
        </div>

        {/* Growth Metrics */}
        <GrowthMetricsPanel />

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actionCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} to={card.href}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      {card.badge !== undefined && (
                        <Badge variant={card.badgeVariant as any || "secondary"}>
                          {card.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                    <div className="mt-4 flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                      Manage <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/admin/users">Add User</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/tools">Add Tool</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/settings">Platform Settings</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/verifications">Review Verifications</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/audit">View Audit Log</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
