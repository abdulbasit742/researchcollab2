import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileSkeleton } from "@/components/skeletons";
import { OptimizedImage } from "@/components/ui/optimized-image";
import {
  MapPin,
  GraduationCap,
  Briefcase,
  BookOpen,
  CheckCircle2,
  MessageSquare,
  UserPlus,
  Send,
  ArrowLeft,
  Building,
  Target,
  Award,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useRecordProfileView, useConnectionStatus, useSendConnectionRequest, useMutualConnectionsCount } from "@/hooks/useNetwork";
import { QuickOfferModal } from "@/components/offers/QuickOfferModal";
import { useStartConversation } from "@/hooks/useMessaging";
import { useState } from "react";

// Import new identity components
import { 
  ProfessionalIdentityHeader,
  TrustScorePublicDisplay,
  WorkHistoryTimeline,
  SkillsSection,
} from "@/components/identity";
import { MutualConnectionsBadge } from "@/components/network/MutualConnectionsBadge";
import { ProofBanner } from "@/components/profile/ProofBanner";
import { AvailabilityBadge } from "@/components/profile/AvailabilityBadge";
import { MutualWorkContext } from "@/components/profile/MutualWorkContext";

export default function UserPublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const { startConversation } = useStartConversation();
  const [showOfferModal, setShowOfferModal] = useState(false);
  
  // Fetch profile data
  const { data: profileData, isLoading } = usePublicProfile(id);
  
  // Record profile view
  const { mutate: recordView } = useRecordProfileView();
  
  // Connection status
  const { data: connectionStatus } = useConnectionStatus(id);
  const { mutate: sendConnectionRequest, isPending: isSendingRequest } = useSendConnectionRequest();

  useEffect(() => {
    // If viewing own profile, redirect to /profile
    if (authUser && id === authUser.id) {
      navigate("/profile");
      return;
    }

    // Record profile view
    if (id && authUser) {
      recordView(id);
    }
  }, [id, authUser, navigate, recordView]);

  const handleMessage = () => {
    if (id) {
      startConversation(id);
    }
  };

  const handleConnect = () => {
    if (!id) return;
    
    if (connectionStatus?.status === "none") {
      sendConnectionRequest(id);
    } else if (connectionStatus?.status === "connected") {
      toast({
        title: "Already Connected",
        description: "You're already connected with this person.",
      });
    } else if (connectionStatus?.status === "pending_sent") {
      toast({
        title: "Request Pending",
        description: "Your connection request is still pending.",
      });
    }
  };

  const getConnectButtonText = () => {
    switch (connectionStatus?.status) {
      case "connected":
        return "Connected";
      case "pending_sent":
        return "Pending";
      case "pending_received":
        return "Accept";
      default:
        return "Connect";
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <ProfileSkeleton />
      </MainLayout>
    );
  }

  if (!profileData) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold">Profile not found</h1>
          <p className="text-muted-foreground mt-2">
            The profile you're looking for doesn't exist.
          </p>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="gradient-hero py-12 md:py-16">
        <div className="container px-4">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row gap-8 items-start"
          >
            {/* Avatar with verification badge */}
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage src={profileData.avatarUrl || undefined} />
                <AvatarFallback className="text-3xl">
                  {profileData.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {profileData.isVerified && (
                <div className="absolute bottom-2 right-2 bg-primary rounded-full p-1">
                  <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1">
              {/* Name and verification */}
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{profileData.fullName}</h1>
                {profileData.isVerified && (
                  <Badge variant="default" className="gap-1 bg-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
                <Badge 
                  variant="outline" 
                  className="capitalize bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30"
                >
                  {profileData.trustTier}
                </Badge>
              </div>
              
              {/* Role */}
              <p className="text-lg text-muted-foreground mt-1 flex items-center gap-2 capitalize">
                {profileData.role === "researcher" ? (
                  <>
                    <Briefcase className="h-5 w-5" />
                    Researcher
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-5 w-5" />
                    {profileData.role || "Student"}
                  </>
                )}
              </p>
              
              {/* Location info */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                {profileData.university && (
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {profileData.university}
                  </div>
                )}
                {profileData.department && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {profileData.department}
                  </div>
                )}
                {profileData.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profileData.location}
                  </div>
                )}
              </div>

              {/* Availability Badge */}
              {id && <AvailabilityBadge userId={id} compact className="mt-3" />}

              {/* Mutual connections */}
              {authUser && id && (
                <MutualConnectionsBadge userId={id} className="mt-3" />
              )}

              {/* Quick stats */}
              <div className="flex flex-wrap gap-6 mt-4 text-sm">
                <div>
                  <span className="font-bold text-lg">{profileData.projectsCompleted}</span>
                  <span className="text-muted-foreground ml-1">projects</span>
                </div>
                <div>
                  <span className="font-bold text-lg">{Math.round(profileData.successRate)}%</span>
                  <span className="text-muted-foreground ml-1">success</span>
                </div>
                <div>
                  <span className="font-bold text-lg">{profileData.trustScore}</span>
                  <span className="text-muted-foreground ml-1">trust</span>
                </div>
              </div>

              {/* Actions */}
              {authUser && authUser.id !== id && (
                <div className="flex gap-3 mt-6 flex-wrap">
                  <Button onClick={handleMessage}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleConnect}
                    disabled={isSendingRequest || connectionStatus?.status === "connected"}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {getConnectButtonText()}
                  </Button>
                  <Button variant="secondary" onClick={() => setShowOfferModal(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Offer
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container py-12">
        {/* Proof-of-Work Banner */}
        <ProofBanner userId={id} className="mb-6" />

        {/* Mutual Work Context */}
        {authUser && id && <MutualWorkContext targetUserId={id} className="mb-6" />}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Trust & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trust Score Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <TrustScorePublicDisplay
                trustScore={profileData.trustScore}
                trustTier={profileData.trustTier}
                trustTrajectory={profileData.trustTrajectory}
                isVerified={profileData.isVerified}
                verificationLevel={profileData.verificationLevel || undefined}
                projectsCompleted={profileData.projectsCompleted}
                successRate={profileData.successRate}
                escrowSuccessRate={profileData.escrowSuccessRate}
                onTimeRate={profileData.onTimeRate}
                disputeRate={profileData.disputeRate}
              />
            </motion.div>

            {/* Skills Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SkillsSection
                    provenSkills={profileData.provenSkills}
                    claimedSkills={profileData.claimedSkills}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Interests */}
            {profileData.interests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Research Interests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profileData.interests.map((interest) => (
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

          {/* Right Column - Work History & Portfolio */}
          <div className="lg:col-span-2 space-y-6">
            {/* Work History Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <WorkHistoryTimeline
                records={profileData.workHistory}
                userId={profileData.id}
              />
            </motion.div>

            {/* Portfolio Section */}
            {profileData.portfolioProjects.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Award className="h-5 w-5 text-primary" />
                      Portfolio Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {profileData.portfolioProjects.map((project) => (
                        <div
                          key={project.id}
                          className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                        >
                          <div className="flex gap-4">
                            {project.thumbnail_url && (
                              <OptimizedImage
                                src={project.thumbnail_url}
                                alt={project.title}
                                widths={[96, 192]}
                                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg">{project.title}</h3>
                              {project.description && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {project.description}
                                </p>
                              )}
                              {project.link && (
                                <a
                                  href={project.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary hover:underline font-medium"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  View Project
                                  <ArrowRight className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Empty state for work history */}
            {profileData.workHistory.length === 0 && profileData.portfolioProjects.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="text-lg font-medium">No Work History Yet</h3>
                  <p className="text-muted-foreground mt-2">
                    This user hasn't completed any projects on the platform yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <QuickOfferModal
        open={showOfferModal}
        onOpenChange={setShowOfferModal}
        recipientName={profileData.fullName}
        recipientId={id || ""}
      />
    </MainLayout>
  );
}
