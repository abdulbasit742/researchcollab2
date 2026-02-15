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
import { PortfolioManager } from "@/components/portfolio/PortfolioManager";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  User,
  BookOpen,
  Target,
  Wrench,
  Briefcase,
  Shield,
  Save,
  X,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const semesters = Array.from({ length: 10 }, (_, i) => i + 1);
const researchLevels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "publication-ready", label: "Publication-ready" },
];

const passionAreas = [
  "AI", "Machine Learning", "Deep Learning", "Computer Vision", "NLP",
  "Quantum Computing", "Robotics", "IoT", "Blockchain", "Cybersecurity",
  "Data Science", "Climate Science", "Renewable Energy", "Healthcare",
  "Biotechnology", "Medical Devices", "Psychology", "Neuroscience",
  "Economics", "Finance", "Social Sciences", "Education", "Physics",
  "Mathematics", "Chemistry", "Environmental Science"
];

const researchInterests = [
  "Machine Learning", "Deep Learning", "Computer Vision", "NLP",
  "Reinforcement Learning", "Generative AI", "Quantum Algorithms",
  "Climate Modeling", "Sustainability", "Drug Discovery", "Genomics",
  "Behavioral Economics", "Game Theory", "Network Science",
  "Human-Computer Interaction", "Autonomous Systems", "Signal Processing"
];

const goals = [
  { id: "co-author", label: "Co-author paper" },
  { id: "fyp-support", label: "FYP support" },
  { id: "learn-research", label: "Learn research" },
  { id: "earn-projects", label: "Earn via projects" },
  { id: "build-portfolio", label: "Build portfolio" },
];

const services = [
  { id: "fyp-thesis", label: "FYP / Thesis" },
  { id: "research-writing", label: "Research Writing" },
  { id: "data-analysis", label: "Data Analysis" },
  { id: "coding-dev", label: "Coding / App Dev" },
  { id: "design-ui", label: "Design / UI" },
  { id: "presentation", label: "Presentation / Posters" },
];

const availabilityOptions = ["5 hrs/week", "10 hrs/week", "20 hrs/week", "40+ hrs/week"];

export default function StudentProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    university: "",
    department: "",
    location: "",
    semester: "",
    cgpa: "",
    researchLevel: "",
    backgroundSummary: "",
    researchInterests: [] as string[],
    passionAreas: [] as string[],
    preferredDomain: "",
    goals: [] as string[],
    skills: [] as string[],
    servicesOffered: [] as string[],
    hourlyRate: "",
    availability: "",
    studentId: "",
    orcid: "",
  });

  const [newSkill, setNewSkill] = useState("");

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

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSave = () => {
    toast({
      title: "Profile Saved!",
      description: "Your student profile has been updated successfully.",
    });
    navigate("/matches");
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
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Badge variant="secondary" className="mb-4">
              <GraduationCap className="h-3 w-3 mr-1" />
              Student Profile
            </Badge>
            <h1 className="text-3xl font-bold md:text-4xl">
              Complete Your{" "}
              <span className="text-gradient">Student Profile</span>
            </h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              A complete profile helps us match you with the right researchers and opportunities.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-8 max-w-4xl">
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
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                />
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
                <Label htmlFor="department">Department / Program *</Label>
                <Input
                  id="department"
                  placeholder="Computer Science"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location (Country/City) *</Label>
                <Input
                  id="location"
                  placeholder="Boston, USA"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Academic Background */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Academic Background
              </CardTitle>
              <CardDescription>Your academic standing and research experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Class / Semester *</Label>
                  <Select
                    value={formData.semester}
                    onValueChange={(v) => handleInputChange("semester", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((s) => (
                        <SelectItem key={s} value={s.toString()}>
                          Semester {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cgpa">Current CGPA (optional)</Label>
                  <Input
                    id="cgpa"
                    type="number"
                    step="0.01"
                    placeholder="3.75"
                    value={formData.cgpa}
                    onChange={(e) => handleInputChange("cgpa", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="researchLevel">Research Level *</Label>
                  <Select
                    value={formData.researchLevel}
                    onValueChange={(v) => handleInputChange("researchLevel", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {researchLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="backgroundSummary">Background Summary</Label>
                <Textarea
                  id="backgroundSummary"
                  placeholder="What have you studied / built? Describe your research background..."
                  rows={4}
                  value={formData.backgroundSummary}
                  onChange={(e) => handleInputChange("backgroundSummary", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Research & Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Research & Interests
              </CardTitle>
              <CardDescription>What are you passionate about?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                <Label>Passion Areas (select multiple)</Label>
                <div className="flex flex-wrap gap-2">
                  {passionAreas.map((area) => (
                    <Badge
                      key={area}
                      variant={formData.passionAreas.includes(area) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => handleMultiSelect("passionAreas", area)}
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredDomain">Preferred Domain</Label>
                <Select
                  value={formData.preferredDomain}
                  onValueChange={(v) => handleInputChange("preferredDomain", v)}
                >
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academia">Academia</SelectItem>
                    <SelectItem value="industry">Industry</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Goals (select multiple)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {goals.map((goal) => (
                    <div key={goal.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal.id}
                        checked={formData.goals.includes(goal.id)}
                        onCheckedChange={() => handleMultiSelect("goals", goal.id)}
                      />
                      <Label htmlFor={goal.id} className="font-normal cursor-pointer">
                        {goal.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                Skills & Services
              </CardTitle>
              <CardDescription>What can you offer?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g., Python, SPSS)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Services Offered</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={service.id}
                        checked={formData.servicesOffered.includes(service.id)}
                        onCheckedChange={() => handleMultiSelect("servicesOffered", service.id)}
                      />
                      <Label htmlFor={service.id} className="font-normal cursor-pointer">
                        {service.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (PKR, optional)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    placeholder="2500"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability *</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(v) => handleInputChange("availability", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      {availabilityOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio */}
          <PortfolioManager />

          {/* Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Verification (Optional)
              </CardTitle>
              <CardDescription>Get verified for better visibility</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  placeholder="Your student ID"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange("studentId", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orcid">ORCID</Label>
                <Input
                  id="orcid"
                  placeholder="0000-0001-2345-6789"
                  value={formData.orcid}
                  onChange={(e) => handleInputChange("orcid", e.target.value)}
                />
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
