import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sparkles, PenLine, Calendar, Send, Linkedin, Instagram, Mail, Globe, Plus } from "lucide-react";
import { getMarketingContent, createMarketingContent, updateMarketingContent, getContentCalendar, CONTENT_TYPES, MARKETING_CHANNELS } from "@/lib/omnichannel/marketingService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const CHANNEL_ICONS: Record<string, any> = { linkedin: Linkedin, instagram: Instagram, email: Mail, blog: Globe };

export default function OmniMarketingPage() {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("content");
  const [filterChannel, setFilterChannel] = useState("all");
  const [generating, setGenerating] = useState(false);
  const [genTopic, setGenTopic] = useState("");
  const [genChannel, setGenChannel] = useState("linkedin");
  const [genResult, setGenResult] = useState("");

  useEffect(() => { loadContent(); }, [filterChannel]);

  async function loadContent() {
    setLoading(true);
    try {
      const filters: any = {};
      if (filterChannel !== "all") filters.channel = filterChannel;
      setContent(await getMarketingContent(filters));
    } catch { toast.error("Failed to load content"); }
    finally { setLoading(false); }
  }

  async function handleGenerate() {
    if (!genTopic.trim()) return;
    setGenerating(true);
    setGenResult("");
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/omni-agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Generate a ${genChannel} marketing post about: ${genTopic}. For the RCollab platform — a Global Execution Economy. Make it compelling, professional, and include relevant hashtags. Return ONLY the post content, nothing else.` }],
          channel_type: "marketing",
        }),
      });
      if (!resp.ok || !resp.body) throw new Error("AI error");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) { result += delta; setGenResult(result); }
          } catch {}
        }
      }
    } catch { toast.error("Failed to generate content"); }
    finally { setGenerating(false); }
  }

  async function handleSaveDraft() {
    if (!genResult.trim()) return;
    try {
      await createMarketingContent({ content_type: "linkedin_post", channel: genChannel, body: genResult, title: genTopic });
      toast.success("Saved as draft");
      setGenResult(""); setGenTopic("");
      loadContent();
    } catch { toast.error("Failed to save"); }
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" /> AI Marketing Engine
          </h1>
          <p className="text-sm text-muted-foreground">AI-powered content generation and scheduling</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="generate"><Sparkles className="h-3 w-3 mr-1" /> Generate</TabsTrigger>
          <TabsTrigger value="content"><PenLine className="h-3 w-3 mr-1" /> Content Library</TabsTrigger>
          <TabsTrigger value="calendar"><Calendar className="h-3 w-3 mr-1" /> Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <h3 className="font-semibold">Generate Marketing Content</h3>
              <div className="flex gap-2">
                <Input value={genTopic} onChange={e => setGenTopic(e.target.value)} placeholder="Topic: e.g., 'Research funding revolution'" className="flex-1" />
                <Select value={genChannel} onValueChange={setGenChannel}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MARKETING_CHANNELS.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={handleGenerate} disabled={generating || !genTopic.trim()}>
                  <Sparkles className="h-4 w-4 mr-1" /> {generating ? "Generating..." : "Generate"}
                </Button>
              </div>
              {genResult && (
                <div className="space-y-2">
                  <div className="bg-muted rounded-lg p-4 prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{genResult}</ReactMarkdown>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setGenResult("")}>Discard</Button>
                    <Button onClick={handleSaveDraft}><PenLine className="h-4 w-4 mr-1" /> Save Draft</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Select value={filterChannel} onValueChange={setFilterChannel}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Channels" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                {MARKETING_CHANNELS.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-2">{[1,2].map(i => <Card key={i} className="animate-pulse h-20" />)}</div>
          ) : content.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <PenLine className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>No content yet. Generate your first post!</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {content.map(c => {
                const Icon = CHANNEL_ICONS[c.channel] || Globe;
                return (
                  <Card key={c.id} className="hover:shadow transition-shadow">
                    <CardContent className="pt-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-2 flex-1">
                          <Icon className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div className="flex-1">
                            {c.title && <p className="font-medium text-sm">{c.title}</p>}
                            <p className="text-sm text-muted-foreground line-clamp-2">{c.body}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={c.status === "published" ? "default" : "secondary"}>{c.status}</Badge>
                          <Badge variant="outline" className="capitalize text-[10px]">{c.channel}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p>Content calendar — schedule posts from the Content Library.</p>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
