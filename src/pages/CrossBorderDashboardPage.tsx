import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCrossBorderProjects } from "@/hooks/useSovereignFederation";
import { Globe2, ArrowLeftRight, ShieldAlert, CheckCircle } from "lucide-react";

export default function CrossBorderDashboardPage() {
  const { data: projects, isLoading } = useCrossBorderProjects();
  const list = projects ?? [];

  const activeCount = list.filter((p: any) => p.status === "active").length;
  const flaggedCount = list.filter((p: any) => p.regulatory_flag !== "clear").length;
  const avgTrust = list.length
    ? Math.round(list.reduce((s: number, p: any) => s + (p.cross_border_trust_score || 0), 0) / list.length)
    : 0;

  const countriesInvolved = new Set(list.flatMap((p: any) => [p.origin_country, p.partner_country])).size;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Globe2 className="h-8 w-8 text-primary" />
            Cross-Border Collaboration Engine
          </h1>
          <p className="text-muted-foreground mt-1">International research collaboration tracking and regulatory intelligence</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <ArrowLeftRight className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{list.length}</p>
            <p className="text-xs text-muted-foreground">Total Projects</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <ShieldAlert className="h-5 w-5 mx-auto mb-1 text-amber-600" />
            <p className="text-2xl font-bold text-amber-600">{flaggedCount}</p>
            <p className="text-xs text-muted-foreground">Regulatory Flags</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Globe2 className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{countriesInvolved}</p>
            <p className="text-xs text-muted-foreground">Countries Involved</p>
          </CardContent></Card>
        </div>

        <div className="space-y-3">
          {list.map((project: any) => (
            <Card key={project.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <span className="bg-primary/10 px-2 py-0.5 rounded text-primary">{project.origin_country}</span>
                      <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                      <span className="bg-primary/10 px-2 py-0.5 rounded text-primary">{project.partner_country}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={project.regulatory_flag === "clear" ? "default" : "destructive"}>
                      {project.regulatory_flag}
                    </Badge>
                    <Badge variant="secondary">Trust: {project.cross_border_trust_score}</Badge>
                    <Badge variant="outline">{project.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {list.length === 0 && !isLoading && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              No cross-border projects registered yet
            </CardContent></Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
