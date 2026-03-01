import { useState } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProjectArtifacts, useUploadArtifact, useArtifactVersions } from "@/hooks/useResearchWorkflow";
import { FileText, Plus, Upload, History, Loader2, Code, Database, FileCheck, File } from "lucide-react";

const ARTIFACT_TYPES = [
  { value: "dataset", label: "Dataset", icon: Database },
  { value: "draft", label: "Draft", icon: FileText },
  { value: "code", label: "Code", icon: Code },
  { value: "report", label: "Report", icon: FileCheck },
  { value: "other", label: "Other", icon: File },
];

export default function ProjectArtifactsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: artifacts = [], isLoading } = useProjectArtifacts(projectId);
  const uploadArtifact = useUploadArtifact();

  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("other");
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);

  const { data: versions = [] } = useArtifactVersions(selectedArtifactId || undefined);

  const handleUpload = async () => {
    if (!projectId || !title.trim()) return;
    await uploadArtifact.mutateAsync({
      project_id: projectId,
      artifact_type: type,
      title: title.trim(),
    });
    setTitle("");
    setType("other");
    setShowUpload(false);
  };

  const typeIcon = (artifactType: string) => {
    const found = ARTIFACT_TYPES.find((t) => t.value === artifactType);
    const Icon = found?.icon || File;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <MainLayout>
      <div className="container py-6 px-4 max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Research Artifacts
            </h1>
            <p className="text-sm text-muted-foreground">{artifacts.length} artifacts uploaded</p>
          </div>
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Upload Artifact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Research Artifact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Artifact title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ARTIFACT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleUpload} disabled={uploadArtifact.isPending || !title.trim()}>
                  {uploadArtifact.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Artifact List */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </div>
            ) : artifacts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No artifacts yet. Upload research files to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {artifacts.map((artifact: any) => (
                  <Card
                    key={artifact.id}
                    className={`cursor-pointer transition-colors hover:bg-accent/30 ${
                      selectedArtifactId === artifact.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedArtifactId(artifact.id)}
                  >
                    <CardContent className="py-3 px-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {typeIcon(artifact.artifact_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{artifact.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {artifact.artifact_type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            v{artifact.version_number}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(artifact.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Version Panel */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  Version History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedArtifactId ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Select an artifact to view versions
                  </p>
                ) : versions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No version history yet
                  </p>
                ) : (
                  <ScrollArea className="max-h-[400px]">
                    <div className="space-y-2">
                      {versions.map((v: any) => (
                        <div key={v.id} className="p-2 rounded border text-xs">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">v{v.version_number}</Badge>
                            <span className="text-muted-foreground">
                              {new Date(v.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {v.changelog && (
                            <p className="text-muted-foreground mt-1">{v.changelog}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
