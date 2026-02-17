import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingUp, AlertTriangle, DollarSign, Building2, Target, BarChart3, Shield } from "lucide-react";
import { useState, useMemo } from "react";
import { formatPKR } from "@/lib/currency";

const InstitutionalROICalculatorPage = () => {
  // Inputs
  const [universities, setUniversities] = useState([1, 3, 8, 20, 50]);
  const [researchPerUni, setResearchPerUni] = useState(200);
  const [implReadyPct, setImplReadyPct] = useState(20);
  const [fundedPct, setFundedPct] = useState(25);
  const [avgFunding, setAvgFunding] = useState(4000);
  const [commission, setCommission] = useState(8);
  const [escrowFee, setEscrowFee] = useState(2);
  const [subscription, setSubscription] = useState(12000);
  const [milestoneCompletion, setMilestoneCompletion] = useState(75);

  // Worst case overrides
  const [showWorstCase, setShowWorstCase] = useState(false);

  const projections = useMemo(() => {
    return universities.map((unis, yr) => {
      const totalResearch = unis * researchPerUni;
      const implReady = totalResearch * (implReadyPct / 100);
      const funded = implReady * (fundedPct / 100);
      const gmv = funded * avgFunding;
      const commissionRev = gmv * (commission / 100);
      const escrowRev = gmv * (escrowFee / 100);
      const subRev = unis * subscription;
      const totalRev = commissionRev + escrowRev + subRev;
      return {
        year: yr + 1, unis, totalResearch, implReady: Math.round(implReady),
        funded: Math.round(funded), gmv, commissionRev, escrowRev, subRev, totalRev,
      };
    });
  }, [universities, researchPerUni, implReadyPct, fundedPct, avgFunding, commission, escrowFee, subscription]);

  const worstCase = useMemo(() => {
    return universities.map((unis, yr) => {
      const totalResearch = unis * researchPerUni;
      const implReady = totalResearch * 0.15;
      const funded = implReady * 0.15;
      const gmv = funded * 2500;
      const commissionRev = gmv * (commission / 100);
      const escrowRev = gmv * (escrowFee / 100);
      const subRev = unis * subscription;
      const totalRev = commissionRev + escrowRev + subRev;
      return {
        year: yr + 1, unis, totalResearch, implReady: Math.round(implReady),
        funded: Math.round(funded), gmv, commissionRev, escrowRev, subRev, totalRev,
      };
    });
  }, [universities, researchPerUni, commission, escrowFee, subscription]);

  // Cost model (PKR equivalent, emerging market team)
  const annualCosts = [
    { year: 1, engineering: 6000000, cloud: 600000, legal: 1200000, sales: 2400000, cs: 1200000, admin: 1800000, payments: 300000 },
    { year: 2, engineering: 9000000, cloud: 1200000, legal: 1800000, sales: 4800000, cs: 2400000, admin: 2400000, payments: 600000 },
    { year: 3, engineering: 14000000, cloud: 2400000, legal: 2400000, sales: 7200000, cs: 4800000, admin: 3600000, payments: 1200000 },
    { year: 4, engineering: 20000000, cloud: 4800000, legal: 3600000, sales: 12000000, cs: 7200000, admin: 4800000, payments: 2400000 },
    { year: 5, engineering: 28000000, cloud: 7200000, legal: 4800000, sales: 18000000, cs: 12000000, admin: 7200000, payments: 4800000 },
  ];

  const costTotals = annualCosts.map(c => ({
    year: c.year,
    total: c.engineering + c.cloud + c.legal + c.sales + c.cs + c.admin + c.payments,
    ...c,
  }));

  const breakEvenYear = projections.findIndex((p, i) => p.totalRev >= costTotals[i]?.total);

  // Sensitivity analysis
  const sensitivities = [
    { variable: "Commission Rate", change: "+5%", impact: projections[4] ? ((projections[4].gmv * 0.05)).toFixed(0) : "0" },
    { variable: "Commission Rate", change: "-5%", impact: projections[4] ? (-(projections[4].gmv * 0.05)).toFixed(0) : "0" },
    { variable: "Avg Funding", change: "+$1,000", impact: projections[4] ? ((projections[4].funded * 1000 * (commission / 100))).toFixed(0) : "0" },
    { variable: "Avg Funding", change: "-$1,000", impact: projections[4] ? (-(projections[4].funded * 1000 * (commission / 100))).toFixed(0) : "0" },
    { variable: "Funding Conversion", change: "+5%", impact: projections[4] ? ((projections[4].implReady * 0.05 * avgFunding * (commission / 100))).toFixed(0) : "0" },
    { variable: "Universities", change: "+5", impact: ((5 * researchPerUni * (implReadyPct / 100) * (fundedPct / 100) * avgFunding * (commission / 100)) + 5 * subscription).toFixed(0) },
  ];

  // Moat assessment
  const moatFactors = [
    { factor: "Historical execution data", strength: "Strong", note: "Cannot be replicated elsewhere" },
    { factor: "Revenue performance records", strength: "Strong", note: "Verified financial track record" },
    { factor: "Institutional trust capital", strength: "Medium", note: "Takes 2+ years to build" },
    { factor: "Escrow-backed contracts", strength: "Strong", note: "Active contracts prevent switching" },
    { factor: "Student earnings history", strength: "Medium", note: "Portable but context-dependent" },
    { factor: "Productivity index trajectory", strength: "Strong", note: "Lost on departure" },
  ];

  const modelVerdict = projections[4]?.totalRev > 50000000 ? "$50M+ infrastructure play"
    : projections[4]?.totalRev > 5000000 ? "$5M–$50M growth SaaS"
    : "Niche SaaS — requires capital efficiency";

  return (
    <>
      <Helmet><title>Revenue Model Stress Test | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Revenue Model Stress Test</h1>
              <p className="text-muted-foreground">5-year institutional revenue projection with break-even & sensitivity analysis</p>
            </div>
          </div>
          <Badge variant="outline" className="mb-8 bg-amber-500/10 text-amber-700 border-amber-500/30">Conservative Assumptions — No Optimism Bias</Badge>

          {/* Input Controls */}
          <Card className="mb-8">
            <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Model Inputs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium">Research/University/Year: {researchPerUni}</label>
                <Slider value={[researchPerUni]} onValueChange={v => setResearchPerUni(v[0])} min={50} max={500} step={10} className="mt-2" />
              </div>
              <div>
                <label className="text-sm font-medium">Implementation Ready %: {implReadyPct}%</label>
                <Slider value={[implReadyPct]} onValueChange={v => setImplReadyPct(v[0])} min={5} max={50} step={1} className="mt-2" />
              </div>
              <div>
                <label className="text-sm font-medium">Funding Conversion %: {fundedPct}%</label>
                <Slider value={[fundedPct]} onValueChange={v => setFundedPct(v[0])} min={5} max={50} step={1} className="mt-2" />
              </div>
              <div>
                <label className="text-sm font-medium">Avg Funding/Project: ${avgFunding.toLocaleString()}</label>
                <Slider value={[avgFunding]} onValueChange={v => setAvgFunding(v[0])} min={1000} max={20000} step={500} className="mt-2" />
              </div>
              <div>
                <label className="text-sm font-medium">Platform Commission: {commission}%</label>
                <Slider value={[commission]} onValueChange={v => setCommission(v[0])} min={3} max={15} step={1} className="mt-2" />
              </div>
              <div>
                <label className="text-sm font-medium">Annual Subscription: ${subscription.toLocaleString()}</label>
                <Slider value={[subscription]} onValueChange={v => setSubscription(v[0])} min={5000} max={50000} step={1000} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          {/* 5-Year Projection Table */}
          <Card className="mb-8">
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> 5-Year Revenue Projection (Base Case)</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Metric</th>
                    {projections.map(p => <th key={p.year} className="text-right py-2 px-3 font-medium">Year {p.year}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50"><td className="py-2 px-3">Universities</td>{projections.map(p => <td key={p.year} className="text-right px-3 font-medium">{p.unis}</td>)}</tr>
                  <tr className="border-b border-border/50"><td className="py-2 px-3">Total Research</td>{projections.map(p => <td key={p.year} className="text-right px-3">{p.totalResearch.toLocaleString()}</td>)}</tr>
                  <tr className="border-b border-border/50"><td className="py-2 px-3">Funded Projects</td>{projections.map(p => <td key={p.year} className="text-right px-3">{p.funded}</td>)}</tr>
                  <tr className="border-b border-border/50"><td className="py-2 px-3">GMV</td>{projections.map(p => <td key={p.year} className="text-right px-3">${p.gmv.toLocaleString()}</td>)}</tr>
                  <tr className="border-b border-border/50"><td className="py-2 px-3">Commission Revenue</td>{projections.map(p => <td key={p.year} className="text-right px-3 text-green-600">${p.commissionRev.toLocaleString()}</td>)}</tr>
                  <tr className="border-b border-border/50"><td className="py-2 px-3">Escrow Revenue</td>{projections.map(p => <td key={p.year} className="text-right px-3">${p.escrowRev.toLocaleString()}</td>)}</tr>
                  <tr className="border-b border-border/50"><td className="py-2 px-3">Subscription Revenue</td>{projections.map(p => <td key={p.year} className="text-right px-3">${p.subRev.toLocaleString()}</td>)}</tr>
                  <tr className="border-t-2 border-primary/30 font-bold"><td className="py-2 px-3">Total Revenue</td>{projections.map(p => <td key={p.year} className="text-right px-3 text-primary">${p.totalRev.toLocaleString()}</td>)}</tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Cost vs Revenue */}
          <Card className="mb-8">
            <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Burn vs Revenue — Break-Even Analysis</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Year</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Total Cost</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Total Revenue</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Net</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {costTotals.map((c, i) => {
                    const rev = projections[i]?.totalRev || 0;
                    const net = rev - c.total;
                    const profitable = net >= 0;
                    return (
                      <tr key={c.year} className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">Year {c.year}</td>
                        <td className="text-right px-3 text-destructive">${c.total.toLocaleString()}</td>
                        <td className="text-right px-3 text-green-600">${rev.toLocaleString()}</td>
                        <td className={`text-right px-3 font-bold ${profitable ? "text-green-600" : "text-destructive"}`}>${net.toLocaleString()}</td>
                        <td className="text-right px-3">
                          <Badge variant={profitable ? "default" : "destructive"}>{profitable ? "Profitable" : "Burning"}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">
                  Break-even: {breakEvenYear >= 0 ? `Year ${breakEvenYear + 1}` : "Not within 5 years — requires more aggressive growth or lower costs"}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Sensitivity Analysis */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Sensitivity Analysis (Year 5 Impact)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sensitivities.map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/50">
                      <div>
                        <span className="text-sm font-medium">{s.variable}</span>
                        <span className="text-xs text-muted-foreground ml-2">{s.change}</span>
                      </div>
                      <span className={`text-sm font-bold ${Number(s.impact) >= 0 ? "text-green-600" : "text-destructive"}`}>
                        {Number(s.impact) >= 0 ? "+" : ""}${Number(s.impact).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">Most sensitive variable: <strong>University count + funding conversion rate</strong></p>
              </CardContent>
            </Card>

            {/* Moat Assessment */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Switching Cost & Moat Strength</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {moatFactors.map((m, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/50">
                      <div>
                        <span className="text-sm font-medium">{m.factor}</span>
                        <p className="text-xs text-muted-foreground">{m.note}</p>
                      </div>
                      <Badge variant={m.strength === "Strong" ? "default" : "secondary"}>{m.strength}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Worst Case */}
          <Card className="mb-8 border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" /> Worst-Case Scenario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">15% impl-ready, 15% funding conversion, $2,500 avg funding, 60% milestone completion</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground">Year</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">Funded</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">GMV</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">Total Revenue</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">vs Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {worstCase.map((w, i) => {
                      const cost = costTotals[i]?.total || 0;
                      return (
                        <tr key={w.year} className="border-b border-border/50">
                          <td className="py-2 px-3">Year {w.year}</td>
                          <td className="text-right px-3">{w.funded}</td>
                          <td className="text-right px-3">${w.gmv.toLocaleString()}</td>
                          <td className="text-right px-3">${w.totalRev.toLocaleString()}</td>
                          <td className={`text-right px-3 font-bold ${w.totalRev >= cost ? "text-green-600" : "text-destructive"}`}>
                            ${(w.totalRev - cost).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Verdict */}
          <Card className="border-primary/30">
            <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Strategic Verdict</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">${(projections[4]?.totalRev || 0).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Year 5 Revenue</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{breakEvenYear >= 0 ? `Y${breakEvenYear + 1}` : "N/A"}</div>
                  <div className="text-xs text-muted-foreground">Break-Even</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">${((costTotals.reduce((s, c) => s + c.total, 0)) - projections.reduce((s, p) => s + p.totalRev, 0)).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Cash Runway Needed</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">{modelVerdict.split("—")[0]}</div>
                  <div className="text-xs text-muted-foreground">Model Classification</div>
                </div>
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Revenue model:</strong> Hybrid (recurring subscription + transactional commission)</p>
                <p><strong>Most vulnerable variable:</strong> University acquisition speed & funding conversion rate</p>
                <p><strong>Moat durability:</strong> Strong after 2+ years of institutional data accumulation</p>
                <p><strong>Verdict:</strong> {modelVerdict}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default InstitutionalROICalculatorPage;
