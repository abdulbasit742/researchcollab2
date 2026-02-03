import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useMyTrustProfile } from "@/hooks/useMyTrustProfile";
import { useProfileProofMetrics, useWorkConnections } from "@/hooks/useOutcomeFeed";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ProofProfileCard,
  WorkGraphCard,
  TrustEngineDisplay,
} from "@/components/outcome";
import {
  User,
  Briefcase,
  Award,
  Shield,
  Building,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  Star,
  ChevronRight,
  Settings,
  ExternalLink,
} from "lucide-react";

export default function ProfilePage() {
  const { user, profile, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const { trustProfile, badges, loading: trustLoading } = useMyTrustProfile();
  const { metrics, loading: metricsLoading } = useProfileProofMetrics();
  const { connections } = useWorkConnections();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading || trustLoading || metricsLoading) {
    return (
      <MainLayout>
        <div className="container max-w-4xl py-6 sm:py-8 px-4">
          <Skeleton className="h-8 w-48 mb-6 sm:mb-8" />
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return null;
  }

  const trustScore = trustProfile?.trust_score ?? 0;
  const trustTier = trustScore >= 80 ? "platinum" : trustScore >= 60 ? "gold" : trustScore >= 40 ? "silver" : "bronze";

  const roleColors: Record<string, string> = {
    student: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    researcher: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <MainLayout>
      <div className="container max-w-5xl py-6 sm:py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Proof Profile</h1>
            <Button variant="outline" size="sm" asChild>
              <Link to="/profile/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>

          {/* Subtitle explaining the philosophy */}
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Your profile is generated from verified activity—not self-written claims. 
            Complete projects, win grants, and earn trust to build your professional ledger.
          </p>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Full Proof Profile Card */}
              <ProofProfileCard
                userId={user.id}
                userEmail={user.email}
                userName={profile?.full_name || undefined}
                metrics={metrics}
                trustScore={trustScore}
                trustTier={trustTier}
              />

              {/* Activity Tabs */}
              <Card>
                <Tabs defaultValue="work" className="w-full">
                  <CardHeader className="pb-0">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="work" className="text-xs sm:text-sm">
                        <Briefcase className="h-4 w-4 mr-1 hidden sm:inline" />
                        Work
                      </TabsTrigger>
                      <TabsTrigger value="publications" className="text-xs sm:text-sm">
                        <FileText className="h-4 w-4 mr-1 hidden sm:inline" />
                        Publications
                      </TabsTrigger>
                      <TabsTrigger value="grants" className="text-xs sm:text-sm">
                        <Award className="h-4 w-4 mr-1 hidden sm:inline" />
                        Grants
                      </TabsTrigger>
                      <TabsTrigger value="badges" className="text-xs sm:text-sm">
                        <Star className="h-4 w-4 mr-1 hidden sm:inline" />
                        Badges
                      </TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <TabsContent value="work" className="mt-0">
                      {metrics && metrics.projects_completed > 0 ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Completed</span>
                              </div>
                              <span className="text-2xl font-bold">{metrics.projects_completed}</span>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Success Rate</span>
                              </div>
                              <span className="text-2xl font-bold">{metrics.escrow_success_rate.toFixed(0)}%</span>
                            </div>
                          </div>
                          <Button variant="outline" asChild className="w-full">
                            <Link to="/offers">
                              Browse More Projects
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <EmptyTabContent
                          icon={Briefcase}
                          title="No completed work yet"
                          description="Complete your first project to build your work history"
                          actionLabel="Find Projects"
                          actionHref="/offers"
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="publications" className="mt-0">
                      <EmptyTabContent
                        icon={FileText}
                        title="No publications linked"
                        description="Link your publications to strengthen your profile"
                        actionLabel="Add Publications"
                        actionHref="/profile/publications"
                      />
                    </TabsContent>

                    <TabsContent value="grants" className="mt-0">
                      {metrics && metrics.grants_won > 0 ? (
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2 mb-1">
                              <Award className="h-4 w-4 text-amber-500" />
                              <span className="text-sm text-muted-foreground">Grants Won</span>
                            </div>
                            <span className="text-2xl font-bold">{metrics.grants_won}</span>
                          </div>
                          <Button variant="outline" asChild className="w-full">
                            <Link to="/grants">
                              Find More Grants
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <EmptyTabContent
                          icon={Award}
                          title="No grants yet"
                          description="Win grants to showcase your competitive success"
                          actionLabel="Find Grants"
                          actionHref="/grants"
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="badges" className="mt-0">
                      {badges.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {badges.map((badge) => (
                            <div
                              key={badge.id}
                              className="p-3 rounded-lg border bg-card text-center"
                            >
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                                <Star className="h-5 w-5 text-primary" />
                              </div>
                              <p className="font-medium text-sm">{badge.badge_name}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(badge.earned_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyTabContent
                          icon={Star}
                          title="No badges earned"
                          description="Complete milestones to earn recognition badges"
                          actionLabel="View Milestones"
                          actionHref="/achievements"
                        />
                      )}
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Trust Engine */}
              <TrustEngineDisplay
                totalScore={trustScore}
                tier={trustTier}
                breakdown={{
                  verification_status: trustProfile?.is_verified_student || trustProfile?.is_verified_researcher ? 25 : 0,
                  completed_offers: Math.min((metrics?.projects_completed || 0) * 2, 20),
                  on_time_delivery_rate: 12,
                  dispute_free_history: (metrics?.dispute_loss_count || 0) === 0 ? 15 : 5,
                  ratings_score: Math.min((metrics?.peer_reviews_received || 0) * 2, 10),
                  financial_reliability: metrics?.escrow_success_rate ? Math.round(metrics.escrow_success_rate / 10) : 0,
                }}
                lastUpdated={trustProfile?.updated_at}
              />

              {/* Work Graph */}
              <WorkGraphCard connections={connections} maxDisplay={3} />

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <QuickActionButton
                      icon={Shield}
                      iconColor="text-emerald-500"
                      label="Get Verified"
                      description="Prove your credentials"
                      href="/verification"
                    />
                    <QuickActionButton
                      icon={DollarSign}
                      iconColor="text-primary"
                      label="My Wallet"
                      description="Manage funds"
                      href="/wallet"
                    />
                    <QuickActionButton
                      icon={Building}
                      iconColor="text-orange-500"
                      label="Institutions"
                      description="Link affiliations"
                      href="/organizations"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Account Info (minimal) */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium truncate max-w-[150px]">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Role</span>
                    <Badge className={roleColors[userRole?.role || "student"]}>
                      {userRole?.role || "Student"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Member since</span>
                    <span className="font-medium">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                          })
                        : "N/A"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}

interface EmptyTabContentProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

function EmptyTabContent({ icon: Icon, title, description, actionLabel, actionHref }: EmptyTabContentProps) {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h4 className="font-medium mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Button variant="outline" size="sm" asChild>
        <Link to={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}

interface QuickActionButtonProps {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  description: string;
  href: string;
}

function QuickActionButton({ icon: Icon, iconColor, label, description, href }: QuickActionButtonProps) {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(href)}
      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors touch-manipulation active:bg-muted"
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div className="text-left">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
