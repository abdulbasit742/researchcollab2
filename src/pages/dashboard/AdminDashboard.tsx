import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Shield,
  Users,
  DollarSign,
  Package,
  CheckCircle,
  Settings,
  ArrowRight,
  BarChart3,
  Building,
} from "lucide-react";

const adminActions = [
  {
    title: "User Management",
    description: "Manage users and roles",
    href: "/admin/users",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Finance Overview",
    description: "View earnings and payouts",
    href: "/admin/finance",
    icon: DollarSign,
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Fulfillment Queue",
    description: "Manage tool deliveries",
    href: "/admin/fulfillment",
    icon: Package,
    color: "from-orange-500 to-amber-500",
  },
  {
    title: "Verifications",
    description: "Review pending verifications",
    href: "/admin/verifications",
    icon: CheckCircle,
    color: "from-violet-500 to-purple-600",
  },
  {
    title: "Subscriptions",
    description: "Manage tool subscriptions",
    href: "/admin/subscriptions",
    icon: BarChart3,
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "Organizations",
    description: "Manage B2B accounts",
    href: "/admin/enterprise",
    icon: Building,
    color: "from-slate-500 to-gray-600",
  },
];

export default function AdminDashboard() {
  const { profile, userRole } = useAuth();

  return (
    <MainLayout>
      <div className="gradient-hero py-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="destructive" className="mb-4">
              <Shield className="h-3 w-3 mr-1" />
              Admin Dashboard
            </Badge>
            <h1 className="text-3xl font-bold md:text-4xl">
              Welcome, <span className="text-primary">{profile?.full_name || "Admin"}</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage the platform, users, and operations.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-8">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">1,247</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  <p className="text-2xl font-bold">342</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Verifications</p>
                  <p className="text-2xl font-bold">18</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue (MTD)</p>
                  <p className="text-2xl font-bold">$12,450</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-violet-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Admin Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
              <CardDescription>Manage all platform operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminActions.map((action, index) => (
                  <Link key={action.href} to={action.href}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-4 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`h-12 w-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}
                        >
                          <action.icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}