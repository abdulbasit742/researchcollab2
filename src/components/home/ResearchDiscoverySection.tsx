import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Sparkles, Users, GraduationCap, ArrowRight, Quote, Calendar } from "lucide-react";

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

const STATS = [
  { label: "Research Papers", value: "12,000+", icon: BookOpen },
  { label: "Academic Fields", value: "50+", icon: GraduationCap },
  { label: "Active Researchers", value: "5,000+", icon: Users },
  { label: "AI-Powered Tools", value: "8", icon: Sparkles },
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
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-0">
            <BookOpen className="h-3 w-3 mr-1" />
            Research Hub
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Discover & Analyze Research Papers
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Access thousands of papers across 50+ fields with AI-powered summarization, comparison, and gap analysis tools.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search papers by title, author, or field..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-28 h-14 text-base rounded-xl border-2 border-border focus:border-primary"
            />
            <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 gap-1.5">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </motion.form>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-3xl mx-auto">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="text-center"
            >
              <stat.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Featured Papers */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {FEATURED_PAPERS.map((paper, i) => (
            <motion.div
              key={paper.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.07 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow group cursor-pointer">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{paper.type}</Badge>
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-200">Open Access</Badge>
                  </div>
                  <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {paper.title}
                  </h3>
                  <div className="space-y-1 text-xs text-muted-foreground">
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

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button size="lg" className="gap-2" asChild>
            <Link to="/research-papers">
              Explore Research Hub
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
