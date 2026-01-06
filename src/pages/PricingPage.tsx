import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Sparkles, Users, Building2, GraduationCap, Zap, Star } from "lucide-react";
import { Link } from "react-router-dom";

const PricingPage = () => {
  const individualPlans = [
    {
      name: "Free",
      price: "PKR 0",
      period: "/month",
      description: "Get started with basic features",
      features: [
        "Access to public tools directory",
        "5 collaboration requests/month",
        "Basic profile",
        "Community support",
      ],
      cta: "Get Started",
      ctaVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Student",
      price: "PKR 499",
      period: "/month",
      description: "Perfect for students and learners",
      features: [
        "Everything in Free",
        "Unlimited collaboration requests",
        "Priority matching with researchers",
        "Access to discounted AI tools",
        "Profile verification badge",
        "Email support",
      ],
      cta: "Start Free Trial",
      ctaVariant: "default" as const,
      popular: true,
    },
    {
      name: "Researcher",
      price: "PKR 1,999",
      period: "/month",
      description: "For researchers and academics",
      features: [
        "Everything in Student",
        "Post unlimited projects",
        "AI project scoping assistant",
        "Advanced analytics",
        "Research verification badge",
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

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you're a student, researcher, or institution, we have the perfect plan for you. All prices in PKR.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
            <TabsTrigger value="individual" className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              AI Tools
            </TabsTrigger>
            <TabsTrigger value="enterprise" className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              Enterprise
            </TabsTrigger>
          </TabsList>

          {/* Individual Plans */}
          <TabsContent value="individual">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {individualPlans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
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
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-6 py-4 text-left font-semibold">Tool</th>
                          <th className="px-6 py-4 text-center font-semibold">Semi-Private</th>
                          <th className="px-6 py-4 text-center font-semibold">Private</th>
                          <th className="px-6 py-4 text-center font-semibold">BYO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiToolPricing.map((item, index) => (
                          <tr key={index} className="border-t border-border">
                            <td className="px-6 py-4 font-medium">{item.tool}</td>
                            <td className="px-6 py-4 text-center text-muted-foreground">{item.semiPrivate}</td>
                            <td className="px-6 py-4 text-center text-muted-foreground">{item.private}</td>
                            <td className="px-6 py-4 text-center text-muted-foreground">{item.byo}</td>
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
    </MainLayout>
  );
};

export default PricingPage;
