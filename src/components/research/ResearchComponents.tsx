import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FlaskConical, Database, BookOpen, FileText, Users, Award } from "lucide-react";

export function PatentPortfolio() {
  const patents = [
    { id: "1", title: "AI Trust Verification", status: "granted", citations: 12, revenue: 45000 },
    { id: "2", title: "Blockchain Identity", status: "pending", citations: 0, revenue: 0 },
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Patent Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {patents.map(patent => (
          <div key={patent.id} className="p-3 rounded-lg border bg-muted/30">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-sm">{patent.title}</span>
              <Badge variant={patent.status === "granted" ? "default" : "secondary"}>
                {patent.status}
              </Badge>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{patent.citations} citations</span>
              <span>${patent.revenue.toLocaleString()} revenue</span>
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full">File New Patent</Button>
      </CardContent>
    </Card>
  );
}

export function ResearchProjectTracker() {
  const projects = [
    { title: "Quantum Drug Discovery", status: "active", funding: 2500000, publications: 8 },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          Research Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.map((project, i) => (
          <div key={i} className="p-3 rounded-lg border">
            <h4 className="font-medium">{project.title}</h4>
            <div className="grid grid-cols-3 gap-2 mt-2 text-center">
              <div className="p-2 bg-muted/50 rounded">
                <p className="text-lg font-bold">${(project.funding/1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Funding</p>
              </div>
              <div className="p-2 bg-muted/50 rounded">
                <p className="text-lg font-bold">{project.publications}</p>
                <p className="text-xs text-muted-foreground">Papers</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded">
                <p className="text-lg font-bold text-green-600">Active</p>
                <p className="text-xs text-muted-foreground">Status</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function DatasetRepository() {
  const datasets = [
    { name: "Climate Indicators 2024", downloads: 1250, citations: 45, size: "2.3 GB" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Dataset Repository
        </CardTitle>
      </CardHeader>
      <CardContent>
        {datasets.map((ds, i) => (
          <div key={i} className="p-3 rounded-lg border">
            <h4 className="font-medium">{ds.name}</h4>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>{ds.downloads} downloads</span>
              <span>{ds.citations} citations</span>
              <span>{ds.size}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function PublicationMetrics() {
  const metrics = { totalPublications: 45, citations: 1234, hIndex: 18, impactFactor: 4.5 };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Publication Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-bold">{metrics.totalPublications}</p>
            <p className="text-xs text-muted-foreground">Publications</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-bold">{metrics.citations}</p>
            <p className="text-xs text-muted-foreground">Citations</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 text-center">
            <p className="text-2xl font-bold text-blue-600">{metrics.hIndex}</p>
            <p className="text-xs text-muted-foreground">h-index</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 text-center">
            <p className="text-2xl font-bold text-green-600">{metrics.impactFactor}</p>
            <p className="text-xs text-muted-foreground">Impact Factor</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LabEquipmentBooking() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          Lab Equipment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 rounded-lg border flex justify-between items-center">
          <div>
            <p className="font-medium">Mass Spectrometer</p>
            <p className="text-sm text-muted-foreground">Lab 201 • Available</p>
          </div>
          <Button size="sm">Book</Button>
        </div>
        <div className="p-3 rounded-lg border flex justify-between items-center">
          <div>
            <p className="font-medium">Electron Microscope</p>
            <p className="text-sm text-muted-foreground">Lab 105 • In Use</p>
          </div>
          <Button size="sm" variant="outline" disabled>Waitlist</Button>
        </div>
      </CardContent>
    </Card>
  );
}
