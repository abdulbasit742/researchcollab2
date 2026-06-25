import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ProjectTemplatePicker } from "@/components/projects/ProjectTemplatePicker";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  PROJECT_CREATION_STEPS,
  PROJECT_TIER_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  getProjectTierOption,
  getProjectTypeOption,
  type ProjectBuildTier,
  type ProjectCreationType,
} from "@/config/projectCreation";
import type { ProjectTemplate } from "@/config/projectTemplates";
import {
  Send,
  Shield,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Building2,
  GraduationCap,
  Lightbulb,
  Sparkles,
} from "lucide-react";

const splitSkills = (skills: string) =>
  skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 12);

export default function FYPSubmitProblemPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    project_title: "",
    project_type: "fyp" as ProjectCreationType,
    company_name: "",
    contact_name: "",
    contact_email: "",
    website: "",
    academic_department: "",
    problem_description: "",
    expected_outcomes: "",
    skills_needed: "",
    preferred_timeline: "",
    budget_range: "",
    prototype_tier: "prototype" as ProjectBuildTier,
    sponsor_type: "industry",
  });

  const selectedType = useMemo(() => getProjectTypeOption(form.project_type), [form.project_type]);
  const selectedTier = useMemo(() => getProjectTierOption(form.prototype_tier), [form.prototype_tier]);
  const parsedSkills = useMemo(() => splitSkills(form.skills_needed), [form.skills_needed]);

  const applyTemplate = (template: ProjectTemplate) => {
    setForm((current) => ({
      ...current,
      project_title: template.title,
      project_type: template.project_type,
      academic_department: template.academic_department,
      problem_description: template.problem_description,
      expected_outcomes: template.expected_outcomes,
      skills_needed: template.skills_needed.join(", "),
      preferred_timeline: template.preferred_timeline,
      budget_range: template.budget_range,
      prototype_tier: template.prototype_tier,
      sponsor_type: template.sponsor_type,
    }));
    toast({ title: "Template applied", description: `${template.title} has been loaded into the project form.` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.project_title || !form.company_name || !form.contact_name || !form.contact_email || !form.problem_description) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    if (form.problem_description.trim().length < 40) {
      toast({ title: "Add more project detail", description: "Please describe the problem in at least 40 characters.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("fyp_problem_briefs").insert({
        project_title: form.project_title.trim().slice(0, 200),
        project_type: form.project_type,
        company_name: form.company_name.trim().slice(0, 200),
        contact_name: form.contact_name.trim().slice(0, 200),
        contact_email: form.contact_email.trim().slice(0, 255),
        website: form.website.trim().slice(0, 500) || null,
        academic_department: form.academic_department.trim().slice(0, 200) || null,
        problem_description: form.problem_description.trim().slice(0, 5000),
        expected_outcomes: form.expected_outcomes.trim().slice(0, 2000) || selectedType.outcomeLabel,
        skills_needed: parsedSkills,
        preferred_timeline: form.preferred_timeline.trim().slice(0, 100) || selectedTier.duration,
        budget_range: form.budget_range.trim().slice(0, 100) || selectedTier.budget,
        prototype_tier: form.prototype_tier,
        sponsor_type: form.sponsor_type.trim().slice(0, 100) || null,
      });

      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Project intake submitted successfully!" });
    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: err.message || "Please make sure the latest project-flow migration has been applied.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Helmet><title>Project Submitted | RCollab</title></Helmet>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-6">
              <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Project Intake Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                We will review your FYP/research intake and convert it into a milestone-ready project plan for matching and execution.
              </p>
              <div className="space-y-2 text-left bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm"><strong>What happens next:</strong></p>
                {PROJECT_CREATION_STEPS.map((step, index) => (
                  <p key={step} className="text-sm text-muted-foreground">{index + 1}. {step}</p>
                ))}
              </div>
              <Button onClick={() => setSubmitted(false)} variant="outline">Submit Another Project</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Create FYP / Research Project | RCollab</title>
        <meta name="description" content="Create a milestone-ready FYP, research, or prototype project for supervised matching and execution." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <section className="py-12 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">Create → Match → Execute</Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Create an FYP or Research Project
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Turn a rough idea, business problem, research topic, or prototype need into a structured project with skills, milestones, and execution expectations.
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Creation Brief
                </CardTitle>
                <CardDescription>Tell us what needs to be researched, built, validated, or delivered.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <ProjectTemplatePicker activeType={form.project_type} onApply={applyTemplate} />

                  <div className="space-y-3">
                    <Label>Project Type *</Label>
                    <RadioGroup value={form.project_type} onValueChange={(v) => setForm(f => ({ ...f, project_type: v as ProjectCreationType }))}>
                      {PROJECT_TYPE_OPTIONS.map((type) => (
                        <label key={type.value} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value={type.value} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{type.label}</span>
                              <Badge variant="secondary">{type.value}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      value={form.project_title}
                      onChange={(e) => setForm(f => ({ ...f, project_title: e.target.value }))}
                      placeholder="AI-based attendance system, smart irrigation research, hospital workflow automation..."
                      required
                      maxLength={200}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Organization / University *</Label>
                      <Input id="company" value={form.company_name} onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Company, university, lab, or team" required maxLength={200} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department / Domain</Label>
                      <Input id="department" value={form.academic_department} onChange={(e) => setForm(f => ({ ...f, academic_department: e.target.value }))} placeholder="CS, EE, Business, Healthcare..." maxLength={200} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Contact Name *</Label>
                      <Input id="name" value={form.contact_name} onChange={(e) => setForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="Your Name" required maxLength={200} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={form.contact_email} onChange={(e) => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="you@example.com" required maxLength={255} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website / Reference Link</Label>
                      <Input id="website" value={form.website} onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." maxLength={500} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sponsorType">Sponsor / Owner Type</Label>
                      <Input id="sponsorType" value={form.sponsor_type} onChange={(e) => setForm(f => ({ ...f, sponsor_type: e.target.value }))} placeholder="industry, student, faculty, lab..." maxLength={100} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="problem">Problem / Research Need *</Label>
                    <Textarea
                      id="problem"
                      value={form.problem_description}
                      onChange={(e) => setForm(f => ({ ...f, problem_description: e.target.value }))}
                      placeholder="What problem are you solving? Who has this problem? What should the team research, build, test, or prove?"
                      rows={5}
                      required
                      maxLength={5000}
                    />
                    <p className="text-xs text-muted-foreground">{form.problem_description.length}/5000</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outcomes">Expected Outcomes</Label>
                    <Textarea
                      id="outcomes"
                      value={form.expected_outcomes}
                      onChange={(e) => setForm(f => ({ ...f, expected_outcomes: e.target.value }))}
                      placeholder={selectedType.outcomeLabel}
                      rows={3}
                      maxLength={2000}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills Needed</Label>
                      <Input
                        id="skills"
                        value={form.skills_needed}
                        onChange={(e) => setForm(f => ({ ...f, skills_needed: e.target.value }))}
                        placeholder="React, Python, ML, IoT, CAD, research writing"
                      />
                      <p className="text-xs text-muted-foreground">Comma-separated. Parsed: {parsedSkills.length || 0} skills.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeline">Preferred Timeline</Label>
                      <Input id="timeline" value={form.preferred_timeline} onChange={(e) => setForm(f => ({ ...f, preferred_timeline: e.target.value }))} placeholder={selectedTier.duration} maxLength={100} />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Execution Tier</Label>
                    <RadioGroup value={form.prototype_tier} onValueChange={(v) => setForm(f => ({ ...f, prototype_tier: v as ProjectBuildTier }))}>
                      {PROJECT_TIER_OPTIONS.map((tier) => (
                        <label key={tier.value} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value={tier.value} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{tier.label}</span>
                              <Badge variant="secondary">{tier.budget}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {tier.milestones} milestones · {tier.duration} · {tier.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range</Label>
                    <Input id="budget" value={form.budget_range} onChange={(e) => setForm(f => ({ ...f, budget_range: e.target.value }))} placeholder={selectedTier.budget} maxLength={100} />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? "Submitting..." : <>Create Project Intake <Send className="h-4 w-4 ml-2" /></>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" /> Project Plan Preview</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-medium">{selectedType.label}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tier</p>
                    <p className="font-medium">{selectedTier.label} · {selectedTier.milestones} milestones</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Default outcome</p>
                    <p className="text-muted-foreground">{selectedType.outcomeLabel}</p>
                  </div>
                  {parsedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {parsedSkills.map((skill) => <Badge key={skill} variant="outline">{skill}</Badge>)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold">Creation Flow</h3>
                {PROJECT_CREATION_STEPS.map((step, index) => (
                  <div key={step} className="flex items-start gap-2 text-sm">
                    <Badge variant="secondary" className="mt-0.5">{index + 1}</Badge>
                    <span>{step}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold">Why Use RCollab?</h3>
                {[
                  { icon: DollarSign, text: "Structured budget and milestone planning" },
                  { icon: Shield, text: "Demo-safe funding and review labels" },
                  { icon: GraduationCap, text: "Student/research team matching" },
                  { icon: Building2, text: "Faculty or institution supervision" },
                  { icon: Clock, text: "6–16 week execution options" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <item.icon className="h-4 w-4 text-primary shrink-0" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm font-semibold mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Pilot Intake</p>
                <p className="text-xs text-muted-foreground mb-3">
                  This intake creates a review-ready brief. Admins can convert it into workspace, milestones, and team matching in the next workflow steps.
                </p>
                <Badge>Demo-safe workflow</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
