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
import { useDisciplines, useInterdisciplinaryCalls, useInterdisciplinaryResponses, useFieldTranslations } from "@/hooks/useInterdisciplinary";
import { useAuth } from "@/contexts/AuthContext";
import { Layers, Plus, Search, Users, ArrowRightLeft, GitMerge, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export default function InterdisciplinaryPage() {
  const { user } = useAuth();
  const { disciplines, loading: disciplinesLoading } = useDisciplines();
  const { calls, loading: callsLoading, createCall, updateCallStatus } = useInterdisciplinaryCalls();
  const { translations, loading: translationsLoading, createTranslation } = useFieldTranslations();

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<string | null>(null);
  const [newCall, setNewCall] = useState({
    primary_discipline_id: "",
    missing_disciplines: [] as string[],
    problem_statement: "",
    collaboration_type: "research" as const,
    expected_duration: "3-6 months",
    visibility: "public" as const,
  });

  const handleCreateCall = async () => {
    const { data } = await createCall(newCall);
    if (data) {
      setCreateOpen(false);
      setNewCall({
        primary_discipline_id: "",
        missing_disciplines: [],
        problem_statement: "",
        collaboration_type: "research",
        expected_duration: "3-6 months",
        visibility: "public",
      });
    }
  };

  const getDisciplineName = (id: string) => {
    return disciplines.find((d) => d.id === id)?.name || "Unknown";
  };

  const collaborationTypeLabels: Record<string, string> = {
    research: "Joint Research",
    methodology: "Methodology Exchange",
    application: "Applied Research",
    translation: "Knowledge Translation",
  };

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Layers className="h-8 w-8 text-primary" />
              Interdisciplinary Collaboration
            </h1>
            <p className="text-muted-foreground mt-1">
              Bridge disciplines and find cross-domain research partners
            </p>
          </div>
          
          {user && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Collaboration Call
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Interdisciplinary Call</DialogTitle>
                  <DialogDescription>
                    Find experts from other disciplines to collaborate with
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Your Primary Discipline</Label>
                    <Select
                      value={newCall.primary_discipline_id}
                      onValueChange={(v) => setNewCall({ ...newCall, primary_discipline_id: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Select your discipline" /></SelectTrigger>
                      <SelectContent>
                        {disciplines.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Problem Statement</Label>
                    <Textarea
                      value={newCall.problem_statement}
                      onChange={(e) => setNewCall({ ...newCall, problem_statement: e.target.value })}
                      placeholder="Describe the interdisciplinary challenge you're facing..."
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Collaboration Type</Label>
                      <Select
                        value={newCall.collaboration_type}
                        onValueChange={(v: any) => setNewCall({ ...newCall, collaboration_type: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="research">Joint Research</SelectItem>
                          <SelectItem value="methodology">Methodology</SelectItem>
                          <SelectItem value="application">Application</SelectItem>
                          <SelectItem value="translation">Translation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Duration</Label>
                      <Input
                        value={newCall.expected_duration}
                        onChange={(e) => setNewCall({ ...newCall, expected_duration: e.target.value })}
                        placeholder="e.g., 3-6 months"
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateCall} className="w-full">
                    Post Collaboration Call
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{calls.length}</p>
                  <p className="text-sm text-muted-foreground">Active Calls</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <GitMerge className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{disciplines.length}</p>
                  <p className="text-sm text-muted-foreground">Disciplines</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <ArrowRightLeft className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{translations.length}</p>
                  <p className="text-sm text-muted-foreground">Translations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="calls" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calls">
              <Users className="h-4 w-4 mr-2" />
              Collaboration Calls
            </TabsTrigger>
            <TabsTrigger value="translations">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Field Translations
            </TabsTrigger>
            <TabsTrigger value="disciplines">
              <Layers className="h-4 w-4 mr-2" />
              Disciplines
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calls" className="space-y-4">
            {callsLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : calls.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active calls</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to post an interdisciplinary collaboration call
                </p>
                {user && (
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post a Call
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {calls.map((call) => (
                  <Card key={call.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant="outline" className="mb-2">
                            {call.primary_discipline?.name || "Unknown Discipline"}
                          </Badge>
                          <CardTitle className="text-lg">
                            {collaborationTypeLabels[call.collaboration_type]}
                          </CardTitle>
                        </div>
                        <Badge variant={call.status === "open" ? "default" : "secondary"}>
                          {call.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {call.problem_statement}
                      </p>
                      
                      {call.missing_disciplines.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Looking for:</p>
                          <div className="flex flex-wrap gap-1">
                            {call.missing_disciplines.slice(0, 3).map((id, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {getDisciplineName(id)}
                              </Badge>
                            ))}
                            {call.missing_disciplines.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{call.missing_disciplines.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>by {call.creator?.full_name || "Anonymous"}</span>
                        <span>{call.expected_duration}</span>
                      </div>

                      <Button variant="outline" className="w-full" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Respond to Call
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="translations" className="space-y-4">
            {translationsLoading ? (
              <Skeleton className="h-64" />
            ) : translations.length === 0 ? (
              <Card className="p-12 text-center">
                <ArrowRightLeft className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No field translations</h3>
                <p className="text-muted-foreground">
                  Knowledge translations between disciplines will appear here
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {translations.map((translation) => (
                  <Card key={translation.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4 mb-3">
                        <Badge variant="outline">
                          {getDisciplineName(translation.source_discipline_id)}
                        </Badge>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline">
                          {getDisciplineName(translation.target_discipline_id)}
                        </Badge>
                      </div>
                      <p className="text-sm">{translation.translation_summary}</p>
                      {translation.methodology_adaptations && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Methodology:</strong> {translation.methodology_adaptations}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(translation.created_at), "PPP")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="disciplines" className="space-y-4">
            {disciplinesLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {disciplines.map((discipline) => (
                  <Card key={discipline.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <h3 className="font-semibold">{discipline.name}</h3>
                      {discipline.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {discipline.description}
                        </p>
                      )}
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
