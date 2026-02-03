import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useDatasets, useDatasetAccess, useOpenScienceBadges } from "@/hooks/useOpenScience";
import { useAuth } from "@/contexts/AuthContext";
import { Database, Search, Filter, Plus, Lock, Unlock, FileText, Download, ExternalLink, Award } from "lucide-react";

export default function DatasetsPage() {
  const { user } = useAuth();
  const { datasets, loading, createDataset } = useDatasets();
  const { myRequests } = useDatasetAccess();
  const { badges } = useOpenScienceBadges();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [accessFilter, setAccessFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [newDataset, setNewDataset] = useState({
    title: "",
    description: "",
    dataset_type: "experimental" as const,
    access_level: "open" as const,
    license: "CC-BY-4.0",
    keywords: [] as string[],
  });

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearch = dataset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dataset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesAccess = accessFilter === "all" || dataset.access_level === accessFilter;
    const matchesType = typeFilter === "all" || dataset.dataset_type === typeFilter;
    return matchesSearch && matchesAccess && matchesType;
  });

  const handleCreateDataset = async () => {
    const result = await createDataset(newDataset);
    if (result.success) {
      setCreateOpen(false);
      setNewDataset({
        title: "",
        description: "",
        dataset_type: "experimental",
        access_level: "open",
        license: "CC-BY-4.0",
        keywords: [],
      });
    }
  };

  const getAccessBadgeVariant = (access: string) => {
    switch (access) {
      case "open": return "default";
      case "restricted": return "secondary";
      case "embargoed": return "outline";
      case "private": return "destructive";
      default: return "default";
    }
  };

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="h-8 w-8 text-primary" />
              Research Datasets
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover, share, and access research data with proper licensing
            </p>
          </div>
          
          {user && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Share Dataset
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Share a New Dataset</DialogTitle>
                  <DialogDescription>
                    Make your research data available to the community
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Dataset Title</Label>
                    <Input
                      id="title"
                      value={newDataset.title}
                      onChange={(e) => setNewDataset({ ...newDataset, title: e.target.value })}
                      placeholder="Enter dataset title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newDataset.description}
                      onChange={(e) => setNewDataset({ ...newDataset, description: e.target.value })}
                      placeholder="Describe your dataset..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Dataset Type</Label>
                      <Select
                        value={newDataset.dataset_type}
                        onValueChange={(v: any) => setNewDataset({ ...newDataset, dataset_type: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="experimental">Experimental</SelectItem>
                          <SelectItem value="survey">Survey</SelectItem>
                          <SelectItem value="simulation">Simulation</SelectItem>
                          <SelectItem value="observational">Observational</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                          <SelectItem value="derived">Derived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Access Level</Label>
                      <Select
                        value={newDataset.access_level}
                        onValueChange={(v: any) => setNewDataset({ ...newDataset, access_level: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open Access</SelectItem>
                          <SelectItem value="restricted">Restricted</SelectItem>
                          <SelectItem value="embargoed">Embargoed</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>License</Label>
                    <Select
                      value={newDataset.license}
                      onValueChange={(v) => setNewDataset({ ...newDataset, license: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC-BY-4.0">CC BY 4.0</SelectItem>
                        <SelectItem value="CC-BY-SA-4.0">CC BY-SA 4.0</SelectItem>
                        <SelectItem value="CC-BY-NC-4.0">CC BY-NC 4.0</SelectItem>
                        <SelectItem value="CC0">CC0 (Public Domain)</SelectItem>
                        <SelectItem value="MIT">MIT</SelectItem>
                        <SelectItem value="Custom">Custom License</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateDataset} className="w-full">
                    Share Dataset
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={accessFilter} onValueChange={setAccessFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Access Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Access Levels</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="restricted">Restricted</SelectItem>
              <SelectItem value="embargoed">Embargoed</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Dataset Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="experimental">Experimental</SelectItem>
              <SelectItem value="survey">Survey</SelectItem>
              <SelectItem value="simulation">Simulation</SelectItem>
              <SelectItem value="observational">Observational</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
              <SelectItem value="derived">Derived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">Browse Datasets</TabsTrigger>
            <TabsTrigger value="my-requests">My Access Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredDatasets.length === 0 ? (
              <Card className="p-12 text-center">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No datasets found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try adjusting your search or filters" : "Be the first to share a dataset"}
                </p>
                {user && !searchQuery && (
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Share Dataset
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDatasets.map((dataset) => (
                  <Card key={dataset.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg leading-tight line-clamp-2">
                          {dataset.title}
                        </CardTitle>
                        {dataset.access_level === "open" ? (
                          <Unlock className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={getAccessBadgeVariant(dataset.access_level)}>
                          {dataset.access_level}
                        </Badge>
                        <Badge variant="outline">{dataset.dataset_type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {dataset.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {dataset.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {dataset.license}
                        </span>
                        {dataset.doi && (
                          <a
                            href={`https://doi.org/${dataset.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            DOI <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link to={`/datasets/${dataset.id}`}>
                            <FileText className="h-4 w-4 mr-1" />
                            Details
                          </Link>
                        </Button>
                        {dataset.access_level === "open" && (
                          <Button size="sm" variant="secondary">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-requests" className="space-y-4">
            {myRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No access requests</h3>
                <p className="text-muted-foreground">
                  Your dataset access requests will appear here
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium">Dataset Access Request</p>
                        <p className="text-sm text-muted-foreground">{request.purpose}</p>
                      </div>
                      <Badge variant={
                        request.status === "approved" ? "default" :
                        request.status === "pending" ? "secondary" :
                        "destructive"
                      }>
                        {request.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Open Science Badges Section */}
        {badges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Open Science Badges
              </CardTitle>
              <CardDescription>
                Recognition for open science practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {badges.slice(0, 10).map((badge) => (
                  <Badge key={badge.id} variant="outline" className="py-1.5">
                    {badge.badge_type.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
