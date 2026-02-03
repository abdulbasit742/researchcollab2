import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useMyTrustProfile } from "@/hooks/useMyTrustProfile";
import { useOpportunityEngine } from "@/hooks/useOpportunityEngine";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Briefcase,
  TrendingUp,
  Building2,
  BookOpen,
  Users,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield,
  Eye,
  Rocket,
} from "lucide-react";

const STEPS = [
  { id: "goal", title: "Goals", description: "What brings you here?" },
  { id: "context", title: "Context", description: "Refine your focus" },
  { id: "skills", title: "Skills", description: "Confirm your strengths" },
  { id: "preview", title: "Preview", description: "See what's unlocked" },
  { id: "activate", title: "Start", description: "Your experience is ready" },
];

const GOALS = [
  { id: "opportunities", label: "Find higher-quality opportunities", icon: Target },
  { id: "deals", label: "Win more deals / projects", icon: Briefcase },
  { id: "trust", label: "Build trust & credibility faster", icon: TrendingUp },
  { id: "institutions", label: "Collaborate with institutions", icon: Building2 },
  { id: "research", label: "Research & publications", icon: BookOpen },
  { id: "team", label: "Team / organization growth", icon: Users },
];

const OPPORTUNITY_TYPES = [
  { id: "jobs", label: "Jobs" },
  { id: "projects", label: "Projects" },
  { id: "grants", label: "Grants" },
  { id: "collaborations", label: "Collaborations" },
];

const BUDGET_RANGES = [
  { id: "any", label: "Any budget" },
  { id: "low", label: "< PKR 50,000" },
  { id: "mid", label: "PKR 50,000 - 200,000" },
  { id: "high", label: "PKR 200,000+" },
];

const COLLABORATION_TYPES = [
  { id: "solo", label: "Solo work" },
  { id: "team", label: "Team collaboration" },
  { id: "institution", label: "Institutional partnership" },
];

const TIME_HORIZONS = [
  { id: "immediate", label: "Immediately" },
  { id: "short", label: "1-3 months" },
  { id: "long", label: "Long-term (6+ months)" },
];

const getTrustTier = (score: number): string => {
  if (score >= 80) return "platinum";
  if (score >= 60) return "gold";
  if (score >= 40) return "silver";
  return "bronze";
};

export default function PremiumOnboardingPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { trustProfile } = useMyTrustProfile();
  const opportunityQuery = useOpportunityEngine();
  const opportunities = opportunityQuery.data || [];
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [opportunityTypes, setOpportunityTypes] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState("any");
  const [collaborationType, setCollaborationType] = useState("solo");
  const [timeHorizon, setTimeHorizon] = useState("short");
  const [confirmedSkills, setConfirmedSkills] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const userSkills = profile?.interests || [];

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]
    );
  };

  const toggleOpportunityType = (typeId: string) => {
    setOpportunityTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const toggleSkill = (skill: string) => {
    setConfirmedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Save preferences and complete onboarding
      await savePreferences();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const savePreferences = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Store preferences in profile metadata or dedicated preferences
      // For now, we'll update the profile with interests based on confirmed skills
      if (confirmedSkills.length > 0) {
        await supabase
          .from("profiles")
          .update({
            interests: confirmedSkills,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }

      toast({
        title: "Premium Experience Activated",
        description: "Your personalized experience is ready.",
      });

      navigate("/opportunities");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return selectedGoals.length > 0;
    if (currentStep === 1) return opportunityTypes.length > 0;
    return true;
  };

  // Filter opportunities that would be unlocked
  const premiumOpportunities = (opportunities || []).filter((opp) => {
    // Simulate premium-only filtering
    const matchScore = opp.match_score || 50;
    return matchScore >= 70;
  }).slice(0, 3);

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case "goal":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                What is your primary goal on RCollab?
              </h2>
              <p className="text-muted-foreground">
                Select all that apply. This helps us personalize your experience.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {GOALS.map((goal) => {
                const Icon = goal.icon;
                const isSelected = selectedGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{goal.label}</span>
                    {isSelected && <Check className="ml-auto h-5 w-5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        );

      case "context":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 max-w-xl mx-auto"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Refine your focus</h2>
              <p className="text-muted-foreground">
                Help us reduce noise and show only what matters to you.
              </p>
            </div>

            {/* Opportunity Types */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Preferred opportunity types</Label>
              <div className="flex flex-wrap gap-2">
                {OPPORTUNITY_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => toggleOpportunityType(type.id)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      opportunityTypes.includes(type.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Range */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Budget preference</Label>
              <RadioGroup value={budgetRange} onValueChange={setBudgetRange}>
                <div className="grid grid-cols-2 gap-2">
                  {BUDGET_RANGES.map((range) => (
                    <div key={range.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={range.id} id={range.id} />
                      <Label htmlFor={range.id} className="text-sm">
                        {range.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Collaboration Type */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Collaboration style</Label>
              <RadioGroup value={collaborationType} onValueChange={setCollaborationType}>
                <div className="space-y-2">
                  {COLLABORATION_TYPES.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.id} id={`collab-${type.id}`} />
                      <Label htmlFor={`collab-${type.id}`} className="text-sm">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Time Horizon */}
            <div className="space-y-3">
              <Label className="text-base font-medium">When do you need results?</Label>
              <RadioGroup value={timeHorizon} onValueChange={setTimeHorizon}>
                <div className="space-y-2">
                  {TIME_HORIZONS.map((horizon) => (
                    <div key={horizon.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={horizon.id} id={`time-${horizon.id}`} />
                      <Label htmlFor={`time-${horizon.id}`} className="text-sm">
                        {horizon.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </motion.div>
        );

      case "skills":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 max-w-xl mx-auto"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Confirm your strengths</h2>
              <p className="text-muted-foreground">
                These skills are detected from your profile. Confirm those you want to highlight.
              </p>
            </div>

            {userSkills.length > 0 ? (
              <div className="flex flex-wrap gap-3 justify-center">
                {userSkills.map((skill) => {
                  const isConfirmed = confirmedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                        isConfirmed
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {isConfirmed && <Check className="h-4 w-4" />}
                      {skill}
                    </button>
                  );
                })}
              </div>
            ) : (
              <Card className="bg-muted/50">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    No skills detected yet. Complete your profile to add skills.
                  </p>
                  <Button variant="outline" asChild>
                    <a href="/profile">Update Profile</a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Trust Signal */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Your Trust Score</p>
                    <p className="text-2xl font-bold text-primary">
                      {trustProfile?.trust_score || 0}/100
                    </p>
                  </div>
                  <Badge className="ml-auto capitalize">
                    {getTrustTier(trustProfile?.trust_score || 0)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case "preview":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">What Premium unlocks for you</h2>
              <p className="text-muted-foreground">
                Real opportunities, real insights — not available on free plan.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {/* High-Match Opportunities */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm">Premium Opportunities</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary mb-1">
                    {premiumOpportunities.length}+
                  </p>
                  <p className="text-xs text-muted-foreground">
                    High-match opportunities hidden on free plan
                  </p>
                </CardContent>
              </Card>

              {/* Trust Insights */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm">Trust Insights</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary mb-1">Full</p>
                  <p className="text-xs text-muted-foreground">
                    Access to trust trajectory & predictions
                  </p>
                </CardContent>
              </Card>

              {/* Career Copilot */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm">AI Career Copilot</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary mb-1">Unlimited</p>
                  <p className="text-xs text-muted-foreground">
                    Personalized guidance & next-best-actions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sample Opportunities */}
            {premiumOpportunities.length > 0 && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Opportunities matching your profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {premiumOpportunities.map((opp, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                    >
                      <div>
                        <p className="font-medium text-sm">{opp.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {opp.owner_university || "Independent"}
                        </p>
                      </div>
                      <Badge variant="secondary">{opp.match_score}% match</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        );

      case "activate":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 max-w-lg mx-auto"
          >
            <div className="h-24 w-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Rocket className="h-12 w-12 text-primary" />
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-2">Your Premium experience is ready</h2>
              <p className="text-muted-foreground">
                Personalized opportunities, trust insights, and AI guidance await.
              </p>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm">Goals: {selectedGoals.length} priorities set</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm">
                    Focus: {opportunityTypes.join(", ") || "All types"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm">
                    Skills: {confirmedSkills.length || userSkills.length} confirmed
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={handleNext} disabled={saving}>
                {saving ? "Activating..." : "Go to My Opportunities"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/progress")}
                disabled={saving}
              >
                View Progress Dashboard
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex flex-col">
        {/* Progress Header */}
        <div className="border-b bg-muted/30">
          <div className="container px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Premium Onboarding
              </Badge>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {STEPS.length}
              </span>
            </div>

            <Progress value={progress} className="h-2 mb-4" />

            <div className="hidden md:flex justify-between">
              {STEPS.map((step, i) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 ${
                    i <= currentStep ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                      i < currentStep
                        ? "bg-primary text-primary-foreground"
                        : i === currentStep
                        ? "bg-primary/20 text-primary border border-primary"
                        : "bg-muted"
                    }`}
                  >
                    {i < currentStep ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <span className="text-sm font-medium">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 container px-4 py-8">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </div>

        {/* Navigation Footer */}
        {currentStep < STEPS.length - 1 && (
          <div className="border-t bg-background sticky bottom-0">
            <div className="container px-4 py-4 flex justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
