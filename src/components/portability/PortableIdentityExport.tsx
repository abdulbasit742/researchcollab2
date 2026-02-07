import { useState } from "react";
import { 
  useExportProfessionalRecord, 
  useCreateVerificationLink,
  downloadProfessionalRecord,
  PortableProfessionalRecord,
  VerificationLink,
} from "@/hooks/usePortableIdentity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  Link as LinkIcon,
  Shield,
  FileJson,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function PortableIdentityExport() {
  const exportRecord = useExportProfessionalRecord();
  const createLink = useCreateVerificationLink();
  
  const [includeProjects, setIncludeProjects] = useState(true);
  const [includePublications, setIncludePublications] = useState(true);
  const [includeEarnings, setIncludeEarnings] = useState(false);
  
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkType, setLinkType] = useState<"full" | "summary" | "trust_only">("summary");
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [generatedLink, setGeneratedLink] = useState<VerificationLink | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExport = async () => {
    const record = await exportRecord.mutateAsync({
      includeProjects,
      includePublications,
      includeEarnings,
    });
    downloadProfessionalRecord(record);
  };

  const handleCreateLink = async () => {
    const link = await createLink.mutateAsync({
      linkType,
      expiresInDays: parseInt(expiresInDays),
    });
    setGeneratedLink(link);
  };

  const copyLink = () => {
    if (generatedLink) {
      const url = `${window.location.origin}/verify/${generatedLink.accessCode}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link copied to clipboard" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Export Professional Record
          </CardTitle>
          <CardDescription>
            Download your complete professional identity as a portable, cryptographically signed JSON file.
            This record can be verified by any institution without depending on ResearcherCollab Pro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">Include Projects</p>
                <p className="text-xs text-muted-foreground">Work history & outcomes</p>
              </div>
              <Switch checked={includeProjects} onCheckedChange={setIncludeProjects} />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">Include Publications</p>
                <p className="text-xs text-muted-foreground">Research & papers</p>
              </div>
              <Switch checked={includePublications} onCheckedChange={setIncludePublications} />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">Include Earnings</p>
                <p className="text-xs text-muted-foreground">Financial history</p>
              </div>
              <Switch checked={includeEarnings} onCheckedChange={setIncludeEarnings} />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <Shield className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Your export is <span className="font-medium text-foreground">cryptographically signed</span> and can be verified independently.
            </p>
          </div>

          <Button 
            onClick={handleExport} 
            disabled={exportRecord.isPending}
            className="w-full gap-2"
          >
            {exportRecord.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download Portable Record
          </Button>
        </CardContent>
      </Card>

      {/* Verification Link Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Create Verification Link
          </CardTitle>
          <CardDescription>
            Generate a shareable link that allows institutions or collaborators to verify your credentials.
            You control what information is visible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={() => setShowLinkDialog(true)}
            className="w-full gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Generate Verification Link
          </Button>
        </CardContent>
      </Card>

      {/* Link Generation Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Verification Link</DialogTitle>
            <DialogDescription>
              Choose what information to share and how long the link should be valid.
            </DialogDescription>
          </DialogHeader>

          {!generatedLink ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Information Level</Label>
                <Select value={linkType} onValueChange={(v) => setLinkType(v as typeof linkType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trust_only">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Trust Score Only</p>
                          <p className="text-xs text-muted-foreground">Minimal: just your trust score and tier</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="summary">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Summary</p>
                          <p className="text-xs text-muted-foreground">Trust + key metrics + skills</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="full">
                      <div className="flex items-center gap-2">
                        <FileJson className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Full Profile</p>
                          <p className="text-xs text-muted-foreground">Complete professional record</p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Expires In</Label>
                <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateLink} disabled={createLink.isPending}>
                  {createLink.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Generate Link
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{generatedLink.linkType}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Expires: {new Date(generatedLink.expiresAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    readOnly 
                    value={`${window.location.origin}/verify/${generatedLink.accessCode}`}
                    className="text-sm"
                  />
                  <Button size="icon" variant="outline" onClick={copyLink}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Share this link with institutions or collaborators to verify your credentials.
              </p>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setGeneratedLink(null);
                    setShowLinkDialog(false);
                  }}
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
