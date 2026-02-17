import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, FileText, Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const ipModels = [
  {
    value: "sponsor_owned",
    label: "Sponsor-Owned IP",
    description: "Full intellectual property rights transfer to the sponsoring organization.",
    icon: "🏢",
  },
  {
    value: "student_owned",
    label: "Student-Owned IP",
    description: "Students retain full ownership. Sponsor receives usage license.",
    icon: "🎓",
  },
  {
    value: "shared",
    label: "Shared IP",
    description: "Joint ownership between sponsor and student team with agreed usage rights.",
    icon: "🤝",
  },
  {
    value: "license",
    label: "License Model",
    description: "Student retains ownership, grants exclusive or non-exclusive license to sponsor.",
    icon: "📄",
  },
  {
    value: "royalty",
    label: "Royalty-Based",
    description: "Student retains ownership with revenue-sharing arrangement based on commercialization.",
    icon: "💰",
  },
];

interface IPContractFlowProps {
  onComplete?: (model: string) => void;
  className?: string;
}

export function IPContractFlow({ onComplete, className }: IPContractFlowProps) {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [step, setStep] = useState<"select" | "review" | "sign">("select");
  const [agreed, setAgreed] = useState(false);

  const selectedConfig = ipModels.find((m) => m.value === selectedModel);

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">IP Agreement</CardTitle>
        </div>
        <div className="flex gap-2 mt-3">
          {["select", "review", "sign"].map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium border",
                step === s ? "bg-primary text-primary-foreground border-primary" :
                  (["select", "review", "sign"].indexOf(step) > i ? "bg-success text-white border-success" : "bg-muted text-muted-foreground border-border")
              )}>
                {["select", "review", "sign"].indexOf(step) > i ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className="text-xs text-muted-foreground capitalize hidden sm:inline">{s === "select" ? "Select Model" : s === "review" ? "Review Terms" : "Sign"}</span>
              {i < 2 && <div className="w-6 h-px bg-border hidden sm:block" />}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "select" && (
          <>
            <RadioGroup value={selectedModel} onValueChange={setSelectedModel} className="space-y-2">
              {ipModels.map((model) => (
                <Label
                  key={model.value}
                  htmlFor={model.value}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                    selectedModel === model.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem value={model.value} id={model.value} className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{model.icon}</span>
                      <span className="text-sm font-medium">{model.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{model.description}</p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
            <Button
              onClick={() => setStep("review")}
              disabled={!selectedModel}
              className="w-full"
            >
              Continue to Review
            </Button>
          </>
        )}

        {step === "review" && selectedConfig && (
          <>
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Contract Preview</span>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IP Model</span>
                  <Badge variant="outline">{selectedConfig.label}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ownership</span>
                  <span className="font-medium">{selectedConfig.value === "sponsor_owned" ? "Sponsor" : selectedConfig.value === "student_owned" ? "Student" : "Joint"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Effective Date</span>
                  <span className="font-medium">Upon escrow activation</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-2 bg-warning/5 border border-warning/20 rounded-md p-2.5">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  This agreement is binding once all parties sign. Escrow will not activate until this contract is fully executed.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("select")} className="flex-1">Back</Button>
              <Button onClick={() => setStep("sign")} className="flex-1">Proceed to Sign</Button>
            </div>
          </>
        )}

        {step === "sign" && (
          <>
            <div className="rounded-lg border border-border p-4 space-y-3">
              <Label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-xs text-muted-foreground">
                  I acknowledge and agree to the terms of this IP agreement. I understand that this contract will be digitally recorded and associated with the escrow for this FYP project.
                </span>
              </Label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("review")} className="flex-1">Back</Button>
              <Button
                disabled={!agreed}
                onClick={() => onComplete?.(selectedModel)}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Sign Agreement
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
