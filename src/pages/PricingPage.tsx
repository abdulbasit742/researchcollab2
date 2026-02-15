import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Sparkles, Users, Building2, GraduationCap, Zap, Star, BookOpen, Crown, Infinity, X, Shield, GraduationCap as UniCap } from "lucide-react";
import { Link } from "react-router-dom";
import { SubscriptionCheckoutModal } from "@/components/subscriptions/SubscriptionCheckoutModal";

const PricingPage = () => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const individualPlans = [
    {
      name: "Basic",
      price: "PKR 0",
      period: "/month",
      description: "Get started with basic features",
      features: [
        "Access to public tools directory",
        "3 bids/month",
        "1,000 free AI words/month",
        "Basic profile",
        "Community support",
        "No peer review included",
      ],
      cta: "Get Started",
      ctaVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Career",
      price: "PKR 499",
      period: "/month",
      description: "Perfect for ambitious students and learners",
      features: [
        "Everything in Basic",
        "Unlimited bids",
        "10,000 free AI words/month",
        "1 free peer review/month",
        "Verified university badge (.edu)",
        "Priority matching with researchers",
        "Access to discounted AI tools",
        "Email support",
      ],
      cta: "Start Free Trial",
      ctaVariant: "default" as const,
      popular: true,
    },
    {
      name: "Business",
      price: "PKR 1,999",
      period: "/month",
      description: "For researchers and academics",
      features: [
        "Everything in Career",
        "50,000 free AI words/month",
        "3 free peer reviews/month",
        "Verified university badge + spotlight",
        "Post unlimited projects",
        "AI project scoping assistant",
        "Advanced analytics",
        "Priority support",
        "API access",
      ],
      cta: "Start Free Trial",
      ctaVariant: "default" as const,
      popular: false,
    },
  ];

  const toolBundles = [
    {
      name: "AI Essentials",
      price: "PKR 7,500",
      period: "/month",
      description: "ChatGPT + Perplexity combo",
      tools: ["ChatGPT 5.3 (Semi-Private)", "Perplexity Pro (Semi-Private)"],
      savings: "Save PKR 500",
    },
    {
      name: "Research Pro",
      price: "PKR 15,000",
      period: "/month",
      description: "Complete AI research toolkit",
      tools: ["ChatGPT 5.3 (Private)", "Claude 4 Opus (Semi-Private)", "Perplexity Pro (Private)"],
      savings: "Save PKR 2,100",
    },
    {
      name: "Ultimate Bundle",
      price: "PKR 28,000",
      period: "/month",
      description: "All premium AI tools",
      tools: ["ChatGPT 5.3 (Private)", "Claude 4 Opus (Private)", "Gemini 4 Ultra", "Perplexity Pro (Private)", "Research AI Pro"],
      savings: "Save PKR 6,500",
    },
  ];

  const enterprisePlans = [
    {
      name: "Team",
      price: "PKR 8,999",
      period: "/month",
      seats: "Up to 10 members",
      description: "For small research teams",
      features: [
        "All Researcher features",
        "Team management dashboard",
        "Shared tool subscriptions",
        "Centralized billing",
        "Team analytics",
        "Slack integration",
      ],
    },
    {
      name: "Department",
      price: "PKR 29,999",
      period: "/month",
      seats: "Up to 50 members",
      description: "For university departments",
      features: [
        "Everything in Team",
        "Custom branding",
        "SSO integration",
        "Advanced permissions",
        "Dedicated success manager",
        "SLA guarantee",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      seats: "Unlimited",
      description: "For large institutions",
      features: [
        "Everything in Department",
        "Custom integrations",
        "On-premise deployment option",
        "24/7 phone support",
        "Custom training",
        "Volume discounts",
      ],
    },
  ];

  const aiToolPricing = [
    { tool: "ChatGPT 5.3", semiPrivate: "PKR 4,200", private: "PKR 8,000", byo: "PKR 6,100" },
    { tool: "Claude 4 Opus", semiPrivate: "PKR 4,500", private: "PKR 8,900", byo: "-" },
    { tool: "Perplexity Pro", semiPrivate: "PKR 3,300", private: "PKR 6,700", byo: "-" },
    { tool: "Gemini 4 Ultra", semiPrivate: "-", private: "PKR 9,500", byo: "-" },
    { tool: "Research AI Pro", semiPrivate: "PKR 2,200", private: "PKR 4,200", byo: "-" },
    { tool: "AI Data Analyst Pack", semiPrivate: "-", private: "PKR 7,800", byo: "-" },
  ];

  const researchPlans = [
    {
      name: "Free Researcher",
      price: "PKR 0",
      period: "/month",
      description: "Explore open access papers",
      icon: BookOpen,
      features: [
        "Access to Open Access papers only",
        "3 AI summaries/month",
        "Basic search & filters",
        "Reading stats tracking",
      ],
      cta: "Get Started",
      ctaVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Pro Researcher",
      price: "PKR 999",
      period: "/month",
      description: "Unlock all papers + AI tools",
      icon: Crown,
      features: [
        "All papers unlocked (Open + Restricted)",
        "50 AI summaries/month",
        "5 bid tokens/month for collaborations",
        "1 free peer review request",
        "Paper comparison (up to 5/month)",
        "Research Gap Finder",
        "Lit Review Generator",
        "Export citations",
      ],
      cta: "Upgrade to Pro",
      ctaVariant: "default" as const,
      popular: true,
    },
    {
      name: "Elite Researcher",
      price: "PKR 2,499",
      period: "/month",
      description: "Unlimited AI + advanced tools",
      icon: Sparkles,
      features: [
        "Everything in Pro",
        "Unlimited AI actions",
        "15 bid tokens/month",
        "3 free peer reviews/month",
        "Verified institution badge",
        "Annotated Bibliography generator",
        "Document Chat (ask questions to papers)",
        "Plain English toggle",
        "Priority AI processing",
        "API access to research tools",
      ],
      cta: "Go Elite",
      ctaVariant: "default" as const,
      popular: false,
    },
  ];

  const comboBundles = [
    {
      name: "Research Pro + AI Essentials",
      price: "PKR 7,999",
      originalPrice: "PKR 9,499",
      savings: "Save PKR 1,500",
      includes: ["Pro Researcher plan", "AI Essentials bundle", "50 AI summaries + ChatGPT + Perplexity"],
    },
    {
      name: "Research Elite + Research Pro AI",
      price: "PKR 14,999",
      originalPrice: "PKR 18,499",
      savings: "Save PKR 3,500",
      includes: ["Elite Researcher plan", "Research Pro AI bundle", "Unlimited AI + Claude + ChatGPT + Perplexity"],
    },
    {
      name: "Full Academic Suite",
      price: "Custom",
      originalPrice: "",
      savings: "Best Value",
      includes: ["Elite Researcher", "Ultimate AI Bundle", "Enterprise features", "Contact us for pricing"],
    },
  ];

  const comparisonFeatures = [
    { feature: "Bids/month", free: "3", student: "Unlimited", researcher: "Unlimited", proResearch: "5 tokens", eliteResearch: "15 tokens" },
    { feature: "AI words/month", free: "1,000", student: "10,000", researcher: "50,000", proResearch: "50 summaries", eliteResearch: "Unlimited" },
    { feature: "Peer reviews", free: "—", student: "1 free", researcher: "3 free", proResearch: "1 free", eliteResearch: "3 free" },
    { feature: "Research papers", free: "Open Access", student: "Open Access", researcher: "Open Access", proResearch: "All unlocked", eliteResearch: "All unlocked" },
    { feature: "Verified university", free: "—", student: "Badge", researcher: "Badge + Spotlight", proResearch: "—", eliteResearch: "Badge" },
    { feature: "AI tools", free: "Basic", student: "Discounted", researcher: "Full access", proResearch: "Research tools", eliteResearch: "All tools" },
    { feature: "Document Chat", free: "—", student: "—", researcher: "—", proResearch: "—", eliteResearch: "✓" },
    { feature: "Research Gap Finder", free: "—", student: "—", researcher: "—", proResearch: "✓", eliteResearch: "✓" },
    { feature: "Lit Review Generator", free: "—", student: "—", researcher: "—", proResearch: "✓", eliteResearch: "✓" },
    { feature: "API access", free: "—", student: "—", researcher: "✓", proResearch: "—", eliteResearch: "✓" },
    { feature: "Priority support", free: "—", student: "—", researcher: "✓", proResearch: "—", eliteResearch: "✓" },
  ];

  return (
    <MainLayout>
      <SEOHead
        title="Pricing Plans"
        description="Affordable plans for students, researchers, and institutions. Start free and upgrade as you grow."
        canonicalPath="/pricing"
        keywords="pricing, subscription plans, academic tools pricing, research platform cost"
      />
      {/* Hero Section */}
      <section className="gradient-hero py-10 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-3">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Whether you're a student, researcher, or institution, we have the perfect plan for you. All prices in PKR.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <Tabs defaultValue="individual" className="w-full">
          <div className="overflow-x-auto -mx-4 px-4 mb-8 md:mb-12">
            <TabsList className="inline-flex w-auto min-w-full md:w-full max-w-2xl mx-auto">
              <TabsTrigger value="individual" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 whitespace-nowrap">
                <GraduationCap className="h-4 w-4 shrink-0" />
                Individual
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 whitespace-nowrap">
                <Zap className="h-4 w-4 shrink-0" />
                AI Tools
              </TabsTrigger>
              <TabsTrigger value="research" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 whitespace-nowrap">
                <BookOpen className="h-4 w-4 shrink-0" />
                Research
              </TabsTrigger>
              <TabsTrigger value="enterprise" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 whitespace-nowrap">
                <Building2 className="h-4 w-4 shrink-0" />
                Enterprise
              </TabsTrigger>
              <TabsTrigger value="compare" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 whitespace-nowrap">
                <Star className="h-4 w-4 shrink-0" />
                Compare
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Individual Plans */}
          <TabsContent value="individual">
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
              {individualPlans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`relative ${plan.popular ? 'border-primary shadow-lg md:scale-105' : ''}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                      <Star className="h-3 w-3 mr-1" /> Most Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-4">
                      <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={plan.ctaVariant}
                      onClick={() => setCheckoutOpen(true)}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Tools Tab */}
          <TabsContent value="tools">
            <div className="space-y-12">
              {/* Tool Bundles */}
              <div>
                <h2 className="text-2xl font-bold text-center mb-8">Tool Bundles</h2>
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {toolBundles.map((bundle, index) => (
                    <Card key={index} className="relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg">
                        {bundle.savings}
                      </div>
                      <CardHeader>
                        <CardTitle>{bundle.name}</CardTitle>
                        <CardDescription>{bundle.description}</CardDescription>
                        <div className="pt-4">
                          <span className="text-3xl font-bold">{bundle.price}</span>
                          <span className="text-muted-foreground">{bundle.period}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 mb-6">
                          {bundle.tools.map((tool, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <Check className="h-4 w-4 text-primary" />
                              {tool}
                            </li>
                          ))}
                        </ul>
                        <Button className="w-full" asChild>
                          <Link to="/tools">Get Bundle</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Individual Tools Table */}
              <div>
                <h2 className="text-2xl font-bold text-center mb-8">Individual AI Tools</h2>
                <Card className="max-w-4xl mx-auto overflow-hidden">
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-3 md:px-6 py-3 md:py-4 text-left font-semibold whitespace-nowrap">Tool</th>
                          <th className="px-2 md:px-6 py-3 md:py-4 text-center font-semibold whitespace-nowrap">Semi-Private</th>
                          <th className="px-2 md:px-6 py-3 md:py-4 text-center font-semibold whitespace-nowrap">Private</th>
                          <th className="px-2 md:px-6 py-3 md:py-4 text-center font-semibold whitespace-nowrap">BYO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiToolPricing.map((item, index) => (
                          <tr key={index} className="border-t border-border">
                            <td className="px-3 md:px-6 py-3 md:py-4 font-medium whitespace-nowrap">{item.tool}</td>
                            <td className="px-2 md:px-6 py-3 md:py-4 text-center text-muted-foreground whitespace-nowrap">{item.semiPrivate}</td>
                            <td className="px-2 md:px-6 py-3 md:py-4 text-center text-muted-foreground whitespace-nowrap">{item.private}</td>
                            <td className="px-2 md:px-6 py-3 md:py-4 text-center text-muted-foreground whitespace-nowrap">{item.byo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-4 bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">
                      All prices are per month. Multi-month discounts available.{" "}
                      <Link to="/tools" className="text-primary hover:underline">
                        View all plans →
                      </Link>
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Research Tab */}
          <TabsContent value="research">
            <div className="space-y-12">
              {/* Research Tiers */}
              <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
                {researchPlans.map((plan, index) => (
                  <Card 
                    key={index} 
                    className={`relative ${plan.popular ? 'border-primary shadow-lg md:scale-105' : ''}`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                        <Star className="h-3 w-3 mr-1" /> Best Value
                      </Badge>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <plan.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="pt-4">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">{plan.period}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full" 
                        variant={plan.ctaVariant}
                        asChild
                      >
                        <Link to="/auth">{plan.cta}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Paper + AI Tools Combo Bundles */}
              <div>
                <h2 className="text-2xl font-bold text-center mb-2">Paper + AI Tools Combo</h2>
                <p className="text-muted-foreground text-center mb-8 max-w-xl mx-auto">
                  Bundle research access with AI tools for maximum value
                </p>
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {comboBundles.map((bundle, index) => (
                    <Card key={index} className="relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg">
                        {bundle.savings}
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg">{bundle.name}</CardTitle>
                        <div className="pt-3">
                          <span className="text-3xl font-bold">{bundle.price}</span>
                          {bundle.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through ml-2">{bundle.originalPrice}</span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 mb-6">
                          {bundle.includes.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <Check className="h-4 w-4 text-primary shrink-0" />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                        <Button className="w-full" variant={bundle.price === "Custom" ? "outline" : "default"} asChild>
                          <Link to={bundle.price === "Custom" ? "/contact" : "/auth"}>
                            {bundle.price === "Custom" ? "Contact Sales" : "Get Bundle"}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Enterprise Tab */}
          <TabsContent value="enterprise">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {enterprisePlans.map((plan, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <Badge variant="secondary">{plan.seats}</Badge>
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-4">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" variant={plan.name === "Enterprise" ? "default" : "outline"} asChild>
                      <Link to="/contact">
                        {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Compare All Plans Tab */}
          <TabsContent value="compare">
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold text-center mb-2">All-in-One Comparison</h2>
                <p className="text-muted-foreground text-center mb-8 max-w-xl mx-auto">
                  See exactly what's included in every plan at a glance
                </p>
                <Card className="max-w-6xl mx-auto overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold min-w-[160px]">Feature</TableHead>
                          <TableHead className="text-center font-semibold min-w-[100px]">Basic</TableHead>
                          <TableHead className="text-center font-semibold min-w-[100px]">
                            <div className="flex flex-col items-center gap-1">
                              <span>Career</span>
                              <span className="text-xs text-primary font-normal">PKR 499</span>
                            </div>
                          </TableHead>
                          <TableHead className="text-center font-semibold min-w-[110px]">
                            <div className="flex flex-col items-center gap-1">
                              <span>Business</span>
                              <span className="text-xs text-primary font-normal">PKR 1,999</span>
                            </div>
                          </TableHead>
                          <TableHead className="text-center font-semibold min-w-[110px]">
                            <div className="flex flex-col items-center gap-1">
                              <span>Pro Research</span>
                              <span className="text-xs text-primary font-normal">PKR 999</span>
                            </div>
                          </TableHead>
                          <TableHead className="text-center font-semibold min-w-[120px]">
                            <div className="flex flex-col items-center gap-1">
                              <span>Elite Research</span>
                              <span className="text-xs text-primary font-normal">PKR 2,499</span>
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparisonFeatures.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{row.feature}</TableCell>
                            <TableCell className="text-center text-muted-foreground">{row.free}</TableCell>
                            <TableCell className="text-center text-muted-foreground">{row.student}</TableCell>
                            <TableCell className="text-center text-muted-foreground">{row.researcher}</TableCell>
                            <TableCell className="text-center text-muted-foreground">{row.proResearch}</TableCell>
                            <TableCell className="text-center text-muted-foreground">{row.eliteResearch}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>

              {/* Verified Universities Banner */}
              <Card className="max-w-4xl mx-auto bg-primary/5 border-primary/20">
                <CardContent className="py-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center md:text-left flex-1">
                      <h3 className="text-xl font-bold mb-2">Trusted by 50+ Verified Pakistani Universities</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Students with .edu email get automatic verification and unlock exclusive badges, peer review access, and institutional spotlights on their profile.
                      </p>
                      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        {["LUMS", "NUST", "FAST", "COMSATS", "UET", "QAU", "IBA", "GCU"].map((uni) => (
                          <Badge key={uni} variant="secondary" className="text-xs">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            {uni}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="text-xs">+42 more</Badge>
                      </div>
                    </div>
                    <Button asChild className="shrink-0">
                      <Link to="/auth">Verify Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Payment Methods */}
        <section className="mt-16 text-center">
          <h3 className="text-lg font-semibold mb-4">Accepted Payment Methods</h3>
          <div className="flex flex-wrap justify-center gap-4 items-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <div className="w-8 h-8 bg-[#00a651] rounded flex items-center justify-center text-white text-xs font-bold">EP</div>
              <span className="text-sm">EasyPaisa</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <div className="w-8 h-8 bg-[#ed1c24] rounded flex items-center justify-center text-white text-xs font-bold">JC</div>
              <span className="text-sm">JazzCash</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">V</div>
              <span className="text-sm">Visa / Mastercard</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <div className="w-8 h-8 bg-foreground rounded flex items-center justify-center text-background text-xs font-bold">BT</div>
              <span className="text-sm">Bank Transfer</span>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "What is Semi-Private vs Private access?",
                a: "Semi-Private accounts are shared with 2-4 other users, offering lower prices. Private accounts are exclusively yours with no sharing.",
              },
              {
                q: "What's included in the Research tiers?",
                a: "Free gives you Open Access papers and 3 AI summaries. Pro unlocks all papers with 50 AI actions, 5 bid tokens, and 1 peer review. Elite gives unlimited AI with Document Chat, Bibliography generator, 15 bid tokens, 3 peer reviews, and more.",
              },
              {
                q: "What are bid tokens?",
                a: "Bid tokens let you submit proposals on research collaboration projects. Free users get 3 bids/month, while Student and Researcher plans offer unlimited bids. Research tiers include 5-15 tokens for cross-platform collaboration.",
              },
              {
                q: "How does the verified university badge work?",
                a: "Students and researchers with a .edu email get automatic verification. This unlocks a verified badge on your profile, access to peer reviews, and institutional spotlight features.",
              },
              {
                q: "Can I switch plans later?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.",
              },
              {
                q: "Do you offer refunds?",
                a: "We offer a 7-day money-back guarantee on all plans. If you're not satisfied, contact support for a full refund.",
              },
              {
                q: "How do JazzCash/EasyPaisa payments work?",
                a: "Simply select your preferred mobile wallet at checkout. You'll receive a payment request or can pay via account number.",
              },
            ].map((faq, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
      <SubscriptionCheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </MainLayout>
  );
};

export default PricingPage;