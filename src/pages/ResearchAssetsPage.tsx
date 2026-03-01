import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MainLayout } from "@/components/layout/MainLayout";
import { useMyResearchAssets, useValidatedAssets, useCreateResearchAsset } from "@/hooks/useResearchAssets";
import {
  Gem,
  Plus,
  CheckCircle,
  Clock,
  Shield,
  Hash,
  DollarSign,
  FileText,
} from "lucide-react";

const statusStyles: Record<string, string> = {
  validated: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  pending: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
  rejected: "bg-red-500/10 text-red-700 border-red-500/30",
};

export default function ResearchAssetsPage() {
  const { data: myAssets = [], isLoading: loadingMine } = useMyResearchAssets();
  const { data: publicAssets = [], isLoading: loadingPublic } = useValidatedAssets();
  const createAsset = useCreateResearchAsset();

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assetType, setAssetType] = useState("research_output");

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createAsset.mutateAsync({ title, description, assetType });
    setShowCreate(false);
    setTitle("");
    setDescription("");
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <Gem className="h-8 w-8 text-primary" />
              Research Asset Registry
            </h1>
            <p className="text-muted-foreground mt-1">
              Research = Capital Unit — Verified, hashable, fundable
            </p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Register Asset</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register Research Asset</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Research asset title" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the research output..." />
                </div>
                <div className="space-y-2">
                  <Label>Asset Type</Label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                  >
                    <option value="research_output">Research Output</option>
                    <option value="verified_compute">Verified Compute</option>
                    <option value="dataset">Dataset</option>
                    <option value="methodology">Methodology</option>
                    <option value="patent_filing">Patent Filing</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={createAsset.isPending || !title.trim()}>
                    {createAsset.isPending ? "Registering..." : "Register"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{myAssets.length}</p>
              <p className="text-sm text-muted-foreground">My Assets</p>
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{myAssets.filter(a => a.validation_status === "validated").length}</p>
              <p className="text-sm text-muted-foreground">Validated</p>
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <Hash className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{myAssets.filter(a => a.reproducibility_hash).length}</p>
              <p className="text-sm text-muted-foreground">Hash Verified</p>
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">PKR {myAssets.reduce((s, a) => s + (a.valuation_score || 0), 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Valuation</p>
            </div>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="mine">
          <TabsList>
            <TabsTrigger value="mine">My Assets</TabsTrigger>
            <TabsTrigger value="marketplace">Validated Marketplace</TabsTrigger>
          </TabsList>

          <TabsContent value="mine" className="mt-4">
            {loadingMine ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}</div>
            ) : myAssets.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <Gem className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Research Assets</h3>
                <p className="text-muted-foreground mb-4">Register your first research asset to tokenize it.</p>
                <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" /> Register Asset</Button>
              </CardContent></Card>
            ) : (
              <div className="space-y-3">
                {myAssets.map(asset => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="marketplace" className="mt-4">
            {loadingPublic ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}</div>
            ) : publicAssets.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Validated Assets Yet</h3>
                <p className="text-muted-foreground">Assets will appear here once validated through peer review.</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-3">
                {publicAssets.map(asset => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

function AssetCard({ asset }: { asset: any }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{asset.title}</h3>
              <Badge variant="outline" className={statusStyles[asset.validation_status] || statusStyles.pending}>
                {asset.validation_status}
              </Badge>
              <Badge variant="secondary" className="text-xs">{asset.asset_type.replace(/_/g, " ")}</Badge>
            </div>
            {asset.description && <p className="text-sm text-muted-foreground line-clamp-2">{asset.description}</p>}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
              {asset.reproducibility_hash && (
                <span className="flex items-center gap-1 font-mono">
                  <Hash className="h-3 w-3" />
                  {asset.reproducibility_hash.slice(0, 12)}...
                </span>
              )}
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {asset.validation_count} validations
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(asset.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="text-right">
            {asset.valuation_score > 0 && (
              <p className="text-lg font-bold text-primary">PKR {asset.valuation_score.toLocaleString()}</p>
            )}
            <Badge variant="outline" className="text-xs">{asset.ip_status}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
