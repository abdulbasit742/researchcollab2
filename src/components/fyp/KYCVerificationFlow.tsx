import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, CheckCircle, Upload, Building2, Mail, CreditCard, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface KYCVerificationFlowProps {
  entityType: "sponsor" | "faculty" | "student";
  onComplete?: () => void;
  className?: string;
}

export function KYCVerificationFlow({ entityType, onComplete, className }: KYCVerificationFlowProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    businessEmail: "",
    companyRegistration: "",
    institutionEmail: "",
    studentId: "",
  });

  const steps = entityType === "sponsor"
    ? [
        { label: "Business Email", icon: Mail, field: "businessEmail", placeholder: "company@domain.com" },
        { label: "Company Registration", icon: Building2, field: "companyRegistration", placeholder: "Registration number (optional)" },
        { label: "Payment Method", icon: CreditCard, field: null, placeholder: "" },
        { label: "Legal Entity", icon: Shield, field: null, placeholder: "" },
      ]
    : entityType === "faculty"
    ? [
        { label: "Institutional Email", icon: Mail, field: "institutionEmail", placeholder: "name@university.edu" },
        { label: "Admin Approval", icon: Shield, field: null, placeholder: "" },
      ]
    : [
        { label: "Enrollment Validation", icon: User, field: "studentId", placeholder: "Student ID number" },
        { label: "ID Verification", icon: Shield, field: null, placeholder: "" },
      ];

  const handleSubmit = () => {
    toast.success("KYC verification submitted for review");
    onComplete?.();
  };

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">KYC Verification</CardTitle>
          </div>
          <Badge variant="outline" className="capitalize">{entityType}</Badge>
        </div>
        {/* Progress */}
        <div className="flex gap-1 mt-3">
          {steps.map((_, i) => (
            <div key={i} className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= step ? "bg-primary" : "bg-muted"
            )} />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          {(() => { const Icon = steps[step].icon; return <Icon className="h-5 w-5 text-primary" />; })()}
          <div>
            <p className="text-sm font-medium">{steps[step].label}</p>
            <p className="text-xs text-muted-foreground">Step {step + 1} of {steps.length}</p>
          </div>
        </div>

        {steps[step].field ? (
          <div className="space-y-2">
            <Label className="text-sm">{steps[step].label}</Label>
            <Input
              placeholder={steps[step].placeholder}
              value={formData[steps[step].field as keyof typeof formData]}
              onChange={(e) => setFormData({ ...formData, [steps[step].field!]: e.target.value })}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Upload supporting document</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, or PNG (max 5MB)</p>
            <Button variant="outline" size="sm" className="mt-3">
              Choose File
            </Button>
          </div>
        )}

        <Separator />

        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              Back
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} className="flex-1">
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Submit for Review
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
