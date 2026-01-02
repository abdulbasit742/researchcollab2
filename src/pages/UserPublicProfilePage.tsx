import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileSkeleton } from "@/components/skeletons";
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
  Wrench,
  Award,
  Calendar,
  DollarSign,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { QuickOfferModal } from "@/components/offers/QuickOfferModal";
import { 
  allUsers, 
  UserProfile, 
  StudentProfile, 
  ResearcherProfile 
} from "@/data/users";

// Mock collaborations for researchers
const mockCollaborations = [
  {
    id: 1,
    title: "Machine Learning Research for Climate Analysis",
    description: "Looking for researchers with ML expertise to analyze climate data patterns.",
    skills: ["Python", "TensorFlow", "Climate Science"],
    location: "Remote",
    deadline: "Dec 30, 2025",
    budget: "$2,000 - $5,000",
    applicants: 12,
    featured: true,
  },
];

export default function UserPublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userFromMock, setUserFromMock] = useState<UserProfile | null>(null);

  useEffect(() => {
    // If viewing own profile, redirect to /profile
    if (authUser && id === authUser.id) {
      navigate("/profile");
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      
      // First try to fetch from Supabase
      if (id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (data) {
          setProfileData(data);
          setIsLoading(false);
          return;
        }
      }

      // Fall back to mock data
      const mockUser = allUsers.find(u => u.id === id);
      if (mockUser) {
        setUserFromMock(mockUser);
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [id, authUser, navigate]);

  const handleMessage = () => {
    toast({
      title: "Message Sent!",
      description: "Your message request has been sent.",
    });
  };

  const handleConnect = () => {
    toast({
      title: "Connection Request Sent!",
      description: "They will be notified of your request.",
    });
  };

  const handleApply = (title: string) => {
    toast({
      title: "Application Submitted!",
      description: `Your application for "${title}" has been sent.`,
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <ProfileSkeleton />
      </MainLayout>
    );
  }

  // Render from mock data
  if (userFromMock) {
    const isStudent = userFromMock.type === "student";
    const student = userFromMock as StudentProfile;
    const researcher = userFromMock as ResearcherProfile;

    return (
      <MainLayout>
        {/* Hero Section */}
        <div className="gradient-hero py-12 md:py-16">
          <div className="container">
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
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={userFromMock.avatar} />
                  <AvatarFallback className="text-3xl">
                    {userFromMock.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                {userFromMock.verified && (
                  <div className="absolute bottom-2 right-2 bg-primary rounded-full p-1">
                    <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-bold">{userFromMock.name}</h1>
                  {userFromMock.verified && (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <p className="text-lg text-muted-foreground mt-1 flex items-center gap-2">
                  {isStudent ? (
                    <>
                      <GraduationCap className="h-5 w-5" />
                      Student
                    </>
                  ) : (
                    <>
                      <Briefcase className="h-5 w-5" />
                      {researcher.title}
                    </>
                  )}
                </p>
                
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {userFromMock.university}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {userFromMock.department}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {userFromMock.location}
                  </div>
                </div>

                <div className="flex gap-3 mt-6 flex-wrap">
                  <Button onClick={handleMessage}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" onClick={handleConnect}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                  <Button variant="secondary" onClick={() => setShowOfferModal(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Offer
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* About / Background */}
              {isStudent && student.backgroundSummary && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{student.backgroundSummary}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Academic Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Academic Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isStudent ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Semester</span>
                          <span className="font-medium">{student.semester}</span>
                        </div>
                        {student.cgpa && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">CGPA</span>
                            <span className="font-medium">{student.cgpa}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Research Level</span>
                          <Badge variant="secondary" className="capitalize">
                            {student.researchLevel}
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Discipline</span>
                          <span className="font-medium">{researcher.discipline}</span>
                        </div>
                        {researcher.publications && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Publications</span>
                            <span className="font-medium">{researcher.publications}</span>
                          </div>
                        )}
                        {researcher.hIndex && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">h-Index</span>
                            <span className="font-medium">{researcher.hIndex}</span>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Research Interests */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Research Interests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {userFromMock.researchInterests.map((interest) => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Skills (Students only) */}
              {isStudent && student.skills.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-primary" />
                        Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {student.skills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Portfolio / Projects (Students) */}
              {isStudent && student.projects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    Portfolio
                  </h2>
                  <div className="grid gap-4">
                    {student.projects.map((project, idx) => (
                      <Card key={idx} variant="elevated">
                        <CardContent className="p-5">
                          <h3 className="font-semibold text-lg">{project.title}</h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            {project.description}
                          </p>
                          {project.link && (
                            <a 
                              href={project.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary hover:underline font-medium"
                            >
                              <Briefcase className="h-4 w-4" />
                              View Project
                              <ArrowRight className="h-3 w-3" />
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Active Collaborations (Researchers) */}
              {!isStudent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-4">Active Collaboration Calls</h2>
                  <div className="space-y-4">
                    {mockCollaborations.map((collab) => (
                      <Card key={collab.id} variant="interactive" className="relative">
                        {collab.featured && (
                          <div className="absolute top-4 right-4">
                            <Badge variant="premium">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          </div>
                        )}
                        <CardContent className="p-6 space-y-4">
                          <h3 className="font-semibold text-lg pr-20">{collab.title}</h3>
                          <p className="text-muted-foreground">{collab.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {collab.skills.map((skill) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {collab.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Deadline: {collab.deadline}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {collab.budget}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {collab.applicants} applicants
                            </div>
                          </div>
                          <Button onClick={() => handleApply(collab.title)}>
                            Apply to Collaboration
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Services Offered (Students) */}
              {isStudent && student.servicesOffered.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Services Offered
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {student.servicesOffered.map((service) => (
                          <Badge key={service} variant="outline">
                            {service}
                          </Badge>
                        ))}
                      </div>
                      {student.hourlyRate && (
                        <p className="text-sm text-muted-foreground mt-4">
                          Hourly Rate: <span className="font-medium text-foreground">${student.hourlyRate}/hr</span>
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Availability: <span className="font-medium text-foreground">{student.availability}</span>
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <QuickOfferModal
          open={showOfferModal}
          onOpenChange={setShowOfferModal}
          recipientName={userFromMock.name}
          recipientId={userFromMock.id}
        />
      </MainLayout>
    );
  }

  // Render from Supabase data
  if (profileData) {
    return (
      <MainLayout>
        <div className="gradient-hero py-12 md:py-16">
          <div className="container">
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
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarFallback className="text-3xl">
                  {(profileData.full_name || profileData.first_name || "U")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold">
                  {profileData.full_name || `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim() || "User"}
                </h1>
                
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

                <div className="flex gap-3 mt-6 flex-wrap">
                  <Button onClick={handleMessage}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" onClick={handleConnect}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                  <Button variant="secondary" onClick={() => setShowOfferModal(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Offer
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              {/* Academic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Academic Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profileData.education_level && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Education Level</span>
                      <Badge variant="secondary">{profileData.education_level}</Badge>
                    </div>
                  )}
                  {profileData.department && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-medium">{profileData.department}</span>
                    </div>
                  )}
                  {profileData.research_level && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Research Level</span>
                      <Badge variant="secondary" className="capitalize">
                        {profileData.research_level}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Research Interests */}
              {profileData.interests && profileData.interests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Interests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profileData.interests.map((interest: string) => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <p>More profile details coming soon...</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <QuickOfferModal
          open={showOfferModal}
          onOpenChange={setShowOfferModal}
          recipientName={profileData.full_name || "User"}
          recipientId={id || ""}
        />
      </MainLayout>
    );
  }

  // Profile not found
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
