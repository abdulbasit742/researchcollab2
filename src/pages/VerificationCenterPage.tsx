import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Microscope, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle,
  ArrowRight,
  Shield,
  Star,
  Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dummyUserTrustProfiles, VerificationStatus } from "@/data/verification";
import { TrustScoreCard } from "@/components/badges/TrustScore";
import { BadgeDisplay } from "@/components/badges/BadgeDisplay";

const VerificationCenterPage = () => {
  const navigate = useNavigate();
  // Mock current user profile
  const currentUserProfile = dummyUserTrustProfiles[0];
  
  const getStatusBadge = (status: VerificationStatus) => {
    const styles = {
      unverified: { variant: 'outline' as const, icon: XCircle, text: 'Not Verified', color: 'text-muted-foreground' },
      pending: { variant: 'secondary' as const, icon: Clock, text: 'Pending Review', color: 'text-amber-600' },
      verified: { variant: 'default' as const, icon: CheckCircle2, text: 'Verified', color: 'text-emerald-600' },
      rejected: { variant: 'destructive' as const, icon: XCircle, text: 'Rejected', color: 'text-destructive' },
      suspended: { variant: 'destructive' as const, icon: XCircle, text: 'Suspended', color: 'text-destructive' }
    };
    const style = styles[status];
    return (
      <Badge variant={style.variant} className="gap-1">
        <style.icon className="h-3 w-3" />
        {style.text}
      </Badge>
    );
  };

  const verificationOptions = [
    {
      title: "Student Verification",
      description: "Verify your academic credentials to unlock student benefits and higher trust scores.",
      icon: GraduationCap,
      path: "/verification/student",
      benefits: ["Verified Student badge", "+30 Trust Score", "Priority in matching", "Access to exclusive offers"],
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
    },
    {
      title: "Researcher Verification",
      description: "Verify your research position and credentials to connect with students.",
      icon: Microscope,
      path: "/verification/researcher",
      benefits: ["Verified Researcher badge", "+30 Trust Score", "Post collaboration calls", "Featured profile"],
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
    },
    {
      title: "Partner Verification",
      description: "Join as an affiliate partner and earn by promoting our platform and tools.",
      icon: Users,
      path: "/verification/partner",
      benefits: ["Partner badge", "Higher commission rates", "Promotional assets", "Dedicated support"],
      color: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400"
    }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Verification Center</h1>
          <p className="text-muted-foreground">
            Get verified to build trust, unlock features, and stand out in the community.
          </p>
        </div>

        {/* Current Status Card */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src={currentUserProfile.userAvatar} 
                  alt={currentUserProfile.userName}
                  className="w-16 h-16 rounded-full border-2 border-primary"
                />
                <div>
                  <CardTitle className="text-xl">{currentUserProfile.userName}</CardTitle>
                  <CardDescription className="capitalize">{currentUserProfile.userRole}</CardDescription>
                </div>
              </div>
              {getStatusBadge(currentUserProfile.verificationStatus)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Your Badges
                </h4>
                <BadgeDisplay badges={currentUserProfile.badges} showLabels maxDisplay={5} />
              </div>
              <TrustScoreCard trustScore={currentUserProfile.trustScore} />
            </div>
          </CardContent>
        </Card>

        {/* Verification Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {verificationOptions.map((option) => (
            <Card key={option.title} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl ${option.color} flex items-center justify-center mb-4`}>
                  <option.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{option.title}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-6">
                  <p className="text-sm font-medium text-muted-foreground">Benefits:</p>
                  <ul className="space-y-1">
                    {option.benefits.map((benefit, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  className="w-full gap-2" 
                  onClick={() => navigate(option.path)}
                >
                  Start Verification
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Score Info */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>How Trust Score Works</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">30</div>
                  <h4 className="font-medium">Verification Status</h4>
                </div>
                <p className="text-sm text-muted-foreground">Complete verification to earn up to 30 points.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">35</div>
                  <h4 className="font-medium">Work History</h4>
                </div>
                <p className="text-sm text-muted-foreground">Completed offers and on-time delivery rate contribute 35 points.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">35</div>
                  <h4 className="font-medium">Reputation</h4>
                </div>
                <p className="text-sm text-muted-foreground">Dispute-free history, ratings, and account age add 35 points.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default VerificationCenterPage;
