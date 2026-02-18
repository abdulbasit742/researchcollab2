import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Briefcase, FileText, Calculator, Shield, Users, TrendingUp, Download, CheckCircle2, DollarSign, Lock } from "lucide-react";
import { useState } from "react";

const KIT_ITEMS = [
  { id: "intake", label: "Problem Statement Intake Form", icon: FileText, desc: "Structured form for sponsors to define R&D challenges" },
  { id: "funding", label: "Quick Funding Flow Demo", icon: DollarSign, desc: "Live walkthrough of deposit → match → track → hire" },
  { id: "escrow", label: "Escrow Explanation Visual", icon: Lock, desc: "How funds are secured, milestones unlock payments" },
  { id: "ip", label: "IP Preference Selection Guide", icon: Shield, desc: "Open, shared, or exclusive IP models explained" },
  { id: "hiring", label: "Hiring Conversion Explanation", icon: Users, desc: "How funded projects convert into verified hires" },
  { id: "case", label: "Sample Funded FYP Case", icon: FileText, desc: "Real example of sponsor → project → outcome flow" },
  { id: "budget", label: "Budget Simulation Tool", icon: Calculator, desc: "Model allocation across projects with expected outcomes" },
  { id: "velocity", label: "Capital Velocity Explanation", icon: TrendingUp, desc: "How capital compounds through repeat sponsorship" },
  { id: "roi", label: "Sponsor ROI Calculator", icon: Calculator, desc: "Project hiring savings, R&D cost reduction, brand value" },
  { id: "checklist", label: "Corporate Onboarding Checklist", icon: CheckCircle2, desc: "Step-by-step sponsor activation guide" },
];

const ONBOARDING_STEPS = [
  "Sign sponsor agreement",
  "Create corporate account",
  "Deposit initial funding",
  "Define problem statements",
  "Review matched FYP teams",
  "Approve project proposals",
  "Set IP preferences",
  "Monitor first milestone",
  "Review deliverables",
  "Evaluate hiring candidates",
];

export default function CorporateSalesKitPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const completedCount = Object.values(checked).filter(Boolean).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Corporate Sponsor Sales Kit
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Make the sponsor decision frictionless — everything in one place
          </p>
        </div>

        {/* Kit Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {KIT_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.label}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0">
                      <Download className="h-3.5 w-3.5 mr-1" /> Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Onboarding Checklist */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Corporate Onboarding Checklist
              </CardTitle>
              <Badge variant="secondary">{completedCount}/{ONBOARDING_STEPS.length}</Badge>
            </div>
            <Progress value={(completedCount / ONBOARDING_STEPS.length) * 100} className="h-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ONBOARDING_STEPS.map((step, i) => (
                <label key={i} className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                  <Checkbox
                    checked={!!checked[`step-${i}`]}
                    onCheckedChange={(v) => setChecked(p => ({ ...p, [`step-${i}`]: !!v }))}
                  />
                  <span className="text-sm font-medium">{i + 1}. {step}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sponsor Value Props */}
        <Card className="bg-muted/30 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Why Sponsors Choose RCollab</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Escrow-Secured", desc: "Funds locked until milestones delivered — zero risk of wasted capital", icon: Lock },
                { title: "Hire from Pipeline", desc: "Convert top performers directly into hires — proven before interview", icon: Users },
                { title: "Measurable ROI", desc: "Track every dollar from deposit to outcome with full transparency", icon: TrendingUp },
              ].map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.title} className="p-4 rounded-lg border bg-background text-center">
                    <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold text-sm">{v.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{v.desc}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
