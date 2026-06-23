import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Download, FileText, ArrowUpRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { AICreditsPanel } from "@/components/revenue/AICreditsPanel";
import { UsageLimitBar } from "@/components/revenue/UsageLimitBar";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { getPlan } from "@/lib/revenue/plans";

const SAMPLE_INVOICES = [
  { id: "INV-2026-0423", date: "2026-06-01", item: "Student Pro — Monthly", amount: 1500, status: "Paid" },
  { id: "INV-2026-0388", date: "2026-05-01", item: "Student Pro — Monthly", amount: 1500, status: "Paid" },
  { id: "INV-2026-0356", date: "2026-04-15", item: "AI Credits 2,000 pack", amount: 1799, status: "Paid" },
  { id: "INV-2026-0301", date: "2026-04-01", item: "Student Pro — Monthly", amount: 1500, status: "Paid" },
];

export default function BillingPage() {
  const currentPlan = getPlan("student_pro");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [invoiceOpen, setInvoiceOpen] = useState<typeof SAMPLE_INVOICES[0] | null>(null);

  return (
    <>
      <Helmet><title>Billing — ResearchCollab</title></Helmet>
      <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Billing & Subscription</h1>
            <p className="text-sm text-muted-foreground">Manage your plan, credits, and invoices</p>
          </div>
          <Badge variant="secondary">Demo mode</Badge>
        </div>

        <Tabs defaultValue="plan">
          <TabsList>
            <TabsTrigger value="plan">Plan</TabsTrigger>
            <TabsTrigger value="credits">AI Credits</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <CardTitle>{currentPlan.name}</CardTitle>
                    <CardDescription>{currentPlan.tagline}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">PKR {currentPlan.priceMonthly.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                    <div className="text-xs text-muted-foreground">Next billing: Jul 1, 2026</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <InfoRow label="Billing cycle" value="Monthly" />
                  <InfoRow label="Status" value={<Badge variant="default" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">Active</Badge>} />
                  <InfoRow label="Payment method" value="Demo card •••• 4242" />
                  <InfoRow label="Member since" value="Mar 12, 2026" />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button asChild><Link to="/pricing">Upgrade <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button>
                  <Button variant="outline" asChild><Link to="/pricing">Change plan</Link></Button>
                  <Button variant="ghost" className="text-destructive" onClick={() => setCancelOpen(true)}>Cancel plan</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credits">
            <div className="grid md:grid-cols-2 gap-4">
              <AICreditsPanel monthlyAllowance={1500} used={1080} />
              <Card>
                <CardHeader><CardTitle className="text-base">Credit packs</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { c: 500, p: 499 }, { c: 2000, p: 1799 }, { c: 5000, p: 3999 }, { c: 12000, p: 8999 },
                  ].map(pk => (
                    <div key={pk.c} className="flex justify-between items-center border rounded-md p-3">
                      <div>
                        <div className="font-medium">{pk.c.toLocaleString()} credits</div>
                        <div className="text-xs text-muted-foreground">PKR {(pk.p / pk.c).toFixed(2)} / credit</div>
                      </div>
                      <Button size="sm" asChild>
                        <Link to={`/checkout?credits=${pk.c}`}>PKR {pk.p.toLocaleString()}</Link>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usage">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">This month's usage</CardTitle>
                <CardDescription>Limits reset on the 1st of each month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <UsageLimitBar label="Active projects" used={1} limit={currentPlan.limits.projects} feature="Unlimited projects" />
                <UsageLimitBar label="AI credits" used={1080} limit={currentPlan.limits.aiCredits} feature="Higher AI credit allowance" />
                <UsageLimitBar label="Report exports" used={16} limit={currentPlan.limits.reportExports} feature="More report exports" recommendedPlan="researcher_pro" />
                <UsageLimitBar label="Storage" used={14} limit={currentPlan.limits.storageGb} unit=" GB" feature="More storage" recommendedPlan="researcher_pro" />
                <UsageLimitBar label="Marketplace services" used={0} limit={currentPlan.limits.marketplaceServices} feature="Sell on marketplace" recommendedPlan="researcher_pro" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Invoice history</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {SAMPLE_INVOICES.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{inv.id}</div>
                          <div className="text-xs text-muted-foreground">{inv.date} · {inv.item}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm">PKR {inv.amount.toLocaleString()}</span>
                        <Badge variant="outline" className="text-emerald-600">{inv.status}</Badge>
                        <Button size="sm" variant="ghost" onClick={() => setInvoiceOpen(inv)}>
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancel dialog with churn prevention */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-600" /> Before you cancel…</DialogTitle>
            <DialogDescription>Help us understand — and consider these alternatives.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea placeholder="What didn't work for you?" value={reason} onChange={e => setReason(e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => { toast.success("Switched to Free — keep your data"); setCancelOpen(false); }}>Downgrade to Free</Button>
              <Button variant="outline" size="sm" onClick={() => { toast.success("Plan paused for 30 days"); setCancelOpen(false); }}>Pause 30 days</Button>
              <Button variant="outline" size="sm" onClick={() => { toast.success("500 bonus credits added"); setCancelOpen(false); }}>+500 free credits</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>Keep my plan</Button>
            <Button variant="destructive" onClick={() => { toast("Cancellation recorded (demo)"); setCancelOpen(false); }}>
              Confirm cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice detail */}
      <Dialog open={!!invoiceOpen} onOpenChange={(o) => !o && setInvoiceOpen(null)}>
        <DialogContent>
          {invoiceOpen && (
            <>
              <DialogHeader>
                <DialogTitle>{invoiceOpen.id}</DialogTitle>
                <DialogDescription>{invoiceOpen.date}</DialogDescription>
              </DialogHeader>
              <div className="rounded-md border p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Description</span><span>{invoiceOpen.item}</span></div>
                <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">PKR {invoiceOpen.amount.toLocaleString()}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Tax</span><span className="font-mono">PKR 0</span></div>
                <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span className="font-mono">PKR {invoiceOpen.amount.toLocaleString()}</span></div>
                <Badge variant="outline" className="text-emerald-600">{invoiceOpen.status}</Badge>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => toast("PDF export coming soon")}><Download className="mr-1 h-3 w-3" /> Download PDF</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
