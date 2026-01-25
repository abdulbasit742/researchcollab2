import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, Settings, TrendingUp,
  FileText, Check, Edit, Save
} from "lucide-react";
import {
  defaultPricingConfig, dummyAIScopedProjects, getAIScopingStats,
  projectTypeLabels, complexityLabels, AIPricingConfig
} from "@/data/aiScoping";

const AdminAIPricingPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [configs, setConfigs] = useState<AIPricingConfig[]>(defaultPricingConfig);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  
  const stats = getAIScopingStats();

  const handleToggleCategory = (category: string) => {
    setConfigs(prev => prev.map(c => 
      c.category === category ? { ...c, enabled: !c.enabled } : c
    ));
    toast({
      title: "Category Updated",
      description: `AI pricing ${configs.find(c => c.category === category)?.enabled ? 'disabled' : 'enabled'} for ${projectTypeLabels[category as keyof typeof projectTypeLabels]}`
    });
  };

  const handleUpdateConfig = (category: string, field: string, value: number) => {
    setConfigs(prev => prev.map(c => 
      c.category === category ? { ...c, [field]: value } : c
    ));
  };

  const handleSaveConfig = (category: string) => {
    setEditingConfig(null);
    toast({
      title: "Configuration Saved",
      description: `Pricing rules updated for ${projectTypeLabels[category as keyof typeof projectTypeLabels]}`
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            AI Pricing Engine
          </h1>
          <p className="text-muted-foreground">Configure and monitor AI-powered project pricing</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FileText className="h-4 w-4" />
                <span className="text-xs">AI-Scoped Projects</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalProjects}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-xs">Price Acceptance</span>
              </div>
              <p className="text-2xl font-bold">{stats.pricingAcceptanceRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Edit className="h-4 w-4 text-yellow-500" />
                <span className="text-xs">Override Rate</span>
              </div>
              <p className="text-2xl font-bold">{stats.overrideRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Avg Confidence</span>
              </div>
              <p className="text-2xl font-bold">{stats.avgConfidence}%</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pricing-rules">Pricing Rules</TabsTrigger>
            <TabsTrigger value="projects">Scoped Projects</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Projects by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.byType.filter(t => t.count > 0).map(type => (
                      <div key={type.type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{type.label}</span>
                          <span>{type.count} projects</span>
                        </div>
                        <Progress value={(type.count / stats.totalProjects) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Acceptance Rate</span>
                        <span className="font-medium">{stats.pricingAcceptanceRate}%</span>
                      </div>
                      <Progress value={stats.pricingAcceptanceRate} className="h-3 bg-muted" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                        <Check className="h-6 w-6 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">
                          {dummyAIScopedProjects.filter(p => p.pricingAccepted).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Accepted</p>
                      </div>
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg text-center">
                        <Edit className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-yellow-600">
                          {dummyAIScopedProjects.filter(p => !p.pricingAccepted && p.adjustedPrice).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Adjusted</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Category Status</CardTitle>
                  <CardDescription>Enable or disable AI pricing per category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {configs.map(config => (
                      <div key={config.category} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{projectTypeLabels[config.category as keyof typeof projectTypeLabels]}</p>
                          <p className="text-sm text-muted-foreground">${config.baseRatePerHour}/hr base</p>
                        </div>
                        <Switch 
                          checked={config.enabled}
                          onCheckedChange={() => handleToggleCategory(config.category)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pricing Rules Tab */}
          <TabsContent value="pricing-rules">
            <div className="space-y-6">
              {configs.map(config => (
                <Card key={config.category}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle>{projectTypeLabels[config.category as keyof typeof projectTypeLabels]}</CardTitle>
                        <Badge variant={config.enabled ? 'default' : 'secondary'}>
                          {config.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                      {editingConfig === config.category ? (
                        <Button size="sm" onClick={() => handleSaveConfig(config.category)}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setEditingConfig(config.category)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <Label>Base Rate ($/hr)</Label>
                        <Input
                          type="number"
                          value={config.baseRatePerHour}
                          onChange={(e) => handleUpdateConfig(config.category, 'baseRatePerHour', Number(e.target.value))}
                          disabled={editingConfig !== config.category}
                        />
                      </div>
                      <div>
                        <Label>Price Floor ($)</Label>
                        <Input
                          type="number"
                          value={config.priceFloor}
                          onChange={(e) => handleUpdateConfig(config.category, 'priceFloor', Number(e.target.value))}
                          disabled={editingConfig !== config.category}
                        />
                      </div>
                      <div>
                        <Label>Price Ceiling ($)</Label>
                        <Input
                          type="number"
                          value={config.priceCeiling}
                          onChange={(e) => handleUpdateConfig(config.category, 'priceCeiling', Number(e.target.value))}
                          disabled={editingConfig !== config.category}
                        />
                      </div>
                      <div className="flex items-end">
                        <Switch 
                          checked={config.enabled}
                          onCheckedChange={() => handleToggleCategory(config.category)}
                        />
                        <Label className="ml-2">Enabled</Label>
                      </div>
                    </div>
                    
                    {editingConfig === config.category && (
                      <div className="mt-4 grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="mb-2 block">Complexity Multipliers</Label>
                          <div className="space-y-2">
                            {Object.entries(config.complexityMultipliers).map(([level, mult]) => (
                              <div key={level} className="flex items-center gap-2">
                                <span className="w-32 text-sm">{complexityLabels[level as keyof typeof complexityLabels]}</span>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={mult}
                                  className="w-20"
                                  onChange={(e) => {
                                    const newMultipliers = { ...config.complexityMultipliers, [level]: Number(e.target.value) };
                                    setConfigs(prev => prev.map(c => 
                                      c.category === config.category ? { ...c, complexityMultipliers: newMultipliers } : c
                                    ));
                                  }}
                                />
                                <span className="text-sm text-muted-foreground">x</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="mb-2 block">Urgency Multipliers</Label>
                          <div className="space-y-2">
                            {Object.entries(config.urgencyMultipliers).map(([level, mult]) => (
                              <div key={level} className="flex items-center gap-2">
                                <span className="w-32 text-sm capitalize">{level}</span>
                                <Input
                                  type="number"
                                  step="0.05"
                                  value={mult}
                                  className="w-20"
                                  onChange={(e) => {
                                    const newMultipliers = { ...config.urgencyMultipliers, [level]: Number(e.target.value) };
                                    setConfigs(prev => prev.map(c => 
                                      c.category === config.category ? { ...c, urgencyMultipliers: newMultipliers } : c
                                    ));
                                  }}
                                />
                                <span className="text-sm text-muted-foreground">x</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>AI-Scoped Projects</CardTitle>
                <CardDescription>All projects created using AI scoping</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Complexity</TableHead>
                      <TableHead>AI Price</TableHead>
                      <TableHead>Final Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dummyAIScopedProjects.map(project => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{project.scope.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {project.scope.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {projectTypeLabels[project.scope.projectType]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {complexityLabels[project.scope.complexityLevel]}
                        </TableCell>
                        <TableCell>${project.pricing.recommendedPrice}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            ${project.adjustedPrice || project.pricing.recommendedPrice}
                            {project.pricingAccepted ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Edit className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            project.status === 'completed' ? 'default' :
                            project.status === 'in_progress' ? 'secondary' :
                            'outline'
                          }>
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={project.estimate.confidenceScore} className="w-16 h-2" />
                            <span className="text-sm">{project.estimate.confidenceScore}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Accepted as-is</span>
                      <span className="font-semibold">{stats.pricingAcceptanceRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Adjusted (minor)</span>
                      <span className="font-semibold">{stats.overrideRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rejected</span>
                      <span className="font-semibold">{100 - stats.pricingAcceptanceRate - stats.overrideRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="text-3xl font-bold text-green-600">
                        ${dummyAIScopedProjects.reduce((sum, p) => sum + (p.adjustedPrice || p.pricing.recommendedPrice), 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Revenue from AI-Priced Projects</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminAIPricingPage;