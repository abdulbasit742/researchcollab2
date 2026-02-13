import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Sparkles, BookOpen, Package, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/currency";
import { toolBundles, tools } from "@/data/tools";

const plans = [
  {
    name: "Free",
    price: 0,
    period: "/mo",
    description: "Get started with essential tools at no cost.",
    variant: "outline" as const,
    popular: false,
    features: [
      "Browse all projects",
      "Submit up to 3 bids/month",
      "Basic profile",
      "Community support",
    ],
    cta: "Get Started",
  },
  {
    name: "Student",
    price: 499,
    period: "/mo",
    description: "Unlock more opportunities and stand out.",
    variant: "premium" as const,
    popular: true,
    features: [
      "Unlimited bids",
      "Priority in search results",
      "Verified student badge",
      "Earnings dashboard",
      "Direct messaging",
      "AI-assisted proposals",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Researcher",
    price: 1999,
    period: "/mo",
    description: "Full power for serious academic professionals.",
    variant: "elevated" as const,
    popular: false,
    features: [
      "Everything in Student",
      "Post unlimited projects",
      "Advanced analytics",
      "Priority support",
      "Team collaboration",
      "Custom invoicing",
      "API access",
    ],
    cta: "Upgrade Now",
  },
];

const researchTiers = [
  {
    name: "Free Researcher",
    price: 0,
    period: "/mo",
    description: "Access open research and get started with AI summaries.",
    variant: "outline" as const,
    popular: false,
    features: [
      "Open Access papers only",
      "3 AI summaries/month",
      "Basic search & filters",
      "Reading stats dashboard",
    ],
    cta: "Start Free",
  },
  {
    name: "Pro Researcher",
    price: 999,
    period: "/mo",
    description: "Unlock all papers and powerful research tools.",
    variant: "premium" as const,
    popular: true,
    features: [
      "All papers unlocked",
      "50 AI summaries/month",
      "Paper comparison tool",
      "Research Gap Finder",
      "Lit Review Generator",
      "Export citations (APA, MLA, Chicago)",
    ],
    cta: "Go Pro",
  },
  {
    name: "Elite Researcher",
    price: 2499,
    period: "/mo",
    description: "Unlimited AI power and premium research features.",
    variant: "elevated" as const,
    popular: false,
    features: [
      "Everything in Pro",
      "Unlimited AI summaries",
      "Annotated Bibliography export",
      "Document Chat (ask your paper)",
      "Plain English toggle",
      "Priority processing",
      "API access",
    ],
    cta: "Go Elite",
  },
];

const combos = [
  {
    name: "Research Pro + AI Essentials",
    price: 7999,
    savings: 1500,
    description: "Pro paper access paired with starter AI tools for efficient research.",
    features: ["Pro Researcher tier", "Research Starter AI Bundle", "Priority support"],
  },
  {
    name: "Research Elite + Pro AI",
    price: 14999,
    savings: 3500,
    description: "Elite access with publication-ready AI tools for serious academics.",
    features: ["Elite Researcher tier", "Publication Ready AI Bundle", "Document Chat", "API access"],
  },
  {
    name: "Full Academic Suite",
    price: null,
    savings: null,
    description: "Everything we offer — custom-priced for institutions and power users.",
    features: ["Elite Researcher tier", "Complete Research Suite", "Team collaboration", "Dedicated support", "Custom integrations"],
  },
];

function PlanCards({ items, sectionId }: { items: typeof plans; sectionId: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {items.map((plan, i) => (
        <motion.div
          key={`${sectionId}-${plan.name}`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        >
          <Card
            variant={plan.variant}
            className={`relative h-full flex flex-col ${plan.popular ? "ring-2 ring-primary/50" : ""}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="gradient-primary text-primary-foreground shadow-md">
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">{formatPKR(plan.price)}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.popular ? "hero" : "outline"}
                className="w-full"
                asChild
              >
                <Link to="/pricing">{plan.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function SectionHeader({ icon: Icon, label, title, highlight, subtitle }: {
  icon: React.ElementType;
  label: string;
  title: string;
  highlight: string;
  subtitle: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="text-center mb-12"
    >
      <Badge variant="secondary" className="mb-4">
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
      <h2 className="text-2xl md:text-4xl font-bold">
        {title} <span className="text-gradient">{highlight}</span>
      </h2>
      <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{subtitle}</p>
    </motion.div>
  );
}

export function EarnPricingSection() {
  const getToolNames = (toolIds: string[]) =>
    toolIds.map((id) => tools.find((t) => t.id === id)?.name ?? id);

  return (
    <section className="py-16 md:py-24 space-y-24">
      <div className="container px-4 md:px-6">
        {/* Individual Plans */}
        <SectionHeader
          icon={Sparkles}
          label="Pricing Plans"
          title="Choose Your"
          highlight="Growth Plan"
          subtitle="Start free and scale as you earn. Upgrade anytime to unlock premium features."
        />
        <PlanCards items={plans} sectionId="plans" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-center mt-8"
        >
          <Button variant="link" asChild>
            <Link to="/pricing">
              View all plans & tool bundles
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Research Paper Tiers */}
      <div className="container px-4 md:px-6">
        <SectionHeader
          icon={BookOpen}
          label="Research Paper Access"
          title="Unlock"
          highlight="Research Papers"
          subtitle="From open access to unlimited AI-powered research tools — pick the tier that fits your workflow."
        />
        <PlanCards items={researchTiers} sectionId="research" />
      </div>

      {/* AI Tools Bundles */}
      <div className="container px-4 md:px-6">
        <SectionHeader
          icon={Package}
          label="AI Tools Bundles"
          title="Save with"
          highlight="Tool Bundles"
          subtitle="Pre-packaged AI tool bundles at discounted rates for every research need."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {toolBundles.map((bundle, i) => (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card variant="elevated" className="relative h-full flex flex-col">
                <div className="absolute -top-3 right-4">
                  <Badge variant="success">{bundle.discount}% OFF</Badge>
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">{bundle.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{bundle.description}</p>
                  <div className="mt-3">
                    <span className="text-2xl font-bold">{formatPKR(bundle.price)}</span>
                    <span className="text-muted-foreground text-sm line-through ml-2">
                      {formatPKR(bundle.originalPrice)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Includes:</p>
                  <ul className="space-y-2 flex-1 mb-6">
                    {getToolNames(bundle.tools).map((name) => (
                      <li key={name} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{name}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/pricing">Get Bundle</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Combo Deals */}
      <div className="container px-4 md:px-6">
        <SectionHeader
          icon={Zap}
          label="Combo Deals"
          title="Best Value"
          highlight="Combos"
          subtitle="Pair research access with AI tools for maximum savings."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {combos.map((combo, i) => (
            <motion.div
              key={combo.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card variant="glow" className="relative h-full flex flex-col">
                {combo.savings && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="warning">Save {formatPKR(combo.savings)}</Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">{combo.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{combo.description}</p>
                  <div className="mt-3">
                    {combo.price ? (
                      <span className="text-2xl font-bold">{formatPKR(combo.price)}</span>
                    ) : (
                      <span className="text-2xl font-bold text-gradient">Custom</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2 flex-1 mb-6">
                    {combo.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="hero" className="w-full" asChild>
                    <Link to="/pricing">{combo.price ? "Get Combo" : "Contact Us"}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
