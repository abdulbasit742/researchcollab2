import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const collaborations = [
  {
    id: 1,
    researcherId: "researcher-1",
    title: "Machine Learning Research for Climate Analysis",
    description: "Looking for researchers with ML expertise to analyze climate data patterns and develop predictive models for environmental changes.",
    owner: {
      name: "Dr. Sarah Chen",
      avatar: "https://i.pravatar.cc/150?u=sarah",
      university: "MIT",
    },
    skills: ["Python", "TensorFlow", "Climate Science", "Data Analysis"],
    location: "Remote",
    deadline: "Dec 30, 2025",
    budget: "$2,000 - $5,000",
    applicants: 12,
    featured: true,
  },
  {
    id: 2,
    researcherId: "researcher-2",
    title: "Quantum Computing Algorithm Development",
    description: "Seeking collaborators for developing novel quantum algorithms for optimization problems in logistics and supply chain management.",
    owner: {
      name: "Prof. James Wilson",
      avatar: "https://i.pravatar.cc/150?u=james",
      university: "Stanford",
    },
    skills: ["Quantum Computing", "Qiskit", "Algorithm Design", "Mathematics"],
    location: "California, USA",
    deadline: "Jan 15, 2026",
    budget: "$3,000 - $8,000",
    applicants: 8,
    featured: true,
  },
  {
    id: 3,
    researcherId: "researcher-3",
    title: "Biomedical Image Analysis Using Deep Learning",
    description: "Collaborative research project on developing AI models for early detection of diseases from medical imaging data.",
    owner: {
      name: "Dr. Emily Rodriguez",
      avatar: "https://i.pravatar.cc/150?u=emily",
      university: "Johns Hopkins",
    },
    skills: ["Deep Learning", "PyTorch", "Medical Imaging", "CNNs"],
    location: "Remote",
    deadline: "Jan 20, 2026",
    budget: "$4,000 - $10,000",
    applicants: 15,
    featured: false,
  },
  {
    id: 4,
    researcherId: "researcher-4",
    title: "Natural Language Processing for Legal Documents",
    description: "Research collaboration on developing NLP models for automated analysis and summarization of legal documents.",
    owner: {
      name: "Dr. Michael Park",
      avatar: "https://i.pravatar.cc/150?u=michael",
      university: "Harvard Law",
    },
    skills: ["NLP", "Transformers", "Legal Tech", "Python"],
    location: "Boston, USA",
    deadline: "Feb 1, 2026",
    budget: "$2,500 - $6,000",
    applicants: 10,
    featured: false,
  },
  {
    id: 5,
    researcherId: "researcher-5",
    title: "Renewable Energy Optimization Study",
    description: "Multi-disciplinary research on optimizing renewable energy grid integration using AI and IoT technologies.",
    owner: {
      name: "Dr. Anna Schmidt",
      avatar: "https://i.pravatar.cc/150?u=anna",
      university: "TU Munich",
    },
    skills: ["Energy Systems", "IoT", "Optimization", "Data Science"],
    location: "Germany / Remote",
    deadline: "Jan 25, 2026",
    budget: "$3,500 - $7,500",
    applicants: 18,
    featured: true,
  },
  {
    id: 6,
    researcherId: "researcher-6",
    title: "Social Media Sentiment Analysis Research",
    description: "Analyzing social media trends and sentiment patterns to understand public opinion dynamics on global issues.",
    owner: {
      name: "Prof. David Lee",
      avatar: "https://i.pravatar.cc/150?u=david",
      university: "Oxford",
    },
    skills: ["Sentiment Analysis", "Social Media", "Statistics", "R/Python"],
    location: "UK / Remote",
    deadline: "Feb 10, 2026",
    budget: "$1,500 - $4,000",
    applicants: 22,
    featured: false,
  },
];

const disciplines = [
  "All Disciplines",
  "Computer Science",
  "Data Science",
  "Engineering",
  "Medicine",
  "Environmental Science",
  "Law",
  "Social Sciences",
];

export default function CollaborationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [discipline, setDiscipline] = useState("All Disciplines");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleApply = (title: string) => {
    toast({
      title: "Application Submitted!",
      description: `Your application for "${title}" has been sent.`,
    });
  };

  const handleResearcherClick = (researcherId: string) => {
    navigate(`/researcher/${researcherId}`);
  };

  return (
    <MainLayout>
      <div className="gradient-hero py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">
              <Users className="h-3 w-3 mr-1" />
              Research Collaborations
            </Badge>
            <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
              Find Your Next{" "}
              <span className="text-gradient">Research Partner</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with researchers worldwide. Join collaborative projects 
              and advance your academic career.
            </p>
          </motion.div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-col md:flex-row gap-4 max-w-3xl mx-auto"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search collaborations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={discipline} onValueChange={setDiscipline}>
              <SelectTrigger className="md:w-56">
                <SelectValue placeholder="Discipline" />
              </SelectTrigger>
              <SelectContent>
                {disciplines.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Collaborations List */}
      <div className="container py-16">
        <div className="grid gap-6">
          {collaborations.map((collab, index) => (
            <motion.div
              key={collab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="interactive" className="relative">
                {collab.featured && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="premium">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar 
                      className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => handleResearcherClick(collab.researcherId)}
                    >
                      <AvatarImage src={collab.owner.avatar} />
                      <AvatarFallback>
                        {collab.owner.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl pr-20">{collab.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <span 
                          className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleResearcherClick(collab.researcherId)}
                        >
                          {collab.owner.name}
                        </span>
                        <span className="mx-2">•</span>
                        <span 
                          className="cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleResearcherClick(collab.researcherId)}
                        >
                          {collab.owner.university}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
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

                <CardFooter className="flex gap-3">
                  <Button onClick={() => handleApply(collab.title)}>
                    Apply Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline">Message Owner</Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-10 text-center">
          <Button variant="outline" size="lg">
            Load More Collaborations
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
