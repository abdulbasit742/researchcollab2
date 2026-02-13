import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useMyTrustProfile } from "@/hooks/useMyTrustProfile";
import { useConsequenceLedger, useTrustEvents, useAccountabilityRecords } from "@/hooks/useAccountability";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ConsequenceLedgerCard,
  TrustTrajectoryChart,
} from "@/components/accountability";
import { AISuggestionCard } from "@/components/ai/AISuggestionCard";
import {
  TrustEngineDisplay,
  WorkGraphCard,
} from "@/components/outcome";
import { ProfileViewsCard } from "@/components/profile";
import { MyPlanCard } from "@/components/profile/MyPlanCard";
import { VisibilityScoreCard } from "@/components/profile/VisibilityScoreCard";
import { useWorkConnections } from "@/hooks/useOutcomeFeed";
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
  XCircle,
  TrendingUp,
  Star,
  ChevronRight,
  Settings,
  ExternalLink,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
  const { user, profile, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const { trustProfile, badges, loading: trustLoading } = useMyTrustProfile();
  const { data: ledger, isLoading: ledgerLoading } = useConsequenceLedger();
  const { data: trustEvents = [] } = useTrustEvents();
  const { data: accountabilityRecords = [] } = useAccountabilityRecords();
  const { connections } = useWorkConnections();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading || trustLoading || ledgerLoading) {
    return (
      <MainLayout>
        <div className="container max-w-5xl py-6 sm:py-8 px-4">
          <Skeleton className="h-8 w-48 mb-6 sm:mb-8" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
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

  // Calculate failure visibility stats (LinkedIn can't show this)
  const failedProjects = accountabilityRecords.filter(r => r.outcome_status === 'failed').length;
  const completedProjects = accountabilityRecords.filter(r => r.outcome_status === 'completed').length;

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
            <h1 className="text-2xl sm:text-3xl font-bold">Professional Profile</h1>
            <Button variant="outline" size="sm" asChild>
              <Link to="/profile/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>

          {/* Philosophy Banner */}
          <Card className="border-dashed bg-muted/30 mb-6">
            <CardContent className="py-3 text-center">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Your permanent record.</span>{" "}
                Successes AND failures visible. Work completed. Money handled. Trust earned.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Full Consequence Ledger */}
              <ConsequenceLedgerCard ledger={ledger || null} />

              {/* Trust Trajectory Chart */}
              <TrustTrajectoryChart userId={user.id} />

              {/* Activity Tabs */}
              <Card>
                <Tabs defaultValue="accountability" className="w-full">
                  <CardHeader className="pb-0">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="accountability" className="text-xs sm:text-sm">
                        <Briefcase className="h-4 w-4 mr-1 hidden sm:inline" />
                        Records
                      </TabsTrigger>
                      <TabsTrigger value="trust-history" className="text-xs sm:text-sm">
                        <Activity className="h-4 w-4 mr-1 hidden sm:inline" />
                        Trust
                      </TabsTrigger>
                      <TabsTrigger value="badges" className="text-xs sm:text-sm">
                        <Star className="h-4 w-4 mr-1 hidden sm:inline" />
                        Badges
                      </TabsTrigger>
                      <TabsTrigger value="failures" className="text-xs sm:text-sm">
                        <XCircle className="h-4 w-4 mr-1 hidden sm:inline" />
                        Failures
                      </TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <TabsContent value="accountability" className="mt-0">
                      {accountabilityRecords.length > 0 ? (
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {accountabilityRecords.slice(0, 10).map((record) => (
                            <AccountabilityRecordRow key={record.id} record={record} userId={user.id} />
                          ))}
                        </div>
                      ) : (
                        <EmptyTabContent
                          icon={Briefcase}
                          title="No accountability records"
                          description="Complete projects with escrow to build your record"
                          actionLabel="Find Projects"
                          actionHref="/offers"
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="trust-history" className="mt-0">
                      {trustEvents.length > 0 ? (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {trustEvents.slice(0, 15).map((event) => (
                            <TrustEventRow key={event.id} event={event} />
                          ))}
                        </div>
                      ) : (
                        <EmptyTabContent
                          icon={Activity}
                          title="No trust events"
                          description="Complete work to start building trust history"
                          actionLabel="Find Projects"
                          actionHref="/offers"
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
                          actionHref="/offers"
                        />
                      )}
                    </TabsContent>

                    {/* Failures Tab - LinkedIn Can't Do This */}
                    <TabsContent value="failures" className="mt-0">
                      {failedProjects > 0 ? (
                        <div className="space-y-3">
                          <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
                            <CardContent className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                  <XCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-red-700 dark:text-red-400">
                                    {failedProjects} Failed Project{failedProjects !== 1 ? "s" : ""}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Visible to everyone — this is how trust works
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          {accountabilityRecords
                            .filter(r => r.outcome_status === 'failed')
                            .map((record) => (
                              <AccountabilityRecordRow key={record.id} record={record} userId={user.id} />
                            ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                            <CheckCircle className="h-6 w-6 text-emerald-600" />
                          </div>
                          <h4 className="font-medium mb-1">No Failed Projects</h4>
                          <p className="text-sm text-muted-foreground">
                            Clean record — keep delivering to maintain it
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* My Plan */}
              <MyPlanCard />

              {/* Trust Engine */}
              <TrustEngineDisplay
                totalScore={trustScore}
                tier={trustTier}
                breakdown={{
                  verification_status: trustProfile?.is_verified_student || trustProfile?.is_verified_researcher ? 25 : 0,
                  completed_offers: Math.min((ledger?.projects_completed || 0) * 2, 20),
                  on_time_delivery_rate: Math.round((ledger?.on_time_rate || 0) / 5),
                  dispute_free_history: (ledger?.disputes_lost || 0) === 0 ? 15 : 5,
                  ratings_score: 8,
                  financial_reliability: Math.round((ledger?.escrow_success_rate || 0) / 10),
                }}
                lastUpdated={trustProfile?.updated_at}
              />

              {/* Work Graph */}
              <WorkGraphCard connections={connections} maxDisplay={3} />

              {/* AI Profile Score */}
              <AISuggestionCard
                title="AI Profile Score"
                domain="profile"
                action="optimize"
                context={{
                  name: profile?.full_name,
                  university: profile?.university,
                  department: profile?.department,
                  trustScore,
                }}
                compact
              />

              {/* Visibility Score */}
              <VisibilityScoreCard />

              {/* Profile Views */}
              <ProfileViewsCard />

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
                      href="/org"
                    />
                    <QuickActionButton
                      icon={Activity}
                      iconColor="text-blue-500"
                      label="Reality Feed"
                      description="See system events"
                      href="/reality"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Account Info */}
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

// Accountability Record Row Component
function AccountabilityRecordRow({ 
  record, 
  userId 
}: { 
  record: any; 
  userId: string;
}) {
  const isExecutor = record.executor_id === userId;
  const statusConfig = {
    in_progress: { icon: Clock, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    completed: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    failed: { icon: XCircle, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
    disputed: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
    abandoned: { icon: XCircle, color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-900/30" },
  };
  
  const config = statusConfig[record.outcome_status as keyof typeof statusConfig] || statusConfig.in_progress;
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border">
      <div className={`h-10 w-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-5 w-5 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {record.promised_deliverables?.[0] || "Project"}
        </p>
        <p className="text-xs text-muted-foreground">
          {isExecutor ? "Executor" : "Initiator"} • {record.collaboration_type}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        {record.escrow_amount > 0 && (
          <p className="text-sm font-medium">PKR {record.escrow_amount.toLocaleString()}</p>
        )}
        <Badge variant={record.outcome_status === 'completed' ? 'default' : 'secondary'} className="text-[10px]">
          {record.outcome_status}
        </Badge>
      </div>
    </div>
  );
}

// Trust Event Row Component
function TrustEventRow({ event }: { event: any }) {
  const isPositive = event.trust_delta > 0;
  const isNegative = event.trust_delta < 0;

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isPositive ? "bg-emerald-100 dark:bg-emerald-900/30" : 
        isNegative ? "bg-red-100 dark:bg-red-900/30" : "bg-muted"
      }`}>
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-emerald-600" />
        ) : isNegative ? (
          <XCircle className="h-4 w-4 text-red-600" />
        ) : (
          <Activity className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{event.event_type.replace(/_/g, " ")}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
        </p>
      </div>
      <div className={`text-sm font-bold ${
        isPositive ? "text-emerald-600" : isNegative ? "text-red-600" : ""
      }`}>
        {isPositive ? "+" : ""}{event.trust_delta}
      </div>
    </div>
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
