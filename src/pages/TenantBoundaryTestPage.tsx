import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, XCircle, Clock } from "lucide-react";

interface SecurityTest {
  id: string;
  test_type: string;
  passed: boolean;
  details: string | null;
  checked_at: string;
}

interface BoundaryAudit {
  id: string;
  table_name: string;
  tenant_column_present: boolean;
  rls_enforced: boolean;
  issue_detected: string | null;
  checked_at: string;
}

export default function TenantBoundaryTestPage() {
  const { data: tests = [], isLoading: testsLoading } = useQuery({
    queryKey: ["tenant-security-tests"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tenant_security_tests")
        .select("*")
        .order("checked_at", { ascending: false })
        .limit(50);
      return (data ?? []) as SecurityTest[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: audits = [], isLoading: auditsLoading } = useQuery({
    queryKey: ["tenant-boundary-audit"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tenant_boundary_audit")
        .select("*")
        .order("checked_at", { ascending: false })
        .limit(100);
      return (data ?? []) as BoundaryAudit[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const passedCount = tests.filter((t) => t.passed).length;
  const failedCount = tests.filter((t) => !t.passed).length;
  const rlsIssues = audits.filter((a) => !a.rls_enforced).length;

  return (
    <div className="min-h-screen bg-background p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Tenant Boundary Tests
        </h1>
        <p className="text-sm text-muted-foreground">Cross-tenant isolation verification</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-emerald-600" />
            <p className="text-2xl font-bold text-foreground">{passedCount}</p>
            <p className="text-xs text-muted-foreground">Tests Passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-5 w-5 mx-auto mb-2 text-destructive" />
            <p className="text-2xl font-bold text-foreground">{failedCount}</p>
            <p className="text-xs text-muted-foreground">Tests Failed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-5 w-5 mx-auto mb-2 text-amber-600" />
            <p className="text-2xl font-bold text-foreground">{rlsIssues}</p>
            <p className="text-xs text-muted-foreground">RLS Issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Tests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Security Tests</CardTitle>
        </CardHeader>
        <CardContent>
          {testsLoading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
          ) : tests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No tests recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {tests.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    {t.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <span className="text-sm font-medium text-foreground">{t.test_type.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.details && <span className="text-xs text-muted-foreground">{t.details}</span>}
                    <Badge variant={t.passed ? "secondary" : "destructive"} className="text-[10px]">
                      {t.passed ? "PASS" : "FAIL"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boundary Audit */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tenant Boundary Audit</CardTitle>
        </CardHeader>
        <CardContent>
          {auditsLoading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
          ) : audits.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No audit records yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-4 text-xs text-muted-foreground font-medium">Table</th>
                    <th className="py-2 pr-4 text-xs text-muted-foreground font-medium">Tenant Col</th>
                    <th className="py-2 pr-4 text-xs text-muted-foreground font-medium">RLS</th>
                    <th className="py-2 text-xs text-muted-foreground font-medium">Issue</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((a) => (
                    <tr key={a.id} className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs text-foreground">{a.table_name}</td>
                      <td className="py-2 pr-4">
                        {a.tenant_column_present ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-destructive" />
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        {a.rls_enforced ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-destructive" />
                        )}
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">{a.issue_detected ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
