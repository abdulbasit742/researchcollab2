import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Mail,
  MessageSquare,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStartConversation } from "@/hooks/useMessaging";

// Mock researcher data - in production, fetch from Supabase
const mockResearchers: Record<string, {
  id: string;
  name: string;
  avatar: string;
  title: string;
  university: string;
  location: string;
  discipline: string;
  interests: string[];
  bio: string;
  collaborations: Array<{
    id: number;
    title: string;
    description: string;
    skills: string[];
    location: string;
    deadline: string;
    budget: string;
    applicants: number;
    featured: boolean;
  }>;
}> = {
  "researcher-1": {
    id: "researcher-1",
    name: "Dr. Sarah Chen",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    title: "Associate Professor of Computer Science",
    university: "Massachusetts Institute of Technology",
    location: "Cambridge, MA, USA",
    discipline: "Computer Science / Machine Learning",
    interests: ["Machine Learning", "Climate Science", "Data Analysis", "AI Ethics", "Deep Learning"],
    bio: "I am an associate professor at MIT specializing in machine learning applications for climate science. My research focuses on developing AI models that can help predict and mitigate environmental changes. I have published over 50 papers in top-tier conferences and journals, and I'm passionate about mentoring the next generation of researchers.",
    collaborations: [
      {
        id: 1,
        title: "Machine Learning Research for Climate Analysis",
        description: "Looking for researchers with ML expertise to analyze climate data patterns and develop predictive models for environmental changes.",
        skills: ["Python", "TensorFlow", "Climate Science", "Data Analysis"],
        location: "Remote",
        deadline: "Dec 30, 2025",
        budget: "PKR 500,000 - PKR 1,500,000",
        applicants: 12,
        featured: true,
      },
    ],
  },
  "researcher-2": {
    id: "researcher-2",
    name: "Prof. James Wilson",
    avatar: "https://i.pravatar.cc/150?u=james",
    title: "Professor of Physics & Quantum Computing",
    university: "Stanford University",
    location: "Palo Alto, CA, USA",
    discipline: "Physics / Quantum Computing",
    interests: ["Quantum Computing", "Qiskit", "Algorithm Design", "Mathematics", "Optimization"],
    bio: "Leading the Quantum Computing Lab at Stanford, my work focuses on developing novel quantum algorithms for real-world optimization problems. With 20+ years of experience in theoretical physics and computing, I'm excited to collaborate with bright minds on breakthrough research.",
    collaborations: [
      {
        id: 2,
        title: "Quantum Computing Algorithm Development",
        description: "Seeking collaborators for developing novel quantum algorithms for optimization problems in logistics and supply chain management.",
        skills: ["Quantum Computing", "Qiskit", "Algorithm Design", "Mathematics"],
        location: "California, USA",
        deadline: "Jan 15, 2026",
        budget: "PKR 800,000 - PKR 2,400,000",
        applicants: 8,
        featured: true,
      },
    ],
  },
  "researcher-3": {
    id: "researcher-3",
    name: "Dr. Emily Rodriguez",
    avatar: "https://i.pravatar.cc/150?u=emily",
    title: "Assistant Professor of Biomedical Engineering",
    university: "Johns Hopkins University",
    location: "Baltimore, MD, USA",
    discipline: "Biomedical Engineering / AI in Healthcare",
    interests: ["Deep Learning", "PyTorch", "Medical Imaging", "CNNs", "Healthcare AI"],
    bio: "My research bridges the gap between artificial intelligence and healthcare. I lead a team developing cutting-edge AI models for early disease detection from medical imaging data. Our work has been featured in Nature Medicine and has the potential to save thousands of lives.",
    collaborations: [
      {
        id: 3,
        title: "Biomedical Image Analysis Using Deep Learning",
        description: "Collaborative research project on developing AI models for early detection of diseases from medical imaging data.",
        skills: ["Deep Learning", "PyTorch", "Medical Imaging", "CNNs"],
        location: "Remote",
        deadline: "Jan 20, 2026",
        budget: "PKR 1,200,000 - PKR 3,000,000",
        applicants: 15,
        featured: false,
      },
    ],
  },
  "researcher-4": {
    id: "researcher-4",
    name: "Dr. Michael Park",
    avatar: "https://i.pravatar.cc/150?u=michael",
    title: "Professor of Law & Technology",
    university: "Harvard Law School",
    location: "Cambridge, MA, USA",
    discipline: "Law / Legal Technology",
    interests: ["NLP", "Transformers", "Legal Tech", "Python", "AI Ethics"],
    bio: "At the intersection of law and technology, I explore how AI can transform legal practice. My research focuses on developing NLP models for legal document analysis, making justice more accessible and efficient.",
    collaborations: [
      {
        id: 4,
        title: "Natural Language Processing for Legal Documents",
        description: "Research collaboration on developing NLP models for automated analysis and summarization of legal documents.",
        skills: ["NLP", "Transformers", "Legal Tech", "Python"],
        location: "Boston, USA",
        deadline: "Feb 1, 2026",
        budget: "PKR 750,000 - PKR 1,800,000",
        applicants: 10,
        featured: false,
      },
    ],
  },
  "researcher-5": {
    id: "researcher-5",
    name: "Dr. Anna Schmidt",
    avatar: "https://i.pravatar.cc/150?u=anna",
    title: "Senior Research Scientist",
    university: "Technical University of Munich",
    location: "Munich, Germany",
    discipline: "Energy Systems / Data Science",
    interests: ["Energy Systems", "IoT", "Optimization", "Data Science", "Sustainability"],
    bio: "I lead the Sustainable Energy Research Group at TU Munich, working on AI-driven solutions for renewable energy optimization. My goal is to accelerate the transition to clean energy through innovative research and international collaboration.",
    collaborations: [
      {
        id: 5,
        title: "Renewable Energy Optimization Study",
        description: "Multi-disciplinary research on optimizing renewable energy grid integration using AI and IoT technologies.",
        skills: ["Energy Systems", "IoT", "Optimization", "Data Science"],
        location: "Germany / Remote",
        deadline: "Jan 25, 2026",
        budget: "PKR 1,000,000 - PKR 2,250,000",
        applicants: 18,
        featured: true,
      },
    ],
  },
  "researcher-6": {
    id: "researcher-6",
    name: "Prof. David Lee",
    avatar: "https://i.pravatar.cc/150?u=david",
    title: "Professor of Computational Social Science",
    university: "University of Oxford",
    location: "Oxford, UK",
    discipline: "Social Sciences / Data Analytics",
    interests: ["Sentiment Analysis", "Social Media", "Statistics", "R/Python", "Network Analysis"],
    bio: "My research explores the intersection of social science and data analytics. I study how social media shapes public opinion and develop computational methods to understand complex social phenomena. Open to collaborative projects with researchers from diverse backgrounds.",
    collaborations: [
      {
        id: 6,
        title: "Social Media Sentiment Analysis Research",
        description: "Analyzing social media trends and sentiment patterns to understand public opinion dynamics on global issues.",
        skills: ["Sentiment Analysis", "Social Media", "Statistics", "R/Python"],
        location: "UK / Remote",
        deadline: "Feb 10, 2026",
        budget: "PKR 450,000 - PKR 1,200,000",
        applicants: 22,
        featured: false,
      },
    ],
  },
};

export default function ResearcherPublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startConversation } = useStartConversation();

  const researcher = id ? mockResearchers[id] : null;

  const handleMessage = () => {
    // For mock researchers, we use the id as a placeholder
    // In production, this would be a real user UUID
    if (researcher?.id) {
      startConversation(researcher.id);
    }
  };

  const handleApply = (collabTitle: string) => {
    toast({
      title: "Application Submitted!",
      description: `Your application for "${collabTitle}" has been sent.`,
    });
  };

  if (!researcher) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold">Researcher not found</h1>
          <p className="text-muted-foreground mt-2">The researcher profile you're looking for doesn't exist.</p>
          <Button className="mt-4" onClick={() => navigate("/collaborations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collaborations
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
            onClick={() => navigate("/collaborations")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collaborations
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row gap-8 items-start"
          >
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarImage src={researcher.avatar} />
              <AvatarFallback className="text-3xl">
                {researcher.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{researcher.name}</h1>
              <p className="text-lg text-muted-foreground mt-1">{researcher.title}</p>
              
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  {researcher.university}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {researcher.location}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {researcher.discipline}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handleMessage}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Researcher
                </Button>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Request Email
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Bio & Interests */}
          <div className="lg:col-span-1 space-y-6">
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
                  <p className="text-muted-foreground">{researcher.bio}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Research Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {researcher.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Active Collaborations */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-6">Active Collaboration Calls</h2>
              
              <div className="space-y-6">
                {researcher.collaborations.map((collab) => (
                  <Card key={collab.id} variant="interactive" className="relative">
                    {collab.featured && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="premium">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className="text-xl pr-20">{collab.title}</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
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
                    </CardContent>

                    <CardFooter>
                      <Button onClick={() => handleApply(collab.title)}>
                        Apply to Collaboration
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

                {researcher.collaborations.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">No active collaboration calls at the moment.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
