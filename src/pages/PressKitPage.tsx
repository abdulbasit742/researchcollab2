import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  FileText,
  Image,
  Palette,
  Quote,
  Building2,
  Users,
  Briefcase,
  Shield,
  TrendingUp,
  Mail,
  ExternalLink,
  GraduationCap,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const brandColors = [
  { name: "Primary Purple", hex: "#8B5CF6", hsl: "hsl(262, 83%, 58%)", usage: "Primary actions, links, accents" },
  { name: "Primary Foreground", hex: "#FFFFFF", hsl: "hsl(0, 0%, 100%)", usage: "Text on primary backgrounds" },
  { name: "Background", hex: "#0D0D12", hsl: "hsl(240, 10%, 5%)", usage: "Page backgrounds" },
  { name: "Foreground", hex: "#FAFAFA", hsl: "hsl(0, 0%, 98%)", usage: "Primary text" },
  { name: "Muted", hex: "#27272A", hsl: "hsl(240, 4%, 16%)", usage: "Secondary backgrounds" },
  { name: "Accent", hex: "#3F3F46", hsl: "hsl(240, 4%, 26%)", usage: "Borders, subtle highlights" },
];

const platformStats = [
  { label: "Researchers & Students", value: "10,000+", icon: Users },
  { label: "Projects Completed", value: "2,500+", icon: Briefcase },
  { label: "Institutions Verified", value: "150+", icon: Building2 },
  { label: "Trust Score Accuracy", value: "99.2%", icon: Shield },
];

const pressQuotes = [
  {
    quote: "RCollab is not where professionals are seen. It is where professionals are proven, measured, and trusted.",
    attribution: "Platform Philosophy",
  },
  {
    quote: "The first professional platform where trust is computed, not claimed.",
    attribution: "Mission Statement",
  },
  {
    quote: "LinkedIn shows who you claim to be. RCollab proves what you've done.",
    attribution: "Brand Tagline",
  },
];

const mediaAssets = [
  { name: "Logo (PNG)", format: "PNG", size: "1024x1024", type: "logo" },
  { name: "Logo (SVG)", format: "SVG", size: "Vector", type: "logo" },
  { name: "Wordmark", format: "PNG", size: "2048x512", type: "wordmark" },
  { name: "Icon Only", format: "PNG", size: "512x512", type: "icon" },
  { name: "Brand Guidelines", format: "PDF", size: "2.4 MB", type: "document" },
  { name: "Press Release Template", format: "DOCX", size: "45 KB", type: "document" },
];

export default function PressKitPage() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = (text: string, colorName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(colorName);
    toast.success(`Copied ${colorName} to clipboard`);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <Badge variant="outline" className="mb-4">Press & Media</Badge>
          <h1 className="text-4xl font-bold mb-4">Press Kit</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Official brand assets, platform information, and media resources for journalists, 
            partners, and institutions covering ResearcherCollab.
          </p>
        </div>

        {/* Quick Stats */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Platform at a Glance
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {platformStats.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="pt-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-10" />

        {/* About Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            About ResearcherCollab
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">ResearcherCollab (RCollab)</strong> is an outcome-driven 
                professional platform built for researchers, students, and institutions. Unlike traditional 
                professional networks that optimize for visibility and engagement, RCollab focuses on 
                reliability, accountability, and verified outcomes.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The platform features a unique <strong className="text-foreground">Trust Engine</strong> that 
                computes reputation scores based on project completions, payment reliability, and peer 
                validation—not followers or likes. Every action has consequences, and every outcome is 
                recorded permanently.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                RCollab serves academic institutions, research laboratories, and individual researchers 
                who need a platform where credibility is earned through work, not marketing.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Key Messages */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Quote className="h-5 w-5 text-primary" />
            Key Messages
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {pressQuotes.map((item, index) => (
              <Card key={index} className="bg-muted/30">
                <CardContent className="pt-6">
                  <blockquote className="text-lg font-medium mb-3 italic">
                    "{item.quote}"
                  </blockquote>
                  <p className="text-sm text-muted-foreground">— {item.attribution}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-10" />

        {/* Brand Colors */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Brand Colors
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brandColors.map((color) => (
              <Card key={color.name} className="overflow-hidden">
                <div 
                  className="h-20 w-full" 
                  style={{ backgroundColor: color.hex }}
                />
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{color.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(color.hex, color.name)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedColor === color.name ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><span className="font-mono">{color.hex}</span></p>
                    <p className="text-xs">{color.usage}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Media Assets */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            Media Assets
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Downloadable Assets</CardTitle>
              <CardDescription>
                Official logos, icons, and brand materials for media use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {mediaAssets.map((asset) => (
                  <div
                    key={asset.name}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {asset.type === "document" ? (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Image className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {asset.format} • {asset.size}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Asset downloads will be available soon. Contact press@rcollab.com for immediate access.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Usage Guidelines */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Usage Guidelines
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-emerald-500 mb-3">✓ Do</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Use official logos without modification</li>
                    <li>• Maintain minimum clear space around logos</li>
                    <li>• Reference platform as "ResearcherCollab" or "RCollab"</li>
                    <li>• Use approved quotes and statistics</li>
                    <li>• Contact press team for custom assets</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-destructive mb-3">✗ Don't</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Alter logo colors or proportions</li>
                    <li>• Use outdated branding materials</li>
                    <li>• Imply endorsement without permission</li>
                    <li>• Use assets for commercial products</li>
                    <li>• Crop or obscure any part of the logo</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        {/* Contact */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Media Contact
          </h2>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium mb-1">Press Inquiries</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    For interviews, partnership announcements, and media inquiries
                  </p>
                  <a 
                    href="mailto:press@rcollab.com" 
                    className="text-primary hover:underline font-medium"
                  >
                    press@rcollab.com
                  </a>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <a href="/about">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      About Us
                    </a>
                  </Button>
                  <Button asChild>
                    <a href="/contact">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </MainLayout>
  );
}
