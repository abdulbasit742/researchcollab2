import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  Globe,
  Shield,
  TrendingUp,
  Check,
  X,
  Edit,
  Plus,
  AlertTriangle,
  Building2,
} from "lucide-react";

interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  trustModifier: number;
  isActive: boolean;
}

interface CountryPricing {
  country: string;
  code: string;
  modifier: number;
  currency: string;
}

interface ABTest {
  id: string;
  name: string;
  variants: { name: string; price: number; conversions: number; trials: number }[];
  status: "active" | "paused" | "completed";
  winner?: string;
}

export default function AdminPricingPage() {
  const { toast } = useToast();
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [countryPricing, setCountryPricing] = useState<CountryPricing[]>([]);
  const [abTests, setABTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch subscription tiers
      const { data: tiersData } = await supabase
        .from("subscription_tiers")
        .select("*")
        .order("price_monthly");

      if (tiersData) {
        setTiers(
          tiersData.map((t) => ({
            id: t.id,
            name: t.name,
            monthlyPrice: t.price_monthly,
            yearlyPrice: t.price_yearly,
            features: Array.isArray(t.features) ? (t.features as string[]) : [],
            trustModifier: 0,
            isActive: t.is_active,
          }))
        );
      }

      // Simulated country pricing
      setCountryPricing([
        { country: "Pakistan", code: "PK", modifier: 1.0, currency: "PKR" },
        { country: "India", code: "IN", modifier: 0.8, currency: "INR" },
        { country: "Bangladesh", code: "BD", modifier: 0.7, currency: "BDT" },
        { country: "United States", code: "US", modifier: 2.5, currency: "USD" },
        { country: "United Kingdom", code: "GB", modifier: 2.2, currency: "GBP" },
      ]);

      // Simulated A/B tests
      setABTests([
        {
          id: "1",
          name: "Student Plan Price Test",
          variants: [
            { name: "Control (PKR 499)", price: 499, conversions: 45, trials: 200 },
            { name: "Variant A (PKR 399)", price: 399, conversions: 62, trials: 195 },
            { name: "Variant B (PKR 599)", price: 599, conversions: 38, trials: 198 },
          ],
          status: "active",
        },
        {
          id: "2",
          name: "Annual Discount Test",
          variants: [
            { name: "16% discount", price: 4999, conversions: 28, trials: 100 },
            { name: "25% discount", price: 4499, conversions: 42, trials: 105 },
          ],
          status: "completed",
          winner: "25% discount",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateTierPrice = async (tierId: string, monthlyPrice: number, yearlyPrice: number) => {
    const { error } = await supabase
      .from("subscription_tiers")
      .update({
        price_monthly: monthlyPrice,
        price_yearly: yearlyPrice,
      })
      .eq("id", tierId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Price Updated", description: "Tier pricing has been updated." });
      fetchData();
    }
  };

  const toggleTierActive = async (tierId: string, isActive: boolean) => {
    const { error } = await supabase
      .from("subscription_tiers")
      .update({ is_active: isActive })
      .eq("id", tierId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tier Updated", description: `Tier ${isActive ? "activated" : "deactivated"}.` });
      fetchData();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Pricing Intelligence
          </h1>
          <p className="text-muted-foreground">Manage pricing, experiments, and regional adjustments</p>
        </div>

        {/* Core Principles Banner */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Pricing Principles (No Dark Patterns)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No countdown timers • No fake urgency • No feature removal threats • Clear cancellation paths
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="tiers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tiers">Plan Tiers</TabsTrigger>
            <TabsTrigger value="regional">Regional Pricing</TabsTrigger>
            <TabsTrigger value="experiments">A/B Tests</TabsTrigger>
            <TabsTrigger value="institutional">Institutional</TabsTrigger>
          </TabsList>

          <TabsContent value="tiers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Subscription Tiers</CardTitle>
                    <CardDescription>Configure plan pricing and features</CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tier
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead className="text-right">Monthly</TableHead>
                      <TableHead className="text-right">Yearly</TableHead>
                      <TableHead className="text-right">Features</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tiers.map((tier) => (
                      <TableRow key={tier.id}>
                        <TableCell className="font-medium">{tier.name}</TableCell>
                        <TableCell className="text-right">PKR {tier.monthlyPrice.toLocaleString()}</TableCell>
                        <TableCell className="text-right">PKR {tier.yearlyPrice.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{tier.features.length} features</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Switch
                            checked={tier.isActive}
                            onCheckedChange={(checked) => toggleTierActive(tier.id, checked)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit {tier.name} Pricing</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Monthly Price (PKR)</Label>
                                  <Input
                                    type="number"
                                    defaultValue={tier.monthlyPrice}
                                    id={`monthly-${tier.id}`}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Yearly Price (PKR)</Label>
                                  <Input
                                    type="number"
                                    defaultValue={tier.yearlyPrice}
                                    id={`yearly-${tier.id}`}
                                  />
                                </div>
                                <Button
                                  className="w-full"
                                  onClick={() => {
                                    const monthly = Number(
                                      (document.getElementById(`monthly-${tier.id}`) as HTMLInputElement)?.value
                                    );
                                    const yearly = Number(
                                      (document.getElementById(`yearly-${tier.id}`) as HTMLInputElement)?.value
                                    );
                                    updateTierPrice(tier.id, monthly, yearly);
                                  }}
                                >
                                  Save Changes
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Value Explanation Card */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Outcome-Based Value Explanation</CardTitle>
                <CardDescription>What users see on the pricing page</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="font-medium text-sm">Free Plan</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Access to public opportunities. Limited matching. Basic trust score.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
                    <p className="font-medium text-sm">Premium Plan</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Unlocks 3x more opportunities. AI career copilot. Full trust insights. Priority matching.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="font-medium text-sm">Institution Plan</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Team management. Bulk verification. Custom reporting. Dedicated support.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regional">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Country-Aware Pricing
                    </CardTitle>
                    <CardDescription>Fair pricing based on regional purchasing power</CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Country
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead className="text-right">Price Modifier</TableHead>
                      <TableHead className="text-right">Currency</TableHead>
                      <TableHead className="text-right">Effective Price (Student)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {countryPricing.map((country) => {
                      const basePrice = tiers.find((t) => t.name === "Student")?.monthlyPrice || 499;
                      const effectivePrice = Math.round(basePrice * country.modifier);
                      return (
                        <TableRow key={country.code}>
                          <TableCell className="font-medium">{country.country}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{country.code}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {country.modifier}x
                            {country.modifier < 1 && (
                              <span className="text-emerald-600 text-xs ml-1">
                                ({((1 - country.modifier) * 100).toFixed(0)}% discount)
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{country.currency}</TableCell>
                          <TableCell className="text-right font-medium">
                            {country.currency} {effectivePrice.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experiments">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Pricing A/B Tests
                    </CardTitle>
                    <CardDescription>Experiment with price points without dark patterns</CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Experiment
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {abTests.map((test) => (
                  <Card key={test.id} className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{test.name}</CardTitle>
                        <Badge
                          variant={
                            test.status === "active" ? "default" :
                            test.status === "completed" ? "secondary" : "outline"
                          }
                        >
                          {test.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Variant</TableHead>
                            <TableHead className="text-right">Trials</TableHead>
                            <TableHead className="text-right">Conversions</TableHead>
                            <TableHead className="text-right">Rate</TableHead>
                            <TableHead className="text-right">Result</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {test.variants.map((variant, i) => {
                            const rate = (variant.conversions / variant.trials) * 100;
                            const isWinner = test.winner === variant.name;
                            return (
                              <TableRow key={i}>
                                <TableCell className="font-medium">{variant.name}</TableCell>
                                <TableCell className="text-right">{variant.trials}</TableCell>
                                <TableCell className="text-right">{variant.conversions}</TableCell>
                                <TableCell className="text-right">{rate.toFixed(1)}%</TableCell>
                                <TableCell className="text-right">
                                  {isWinner ? (
                                    <Badge className="bg-emerald-500">Winner</Badge>
                                  ) : test.status === "completed" ? (
                                    <X className="h-4 w-4 text-muted-foreground inline" />
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="institutional">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Institutional Pricing Presets
                </CardTitle>
                <CardDescription>Pre-configured pricing for universities and organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Preset</TableHead>
                      <TableHead>Seats</TableHead>
                      <TableHead className="text-right">Per Seat / Month</TableHead>
                      <TableHead className="text-right">Total / Month</TableHead>
                      <TableHead>Features</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Research Lab</TableCell>
                      <TableCell>Up to 10</TableCell>
                      <TableCell className="text-right">PKR 450</TableCell>
                      <TableCell className="text-right">PKR 4,500</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Basic Team</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Department</TableCell>
                      <TableCell>Up to 50</TableCell>
                      <TableCell className="text-right">PKR 350</TableCell>
                      <TableCell className="text-right">PKR 17,500</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Advanced Team</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">University</TableCell>
                      <TableCell>Unlimited</TableCell>
                      <TableCell className="text-right">Custom</TableCell>
                      <TableCell className="text-right">Contact Sales</TableCell>
                      <TableCell>
                        <Badge>Enterprise</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
