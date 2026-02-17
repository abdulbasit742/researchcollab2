import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Send, Shield, CheckCircle, Clock, DollarSign, 
  FileText, Building2, ArrowRight
} from "lucide-react";

const tiers = [
  { value: "prototype", label: "Prototype", budget: "PKR 50K–100K", milestones: 3, duration: "6–8 weeks" },
  { value: "mvp", label: "Functional MVP", budget: "PKR 150K–250K", milestones: 4, duration: "10–12 weeks" },
  { value: "extended", label: "Extended Build", budget: "PKR 300K–500K", milestones: 5, duration: "14–16 weeks" },
];

export default function FYPSubmitProblemPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    website: "",
    problem_description: "",
    budget_range: "",
    prototype_tier: "prototype" as string,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name || !form.contact_name || !form.contact_email || !form.problem_description) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("fyp_problem_briefs").insert({
        company_name: form.company_name.trim().slice(0, 200),
        contact_name: form.contact_name.trim().slice(0, 200),
        contact_email: form.contact_email.trim().slice(0, 255),
        website: form.website.trim().slice(0, 500) || null,
        problem_description: form.problem_description.trim().slice(0, 5000),
        budget_range: form.budget_range.trim().slice(0, 100) || null,
        prototype_tier: form.prototype_tier,
      });

      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Problem brief submitted successfully!" });
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Helmet><title>Brief Submitted | FYP OS</title></Helmet>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-6">
              <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Brief Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                We'll review your problem brief and match it with a qualified FYP team within 48 hours. You'll receive a follow-up email with next steps.
              </p>
              <div className="space-y-2 text-left bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm"><strong>What happens next:</strong></p>
                <p className="text-sm text-muted-foreground">1. Our team reviews your brief</p>
                <p className="text-sm text-muted-foreground">2. We match with a faculty-supervised team</p>
                <p className="text-sm text-muted-foreground">3. Milestone structuring call (15 min)</p>
                <p className="text-sm text-muted-foreground">4. Escrow deposit & project kickoff</p>
              </div>
              <Button onClick={() => setSubmitted(false)} variant="outline">Submit Another Brief</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Submit a Problem Brief | FYP Execution OS</title>
        <meta name="description" content="Submit your business problem and get it solved by faculty-supervised student teams. Escrow-backed, milestone-controlled execution." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <section className="py-12 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">&lt; 3 Minutes to Submit</Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Get Your Prototype Built for 5x Less
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Submit your business problem. We match it with a faculty-supervised student team. 
              Escrow-protected. Milestone-controlled.
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Problem Brief
                </CardTitle>
                <CardDescription>Tell us what you need built</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name *</Label>
                      <Input id="company" value={form.company_name} onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Your Company" required maxLength={200} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Contact Name *</Label>
                      <Input id="name" value={form.contact_name} onChange={(e) => setForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="Your Name" required maxLength={200} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={form.contact_email} onChange={(e) => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="you@company.com" required maxLength={255} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" value={form.website} onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." maxLength={500} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="problem">Describe Your Problem *</Label>
                    <Textarea id="problem" value={form.problem_description} onChange={(e) => setForm(f => ({ ...f, problem_description: e.target.value }))} placeholder="What do you need built? What problem are you trying to solve? Any specific technologies?" rows={5} required maxLength={5000} />
                    <p className="text-xs text-muted-foreground">{form.problem_description.length}/5000</p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Project Tier</Label>
                    <RadioGroup value={form.prototype_tier} onValueChange={(v) => setForm(f => ({ ...f, prototype_tier: v }))}>
                      {tiers.map((tier) => (
                        <label key={tier.value} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value={tier.value} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{tier.label}</span>
                              <Badge variant="secondary">{tier.budget}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {tier.milestones} milestones · {tier.duration}
                            </p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range (optional)</Label>
                    <Input id="budget" value={form.budget_range} onChange={(e) => setForm(f => ({ ...f, budget_range: e.target.value }))} placeholder="e.g., PKR 100K–200K" maxLength={100} />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? "Submitting..." : <>Submit Problem Brief <Send className="h-4 w-4 ml-2" /></>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold">Why Fund FYP Projects?</h3>
                {[
                  { icon: DollarSign, text: "5x cheaper than agencies" },
                  { icon: Shield, text: "Escrow-protected funds" },
                  { icon: CheckCircle, text: "Milestone-controlled releases" },
                  { icon: Building2, text: "Faculty-supervised quality" },
                  { icon: Clock, text: "6–16 week delivery" },
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
                <p className="text-sm font-semibold mb-2">Pilot Sponsor Offer</p>
                <p className="text-xs text-muted-foreground mb-3">
                  First 10 sponsors get 0% platform fee + featured sponsor badge + public case study spotlight.
                </p>
                <Badge>Limited Spots</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
