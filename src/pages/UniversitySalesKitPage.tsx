import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, FileText, Calculator, Mail, ClipboardList, Play, Users, TrendingUp, Download, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const KIT_ITEMS = [
  { id: "overview", label: "One-Page Platform Overview", icon: FileText, desc: "Auto-generated PDF summarizing RCollab for decision-makers" },
  { id: "demo", label: "Demo Mode Login", icon: Play, desc: "Sample data environment for live university demos" },
  { id: "workflow", label: "FYP Funding Workflow Visual", icon: TrendingUp, desc: "Step-by-step visual: Problem → Fund → Execute → Hire" },
  { id: "supervisor", label: "Supervisor Dashboard Preview", icon: Users, desc: "Show faculty what their monitoring experience looks like" },
  { id: "impact", label: "Institutional Impact Calculator", icon: Calculator, desc: "Project economic output, student employability, and ROI" },
  { id: "casestudy", label: "Case Study Template", icon: FileText, desc: "Fill-in template for completed project case studies" },
  { id: "mou", label: "MoU Draft Generator", icon: ClipboardList, desc: "Pre-filled memorandum of understanding for pilot partnerships" },
  { id: "email", label: "Email Pitch Templates", icon: Mail, desc: "Cold outreach, follow-up, and demo request email templates" },
  { id: "roi", label: "ROI Projection Calculator", icon: Calculator, desc: "Show universities projected outcomes over 6-12 months" },
  { id: "checklist", label: "Admin Onboarding Checklist", icon: ClipboardList, desc: "Step-by-step guide for university admin integration" },
];

const ONBOARDING_STEPS = [
  "Sign institutional MoU",
  "Create organization account",
  "Assign FYP coordinator",
  "Import student roster",
  "Configure department structure",
  "Set up supervisor accounts",
  "Create first FYP batch",
  "Connect corporate sponsor",
  "Run pilot orientation session",
  "Monitor first milestone cycle",
];

export default function UniversitySalesKitPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const completedCount = Object.values(checked).filter(Boolean).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            University Sales Kit
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Everything you need to walk into a university meeting fully prepared
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
                University Onboarding Checklist
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

        {/* Quick ROI Preview */}
        <Card className="bg-muted/30 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Quick ROI Projection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Funded FYPs (Year 1)", value: "50–200" },
                { label: "Avg Escrow/FYP", value: "PKR 50K" },
                { label: "Student Employment ↑", value: "15–30%" },
                { label: "Sponsor Retention", value: "40–60%" },
              ].map((m) => (
                <div key={m.label} className="text-center p-3 rounded-lg border bg-background">
                  <p className="text-lg font-bold text-primary">{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
