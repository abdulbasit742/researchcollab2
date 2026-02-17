import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FundingDeclarationProps {
  onComplete?: () => void;
  className?: string;
}

export function FundingDeclaration({ onComplete, className }: FundingDeclarationProps) {
  const [source, setSource] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  const handleSubmit = () => {
    if (!source || !acknowledged) return;
    toast.success("Funding declaration submitted");
    onComplete?.();
  };

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Funding Source Declaration</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          As part of our compliance requirements, sponsors must declare the source of funding before escrow activation.
        </p>

        <div className="space-y-2">
          <Label className="text-sm">Funding Source</Label>
          <Input
            placeholder="e.g., Corporate R&D budget, CSR Fund, Innovation Grant"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-border p-3">
          <Checkbox
            id="compliance"
            checked={acknowledged}
            onCheckedChange={(checked) => setAcknowledged(checked === true)}
            className="mt-0.5"
          />
          <Label htmlFor="compliance" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
            I confirm that the funding source declared is accurate and complies with all applicable laws and regulations. I understand that misrepresentation may result in account suspension and legal action.
          </Label>
        </div>

        <Button onClick={handleSubmit} disabled={!source || !acknowledged} className="w-full">
          <CheckCircle className="h-4 w-4 mr-1.5" />
          Submit Declaration
        </Button>
      </CardContent>
    </Card>
  );
}
