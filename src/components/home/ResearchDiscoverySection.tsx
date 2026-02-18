import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen, Search, Sparkles, Users, GraduationCap, ArrowRight, Quote,
  Calendar, Brain, FileText, GitCompareArrows, Lightbulb, TrendingUp,
  Microscope, Shield, X, Check, MessageSquare, BookMarked,
} from "lucide-react";

const SCHOLAR_COMPARISON = [
  {
    feature: "AI-Powered Summarization",
    scholar: false,
    rcollab: true,
    detail: "Instant key findings, methodology, and limitations extraction",
  },
  {
    feature: "Paper-to-Paper Chat",
    scholar: false,
    rcollab: true,
    detail: "Ask questions about any paper in natural language",
  },
  {
    feature: "Research Gap Detection",
    scholar: false,
    rcollab: true,
    detail: "AI identifies unexplored areas across your reading history",
  },
  {
    feature: "Literature Review Generator",
    scholar: false,
    rcollab: true,
    detail: "Auto-generate structured lit reviews from analyzed papers",
  },
  {
    feature: "Execution-Linked Research",
    scholar: false,
    rcollab: true,
    detail: "Fund, collaborate, and execute on research — not just read it",
  },
  {
    feature: "Researcher Trust Scores",
    scholar: false,
    rcollab: true,
    detail: "Verified outcomes replace h-index vanity metrics",
  },
];

const AI_TOOLS = [
  { icon: Sparkles, label: "AI Summarize", description: "Key findings in seconds", color: "from-violet-500 to-purple-600" },
  { icon: MessageSquare, label: "Document Chat", description: "Ask papers questions", color: "from-primary to-blue-600" },
  { icon: Lightbulb, label: "Gap Finder", description: "Discover whitespace", color: "from-amber-500 to-orange-600" },
  { icon: BookMarked, label: "Lit Review Gen", description: "Auto literature reviews", color: "from-emerald-500 to-teal-600" },
  { icon: GitCompareArrows, label: "Paper Compare", description: "Side-by-side analysis", color: "from-rose-500 to-red-600" },
  { icon: FileText, label: "Annotated Bib", description: "Export-ready citations", color: "from-cyan-500 to-blue-600" },
];

const FEATURED_PAPERS = [
  {
    title: "Transformer Architecture for Large Language Models",
    authors: ["Vaswani, A.", "Shazeer, N."],
    field: "Computer Science",
    year: 2017,
    citations: 95000,
    type: "Conference Paper",
  },
  {
    title: "Sustainable Urban Development: Green Infrastructure Impact",
    authors: ["Chen, L.", "Müller, K."],
    field: "Environmental Science",
    year: 2024,
    citations: 340,
    type: "Meta-Analysis",
  },
  {
    title: "Deep Learning Approaches to Drug Discovery",
    authors: ["Zhang, W.", "Li, S."],
    field: "Bioinformatics",
    year: 2025,
    citations: 12,
    type: "Working Paper",
  },
  {
    title: "Federated Learning for Privacy-Preserving Medical Imaging",
    authors: ["Li, T.", "Sahu, A."],
    field: "Medical Informatics",
    year: 2023,
    citations: 210,
    type: "Thesis",
  },
];

export function ResearchDiscoverySection() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/research-papers?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Dark background like hero */}
      <div className="absolute inset-0 bg-foreground" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/5" />
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Glowing orb */}
      <motion.div
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/8 blur-[120px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm px-4 py-2 text-xs md:text-sm font-medium text-primary mb-6">
            <Microscope className="h-4 w-4" />
            Beyond Google Scholar
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-background tracking-tight leading-tight">
            Don't Just <span className="line-through opacity-40">Find</span> Research.
            <br />
            <span className="text-primary">Understand & Execute It.</span>
          </h2>
          <p className="text-background/50 text-base md:text-xl max-w-2xl mx-auto mt-4 md:mt-6 leading-relaxed">
            Google Scholar finds papers. We summarize them, find research gaps,
            generate literature reviews, and connect you to fund & execute on what you discover.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto mb-14 px-1"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-background/40" />
            <Input
              placeholder="Search papers by title, author, or field..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-28 h-14 text-base rounded-2xl border-2 border-background/20 bg-background/10 text-background placeholder:text-background/30 focus:border-primary focus:bg-background/15 backdrop-blur-sm"
            />
            <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 gap-1.5 h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </motion.form>

        {/* AI Tools Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mb-16 md:mb-20"
        >
          <h3 className="text-center text-sm font-semibold uppercase tracking-widest text-background/30 mb-6">
            AI-Powered Research Tools
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl mx-auto">
            {AI_TOOLS.map((tool, i) => (
              <motion.div
                key={tool.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="group"
              >
                <div className="rounded-xl border border-background/10 bg-background/5 backdrop-blur-sm p-4 text-center transition-all duration-300 hover:bg-background/10 hover:border-primary/30 hover:-translate-y-1">
                  <div className={`mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${tool.color} shadow-lg transition-transform group-hover:scale-110`}>
                    <tool.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-xs font-bold text-background/80 mb-0.5">{tool.label}</div>
                  <div className="text-[10px] text-background/40">{tool.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Competitor Comparison — Scholar vs RCollab */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-16 md:mb-20 max-w-3xl mx-auto"
        >
          <h3 className="text-center text-sm font-semibold uppercase tracking-widest text-background/30 mb-6">
            Google Scholar vs RCollab Research
          </h3>
          <div className="rounded-2xl border border-background/10 bg-background/5 backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_120px_120px] border-b border-background/10 bg-background/5">
              <div className="p-3 sm:p-4 text-xs font-semibold text-background/50 uppercase tracking-wider">Feature</div>
              <div className="p-3 sm:p-4 text-center text-xs font-medium text-background/40">Scholar</div>
              <div className="p-3 sm:p-4 text-center text-xs font-bold text-primary">RCollab</div>
            </div>
            {SCHOLAR_COMPARISON.map((row, i) => (
              <motion.div
                key={row.feature}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_120px_120px] border-b border-background/5 last:border-0 hover:bg-background/5 transition-colors"
              >
                <div className="p-3 sm:p-4">
                  <div className="text-xs sm:text-sm font-medium text-background/70">{row.feature}</div>
                  <div className="text-[10px] sm:text-xs text-background/30 mt-0.5 hidden sm:block">{row.detail}</div>
                </div>
                <div className="p-3 sm:p-4 flex items-center justify-center">
                  <X className="h-4 w-4 text-destructive/50" />
                </div>
                <div className="p-3 sm:p-4 flex items-center justify-center">
                  <Check className="h-5 w-5 text-primary" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Featured Papers */}
        <div className="mb-10">
          <h3 className="text-center text-sm font-semibold uppercase tracking-widest text-background/30 mb-6">
            Trending Papers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {FEATURED_PAPERS.map((paper, i) => (
              <motion.div
                key={paper.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.07 }}
              >
                <Card className="h-full border-background/10 bg-background/5 backdrop-blur-sm hover:bg-background/10 hover:border-primary/20 transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] bg-background/10 text-background/60 border-0">{paper.type}</Badge>
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary/70">{paper.field}</Badge>
                    </div>
                    <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-background/80 group-hover:text-primary transition-colors">
                      {paper.title}
                    </h3>
                    <div className="space-y-1 text-xs text-background/40">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {paper.authors.join(", ")}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {paper.year}
                        </span>
                        <span className="flex items-center gap-1">
                          <Quote className="h-3 w-3" />
                          {paper.citations.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button size="lg" className="gap-2 h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.4)] transition-all" asChild>
            <Link to="/research-papers">
              <Microscope className="h-5 w-5" />
              Enter Research Hub
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <p className="mt-4 text-xs text-background/30">
            12,000+ papers • 50+ fields • AI-powered analysis • Free tier available
          </p>
        </motion.div>
      </div>
    </section>
  );
}
