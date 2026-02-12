import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, Upload, CheckCircle, ArrowRight, ArrowLeft, Globe, Users, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const DOMAIN_OPTIONS = [
  "Computer Science", "Engineering", "Business & Management", "Medicine & Health",
  "Law", "Social Sciences", "Natural Sciences", "Arts & Humanities",
  "Education", "Agriculture", "Multi-disciplinary", "Other"
];

const COUNTRY_OPTIONS = [
  "Pakistan", "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "India", "China", "UAE", "Saudi Arabia", "Turkey", "Malaysia",
  "Singapore", "Japan", "South Korea", "Other"
];

const InstitutionApplyPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    institution_name: "",
    country: "",
    domain_focus: "",
    contact_email: "",
    estimated_members: 50,
    description: "",
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const canProceed = () => {
    if (step === 1) return form.institution_name && form.country;
    if (step === 2) return form.domain_focus && form.contact_email;
    return true;
  };

  const handleSubmit = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("institution_applications" as any).insert({
        institution_name: form.institution_name,
        country: form.country,
        domain_focus: form.domain_focus,
        contact_email: form.contact_email,
        estimated_members: form.estimated_members,
        submitted_by: user.id,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <MainLayout>
        <div className="container max-w-2xl py-16 text-center">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
          <p className="text-muted-foreground mb-8">
            Your institution application is under review. You'll receive an email at{" "}
            <strong>{form.contact_email}</strong> once approved.
          </p>
          <Button onClick={() => navigate("/home")}>Return to Dashboard</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Register Your Institution</h1>
          <p className="text-muted-foreground">
            Join RCollab's institutional network to unlock economic intelligence, talent tracking, and more.
          </p>
        </div>

        <Progress value={progress} className="mb-8 h-2" />

        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <Badge key={s} variant={step >= s ? "default" : "outline"} className="px-3 py-1">
              Step {s}
            </Badge>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Institution Details"}
              {step === 2 && "Domain & Contact"}
              {step === 3 && "Review & Submit"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about your institution"}
              {step === 2 && "Your focus area and contact information"}
              {step === 3 && "Confirm your details before submitting"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label>Institution Name *</Label>
                  <Input
                    placeholder="e.g., University of Engineering & Technology"
                    value={form.institution_name}
                    onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                    <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      {COUNTRY_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estimated Members</Label>
                  <Input
                    type="number"
                    min={10}
                    value={form.estimated_members}
                    onChange={(e) => setForm({ ...form, estimated_members: parseInt(e.target.value) || 50 })}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label>Domain Focus *</Label>
                  <Select value={form.domain_focus} onValueChange={(v) => setForm({ ...form, domain_focus: v })}>
                    <SelectTrigger><SelectValue placeholder="Select primary domain" /></SelectTrigger>
                    <SelectContent>
                      {DOMAIN_OPTIONS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contact Email *</Label>
                  <Input
                    type="email"
                    placeholder="admin@university.edu"
                    value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    placeholder="Brief description of your institution and goals on RCollab..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Building2 className="h-4 w-4" />
                      <span className="text-xs">Institution</span>
                    </div>
                    <p className="font-semibold">{form.institution_name}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Globe className="h-4 w-4" />
                      <span className="text-xs">Country</span>
                    </div>
                    <p className="font-semibold">{form.country}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Briefcase className="h-4 w-4" />
                      <span className="text-xs">Domain</span>
                    </div>
                    <p className="font-semibold">{form.domain_focus}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-xs">Est. Members</span>
                    </div>
                    <p className="font-semibold">{form.estimated_members}</p>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Contact: {form.contact_email}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              {step < totalSteps ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default InstitutionApplyPage;
