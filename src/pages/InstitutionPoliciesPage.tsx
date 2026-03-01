import { usePolicyAcknowledgments } from "@/hooks/usePolicyAcknowledgments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, FileText } from "lucide-react";
import { toast } from "sonner";

const POLICIES = [
  { version: "tos-v1.0", title: "Terms of Service", description: "Platform usage terms and conditions" },
  { version: "privacy-v1.0", title: "Privacy Policy", description: "Data handling and protection policy" },
  { version: "aup-v1.0", title: "Acceptable Use Policy", description: "Standards of conduct and prohibited activities" },
  { version: "data-retention-v1.0", title: "Data Retention Policy", description: "How long data is stored and archived" },
  { version: "ip-v1.0", title: "Intellectual Property Policy", description: "Ownership and licensing of work products" },
];

export default function InstitutionPoliciesPage() {
  const { acknowledgments, hasAcknowledged, acknowledge, isLoading } = usePolicyAcknowledgments();

  const handleAcknowledge = (version: string) => {
    acknowledge({ policyVersion: version });
    toast.success("Policy acknowledged");
  };

  const acknowledgedCount = POLICIES.filter((p) => hasAcknowledged(p.version)).length;

  return (
    <div className="min-h-screen bg-background p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Policy Acknowledgments
        </h1>
        <p className="text-sm text-muted-foreground">
          Review and acknowledge platform policies ({acknowledgedCount}/{POLICIES.length} completed)
        </p>
      </div>

      <div className="space-y-3">
        {POLICIES.map((policy) => {
          const acked = hasAcknowledged(policy.version);
          return (
            <Card key={policy.version} className={acked ? "opacity-75" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {acked ? (
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-semibold text-foreground">{policy.title}</h3>
                        <Badge variant="secondary" className="text-[10px]">{policy.version}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{policy.description}</p>
                    </div>
                  </div>
                  {!acked && (
                    <Button size="sm" onClick={() => handleAcknowledge(policy.version)} disabled={isLoading}>
                      Acknowledge
                    </Button>
                  )}
                  {acked && (
                    <span className="text-[10px] text-muted-foreground shrink-0">Acknowledged</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
