import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  useVerification, 
  VerificationSubmission, 
  UserTrustProfile, 
  UserBadge 
} from "@/hooks/useVerification";
import { 
  useCredentialVerification,
  Credential,
  CareerPhase,
  ProfileMode
} from "@/hooks/useCredentialVerification";
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  Award,
  FileCheck,
  GraduationCap,
  Briefcase,
  Building2,
  TrendingUp,
  Star,
  Upload,
  Eye,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";

// =====================================================
// VERIFICATION STATUS BADGE
// =====================================================
export function VerificationStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; label: string }> = {
    pending: { variant: "secondary", icon: <Clock className="h-3 w-3" />, label: "Pending" },
    approved: { variant: "default", icon: <CheckCircle2 className="h-3 w-3" />, label: "Verified" },
    rejected: { variant: "destructive", icon: <XCircle className="h-3 w-3" />, label: "Rejected" },
    requires_more_info: { variant: "outline", icon: <AlertCircle className="h-3 w-3" />, label: "More Info Needed" },
    verified: { variant: "default", icon: <CheckCircle2 className="h-3 w-3" />, label: "Verified" },
    expired: { variant: "destructive", icon: <Clock className="h-3 w-3" />, label: "Expired" },
    revoked: { variant: "destructive", icon: <XCircle className="h-3 w-3" />, label: "Revoked" },
    disputed: { variant: "outline", icon: <AlertCircle className="h-3 w-3" />, label: "Disputed" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant={config.variant} className="gap-1">
      {config.icon}
      {config.label}
    </Badge>
  );
}

// =====================================================
// TRUST SCORE DISPLAY
// =====================================================
export function TrustScoreDisplay({ 
  score, 
  level, 
  size = "default" 
}: { 
  score: number; 
  level: string;
  size?: "sm" | "default" | "lg";
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const sizeClasses = {
    sm: "text-2xl",
    default: "text-4xl",
    lg: "text-6xl",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`font-bold ${sizeClasses[size]} ${getScoreColor(score)}`}>
        {score}
      </div>
      <Badge variant="outline" className="capitalize">
        {level} Trust
      </Badge>
      <Progress value={score} className="w-24 h-2" />
    </div>
  );
}

// =====================================================
// USER TRUST PROFILE CARD
// =====================================================
export function TrustProfileCard({ profile }: { profile: UserTrustProfile | null }) {
  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Trust Profile
        </CardTitle>
        <CardDescription>Your platform credibility metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <TrustScoreDisplay 
            score={profile.trust_score} 
            level={profile.verification_level}
            size="lg" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Projects Completed</p>
            <p className="text-2xl font-semibold">{profile.total_projects_completed}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Projects Posted</p>
            <p className="text-2xl font-semibold">{profile.total_projects_posted}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Success Rate</p>
            <p className="text-2xl font-semibold">{(profile.successful_rate * 100).toFixed(0)}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Response Time</p>
            <p className="text-2xl font-semibold">
              {profile.response_time_hours ? `${profile.response_time_hours}h` : "N/A"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {profile.is_verified_student && (
            <Badge className="gap-1">
              <GraduationCap className="h-3 w-3" />
              Verified Student
            </Badge>
          )}
          {profile.is_verified_researcher && (
            <Badge className="gap-1">
              <FileCheck className="h-3 w-3" />
              Verified Researcher
            </Badge>
          )}
          {profile.is_verified_partner && (
            <Badge className="gap-1">
              <Building2 className="h-3 w-3" />
              Verified Partner
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// VERIFICATION SUBMISSION CARD
// =====================================================
export function VerificationSubmissionCard({ 
  submission 
}: { 
  submission: VerificationSubmission 
}) {
  const typeIcons: Record<string, React.ReactNode> = {
    student: <GraduationCap className="h-5 w-5" />,
    researcher: <FileCheck className="h-5 w-5" />,
    partner: <Building2 className="h-5 w-5" />,
    employment: <Briefcase className="h-5 w-5" />,
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              {typeIcons[submission.verification_type] || <FileCheck className="h-5 w-5" />}
            </div>
            <div>
              <h4 className="font-medium capitalize">
                {submission.verification_type} Verification
              </h4>
              <p className="text-sm text-muted-foreground">
                Submitted {format(new Date(submission.created_at), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <VerificationStatusBadge status={submission.status} />
        </div>

        {submission.reviewer_notes && (
          <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-1">Reviewer Notes:</p>
            <p className="text-muted-foreground">{submission.reviewer_notes}</p>
          </div>
        )}

        {submission.documents && submission.documents.length > 0 && (
          <div className="mt-4 flex gap-2">
            {submission.documents.map((doc, i) => (
              <Badge key={i} variant="outline" className="gap-1">
                <FileCheck className="h-3 w-3" />
                Document {i + 1}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =====================================================
// BADGES SHOWCASE
// =====================================================
export function BadgesShowcase({ badges }: { badges: UserBadge[] }) {
  if (badges.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No badges earned yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete verifications and projects to earn badges
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Earned Badges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div 
              key={badge.id} 
              className="flex flex-col items-center p-4 bg-muted rounded-lg text-center"
            >
              <div className="p-3 bg-primary/10 rounded-full mb-2">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium text-sm">{badge.badge_name}</p>
              {badge.description && (
                <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {format(new Date(badge.earned_at), "MMM yyyy")}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// CREDENTIAL CARD
// =====================================================
export function CredentialCard({ 
  credential,
  onRequestVerification
}: { 
  credential: Credential;
  onRequestVerification?: (id: string) => void;
}) {
  const typeIcons: Record<string, React.ReactNode> = {
    degree: <GraduationCap className="h-5 w-5" />,
    certification: <Award className="h-5 w-5" />,
    license: <FileCheck className="h-5 w-5" />,
    publication: <FileCheck className="h-5 w-5" />,
    patent: <Sparkles className="h-5 w-5" />,
    award: <Star className="h-5 w-5" />,
    employment: <Briefcase className="h-5 w-5" />,
    research: <FileCheck className="h-5 w-5" />,
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-muted rounded-lg shrink-0">
            {typeIcons[credential.type] || <FileCheck className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium">{credential.title}</h4>
                <p className="text-sm text-muted-foreground">{credential.issuer}</p>
              </div>
              <VerificationStatusBadge status={credential.verification_status} />
            </div>
            
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Issued: {format(new Date(credential.issue_date), "MMM yyyy")}</span>
              {credential.expiry_date && (
                <span>Expires: {format(new Date(credential.expiry_date), "MMM yyyy")}</span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Progress value={credential.verification_confidence} className="flex-1 h-2" />
              <span className="text-sm font-medium">
                {credential.verification_confidence}% confidence
              </span>
            </div>

            {credential.verification_status === "pending" && onRequestVerification && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => onRequestVerification(credential.id)}
              >
                Request Peer Verification
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// CAREER TIMELINE
// =====================================================
export function CareerTimeline({ phases }: { phases: CareerPhase[] }) {
  if (phases.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No career phases recorded</p>
          <Button variant="outline" size="sm" className="mt-3">
            Add Career Phase
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Career Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {phases.map((phase, index) => (
            <div key={phase.id} className="relative pl-8">
              <div className={`absolute left-0 top-0 w-4 h-4 rounded-full border-2 ${
                phase.is_current ? "bg-primary border-primary" : "bg-background border-muted-foreground"
              }`} />
              {index < phases.length - 1 && (
                <div className="absolute left-[7px] top-4 w-0.5 h-full bg-muted" />
              )}
              
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{phase.phase_name}</h4>
                  {phase.is_current && <Badge>Current</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{phase.primary_role}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(phase.start_date), "MMM yyyy")}
                  {phase.end_date && ` - ${format(new Date(phase.end_date), "MMM yyyy")}`}
                  {phase.is_current && " - Present"}
                </p>
                
                {phase.key_achievements.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {phase.key_achievements.slice(0, 3).map((achievement, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// PROFILE MODE SWITCHER
// =====================================================
export function ProfileModeSwitcher({ 
  modes, 
  onSwitch 
}: { 
  modes: ProfileMode[];
  onSwitch: (mode: ProfileMode["mode"]) => void;
}) {
  const activeMode = modes.find(m => m.is_active);

  const modeIcons: Record<string, React.ReactNode> = {
    researcher: <FileCheck className="h-4 w-4" />,
    advisor: <Star className="h-4 w-4" />,
    operator: <Briefcase className="h-4 w-4" />,
    investor: <TrendingUp className="h-4 w-4" />,
    mentor: <GraduationCap className="h-4 w-4" />,
    student: <GraduationCap className="h-4 w-4" />,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Profile Mode</CardTitle>
        <CardDescription>Switch how you appear to others</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {modes.map((mode) => (
            <Button
              key={mode.mode}
              variant={mode.is_active ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => onSwitch(mode.mode)}
            >
              {modeIcons[mode.mode]}
              <span className="capitalize">{mode.mode}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// VERIFICATION CENTER DASHBOARD
// =====================================================
export function VerificationCenterDashboard() {
  const { 
    submissions, 
    trustProfile, 
    badges, 
    loading,
    submitVerification 
  } = useVerification();

  const {
    credentials,
    careerPhases,
    profileModes,
    switchProfileMode,
    generateVerificationReport
  } = useCredentialVerification();

  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Verification Center</h2>
          <p className="text-muted-foreground">
            Manage your credentials and trust profile
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Submit Verification
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <TrustProfileCard profile={trustProfile} />
            <ProfileModeSwitcher modes={profileModes} onSwitch={switchProfileMode} />
          </div>
          <CareerTimeline phases={careerPhases} />
        </TabsContent>

        <TabsContent value="credentials" className="space-y-4 mt-6">
          {credentials.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No credentials added yet</p>
                <Button variant="outline" size="sm" className="mt-3">
                  Add Credential
                </Button>
              </CardContent>
            </Card>
          ) : (
            credentials.map((credential) => (
              <CredentialCard key={credential.id} credential={credential} />
            ))
          )}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4 mt-6">
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No verification submissions</p>
                <Button variant="outline" size="sm" className="mt-3">
                  Start Verification
                </Button>
              </CardContent>
            </Card>
          ) : (
            submissions.map((submission) => (
              <VerificationSubmissionCard key={submission.id} submission={submission} />
            ))
          )}
        </TabsContent>

        <TabsContent value="badges" className="mt-6">
          <BadgesShowcase badges={badges} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default VerificationCenterDashboard;
