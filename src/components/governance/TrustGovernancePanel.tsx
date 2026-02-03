import { useTrustRules, useTrustCalculationBreakdown, useTrustAuditLog, useTrustAlgorithmVersion } from "@/hooks/useTrustGovernance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Scale,
  Shield,
  FileText,
  History,
  Info,
  CheckCircle,
  AlertTriangle,
  MinusCircle,
  Lock,
} from "lucide-react";

export function TrustGovernancePanel() {
  const { data: rules, isLoading: rulesLoading } = useTrustRules();
  const { data: breakdown, isLoading: breakdownLoading } = useTrustCalculationBreakdown();
  const { data: auditLog, isLoading: auditLoading } = useTrustAuditLog();
  const { data: version, isLoading: versionLoading } = useTrustAlgorithmVersion();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "earning": return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "penalty": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "decay": return <MinusCircle className="h-4 w-4 text-amber-500" />;
      case "gate": return <Lock className="h-4 w-4 text-primary" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Trust Governance
          </h2>
          <p className="text-sm text-muted-foreground">
            How your trust score is calculated — fully transparent.
          </p>
        </div>
        {version && (
          <Badge variant="outline" className="gap-1">
            <FileText className="h-3 w-3" />
            Algorithm v{version.version}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList>
          <TabsTrigger value="breakdown">My Breakdown</TabsTrigger>
          <TabsTrigger value="rules">Trust Rules</TabsTrigger>
          <TabsTrigger value="history">Audit Log</TabsTrigger>
          <TabsTrigger value="changelog">Changelog</TabsTrigger>
        </TabsList>

        {/* Your Score Breakdown */}
        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Trust Score Breakdown</CardTitle>
              <CardDescription>
                See exactly how each component contributes to your score
              </CardDescription>
            </CardHeader>
            <CardContent>
              {breakdownLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : breakdown && breakdown.length > 0 ? (
                <div className="space-y-4">
                  {breakdown.map((item) => (
                    <div key={item.component} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{item.component}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{item.currentValue}</span>
                          <span className="text-xs text-muted-foreground">/ {item.maxValue}</span>
                        </div>
                      </div>
                      <Progress value={(item.currentValue / item.maxValue) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">{item.explanation}</p>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total Trust Score</span>
                      <span className="text-2xl font-bold text-primary">
                        {breakdown.reduce((acc, b) => acc + b.contribution, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Complete your profile and projects to see your trust breakdown.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trust Rules */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trust Calculation Rules</CardTitle>
              <CardDescription>
                These rules determine how trust is earned, lost, and gated
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rulesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {rules?.map((rule) => (
                    <div key={rule.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                      {getCategoryIcon(rule.rule_category)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{rule.rule_name}</h4>
                          <Badge variant={
                            rule.rule_category === "earning" ? "default" :
                            rule.rule_category === "penalty" ? "destructive" :
                            "secondary"
                          } className="text-xs capitalize">
                            {rule.rule_category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded mt-1 inline-block">
                          {rule.formula}
                        </code>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={
                          rule.weight > 0 ? "text-emerald-600" : rule.weight < 0 ? "text-destructive" : ""
                        }>
                          {rule.weight > 0 ? "+" : ""}{rule.weight}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" />
                Trust Audit Log
              </CardTitle>
              <CardDescription>
                Complete history of your trust score changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : auditLog && auditLog.length > 0 ? (
                <div className="space-y-2">
                  {auditLog.slice(0, 20).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-2 rounded-lg border text-sm">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          entry.delta > 0 ? "bg-emerald-500/10 text-emerald-600" :
                          entry.delta < 0 ? "bg-destructive/10 text-destructive" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {entry.delta > 0 ? "+" : ""}{entry.delta}
                        </div>
                        <div>
                          <p className="font-medium">{entry.rule_applied}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.trust_before} → {entry.trust_after}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No trust events recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Changelog */}
        <TabsContent value="changelog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Algorithm Changelog</CardTitle>
              <CardDescription>
                History of changes to the trust calculation system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {versionLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : version ? (
                <div className="space-y-4">
                  {version.changelog.map((entry) => (
                    <div key={entry.version} className="p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>v{entry.version}</Badge>
                        <span className="text-sm text-muted-foreground">{entry.date}</span>
                      </div>
                      <ul className="space-y-1">
                        {entry.changes.map((change, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground text-center">
                    Next review scheduled: {version.nextReviewDate}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
