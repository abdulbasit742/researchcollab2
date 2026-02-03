import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useKnowledgePreservation } from "@/hooks/useKnowledgePreservation";
import { useAuth } from "@/contexts/AuthContext";
import { Brain, GitBranch, Archive, AlertTriangle, Plus, Network, BookOpen, Lightbulb, FileWarning } from "lucide-react";
import { format } from "date-fns";

export default function KnowledgePage() {
  const { user } = useAuth();
  const {
    researchLineage,
    ideaEvolution,
    knowledgeSnapshots,
    negativeResults,
    loading,
    getKnowledgeStats,
    contributeIdea,
    submitNegativeResult,
    refresh,
  } = useKnowledgePreservation();

  const [ideaOpen, setIdeaOpen] = useState(false);
  const [negativeOpen, setNegativeOpen] = useState(false);
  const [newIdea, setNewIdea] = useState({
    idea_identifier: "",
    title: "",
    description: "",
    field: "",
    evolution_type: "refinement",
    contributors: [] as string[],
    related_projects: [] as string[],
    evidence_links: [] as string[],
  });
  const [newNegative, setNewNegative] = useState({
    hypothesis: "",
    methodology: "",
    expected_outcome: "",
    actual_outcome: "",
    why_it_failed: "",
    lessons_learned: "",
    field: "",
    is_public: true,
  });

  const stats = getKnowledgeStats();

  const handleContributeIdea = async () => {
    const success = await contributeIdea({
      ...newIdea,
      originated_from: null,
      impact_assessment: null,
    });
    if (success) {
      setIdeaOpen(false);
      setNewIdea({
        idea_identifier: "",
        title: "",
        description: "",
        field: "",
        evolution_type: "refinement",
        contributors: [],
        related_projects: [],
        evidence_links: [],
      });
    }
  };

  const handleSubmitNegative = async () => {
    const success = await submitNegativeResult({
      ...newNegative,
      researcher_id: user?.id || "",
      project_id: null,
      future_implications: null,
    });
    if (success) {
      setNegativeOpen(false);
      setNewNegative({
        hypothesis: "",
        methodology: "",
        expected_outcome: "",
        actual_outcome: "",
        why_it_failed: "",
        lessons_learned: "",
        field: "",
        is_public: true,
      });
    }
  };

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              Knowledge Graph
            </h1>
            <p className="text-muted-foreground mt-1">
              Explore research lineage, idea evolution, and preserved knowledge
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={ideaOpen} onOpenChange={setIdeaOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Contribute Idea
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Contribute an Idea</DialogTitle>
                  <DialogDescription>
                    Add to the evolution of scientific ideas
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Identifier</Label>
                      <Input
                        value={newIdea.idea_identifier}
                        onChange={(e) => setNewIdea({ ...newIdea, idea_identifier: e.target.value })}
                        placeholder="e.g., IDEA-2024-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Field</Label>
                      <Input
                        value={newIdea.field}
                        onChange={(e) => setNewIdea({ ...newIdea, field: e.target.value })}
                        placeholder="e.g., Machine Learning"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={newIdea.title}
                      onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                      placeholder="Enter idea title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newIdea.description}
                      onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                      placeholder="Describe the idea..."
                      rows={4}
                    />
                  </div>
                  <Button onClick={handleContributeIdea} className="w-full">
                    Contribute Idea
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={negativeOpen} onOpenChange={setNegativeOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FileWarning className="h-4 w-4 mr-2" />
                  Archive Negative Result
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Archive Negative Result</DialogTitle>
                  <DialogDescription>
                    Help prevent duplicate efforts by sharing what didn't work
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2">
                    <Label>Hypothesis</Label>
                    <Textarea
                      value={newNegative.hypothesis}
                      onChange={(e) => setNewNegative({ ...newNegative, hypothesis: e.target.value })}
                      placeholder="What did you hypothesize?"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Methodology</Label>
                    <Textarea
                      value={newNegative.methodology}
                      onChange={(e) => setNewNegative({ ...newNegative, methodology: e.target.value })}
                      placeholder="How did you test it?"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expected Outcome</Label>
                      <Textarea
                        value={newNegative.expected_outcome}
                        onChange={(e) => setNewNegative({ ...newNegative, expected_outcome: e.target.value })}
                        placeholder="What did you expect?"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Actual Outcome</Label>
                      <Textarea
                        value={newNegative.actual_outcome}
                        onChange={(e) => setNewNegative({ ...newNegative, actual_outcome: e.target.value })}
                        placeholder="What actually happened?"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Why It Failed</Label>
                    <Textarea
                      value={newNegative.why_it_failed}
                      onChange={(e) => setNewNegative({ ...newNegative, why_it_failed: e.target.value })}
                      placeholder="Your analysis of why it didn't work"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Field</Label>
                    <Input
                      value={newNegative.field}
                      onChange={(e) => setNewNegative({ ...newNegative, field: e.target.value })}
                      placeholder="Research field"
                    />
                  </div>
                  <Button onClick={handleSubmitNegative} className="w-full">
                    Archive Result
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <GitBranch className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalLineageRecords}</p>
                  <p className="text-sm text-muted-foreground">Lineage Records</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Lightbulb className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalIdeas}</p>
                  <p className="text-sm text-muted-foreground">Ideas Tracked</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Archive className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalSnapshots}</p>
                  <p className="text-sm text-muted-foreground">Snapshots</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalNegativeResults}</p>
                  <p className="text-sm text-muted-foreground">Negative Results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ideas" className="space-y-6">
          <TabsList>
            <TabsTrigger value="ideas">
              <Lightbulb className="h-4 w-4 mr-2" />
              Idea Evolution
            </TabsTrigger>
            <TabsTrigger value="lineage">
              <GitBranch className="h-4 w-4 mr-2" />
              Research Lineage
            </TabsTrigger>
            <TabsTrigger value="negative">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Negative Results
            </TabsTrigger>
            <TabsTrigger value="snapshots">
              <Archive className="h-4 w-4 mr-2" />
              Snapshots
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ideas" className="space-y-4">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : ideaEvolution.length === 0 ? (
              <Card className="p-12 text-center">
                <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No ideas yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to contribute to the idea evolution graph
                </p>
                <Button onClick={() => setIdeaOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Contribute Idea
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {ideaEvolution.map((idea) => (
                  <Card key={idea.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{idea.title}</CardTitle>
                          <CardDescription>{idea.idea_identifier}</CardDescription>
                        </div>
                        <Badge variant="outline">{idea.field}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {idea.description}
                      </p>
                      {idea.contributors.length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs text-muted-foreground">
                            {idea.contributors.length} contributor(s)
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="lineage" className="space-y-4">
            {loading ? (
              <Skeleton className="h-64" />
            ) : researchLineage.length === 0 ? (
              <Card className="p-12 text-center">
                <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No lineage records</h3>
                <p className="text-muted-foreground">
                  Research lineage records will appear here
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {researchLineage.map((lineage) => (
                  <Card key={lineage.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                          <Network className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{lineage.relationship_type} relationship</p>
                          <p className="text-sm text-muted-foreground">
                            {lineage.field_of_study || "General"} • {lineage.contributions || "No contributions noted"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={lineage.verified ? "default" : "secondary"}>
                        {lineage.verified ? "Verified" : "Pending"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="negative" className="space-y-4">
            {loading ? (
              <Skeleton className="h-64" />
            ) : negativeResults.length === 0 ? (
              <Card className="p-12 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No negative results archived</h3>
                <p className="text-muted-foreground mb-4">
                  Help the community by sharing what didn't work
                </p>
                <Button onClick={() => setNegativeOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Archive a Result
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {negativeResults.map((result) => (
                  <Card key={result.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">Hypothesis Test</CardTitle>
                        <Badge variant="outline">{result.field}</Badge>
                      </div>
                      <CardDescription>{result.hypothesis}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Why it failed:</p>
                        <p className="text-sm text-muted-foreground">{result.why_it_failed}</p>
                      </div>
                      {result.lessons_learned && (
                        <div>
                          <p className="text-sm font-medium">Lessons learned:</p>
                          <p className="text-sm text-muted-foreground">{result.lessons_learned}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{result.replication_attempts} replication attempts</span>
                        <span>{format(new Date(result.created_at), "PPP")}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="snapshots" className="space-y-4">
            {loading ? (
              <Skeleton className="h-64" />
            ) : knowledgeSnapshots.length === 0 ? (
              <Card className="p-12 text-center">
                <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No snapshots</h3>
                <p className="text-muted-foreground">
                  Knowledge snapshots will appear here
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {knowledgeSnapshots.map((snapshot) => (
                  <Card key={snapshot.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                          <Archive className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{snapshot.snapshot_type} Snapshot</p>
                          <p className="text-sm text-muted-foreground">
                            {snapshot.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(snapshot.snapshot_date), "PPP")}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{snapshot.format_version}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
