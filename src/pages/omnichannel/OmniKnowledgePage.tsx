import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Search } from "lucide-react";
import { getKnowledgeArticles, createKnowledgeArticle, KB_CATEGORIES } from "@/lib/omnichannel/knowledgeService";
import { getTemplates, createTemplate } from "@/lib/omnichannel/templateService";
import { toast } from "sonner";

export default function OmniKnowledgePage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newArticle, setNewArticle] = useState({ category: "faq", title: "", content: "" });

  useEffect(() => { loadData(); }, [category]);

  async function loadData() {
    setLoading(true);
    try {
      const [a, t] = await Promise.all([
        getKnowledgeArticles({ category: category !== "all" ? category : undefined, search: search || undefined }),
        getTemplates(),
      ]);
      setArticles(a);
      setTemplates(t);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }

  async function handleCreateArticle() {
    if (!newArticle.title.trim() || !newArticle.content.trim()) return;
    try {
      await createKnowledgeArticle(newArticle);
      toast.success("Article created");
      setShowCreate(false);
      setNewArticle({ category: "faq", title: "", content: "" });
      loadData();
    } catch { toast.error("Failed"); }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Knowledge & Templates</h1>
            <p className="text-sm text-muted-foreground">AI retrieval knowledge base and message templates</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" />New Article</Button>
      </div>

      <Tabs defaultValue="knowledge">
        <TabsList>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge" className="mt-4">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" onKeyDown={e => e.key === "Enter" && loadData()} />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {KB_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {showCreate && (
            <Card className="mb-4"><CardContent className="pt-4 space-y-3">
              <Input placeholder="Article title" value={newArticle.title} onChange={e => setNewArticle(p => ({ ...p, title: e.target.value }))} />
              <Select value={newArticle.category} onValueChange={v => setNewArticle(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{KB_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Textarea placeholder="Article content..." value={newArticle.content} onChange={e => setNewArticle(p => ({ ...p, content: e.target.value }))} rows={6} />
              <div className="flex gap-2">
                <Button onClick={handleCreateArticle}>Create</Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </CardContent></Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {articles.map(a => (
              <Card key={a.id} className="hover:shadow-md transition">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{a.title}</h3>
                    <Badge variant="outline">{a.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">{a.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-1">{a.tags?.map((t: string) => <Badge key={t} variant="secondary" className="text-[9px]">{t}</Badge>)}</div>
                    <span className="text-[10px] text-muted-foreground">Used {a.usage_count}x</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {templates.map(t => (
              <Card key={t.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{t.template_name}</h3>
                    <div className="flex gap-1">
                      <Badge variant="outline">{t.channel_type}</Badge>
                      {t.is_approved ? <Badge className="bg-green-100 text-green-700 text-[9px]">Approved</Badge> : <Badge variant="secondary" className="text-[9px]">Draft</Badge>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">{t.content_template}</p>
                  <span className="text-[10px] text-muted-foreground mt-1 block">Used {t.usage_count}x</span>
                </CardContent>
              </Card>
            ))}
            {templates.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">No templates yet</CardContent></Card>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
