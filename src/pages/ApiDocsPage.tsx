import { useState } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code,
  Key,
  Zap,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Database,
  Shield,
  Rocket,
  ChevronRight,
  Play,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/tools",
    description: "List all available AI tools",
    category: "Tools",
  },
  {
    method: "GET",
    path: "/api/v1/tools/:id",
    description: "Get details of a specific tool",
    category: "Tools",
  },
  {
    method: "POST",
    path: "/api/v1/subscriptions",
    description: "Create a new subscription",
    category: "Subscriptions",
  },
  {
    method: "GET",
    path: "/api/v1/subscriptions",
    description: "List user subscriptions",
    category: "Subscriptions",
  },
  {
    method: "GET",
    path: "/api/v1/user/profile",
    description: "Get user profile",
    category: "Users",
  },
  {
    method: "PATCH",
    path: "/api/v1/user/profile",
    description: "Update user profile",
    category: "Users",
  },
  {
    method: "GET",
    path: "/api/v1/projects",
    description: "List earning projects",
    category: "Projects",
  },
  {
    method: "POST",
    path: "/api/v1/projects/:id/bids",
    description: "Submit a bid on a project",
    category: "Projects",
  },
];

const codeExamples = {
  authentication: `// Authentication with API Key
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
};

fetch('https://api.researchcollabpro.com/v1/tools', {
  method: 'GET',
  headers: headers
})
.then(response => response.json())
.then(data => console.log(data));`,
  
  listTools: `// List all available tools
const response = await fetch('https://api.researchcollabpro.com/v1/tools', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const tools = await response.json();
// Response:
// {
//   "data": [
//     {
//       "id": "chatgpt",
//       "name": "ChatGPT 5.3",
//       "price": 8000,
//       "currency": "PKR",
//       "plans": ["semi-private", "private", "byo"]
//     },
//     ...
//   ]
// }`,

  createSubscription: `// Create a new subscription
const response = await fetch('https://api.researchcollabpro.com/v1/subscriptions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tool_id: 'chatgpt',
    plan_id: 'chatgpt-private',
    duration_months: 3
  })
});

const subscription = await response.json();
// Response:
// {
//   "id": "sub_123456",
//   "status": "pending_payment",
//   "amount": 22000,
//   "currency": "PKR",
//   "payment_link": "https://..."
// }`,

  webhooks: `// Webhook payload for subscription events
{
  "event": "subscription.activated",
  "timestamp": "2024-02-14T10:30:00Z",
  "data": {
    "subscription_id": "sub_123456",
    "user_id": "user_789",
    "tool_id": "chatgpt",
    "plan_id": "chatgpt-private",
    "status": "active",
    "start_date": "2024-02-14",
    "end_date": "2024-05-14"
  }
}`,
};

const sdkLanguages = [
  { name: "JavaScript", icon: "JS", color: "bg-yellow-500" },
  { name: "Python", icon: "PY", color: "bg-blue-500" },
  { name: "PHP", icon: "PHP", color: "bg-purple-500" },
  { name: "cURL", icon: "cURL", color: "bg-gray-500" },
];

export default function ApiDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-500/10 text-green-600";
      case "POST":
        return "bg-blue-500/10 text-blue-600";
      case "PATCH":
        return "bg-amber-500/10 text-amber-600";
      case "DELETE":
        return "bg-red-500/10 text-red-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="gradient-hero py-8 sm:py-16 md:py-24">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">
              <Code className="h-3 w-3 mr-1" />
              API Documentation
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-bold md:text-5xl lg:text-6xl">
              Build with our <span className="text-gradient">API</span>
            </h1>
            <p className="mt-4 text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Integrate ResearchCollabPro services into your applications with our RESTful API.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Button size="lg">
              <Key className="h-4 w-4 mr-2" />
              Get API Key
            </Button>
            <Button size="lg" variant="outline">
              <Play className="h-4 w-4 mr-2" />
              API Playground
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-8 sm:py-16">
        {/* Quick Start */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Quick Start</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Key className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">1. Get Your API Key</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up and generate your API key from the dashboard settings.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Terminal className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">2. Make Your First Call</h3>
                <p className="text-sm text-muted-foreground">
                  Use your API key to authenticate and fetch available tools.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">3. Build & Scale</h3>
                <p className="text-sm text-muted-foreground">
                  Integrate subscriptions and projects into your application.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Authentication */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Authentication</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-medium">Bearer Token Authentication</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(codeExamples.authentication, "auth")}
                >
                  {copiedCode === "auth" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{codeExamples.authentication}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        {/* Endpoints */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">API Endpoints</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {endpoints.map((endpoint, index) => (
                  <div
                    key={index}
                    className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <Badge className={getMethodColor(endpoint.method)}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono">{endpoint.path}</code>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground hidden md:block">
                        {endpoint.description}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Code Examples */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Code Examples</h2>
          <Tabs defaultValue="list-tools">
            <TabsList className="mb-4">
              <TabsTrigger value="list-tools">List Tools</TabsTrigger>
              <TabsTrigger value="create-subscription">Create Subscription</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>

            <TabsContent value="list-tools">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">List all available tools</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(codeExamples.listTools, "list")}
                    >
                      {copiedCode === "list" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{codeExamples.listTools}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="create-subscription">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Create a new subscription</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(codeExamples.createSubscription, "create")}
                    >
                      {copiedCode === "create" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{codeExamples.createSubscription}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webhooks">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Webhook payload example</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(codeExamples.webhooks, "webhooks")}
                    >
                      {copiedCode === "webhooks" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{codeExamples.webhooks}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* SDKs */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">SDKs & Libraries</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {sdkLanguages.map((lang) => (
              <Card key={lang.name} variant="interactive" className="cursor-pointer">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl ${lang.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {lang.icon}
                  </div>
                  <div>
                    <p className="font-medium">{lang.name}</p>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Rate Limits */}
        <section>
          <h2 className="text-2xl font-bold mb-8">Rate Limits & Pricing</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
                <CardDescription>Requests per minute by plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Free Tier</span>
                    <span className="font-medium">60 requests/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pro</span>
                    <span className="font-medium">300 requests/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enterprise</span>
                    <span className="font-medium">Unlimited</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Pricing</CardTitle>
                <CardDescription>Pay as you grow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Free Tier</span>
                    <span className="font-medium">PKR 0/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pro</span>
                    <span className="font-medium">PKR 5,000/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enterprise</span>
                    <span className="font-medium">Custom</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
