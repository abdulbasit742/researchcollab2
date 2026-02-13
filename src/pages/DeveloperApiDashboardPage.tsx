import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Key, Shield, Activity } from "lucide-react";
import { useApiAccess } from "@/hooks/useFederation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";

export default function DeveloperApiDashboardPage() {
  const { clients, loading, fetchApiClients, createApiClient, revokeApiClient } = useApiAccess();
  const [newClientName, setNewClientName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchApiClients(); }, [fetchApiClients]);

  const handleCreate = async () => {
    if (!newClientName.trim()) return;
    setCreating(true);
    try {
      const result = await createApiClient(newClientName, ["read:trust", "read:reputation", "verify:passport"]);
      toast.success(`API key created! Secret: ${result.secret}`);
      setNewClientName("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await revokeApiClient(id);
      toast.success("API key revoked");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 pb-20 md:pb-8 space-y-6">
        <div className="flex items-center gap-3">
          <Code className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Developer API</h1>
            <p className="text-muted-foreground">Manage API keys and integrations</p>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Create API Key</CardTitle></CardHeader>
          <CardContent className="flex gap-3">
            <Input
              placeholder="Application name"
              value={newClientName}
              onChange={e => setNewClientName(e.target.value)}
            />
            <Button onClick={handleCreate} disabled={creating || !newClientName.trim()}>
              {creating ? "Creating..." : "Create Key"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> Your API Keys</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : clients.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No API keys yet. Create one above.</p>
            ) : (
              <div className="space-y-3">
                {clients.map(client => (
                  <div key={client.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="font-medium">{client.client_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Rate limit: {client.rate_limit_per_hour}/hr · Scopes: {client.scopes?.join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={client.status === "active" ? "default" : "destructive"}>{client.status}</Badge>
                      {client.status === "active" && (
                        <Button variant="outline" size="sm" onClick={() => handleRevoke(client.id)}>Revoke</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Available Endpoints</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { method: "GET", path: "/verify-reputation-passport", desc: "Verify a signed reputation passport" },
              { method: "POST", path: "/generate-reputation-passport", desc: "Generate a new reputation passport" },
              { method: "GET", path: "/compute-trust", desc: "Query trust score for a user" },
              { method: "GET", path: "/compute-visibility", desc: "Query visibility score" },
            ].map(ep => (
              <div key={ep.path} className="flex items-center gap-3 p-2 rounded bg-accent/30">
                <Badge variant="outline" className="font-mono text-xs">{ep.method}</Badge>
                <code className="text-sm font-mono">{ep.path}</code>
                <span className="text-xs text-muted-foreground ml-auto">{ep.desc}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
