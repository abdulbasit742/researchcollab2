import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSchemaVersioning } from "@/hooks/useSchemaVersioning";
import { format } from "date-fns";
import { 
  Database, 
  GitBranch, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  Shield,
  History,
  FileCode
} from "lucide-react";

export default function AdminSchemaPage() {
  const { versions, changes, activeVersion, loading, pendingDeprecations, breakingChanges, isRollbackReady } = useSchemaVersioning();

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            Schema Governance
          </h1>
          <p className="text-muted-foreground">
            Database versioning, migrations, and backward compatibility tracking
          </p>
        </div>

        {/* Active Version Banner */}
        {activeVersion && (
          <Alert className="border-primary/50 bg-primary/5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertTitle className="flex items-center gap-2">
              Active Schema Version: <span className="font-mono">{activeVersion.version}</span>
            </AlertTitle>
            <AlertDescription>
              {activeVersion.description} • Applied {format(new Date(activeVersion.applied_at), "PPp")}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Total Versions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{versions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                Schema Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{changes.length}</div>
            </CardContent>
          </Card>

          <Card className={pendingDeprecations.length > 0 ? "border-amber-500/50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Deprecations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${pendingDeprecations.length > 0 ? "text-amber-600" : ""}`}>
                {pendingDeprecations.length}
              </div>
            </CardContent>
          </Card>

          <Card className={!isRollbackReady ? "border-destructive/50" : "border-emerald-500/50"}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Rollback Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={isRollbackReady ? "default" : "destructive"}>
                {isRollbackReady ? "Ready" : "Not Configured"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Breaking Changes Warning */}
        {breakingChanges.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Breaking Changes Detected</AlertTitle>
            <AlertDescription>
              {breakingChanges.length} schema change(s) are not backward compatible. 
              Ensure all clients are updated before removing deprecated fields.
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs defaultValue="versions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="versions"><GitBranch className="h-4 w-4 mr-2" />Versions</TabsTrigger>
            <TabsTrigger value="changes"><History className="h-4 w-4 mr-2" />Change Log</TabsTrigger>
            <TabsTrigger value="compatibility"><Shield className="h-4 w-4 mr-2" />Compatibility</TabsTrigger>
          </TabsList>

          <TabsContent value="versions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
                <CardDescription>All database schema versions applied to this environment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {versions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No versions recorded yet</p>
                  ) : (
                    versions.map((version, index) => (
                      <div 
                        key={version.id} 
                        className={`flex items-start gap-4 p-4 border rounded-lg ${
                          version.is_active ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <div className={`p-2 rounded-full ${
                          version.is_active ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}>
                          <GitBranch className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-lg">{version.version}</span>
                            {version.is_active && (
                              <Badge>Active</Badge>
                            )}
                            {version.rollback_sql && (
                              <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                                Rollback Ready
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mt-1">{version.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Applied {format(new Date(version.applied_at), "PPpp")}
                          </p>
                        </div>
                        {index < versions.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="changes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Schema Change Log</CardTitle>
                <CardDescription>Detailed record of all structural database changes</CardDescription>
              </CardHeader>
              <CardContent>
                {changes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No changes recorded yet</p>
                ) : (
                  <div className="space-y-3">
                    {changes.map((change) => (
                      <div 
                        key={change.id} 
                        className={`p-4 border rounded-lg ${
                          !change.backward_compatible ? "border-amber-500/50 bg-amber-500/5" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{change.change_type}</Badge>
                          {change.table_name && (
                            <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                              {change.table_name}
                            </span>
                          )}
                          {!change.backward_compatible && (
                            <Badge variant="destructive">Breaking Change</Badge>
                          )}
                        </div>
                        {change.deprecation_notice && (
                          <Alert className="mt-3" variant="default">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Deprecation:</strong> {change.deprecation_notice}
                              {change.deprecation_deadline && (
                                <span className="block text-xs mt-1">
                                  Deadline: {format(new Date(change.deprecation_deadline), "PPP")}
                                </span>
                              )}
                            </AlertDescription>
                          </Alert>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(change.created_at), "PPpp")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compatibility" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    Compatibility Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="p-3 bg-muted rounded-lg">
                    <strong>Additive-First Policy</strong>
                    <p className="text-muted-foreground">Always add new columns before removing old ones.</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <strong>Nullable New Fields</strong>
                    <p className="text-muted-foreground">New columns must be nullable until fully rolled out.</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <strong>Deprecation Window</strong>
                    <p className="text-muted-foreground">Minimum 30 days before removing deprecated fields.</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <strong>Zero-Downtime Migrations</strong>
                    <p className="text-muted-foreground">Avoid table locks; use batched backfills.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Current Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Active Version</span>
                    <Badge variant="default" className="font-mono">
                      {activeVersion?.version || "None"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Backward Compatible</span>
                    <Badge variant={breakingChanges.length === 0 ? "default" : "destructive"}>
                      {breakingChanges.length === 0 ? "Yes" : `${breakingChanges.length} Breaking`}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Rollback Available</span>
                    <Badge variant={isRollbackReady ? "default" : "secondary"}>
                      {isRollbackReady ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Pending Deprecations</span>
                    <Badge variant={pendingDeprecations.length > 0 ? "outline" : "default"}>
                      {pendingDeprecations.length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
