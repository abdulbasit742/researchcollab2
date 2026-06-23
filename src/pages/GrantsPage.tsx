import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, Award, Calendar, DollarSign, MapPin, ExternalLink, Bookmark, BookmarkCheck, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { GrantRow, useGrants, useSavedGrants, useToggleSaveGrant, checkEligibility, EligibilityResult } from "@/hooks/useGrantFinder";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const COUNTRIES = ["all", "United States", "United Kingdom", "European Union", "Germany", "Pakistan", "Global"];
const FIELDS = ["all", "STEM", "Engineering", "Computer Science", "Life Sciences", "Health", "Biomedical", "AI Safety", "Global Health", "All Fields"];
const TYPES = ["all", "research", "fellowship", "scholarship"];

function formatMoney(min: number | null, max: number | null, cur: string) {
  if (!min && !max) return "Varies";
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  if (min && max && min !== max) return `${cur} ${fmt(min)}–${fmt(max)}`;
  return `${cur} ${fmt(max || min || 0)}`;
}

function daysUntil(d: string | null) {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
}

function GrantCard({ grant, saved, onToggleSave, onCheck }: { grant: GrantRow; saved: boolean; onToggleSave: () => void; onCheck: () => void }) {
  const days = daysUntil(grant.deadline);
  const urgent = days !== null && days <= 30 && days > 0;
  const expired = days !== null && days < 0;
  return (
    <Card variant="interactive" className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg leading-tight">{grant.title}</CardTitle>
            <CardDescription className="mt-1">{grant.funder}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onToggleSave} aria-label={saved ? "Unsave" : "Save"}>
            {saved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="secondary" className="capitalize">{grant.grant_type}</Badge>
          {grant.country && <Badge variant="outline"><MapPin className="h-3 w-3 mr-1" />{grant.country}</Badge>}
          {(grant.fields ?? []).slice(0, 2).map((f) => (
            <Badge key={f} variant="outline">{f}</Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {grant.description && <p className="text-sm text-muted-foreground line-clamp-3">{grant.description}</p>}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>{formatMoney(grant.amount_min, grant.amount_max, grant.currency)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className={expired ? "text-destructive" : urgent ? "text-orange-500 font-medium" : ""}>
              {grant.deadline ? new Date(grant.deadline).toLocaleDateString() : "Rolling"}
              {days !== null && !expired && ` · ${days}d`}
              {expired && " · Closed"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onCheck}>
          <Sparkles className="h-4 w-4 mr-2" /> AI Check
        </Button>
        {grant.application_url && (
          <Button asChild size="sm" className="flex-1">
            <a href={grant.application_url} target="_blank" rel="noreferrer">
              Apply <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default function GrantsPage() {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [field, setField] = useState("all");
  const [type, setType] = useState("all");
  const [tab, setTab] = useState("browse");

  const { data: grants = [], isLoading } = useGrants({ search, country, field, type });
  const { data: saved = [] } = useSavedGrants();
  const toggleSave = useToggleSaveGrant();

  const savedIds = useMemo(() => new Set(saved.map((s: { grant_id: string }) => s.grant_id)), [saved]);
  const savedGrants = useMemo(
    () => saved.map((s: { grant: GrantRow }) => s.grant).filter(Boolean),
    [saved]
  );

  const [checkGrant, setCheckGrant] = useState<GrantRow | null>(null);
  const [profileText, setProfileText] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);

  async function runCheck() {
    if (!checkGrant) return;
    setChecking(true);
    setResult(null);
    try {
      const profile = profileText.trim()
        ? { background: profileText.trim() }
        : { background: "Graduate student/early-career researcher (no detailed profile provided)" };
      const r = await checkEligibility(checkGrant, profile);
      setResult(r);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Eligibility check failed");
    } finally {
      setChecking(false);
    }
  }

  const list = tab === "saved" ? savedGrants : grants;

  return (
    <MainLayout>
      <div className="gradient-hero py-8 sm:py-16">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Award className="h-3 w-3 mr-1" /> Grant Finder & Funding Radar
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-bold md:text-5xl">
              Discover <span className="text-gradient">Funding Opportunities</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">
              Search global grants, save the best matches, and run an AI eligibility check before you apply.
            </p>
          </motion.div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search grants, funders, keywords..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c === "all" ? "All countries" : c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t === "all" ? "All types" : t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 max-w-5xl mx-auto">
            <Select value={field} onValueChange={setField}>
              <SelectTrigger className="sm:max-w-xs"><SelectValue placeholder="Field" /></SelectTrigger>
              <SelectContent>
                {FIELDS.map((f) => <SelectItem key={f} value={f}>{f === "all" ? "All fields" : f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6 sm:py-10">
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="browse">Browse ({grants.length})</TabsTrigger>
            <TabsTrigger value="saved">Saved ({savedGrants.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="browse" />
          <TabsContent value="saved" />
        </Tabs>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
          </div>
        ) : list.length === 0 ? (
          <Card className="p-10 text-center">
            <Award className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">{tab === "saved" ? "No saved grants yet" : "No grants match your filters"}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {tab === "saved" ? "Tap the bookmark icon on any grant to save it here." : "Try widening the filters or clearing the search."}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {list.map((g: GrantRow) => (
              <GrantCard
                key={g.id}
                grant={g}
                saved={savedIds.has(g.id)}
                onToggleSave={() => toggleSave.mutate({ grantId: g.id, saved: savedIds.has(g.id) })}
                onCheck={() => { setCheckGrant(g); setResult(null); setProfileText(""); }}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!checkGrant} onOpenChange={(o) => !o && setCheckGrant(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> AI Eligibility Check
            </DialogTitle>
            <DialogDescription>{checkGrant?.title} — {checkGrant?.funder}</DialogDescription>
          </DialogHeader>

          {!result && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Your background (optional)</label>
              <Textarea
                placeholder="e.g. 2nd-year PhD in computer vision, 1 published paper, Pakistani citizen, looking for international postdoc funding..."
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">The more detail you give, the sharper the assessment.</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Fit Score</div>
                  <div className="text-3xl font-bold">{result.fit_score}<span className="text-base text-muted-foreground">/100</span></div>
                </div>
                <Badge variant={result.verdict === "strong" ? "default" : result.verdict === "moderate" ? "secondary" : "destructive"} className="capitalize text-sm px-3 py-1">
                  {result.verdict} match
                </Badge>
              </div>
              <Progress value={result.fit_score} />

              {result.reasons?.length > 0 && (
                <div>
                  <div className="font-medium text-sm flex items-center gap-1.5 mb-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Why you fit</div>
                  <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">{result.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
                </div>
              )}
              {result.missing?.length > 0 && (
                <div>
                  <div className="font-medium text-sm flex items-center gap-1.5 mb-2"><AlertCircle className="h-4 w-4 text-orange-500" /> Gaps to address</div>
                  <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">{result.missing.map((r, i) => <li key={i}>{r}</li>)}</ul>
                </div>
              )}
              {result.suggestions?.length > 0 && (
                <div>
                  <div className="font-medium text-sm mb-2">Next steps</div>
                  <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">{result.suggestions.map((r, i) => <li key={i}>{r}</li>)}</ul>
                </div>
              )}
              {result.draft_pitch && (
                <div>
                  <div className="font-medium text-sm mb-2">Draft pitch</div>
                  <p className="text-sm text-muted-foreground italic border-l-2 border-primary/50 pl-3">{result.draft_pitch}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {result ? (
              <>
                <Button variant="outline" onClick={() => setResult(null)}>Run again</Button>
                <Button onClick={() => setCheckGrant(null)}>Close</Button>
              </>
            ) : (
              <Button onClick={runCheck} disabled={checking}>
                {checking ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing…</> : <><Sparkles className="h-4 w-4 mr-2" /> Run AI check</>}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
