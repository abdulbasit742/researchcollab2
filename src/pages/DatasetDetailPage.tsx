import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useDatasets, useDatasetVersions, useDatasetAccess, useDatasetUsage } from "@/hooks/useOpenScience";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Database, Download, Lock, Unlock, FileText, History, Users, Shield, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export default function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { datasets, loading } = useDatasets();
  const { versions, loading: versionsLoading } = useDatasetVersions(id || "");
  const { requests, requestAccess } = useDatasetAccess(id);
  const { logUsage } = useDatasetUsage(id || "");
  
  const [requestOpen, setRequestOpen] = useState(false);
  const [accessRequest, setAccessRequest] = useState({
    purpose: "",
    intended_use: "",
    institution: "",
  });

  const dataset = datasets.find((d) => d.id === id);

  useEffect(() => {
    if (dataset) {
      logUsage("view");
    }
  }, [dataset]);

  const handleRequestAccess = async () => {
    if (!id) return;
    const result = await requestAccess({
      dataset_id: id,
      ...accessRequest,
    });
    if (result.success) {
      setRequestOpen(false);
      setAccessRequest({ purpose: "", intended_use: "", institution: "" });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8 space-y-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!dataset) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Card className="p-12 text-center">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dataset not found</h3>
            <p className="text-muted-foreground mb-4">
              The dataset you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/datasets">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Datasets
              </Link>
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        {/* Back Link */}
        <Button variant="ghost" size="sm" asChild>
          <Link to="/datasets">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Datasets
          </Link>
        </Button>

        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Database className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{dataset.title}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant={dataset.access_level === "open" ? "default" : "secondary"}>
                    {dataset.access_level === "open" ? (
                      <><Unlock className="h-3 w-3 mr-1" /> Open Access</>
                    ) : (
                      <><Lock className="h-3 w-3 mr-1" /> {dataset.access_level}</>
                    )}
                  </Badge>
                  <Badge variant="outline">{dataset.dataset_type}</Badge>
                  <Badge variant="outline">{dataset.license}</Badge>
                </div>
              </div>
            </div>

            {dataset.description && (
              <p className="text-muted-foreground">{dataset.description}</p>
            )}

            {dataset.methodology_summary && (
              <div>
                <h3 className="font-semibold mb-1">Methodology</h3>
                <p className="text-sm text-muted-foreground">{dataset.methodology_summary}</p>
              </div>
            )}

            {dataset.keywords && dataset.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {dataset.keywords.map((keyword, i) => (
                  <Badge key={i} variant="secondary">{keyword}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions Card */}
          <Card className="w-full lg:w-80 h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Access Dataset</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dataset.access_level === "open" ? (
                <>
                  <Button className="w-full" onClick={() => logUsage("download")}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Dataset
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Licensed under {dataset.license}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    This dataset requires approval to access.
                  </p>
                  <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Shield className="h-4 w-4 mr-2" />
                        Request Access
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Dataset Access</DialogTitle>
                        <DialogDescription>
                          Describe your intended use for this dataset
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Purpose</Label>
                          <Textarea
                            value={accessRequest.purpose}
                            onChange={(e) => setAccessRequest({ ...accessRequest, purpose: e.target.value })}
                            placeholder="Why do you need access to this dataset?"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Intended Use</Label>
                          <Textarea
                            value={accessRequest.intended_use}
                            onChange={(e) => setAccessRequest({ ...accessRequest, intended_use: e.target.value })}
                            placeholder="How will you use this data?"
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Institution</Label>
                          <Input
                            value={accessRequest.institution}
                            onChange={(e) => setAccessRequest({ ...accessRequest, institution: e.target.value })}
                            placeholder="Your affiliated institution"
                          />
                        </div>
                        <Button onClick={handleRequestAccess} className="w-full">
                          Submit Request
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}

              {dataset.doi && (
                <a
                  href={`https://doi.org/${dataset.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
                >
                  View DOI <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Tabs */}
        <Tabs defaultValue="versions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="versions">
              <History className="h-4 w-4 mr-2" />
              Versions
            </TabsTrigger>
            <TabsTrigger value="access">
              <Users className="h-4 w-4 mr-2" />
              Access Requests
            </TabsTrigger>
            <TabsTrigger value="metadata">
              <FileText className="h-4 w-4 mr-2" />
              Metadata
            </TabsTrigger>
          </TabsList>

          <TabsContent value="versions" className="space-y-4">
            {versionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : versions.length === 0 ? (
              <Card className="p-8 text-center">
                <History className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No version history available</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {versions.map((version) => (
                  <Card key={version.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium">Version {version.version_number}</p>
                        <p className="text-sm text-muted-foreground">{version.change_log}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(version.created_at), "PPP")}
                        </p>
                      </div>
                      {version.total_records && (
                        <Badge variant="outline">{version.total_records} records</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="access" className="space-y-4">
            {requests.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No access requests</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{request.purpose}</p>
                          {request.institution && (
                            <p className="text-sm text-muted-foreground">{request.institution}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(request.created_at), "PPP")}
                          </p>
                        </div>
                        <Badge>{request.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="metadata">
            <Card>
              <CardContent className="py-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                    <dd>{format(new Date(dataset.created_at), "PPP")}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                    <dd>{format(new Date(dataset.updated_at), "PPP")}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Size</dt>
                    <dd>{dataset.size_mb ? `${dataset.size_mb} MB` : "Unknown"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Consent Type</dt>
                    <dd className="capitalize">{dataset.consent_type || "Not specified"}</dd>
                  </div>
                  {dataset.ethical_approval_ref && (
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-muted-foreground">Ethics Approval</dt>
                      <dd>{dataset.ethical_approval_ref}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
