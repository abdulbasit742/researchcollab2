import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { PLANS } from "@/lib/revenue/plans";
import { Helmet } from "react-helmet-async";

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <>
      <Helmet>
        <title>Pricing — ResearchCollab</title>
        <meta name="description" content="Plans for students, researchers, supervisors, departments, and enterprises. Start free." />
      </Helmet>
      <div className="container max-w-7xl mx-auto py-12 px-4">
        <div className="text-center mb-10 space-y-3">
          <Badge variant="secondary"><Sparkles className="h-3 w-3 mr-1" /> Demo mode — no real charges yet</Badge>
          <h1 className="text-4xl font-bold tracking-tight">Plans built for every research stage</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From your first FYP to running a full department program. Start free, upgrade when you need more.
          </p>
          <div className="inline-flex items-center gap-3 pt-4">
            <span className={!yearly ? "font-medium" : "text-muted-foreground"}>Monthly</span>
            <Switch checked={yearly} onCheckedChange={setYearly} />
            <span className={yearly ? "font-medium" : "text-muted-foreground"}>
              Yearly <Badge variant="outline" className="ml-1 text-[10px]">Save 20%</Badge>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PLANS.map((p) => {
            const price = yearly ? Math.round(p.priceYearly / 12) : p.priceMonthly;
            const isContact = p.id === "enterprise";
            return (
              <Card key={p.id} className={`relative flex flex-col ${p.popular ? "border-primary shadow-lg" : ""}`}>
                {p.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">Most popular</Badge>
                )}
                <CardHeader>
                  <CardTitle>{p.name}</CardTitle>
                  <CardDescription>{p.tagline}</CardDescription>
                  <div className="pt-3">
                    {isContact ? (
                      <div className="text-3xl font-bold">Custom</div>
                    ) : p.priceMonthly === 0 ? (
                      <div className="text-3xl font-bold">Free</div>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold">PKR {price.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                        {yearly && <div className="text-[11px] text-muted-foreground">billed PKR {p.priceYearly.toLocaleString()}/yr</div>}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">{p.audience}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2 text-sm flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-6 w-full"
                    variant={p.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link to={isContact ? "/contact" : p.id === "department" ? "/admin/department-sales" : `/checkout?plan=${p.id}`}>
                      {p.cta}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-3">Need help choosing?</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" asChild><Link to="/contact">Talk to sales</Link></Button>
            <Button variant="ghost" asChild><Link to="/billing">View billing</Link></Button>
          </div>
        </div>
      </div>
    </>
  );
}
