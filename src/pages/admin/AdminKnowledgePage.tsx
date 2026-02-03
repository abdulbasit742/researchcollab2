import { AdminLayout } from "@/components/admin/AdminLayout";
import { useKnowledgePreservation } from "@/hooks/useKnowledgePreservation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Users, 
  Lightbulb,
  Archive,
  AlertCircle,
  Loader2,
  CheckCircle2,
  GitBranch,
  Plus
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function AdminKnowledgePage() {
  const {
    researchLineage,
    ideaEvolution,
    knowledgeSnapshots,
    negativeResults,
    loading,
    getKnowledgeStats,
  } = useKnowledgePreservation();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const stats = getKnowledgeStats();

  const getRelationshipBadge = (type: string) => {
    switch (type) {
      case "supervisor": return <Badge className="bg-purple-500/10 text-purple-500">Supervisor</Badge>;
      case "collaborator": return <Badge className="bg-blue-500/10 text-blue-500">Collaborator</Badge>;
      case "advisor": return <Badge className="bg-green-500/10 text-green-500">Advisor</Badge>;
      case "reviewer": return <Badge className="bg-amber-500/10 text-amber-500">Reviewer</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getEvolutionBadge = (type: string | null) => {
    switch (type) {
      case "refinement": return <Badge className="bg-blue-500/10 text-blue-500">Refinement</Badge>;
      case "contradiction": return <Badge className="bg-red-500/10 text-red-500">Contradiction</Badge>;
      case "synthesis": return <Badge className="bg-purple-500/10 text-purple-500">Synthesis</Badge>;
      case "application": return <Badge className="bg-green-500/10 text-green-500">Application</Badge>;
      default: return <Badge variant="outline">Original</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Knowledge Preservation</h1>
            <p className="text-muted-foreground">
              Research lineage, idea evolution, and historical memory
            </p>
          </div>
          <Button>
            <Archive className="h-4 w-4 mr-2" />
            Create Snapshot
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lineage Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLineageRecords}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ideas Tracked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalIdeas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Snapshots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSnapshots}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Negative Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalNegativeResults}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fields Covered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.uniqueFields}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="lineage" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lineage">Research Lineage</TabsTrigger>
            <TabsTrigger value="ideas">Idea Evolution</TabsTrigger>
            <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
            <TabsTrigger value="negative">Negative Results</TabsTrigger>
          </TabsList>

          <TabsContent value="lineage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Academic Ancestry
                </CardTitle>
                <CardDescription>
                  Mentor-mentee relationships and academic lineage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {researchLineage.length === 0 ? (
                  <div className="py-8 text-center">
                    <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Lineage Records</h3>
                    <p className="text-muted-foreground mb-4">
                      Research lineage preserves academic ancestry
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lineage Record
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {researchLineage.map((lineage) => (
                      <div key={lineage.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {getRelationshipBadge(lineage.relationship_type)}
                              {lineage.verified && (
                                <Badge className="bg-green-500/10 text-green-500">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {lineage.field_of_study || "Field not specified"}
                            </p>
                            {lineage.started_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(lineage.started_at), "yyyy")}
                                {lineage.ended_at && ` - ${format(new Date(lineage.ended_at), "yyyy")}`}
                              </p>
                            )}
                            {lineage.contributions && (
                              <p className="text-sm mt-2">{lineage.contributions}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ideas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Idea Evolution Graph
                </CardTitle>
                <CardDescription>
                  How concepts develop and influence each other
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ideaEvolution.length === 0 ? (
                  <div className="py-8 text-center">
                    <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Ideas Tracked</h3>
                    <p className="text-muted-foreground mb-4">
                      Track how ideas evolve over time
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Contribute Idea
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ideaEvolution.map((idea) => (
                      <div key={idea.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{idea.title}</h4>
                              {getEvolutionBadge(idea.evolution_type)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Field: {idea.field}
                            </p>
                            <p className="text-sm mt-2">{idea.description}</p>
                            {idea.impact_assessment && (
                              <p className="text-sm text-primary mt-2">
                                Impact: {idea.impact_assessment}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="snapshots" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Knowledge Time Capsules
                </CardTitle>
                <CardDescription>
                  Preserved states of platform knowledge
                </CardDescription>
              </CardHeader>
              <CardContent>
                {knowledgeSnapshots.length === 0 ? (
                  <div className="py-8 text-center">
                    <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Snapshots</h3>
                    <p className="text-muted-foreground mb-4">
                      Create knowledge snapshots for future generations
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Snapshot
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {knowledgeSnapshots.map((snapshot) => (
                      <div key={snapshot.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="capitalize">{snapshot.snapshot_type}</Badge>
                              <span className="text-sm font-medium">
                                {format(new Date(snapshot.snapshot_date), "PPP")}
                              </span>
                            </div>
                            <p className="text-sm">{snapshot.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Format: {snapshot.format_version} • Scope: {snapshot.data_scope.join(", ")}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="negative" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Negative Results Archive
                </CardTitle>
                <CardDescription>
                  Failed research is valuable - learn what didn't work
                </CardDescription>
              </CardHeader>
              <CardContent>
                {negativeResults.length === 0 ? (
                  <div className="py-8 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Negative Results</h3>
                    <p className="text-muted-foreground mb-4">
                      Document what didn't work to help others
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Negative Result
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {negativeResults.map((result) => (
                      <div key={result.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <Badge variant="outline">{result.field}</Badge>
                            <div>
                              <h4 className="font-medium">Hypothesis</h4>
                              <p className="text-sm text-muted-foreground">{result.hypothesis}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-red-500">Why It Failed</h4>
                              <p className="text-sm">{result.why_it_failed}</p>
                            </div>
                            {result.lessons_learned && (
                              <div>
                                <h4 className="font-medium text-green-500">Lessons Learned</h4>
                                <p className="text-sm">{result.lessons_learned}</p>
                              </div>
                            )}
                            {result.replication_attempts > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Replication attempts: {result.replication_attempts}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
