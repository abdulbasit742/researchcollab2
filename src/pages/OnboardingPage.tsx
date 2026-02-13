import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, User, MapPin, Building, Sparkles, ArrowRight, ArrowLeft, Loader2, Check, SkipForward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CelebrationOverlay } from "@/components/celebrations";
import { useCelebration, CELEBRATION_PRESETS } from "@/hooks/useCelebration";
import { SkillSelector } from "@/components/onboarding/SkillSelector";
import { PlatformWalkthrough } from "@/components/onboarding/PlatformWalkthrough";

const TOTAL_STEPS = 4;

const stepMeta = [
  { title: "Tell us about yourself", description: "Help us personalize your experience", label: "Personal" },
  { title: "Your Academic Profile", description: "Complete your academic details", label: "Academic" },
  { title: "Select Your Skills", description: "Pick skills to showcase on your profile", label: "Skills" },
  { title: "Welcome to the Platform", description: "A quick look at what you can do", label: "Explore" },
];

const educationLevels = [
  { value: "FSC", label: "FSC / Intermediate" },
  { value: "BS", label: "BS / Bachelor's" },
  { value: "MS", label: "MS / Master's" },
  { value: "PhD", label: "PhD / Doctorate" },
];

const departments = [
  { value: "CIS", label: "Computer & Information Sciences" },
  { value: "EE", label: "Electrical Engineering" },
  { value: "ME", label: "Mechanical Engineering" },
  { value: "MME", label: "Materials & Metallurgical Engineering" },
  { value: "CHM_ENG", label: "Chemical Engineering" },
  { value: "PHYSICS", label: "Physics" },
  { value: "CHEMISTRY", label: "Chemistry" },
  { value: "MATH", label: "Mathematics" },
  { value: "BIOLOGY", label: "Biology / Life Sciences" },
  { value: "MEDICINE", label: "Medicine / Health Sciences" },
  { value: "BUSINESS", label: "Business Administration" },
  { value: "SOCIAL_SCI", label: "Social Sciences" },
  { value: "ENV_SCI", label: "Environmental Science" },
  { value: "ARCHITECTURE", label: "Architecture" },
  { value: "AGRICULTURE", label: "Agriculture" },
  { value: "LAW", label: "Law" },
  { value: "ARTS", label: "Arts & Humanities" },
  { value: "OTHER", label: "Other" },
];

const researchLevels = [
  { value: "beginner", label: "Beginner", description: "Just starting my research journey" },
  { value: "intermediate", label: "Intermediate", description: "Some research experience" },
  { value: "advanced", label: "Advanced", description: "Multiple research projects completed" },
  { value: "publication-ready", label: "Publication Ready", description: "Published or ready to publish" },
];

const roles = [
  { value: "student", label: "Student", description: "Learn, collaborate, and earn" },
  { value: "researcher", label: "Researcher", description: "Lead projects and mentor" },
  { value: "professional", label: "Professional", description: "Post projects, hire talent, access tools" },
];

const interestOptions = [
  "Machine Learning", "Data Science", "Quantum Physics", "Nanotechnology",
  "Renewable Energy", "Biotechnology", "Robotics", "Materials Science",
  "Fluid Dynamics", "Signal Processing", "Thermodynamics", "Software Engineering",
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();
  const { isActive: isCelebrating, config: celebrationConfig, celebrate } = useCelebration();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    role: "",
    location: "",
    university: "",
    educationLevel: "",
    department: "",
    researchLevel: "",
    interests: [] as string[],
    skills: [] as string[],
  });

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.role || !formData.location || !formData.university) {
        toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
        return;
      }
    }
    if (step === 2) {
      if (!formData.educationLevel || !formData.department || !formData.researchLevel) {
        toast({ title: "Missing Information", description: "Please complete all academic fields.", variant: "destructive" });
        return;
      }
    }
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Not authenticated", description: "Please sign in first.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          role: formData.role,
          location: formData.location,
          university: formData.university,
          education_level: formData.educationLevel,
          department: formData.department,
          research_level: formData.researchLevel,
          interests: formData.interests,
          skills: formData.skills,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      const dbRole = formData.role === "professional" ? "researcher" : formData.role;
      await supabase
        .from("user_roles")
        .update({ role: dbRole as "student" | "researcher" | "admin" })
        .eq("user_id", user.id);

      await refreshProfile();
      celebrate(CELEBRATION_PRESETS.onboardingComplete);

      toast({ title: "Profile Complete!", description: "Welcome to ResearchCollabPro! Your profile is ready." });
      setTimeout(() => navigate("/home"), 2500);
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({ title: "Error", description: error.message || "Failed to save profile. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSkippable = step === 3 || step === 4;
  const meta = stepMeta[step - 1];

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <CelebrationOverlay
        isActive={isCelebrating}
        title={celebrationConfig.title}
        subtitle={celebrationConfig.subtitle}
        icon={celebrationConfig.icon}
      />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/5 blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">
            <span className="text-primary">ResearchCollabPro</span>
          </span>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {stepMeta.map((s, i) => {
            const stepNum = i + 1;
            const isCompleted = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={i} className="flex items-center gap-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
                  </div>
                  <span className={`text-[10px] mt-1 ${isCurrent ? "text-primary font-medium" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {i < TOTAL_STEPS - 1 && (
                  <div className={`h-0.5 w-6 mb-4 rounded-full ${step > stepNum ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            );
          })}
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <Badge variant="secondary" className="mx-auto mb-2">
              Step {step} of {TOTAL_STEPS}
            </Badge>
            <CardTitle className="text-2xl">{meta.title}</CardTitle>
            <CardDescription>{meta.description}</CardDescription>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="fullName" placeholder="Muhammad Ali Khan" className="pl-10" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>I am a...</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {roles.map((role) => (
                        <button key={role.value} type="button" onClick={() => setFormData({ ...formData, role: role.value })}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${formData.role === role.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                          <div className="font-medium text-sm">{role.label}</div>
                          <div className="text-xs text-muted-foreground">{role.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location (City, Country)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="location" placeholder="Islamabad, Pakistan" className="pl-10" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="university">University / Institute</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="university" placeholder="NUST, PIEAS, GIKI..." className="pl-10" value={formData.university} onChange={(e) => setFormData({ ...formData, university: e.target.value })} />
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleNext}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Academic Profile */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Education Level</Label>
                    <Select value={formData.educationLevel} onValueChange={(value) => setFormData({ ...formData, educationLevel: value })}>
                      <SelectTrigger><SelectValue placeholder="Select your education level" /></SelectTrigger>
                      <SelectContent>
                        {educationLevels.map((level) => (<SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                      <SelectTrigger><SelectValue placeholder="Select your department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (<SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Research Experience Level</Label>
                    <Select value={formData.researchLevel} onValueChange={(value) => setFormData({ ...formData, researchLevel: value })}>
                      <SelectTrigger><SelectValue placeholder="Select your research level" /></SelectTrigger>
                      <SelectContent>
                        {researchLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div><div className="font-medium">{level.label}</div><div className="text-xs text-muted-foreground">{level.description}</div></div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Research Interests (Select multiple)</Label>
                    <div className="flex flex-wrap gap-2">
                      {interestOptions.map((interest) => (
                        <Badge key={interest} variant={formData.interests.includes(interest) ? "default" : "outline"} className="cursor-pointer transition-all" onClick={() => toggleInterest(interest)}>
                          {formData.interests.includes(interest) && <Check className="h-3 w-3 mr-1" />}
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleBack} className="flex-1"><ArrowLeft className="h-4 w-4" /> Back</Button>
                    <Button className="flex-1" onClick={handleNext}>Continue <ArrowRight className="h-4 w-4" /></Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Skills */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <SkillSelector selectedSkills={formData.skills} onSkillsChange={(skills) => setFormData({ ...formData, skills })} />
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleBack} className="flex-1"><ArrowLeft className="h-4 w-4" /> Back</Button>
                    <Button className="flex-1" onClick={handleNext}>Continue <ArrowRight className="h-4 w-4" /></Button>
                  </div>
                  <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleNext}>
                    <SkipForward className="h-4 w-4 mr-1" /> Skip for now
                  </Button>
                </motion.div>
              )}

              {/* Step 4: Platform Walkthrough */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <PlatformWalkthrough />
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleBack} className="flex-1"><ArrowLeft className="h-4 w-4" /> Back</Button>
                    <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>) : (<>Get Started <Sparkles className="h-4 w-4" /></>)}
                    </Button>
                  </div>
                  <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleSubmit} disabled={isSubmitting}>
                    <SkipForward className="h-4 w-4 mr-1" /> Skip & finish
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
