import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  GraduationCap,
  Heart,
  Briefcase,
  Wrench,
  Wallet,
  User,
  MapPin,
  Building,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const quickActions = [
  {
    title: "Find Matches",
    description: "Connect with researchers",
    href: "/matches",
    icon: Heart,
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "Browse Offers",
    description: "Find research opportunities",
    href: "/offers",
    icon: Briefcase,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "AI Tools",
    description: "Access research tools",
    href: "/tools",
    icon: Wrench,
    color: "from-violet-500 to-purple-600",
  },
  {
    title: "My Wallet",
    description: "Track earnings & payments",
    href: "/wallet",
    icon: Wallet,
    color: "from-emerald-500 to-teal-500",
  },
];

export default function StudentDashboard() {
  const { profile, userRole } = useAuth();

  const getDepartmentLabel = (code: string) => {
    const depts: Record<string, string> = {
      MME: "Materials & Metallurgical Engineering",
      CIS: "Computer & Information Sciences",
      PHYSICS: "Physics",
      ME: "Mechanical Engineering",
      CHM_ENG: "Chemical Engineering",
      EE: "Electrical Engineering",
    };
    return depts[code] || code;
  };

  return (
    <MainLayout>
      <div className="gradient-hero py-12">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4">
              <GraduationCap className="h-3 w-3 mr-1" />
              Student Dashboard
            </Badge>
            <h1 className="text-3xl font-bold md:text-4xl">
              Welcome back, <span className="text-primary">{profile?.full_name || "Student"}</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Continue your research journey and connect with opportunities.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profile Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {profile?.full_name?.charAt(0) || "S"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{profile?.full_name || "Student"}</h3>
                    <Badge variant="outline" className="mt-1">
                      {userRole?.role || "Student"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  {profile?.education_level && (
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Education:</span>
                      <span className="font-medium">{profile.education_level}</span>
                    </div>
                  )}
                  {profile?.department && (
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Department:</span>
                      <span className="font-medium">{getDepartmentLabel(profile.department)}</span>
                    </div>
                  )}
                  {profile?.university && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">University:</span>
                      <span className="font-medium">{profile.university}</span>
                    </div>
                  )}
                  {profile?.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{profile.location}</span>
                    </div>
                  )}
                  {profile?.research_level && (
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Level:</span>
                      <Badge variant="secondary" className="capitalize">
                        {profile.research_level}
                      </Badge>
                    </div>
                  )}
                </div>

                <Link to="/profile">
                  <Button variant="outline" className="w-full mt-4">
                    Edit Profile
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump to the most common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
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

        {/* Research Interests */}
        {profile?.interests && profile.interests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Research Interests</CardTitle>
                <CardDescription>Your areas of expertise and passion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}