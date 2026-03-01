import { useDepartments } from "@/hooks/useInstitutionalExpansion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Activity } from "lucide-react";

const INST_ID = "00000000-0000-0000-0000-000000000001";

export default function DepartmentComparisonPage() {
  const { data: departments = [] } = useDepartments(INST_ID);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Department Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Department structure and performance insights</p>
      </div>

      {departments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No departments configured yet. Add departments from the onboarding page.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {departments.map((d: any) => (
            <Card key={d.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{d.department_name}</p>
                    {d.department_code && (
                      <p className="text-xs text-muted-foreground">{d.department_code}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-[10px]">Active</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> —</span>
                  <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> —</span>
                  <span className="text-[10px]">Created {new Date(d.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
