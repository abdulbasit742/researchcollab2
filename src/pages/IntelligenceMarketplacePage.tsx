import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Brain, Globe, TrendingUp, Shield, Search, BarChart3, Lock, FileText, Zap, DollarSign, Eye, CheckCircle, AlertTriangle, Database, Key } from "lucide-react";

const PRODUCT_TYPES = [
  { value: "sector_report", label: "Sector Report", icon: BarChart3, color: "text-blue-500" },
  { value: "regional_analysis", label: "Regional Analysis", icon: Globe, color: "text-emerald-500" },
  { value: "forecast_model", label: "Forecast Model", icon: TrendingUp, color: "text-purple-500" },
  { value: "capital_efficiency", label: "Capital Efficiency", icon: DollarSign, color: "text-amber-500" },
  { value: "employment_trends", label: "Employment Trends", icon: Zap, color: "text-rose-500" },
];

const SAMPLE_PRODUCTS = [
  { id: "1", name: "Global Innovation Density Index", type: "regional_analysis", tier: "premium", price: 499, frequency: "monthly", scope: "50+ countries", compliance: "approved", subscribers: 47 },
  { id: "2", name: "Sector Acceleration Forecast Q3", type: "forecast_model", tier: "enterprise", price: 1999, frequency: "quarterly", scope: "Tech, Biotech, AI", compliance: "approved", subscribers: 12 },
  { id: "3", name: "Capital Efficiency Benchmark", type: "capital_efficiency", tier: "standard", price: 199, frequency: "monthly", scope: "MENA + South Asia", compliance: "approved", subscribers: 83 },
  { id: "4", name: "Employment Conversion Tracker", type: "employment_trends", tier: "premium", price: 349, frequency: "weekly", scope: "Global", compliance: "approved", subscribers: 65 },
  { id: "5", name: "Startup Survival Probability Model", type: "forecast_model", tier: "enterprise", price: 2499, frequency: "monthly", scope: "All Sectors", compliance: "approved", subscribers: 8 },
  { id: "6", name: "National Innovation Signal Report", type: "sector_report", tier: "free", price: 0, frequency: "monthly", scope: "Public Aggregate", compliance: "approved", subscribers: 340 },
];

const TIERS = { free: "bg-muted text-muted-foreground", standard: "bg-blue-500/10 text-blue-600", premium: "bg-purple-500/10 text-purple-600", enterprise: "bg-amber-500/10 text-amber-700" };

export default function IntelligenceMarketplacePage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  const filtered = SAMPLE_PRODUCTS.filter(p =>
    (typeFilter === "all" || p.type === typeFilter) &&
    (tierFilter === "all" || p.tier === tierFilter) &&
    (search === "" || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Intelligence Marketplace | Sovereign Data Exchange</title></Helmet>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Intelligence Marketplace</h1>
          </div>
          <p className="text-muted-foreground">Structured, sovereign-compliant intelligence products — aggregated insights, never raw data.</p>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-3xl">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="subscriptions">My Subs</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="api">API Gateway</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Public Innovation Signal */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2"><Eye className="h-5 w-5 text-primary" /> Global Innovation Signal Index</h3>
                    <p className="text-sm text-muted-foreground mt-1">Aggregated public view — detailed breakdowns require subscription</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">72.4</div>
                    <p className="text-xs text-muted-foreground">Global composite score</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {[{ label: "Innovation Density", val: 68 }, { label: "Capital Efficiency", val: 74 }, { label: "Employment Velocity", val: 71 }, { label: "Startup Yield", val: 76 }].map(m => (
                    <div key={m.label} className="text-center">
                      <div className="text-lg font-semibold">{m.val}</div>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <Progress value={m.val} className="h-1 mt-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Product Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {PRODUCT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tier" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(product => {
                const typeInfo = PRODUCT_TYPES.find(t => t.value === product.type);
                const Icon = typeInfo?.icon || BarChart3;
                return (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Icon className={`h-5 w-5 ${typeInfo?.color}`} />
                        <Badge className={TIERS[product.tier as keyof typeof TIERS]}>{product.tier}</Badge>
                      </div>
                      <CardTitle className="text-base mt-2">{product.name}</CardTitle>
                      <CardDescription>{product.scope} · Updated {product.frequency}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          {product.price === 0 ? (
                            <span className="text-lg font-bold text-emerald-600">Free</span>
                          ) : (
                            <span className="text-lg font-bold">${product.price}<span className="text-xs text-muted-foreground">/mo</span></span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{product.subscribers} subscribers</div>
                      </div>
                      <Button className="w-full mt-3" variant={product.price === 0 ? "outline" : "default"} size="sm">
                        {product.price === 0 ? "View Report" : "Subscribe"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> My Intelligence Subscriptions</CardTitle>
                <CardDescription>Active subscriptions and API access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Lock className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>No active subscriptions yet</p>
                  <Button variant="outline" className="mt-3">Browse Marketplace</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Custom Intelligence Requests</CardTitle>
                <CardDescription>Submit bespoke queries for sector-specific, multi-country, or strategic analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {["Sector-specific deep dive", "Multi-country comparison", "Capital deployment strategy", "University benchmarking", "Startup cluster analysis"].map(type => (
                    <Card key={type} className="p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                      <p className="text-sm font-medium">{type}</p>
                      <p className="text-xs text-muted-foreground mt-1">Enterprise & Premium tiers</p>
                    </Card>
                  ))}
                </div>
                <Button className="w-full"><FileText className="mr-2 h-4 w-4" /> Submit Custom Request</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> API Intelligence Gateway</CardTitle>
                <CardDescription>Programmatic access to intelligence endpoints — rate-limited & authenticated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm space-y-2">
                  <p className="text-muted-foreground"># Available Endpoints</p>
                  <p>GET /intelligence/api/v1/sector-momentum</p>
                  <p>GET /intelligence/api/v1/innovation-density</p>
                  <p>GET /intelligence/api/v1/capital-efficiency</p>
                  <p>GET /intelligence/api/v1/employment-trends</p>
                  <p>GET /intelligence/api/v1/startup-survival</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[{ label: "Rate Limit", val: "1,000 req/day" }, { label: "Auth", val: "Bearer Token" }, { label: "Format", val: "JSON" }].map(s => (
                    <Card key={s.label} className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-sm font-semibold mt-1">{s.val}</p>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="governance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Intelligence Governance & Sovereign Protection</CardTitle>
                <CardDescription>Every intelligence product must pass pre-publication audit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "No Identifiable Data", icon: CheckCircle, desc: "Aggregation enforced — no individual-level data" },
                    { label: "Node Consent", icon: Globe, desc: "Publishing requires node-level consent" },
                    { label: "Compliance Active", icon: Shield, desc: "Regulatory compliance validated" },
                    { label: "Aggregation Threshold", icon: Database, desc: "Minimum sample sizes enforced" },
                    { label: "Bias Impact Check", icon: AlertTriangle, desc: "AI bias audit completed before publication" },
                    { label: "Explainability Attached", icon: Brain, desc: "Top factors, confidence bands, & alternatives included" },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg border">
                      <item.icon className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Intelligence Revenue Allocation</CardTitle>
                <CardDescription>Revenue split across commercial, foundation, and node reserves</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: "Commercial Entity", pct: 60, color: "bg-blue-500" },
                    { label: "Foundation Fund", pct: 25, color: "bg-emerald-500" },
                    { label: "Node Reserve", pct: 15, color: "bg-amber-500" },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <div className="text-2xl font-bold">{s.pct}%</div>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <div className={`h-2 rounded-full mt-2 ${s.color}`} style={{ width: `${s.pct}%`, margin: "0 auto" }} />
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">Intelligence marketplace revenue logs are tracked per transaction with full audit trail</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
