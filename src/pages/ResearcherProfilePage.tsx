import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  User,
  MapPin,
  BookOpen,
  Target,
  Users,
  Save,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const disciplines = [
  "Machine Learning", "Computer Vision", "NLP", "Quantum Computing",
  "Robotics", "Biomedical Engineering", "Climate Science", "Renewable Energy",
  "Psychology", "Neuroscience", "Economics", "Social Sciences",
  "Mathematics", "Physics", "Chemistry", "Legal Tech"
];

const researchInterests = [
  "Deep Learning", "Computer Vision", "Healthcare AI", "Autonomous Systems",
  "Quantum Algorithms", "Climate Modeling", "Drug Discovery", "Genomics",
  "Behavioral Economics", "Network Science", "Signal Processing",
  "Human-Computer Interaction", "Sustainability", "IoT"
];

const collaborationTypes = [
  { id: "co-author", label: "Co-author papers" },
  { id: "mentor", label: "Mentor students" },
  { id: "project-partner", label: "Project partner" },
];

const studentLevels = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
  { id: "publication-ready", label: "Publication-ready" },
];

const availabilityOptions = ["5 hrs/week", "10 hrs/week", "20 hrs/week", "40+ hrs/week"];

export default function ResearcherProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    title: "",
    university: "",
    department: "",
    location: "",
    discipline: "",
    researchInterests: [] as string[],
    collaborationType: [] as string[],
    availability: "",
    preferredStudentLevel: [] as string[],
    bio: "",
    publications: "",
    hIndex: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field: string, value: string) => {
    setFormData(prev => {
      const current = prev[field as keyof typeof prev] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const handleSave = () => {
    toast({
      title: "Profile Saved!",
      description: "Your researcher profile has been updated successfully.",
    });
    navigate("/matches");
  };

  return (
    <MainLayout>
      <div className="gradient-hero py-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Badge variant="secondary" className="mb-4">
              <Briefcase className="h-3 w-3 mr-1" />
              Researcher Profile
            </Badge>
            <h1 className="text-3xl font-bold md:text-4xl">
              Complete Your{" "}
              <span className="text-gradient">Researcher Profile</span>
            </h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Help us match you with talented students and fellow researchers.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Identity Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Identity
              </CardTitle>
              <CardDescription>Basic information about you</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Dr. Jane Smith"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Select
                  value={formData.title}
                  onValueChange={(v) => handleInputChange("title", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assistant-professor">Assistant Professor</SelectItem>
                    <SelectItem value="associate-professor">Associate Professor</SelectItem>
                    <SelectItem value="full-professor">Full Professor</SelectItem>
                    <SelectItem value="research-fellow">Research Fellow</SelectItem>
                    <SelectItem value="senior-researcher">Senior Researcher</SelectItem>
                    <SelectItem value="postdoc">Postdoctoral Researcher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="university">University / Institute *</Label>
                <Input
                  id="university"
                  placeholder="MIT"
                  value={formData.university}
                  onChange={(e) => handleInputChange("university", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  placeholder="Computer Science"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="Cambridge, USA"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Research Focus */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Research Focus
              </CardTitle>
              <CardDescription>Your research areas and interests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="discipline">Primary Discipline *</Label>
                <Select
                  value={formData.discipline}
                  onValueChange={(v) => handleInputChange("discipline", v)}
                >
                  <SelectTrigger className="w-full md:w-80">
                    <SelectValue placeholder="Select discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplines.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Research Interests (select multiple)</Label>
                <div className="flex flex-wrap gap-2">
                  {researchInterests.map((interest) => (
                    <Badge
                      key={interest}
                      variant={formData.researchInterests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => handleMultiSelect("researchInterests", interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Research Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Describe your research focus and current projects..."
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="publications">Publications Count</Label>
                  <Input
                    id="publications"
                    type="number"
                    placeholder="45"
                    value={formData.publications}
                    onChange={(e) => handleInputChange("publications", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hIndex">h-Index</Label>
                  <Input
                    id="hIndex"
                    type="number"
                    placeholder="28"
                    value={formData.hIndex}
                    onChange={(e) => handleInputChange("hIndex", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collaboration Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Collaboration Preferences
              </CardTitle>
              <CardDescription>How would you like to collaborate?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Collaboration Type (select multiple)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {collaborationTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.id}
                        checked={formData.collaborationType.includes(type.id)}
                        onCheckedChange={() => handleMultiSelect("collaborationType", type.id)}
                      />
                      <Label htmlFor={type.id} className="font-normal cursor-pointer">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preferred Student Level (select multiple)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {studentLevels.map((level) => (
                    <div key={level.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`level-${level.id}`}
                        checked={formData.preferredStudentLevel.includes(level.id)}
                        onCheckedChange={() => handleMultiSelect("preferredStudentLevel", level.id)}
                      />
                      <Label htmlFor={`level-${level.id}`} className="font-normal cursor-pointer">
                        {level.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability for Collaboration *</Label>
                <Select
                  value={formData.availability}
                  onValueChange={(v) => handleInputChange("availability", v)}
                >
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={handleSave} size="lg">
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
