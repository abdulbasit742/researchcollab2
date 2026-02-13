import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/currency";

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

export function EarnPricingSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            Pricing Plans
          </Badge>
          <h2 className="text-2xl md:text-4xl font-bold">
            Choose Your <span className="text-gradient">Growth Plan</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Start free and scale as you earn. Upgrade anytime to unlock premium features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
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
    </section>
  );
}
