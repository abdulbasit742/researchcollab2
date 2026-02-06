import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Copy, FileText, Image, MousePointer, ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { promoAssets, dummyAffiliates } from "@/data/affiliates";
import { tools, toolBundles } from "@/data/tools";
import { Link } from "react-router-dom";

export default function AffiliateAssetsPage() {
  const affiliate = dummyAffiliates[0];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const toolDescriptions = [
    {
      tool: "ChatGPT 5.3",
      short: "AI-powered research assistant for academic writing and analysis",
      benefits: [
        "Write papers 3x faster with AI assistance",
        "Get instant feedback on your writing",
        "Generate citations and references automatically",
      ],
    },
    {
      tool: "Perplexity Pro",
      short: "Real-time research search with academic citations",
      benefits: [
        "Find peer-reviewed sources in seconds",
        "Automatic citation formatting (APA, MLA, etc.)",
        "Cross-reference multiple sources instantly",
      ],
    },
    {
      tool: "Claude 4 Opus",
      short: "Thoughtful AI for deep analysis and complex research",
      benefits: [
        "Handle 200k+ word documents",
        "Get nuanced analysis of complex topics",
        "Perfect for literature reviews",
      ],
    },
    {
      tool: "Gemini 4 Ultra",
      short: "Multimodal AI for text, images, and data",
      benefits: [
        "Analyze images and diagrams",
        "Process multiple formats simultaneously",
        "Synthesize research across media types",
      ],
    },
  ];

  const ctaTemplates = [
    {
      name: "Simple Share",
      text: "Check out this amazing AI tool for research! 🚀",
    },
    {
      name: "Value-focused",
      text: "I've been using this tool for my research and it's a game-changer. Saves me hours every week!",
    },
    {
      name: "Discount CTA",
      text: "Get 40% off the best AI research tools with my exclusive link! Limited time offer 🔥",
    },
    {
      name: "Social Proof",
      text: "Discover a platform where researchers earn, collaborate, and build trust. Here's my referral link:",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Link to="/affiliate" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Promotional Assets</h1>
            <p className="text-muted-foreground mt-1">
              Ready-to-use content for promoting tools and earning commissions
            </p>
          </div>

          <Tabs defaultValue="copy" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="copy" className="gap-2">
                <FileText className="h-4 w-4" />
                Copy & Text
              </TabsTrigger>
              <TabsTrigger value="cta" className="gap-2">
                <MousePointer className="h-4 w-4" />
                CTA Templates
              </TabsTrigger>
              <TabsTrigger value="tools" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Tool Descriptions
              </TabsTrigger>
            </TabsList>

            {/* Promo Copy */}
            <TabsContent value="copy">
              <div className="grid gap-4">
                {promoAssets.filter(a => a.type === "text").map(asset => (
                  <Card key={asset.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{asset.title}</CardTitle>
                        {asset.ctaText && (
                          <Badge variant="outline">{asset.ctaText}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea 
                        value={asset.content} 
                        readOnly 
                        className="min-h-24 resize-none"
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                          {asset.content.length} characters
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(asset.content)}
                          className="gap-2"
                        >
                          <Copy className="h-3 w-3" />
                          Copy Text
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Custom message with referral link */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Your Custom Message</CardTitle>
                    <CardDescription>
                      Copy this ready-to-share message with your referral link
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={`Hey! I've been using Researcher Collab Pro for my research and it's amazing! They have the best AI tools at discounted prices. Use my link to get started: ${window.location.origin}/ref/${affiliate.referralCode}`}
                      readOnly
                      className="min-h-28 resize-none mb-4"
                    />
                    <Button 
                      onClick={() => copyToClipboard(`Hey! I've been using Researcher Collab Pro for my research and it's amazing! They have the best AI tools at discounted prices. Use my link to get started: ${window.location.origin}/ref/${affiliate.referralCode}`)}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy with Your Link
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* CTA Templates */}
            <TabsContent value="cta">
              <div className="grid md:grid-cols-2 gap-4">
                {ctaTemplates.map((cta, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{cta.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{cta.text}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(`${cta.text} ${window.location.origin}/ref/${affiliate.referralCode}`)}
                        className="gap-2"
                      >
                        <Copy className="h-3 w-3" />
                        Copy with Link
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Social Share Buttons */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Quick Share Buttons</CardTitle>
                  <CardDescription>Share your referral link on social media</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button variant="outline" className="gap-2" asChild>
                    <a 
                      href={`https://twitter.com/intent/tweet?text=Check%20out%20the%20best%20AI%20research%20tools!&url=${encodeURIComponent(`${window.location.origin}/ref/${affiliate.referralCode}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Share on X
                    </a>
                  </Button>
                  <Button variant="outline" className="gap-2" asChild>
                    <a 
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/ref/${affiliate.referralCode}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Share on LinkedIn
                    </a>
                  </Button>
                  <Button variant="outline" className="gap-2" asChild>
                    <a 
                      href={`https://wa.me/?text=${encodeURIComponent(`Check out these amazing AI research tools! ${window.location.origin}/ref/${affiliate.referralCode}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Share on WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tool Descriptions */}
            <TabsContent value="tools">
              <div className="space-y-4">
                {toolDescriptions.map((item, idx) => {
                  const tool = tools.find(t => t.name === item.tool);
                  return (
                    <Card key={idx}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          {tool && (
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color} text-white`}>
                              <tool.icon className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-lg">{item.tool}</CardTitle>
                            <CardDescription>{item.short}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Key Benefits:</p>
                          <ul className="space-y-1">
                            {item.benefits.map((benefit, bidx) => (
                              <li key={bidx} className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(item.benefits.join("\n• "))}
                            className="gap-2"
                          >
                            <Copy className="h-3 w-3" />
                            Copy Benefits
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(`${item.tool} - ${item.short}\n\n• ${item.benefits.join("\n• ")}\n\nGet it here: ${window.location.origin}/tools/${tool?.id}?ref=${affiliate.referralCode}`)}
                            className="gap-2"
                          >
                            <Copy className="h-3 w-3" />
                            Copy Full Description
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Bundles */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Bundle Descriptions</CardTitle>
                  <CardDescription>Higher commission rates (20%) for bundle sales</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {toolBundles.map(bundle => (
                    <div key={bundle.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{bundle.name}</h4>
                        <Badge variant="secondary">{bundle.discount}% off</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{bundle.description}</p>
                      <p className="text-sm mb-3">
                        <span className="text-muted-foreground">Includes: </span>
                        {bundle.tools.map(t => tools.find(tool => tool.id === t)?.name).join(", ")}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(`🎁 ${bundle.name} - ${bundle.discount}% OFF!\n\n${bundle.description}\n\nIncludes: ${bundle.tools.map(t => tools.find(tool => tool.id === t)?.name).join(", ")}\n\nOnly $${bundle.price} (was $${bundle.originalPrice})\n\nGet it: ${window.location.origin}/tools?bundle=${bundle.id}&ref=${affiliate.referralCode}`)}
                        className="gap-2"
                      >
                        <Copy className="h-3 w-3" />
                        Copy Bundle Promo
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
