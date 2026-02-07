import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { GitBranch, Key, Webhook, Plug, Code, Package } from "lucide-react";

export function APIKeyManager() {
  const keys = [
    { name: "Production Key", prefix: "sk_live_", usedCalls: 5234, limit: 10000, status: "active" },
    { name: "Development Key", prefix: "sk_test_", usedCalls: 150, limit: 1000, status: "active" },
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          API Keys
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {keys.map((key, i) => (
          <div key={i} className="p-3 rounded-lg border">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{key.name}</p>
                <p className="text-sm text-muted-foreground font-mono">{key.prefix}•••••••</p>
              </div>
              <Badge variant={key.status === "active" ? "default" : "destructive"}>
                {key.status}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Usage</span>
                <span>{key.usedCalls}/{key.limit}</span>
              </div>
              <Progress value={(key.usedCalls/key.limit)*100} className="h-2" />
            </div>
          </div>
        ))}
        <Button className="w-full" size="sm">Create New Key</Button>
      </CardContent>
    </Card>
  );
}

export function WebhookManager() {
  const webhooks = [
    { url: "https://myapp.com/webhooks", events: 3, successRate: 99.5, status: "active" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Webhook className="h-5 w-5 text-primary" />
          Webhooks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {webhooks.map((wh, i) => (
          <div key={i} className="p-3 rounded-lg border">
            <div className="flex justify-between items-start mb-2">
              <p className="font-medium text-sm truncate max-w-[200px]">{wh.url}</p>
              <Badge variant="default">{wh.status}</Badge>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{wh.events} events</span>
              <span className="text-green-600">{wh.successRate}% success</span>
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full" size="sm">Add Webhook</Button>
      </CardContent>
    </Card>
  );
}

export function IntegrationHub() {
  const integrations = [
    { name: "Slack", status: "connected", icon: "💬" },
    { name: "Google Calendar", status: "connected", icon: "📅" },
    { name: "Zapier", status: "available", icon: "⚡" },
    { name: "HubSpot", status: "available", icon: "🔶" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Plug className="h-5 w-5 text-primary" />
          Integrations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {integrations.map((int, i) => (
          <div key={i} className="p-3 rounded-lg border flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">{int.icon}</span>
              <span className="font-medium">{int.name}</span>
            </div>
            <Badge variant={int.status === "connected" ? "default" : "secondary"}>
              {int.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function APIMarketplace() {
  const apis = [
    { name: "Research Data API", rating: 4.8, subscribers: 5000, price: "Free tier" },
    { name: "AI Analysis API", rating: 4.6, subscribers: 3200, price: "PKR 2/call" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          API Marketplace
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {apis.map((api, i) => (
          <div key={i} className="p-3 rounded-lg border">
            <div className="flex justify-between items-start mb-2">
              <p className="font-medium">{api.name}</p>
              <div className="flex items-center gap-1 text-yellow-500">
                <span>⭐</span>
                <span className="text-sm">{api.rating}</span>
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{api.subscribers.toLocaleString()} subscribers</span>
              <span>{api.price}</span>
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full">Browse All APIs</Button>
      </CardContent>
    </Card>
  );
}

export function WorkflowBuilder() {
  const workflows = [
    { name: "New Project Onboarding", executions: 150, status: "active" },
    { name: "Weekly Report", executions: 52, status: "active" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          Workflows
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {workflows.map((wf, i) => (
          <div key={i} className="p-3 rounded-lg border flex justify-between items-center">
            <div>
              <p className="font-medium">{wf.name}</p>
              <p className="text-sm text-muted-foreground">{wf.executions} executions</p>
            </div>
            <Badge>{wf.status}</Badge>
          </div>
        ))}
        <Button className="w-full">Create Workflow</Button>
      </CardContent>
    </Card>
  );
}

export function SDKDownloads() {
  const sdks = ["TypeScript", "Python", "Go", "Ruby", "Java"];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          SDK Downloads
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {sdks.map((sdk) => (
            <Button key={sdk} variant="outline" size="sm">
              {sdk}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Auto-generated SDKs for your API
        </p>
      </CardContent>
    </Card>
  );
}
