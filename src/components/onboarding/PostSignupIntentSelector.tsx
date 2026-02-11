import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  User,
  Sparkles,
} from "lucide-react";

type Intent = "earn" | "post" | null;

interface ProfileFields {
  headline: string;
  skills: string;
  portfolio_url: string;
}

export function PostSignupIntentSelector() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [intent, setIntent] = useState<Intent>(null);
  const [profileStep, setProfileStep] = useState(0);
  const [fields, setFields] = useState<ProfileFields>({
    headline: "",
    skills: "",
    portfolio_url: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && !localStorage.getItem("rcollab_intent_chosen")) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleIntentSelect = (selected: Intent) => {
    setIntent(selected);
    if (selected === "post") {
      // Go directly to project wizard
      localStorage.setItem("rcollab_intent_chosen", "true");
      setIsOpen(false);
      navigate("/earn?action=post");
    }
  };

  const profileProgress = () => {
    let score = 0;
    if (fields.headline.trim()) score += 33;
    if (fields.skills.trim()) score += 34;
    if (fields.portfolio_url.trim()) score += 33;
    return score;
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const skillsArray = fields.skills.split(",").map((s) => s.trim()).filter(Boolean);
      await supabase.from("profiles").update({
        headline: fields.headline,
        skills: skillsArray,
        portfolio_url: fields.portfolio_url,
      }).eq("id", user.id);

      localStorage.setItem("rcollab_intent_chosen", "true");
      setIsOpen(false);
      toast({ title: "Profile updated!", description: "Browse projects to place your first bid." });
      navigate("/earn");
    } catch (err) {
      toast({ title: "Error", description: "Failed to save profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("rcollab_intent_chosen", "true");
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {!intent && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6"
            >
              <DialogHeader className="text-center mb-6">
                <DialogTitle className="text-xl">
                  What brings you here? 🎯
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  We'll set things up for you
                </p>
              </DialogHeader>

              <div className="grid gap-3">
                <button
                  onClick={() => handleIntentSelect("earn")}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-left group"
                >
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                    <DollarSign className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      I want to Earn
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Bid on projects and get paid for your skills
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto shrink-0 group-hover:text-primary transition-colors" />
                </button>

                <button
                  onClick={() => handleIntentSelect("post")}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-left group"
                >
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                    <Briefcase className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      I want to Post a Project
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Find talent to work on your project
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto shrink-0 group-hover:text-primary transition-colors" />
                </button>
              </div>

              <Button variant="ghost" onClick={handleSkip} className="w-full mt-4 text-sm">
                Skip for now
              </Button>
            </motion.div>
          )}

          {intent === "earn" && (
            <motion.div
              key="earn-profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIntent(null)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle className="text-lg">Complete Your Profile</DialogTitle>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Profile Strength</span>
                  <span className="font-semibold text-primary">{profileProgress()}%</span>
                </div>
                <Progress value={profileProgress()} className="h-2" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    <User className="h-3.5 w-3.5 inline mr-1" />
                    Short Headline *
                  </label>
                  <Input
                    placeholder="e.g. Data Science Student | Python & ML Expert"
                    value={fields.headline}
                    onChange={(e) => setFields({ ...fields, headline: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                    Skills * (comma-separated)
                  </label>
                  <Textarea
                    placeholder="Python, Machine Learning, Data Analysis, R..."
                    value={fields.skills}
                    onChange={(e) => setFields({ ...fields, skills: e.target.value })}
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Portfolio / LinkedIn URL
                  </label>
                  <Input
                    placeholder="https://..."
                    value={fields.portfolio_url}
                    onChange={(e) => setFields({ ...fields, portfolio_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={handleSkip} className="flex-1">
                  Skip
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={!fields.headline.trim() || !fields.skills.trim() || saving}
                  className="flex-1 gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {saving ? "Saving..." : "Save & Browse Projects"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
