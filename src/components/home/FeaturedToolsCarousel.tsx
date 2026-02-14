import { useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, ChevronLeft, ChevronRight,
  FileText, Table2, Presentation, Brain,
  Search, BarChart3, BookOpen, PenTool,
} from "lucide-react";

const tools = [
  {
    icon: FileText, name: "RCollab Docs", tagline: "Academic writing with built-in citations",
    description: "APA, MLA, Chicago formatting with AI writing assistant and real-time collaboration.",
    href: "/productivity", badge: "Suite",
    gradient: "from-blue-500/20 to-cyan-500/20", iconColor: "text-blue-500", borderColor: "group-hover:border-t-blue-500",
  },
  {
    icon: Table2, name: "RCollab Sheets", tagline: "Statistical analysis made simple",
    description: "Academic-optimized spreadsheets with built-in statistical functions and AI data analysis.",
    href: "/productivity", badge: "Suite",
    gradient: "from-emerald-500/20 to-teal-500/20", iconColor: "text-emerald-500", borderColor: "group-hover:border-t-emerald-500",
  },
  {
    icon: Presentation, name: "RCollab Slides", tagline: "Conference-ready presentations",
    description: "Academic templates, AI design assistance, and LaTeX equation support for research presentations.",
    href: "/productivity", badge: "Suite",
    gradient: "from-amber-500/20 to-orange-500/20", iconColor: "text-amber-500", borderColor: "group-hover:border-t-amber-500",
  },
  {
    icon: Brain, name: "AI Research Assistant", tagline: "Your personal research companion",
    description: "Literature reviews, hypothesis generation, and methodology suggestions powered by advanced AI.",
    href: "/tools", badge: "AI",
    gradient: "from-violet-500/20 to-purple-500/20", iconColor: "text-violet-500", borderColor: "group-hover:border-t-violet-500",
  },
  {
    icon: Search, name: "Smart Matching", tagline: "Find the perfect collaborator",
    description: "AI-driven matching based on research domains, trust scores, and institutional compatibility.",
    href: "/smart-matching", badge: "AI",
    gradient: "from-pink-500/20 to-rose-500/20", iconColor: "text-pink-500", borderColor: "group-hover:border-t-pink-500",
  },
  {
    icon: BarChart3, name: "Analytics Dashboard", tagline: "Track your research impact",
    description: "Real-time metrics on citations, collaborations, and your academic reputation score.",
    href: "/progress", badge: "Pro",
    gradient: "from-cyan-500/20 to-sky-500/20", iconColor: "text-cyan-500", borderColor: "group-hover:border-t-cyan-500",
  },
  {
    icon: BookOpen, name: "Grant Finder", tagline: "Discover funding opportunities",
    description: "AI-curated grant calls, fellowship programs, and funding alerts matched to your profile.",
    href: "/grants", badge: "New",
    gradient: "from-rose-500/20 to-red-500/20", iconColor: "text-rose-500", borderColor: "group-hover:border-t-rose-500",
  },
  {
    icon: PenTool, name: "Deal Rooms", tagline: "Structured collaboration spaces",
    description: "Escrow payments, milestone tracking, and accountability records tied to trust scores.",
    href: "/deals", badge: "Popular",
    gradient: "from-indigo-500/20 to-blue-500/20", iconColor: "text-indigo-500", borderColor: "group-hover:border-t-indigo-500",
  },
];

export function FeaturedToolsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") scroll("left");
    if (e.key === "ArrowRight") scroll("right");
  }, [scroll]);

  return (
    <section className="py-12 md:py-20 lg:py-28 relative overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-3 px-3 py-1 text-xs font-medium">
              🛠️ Featured Tools
            </Badge>
            <h2 className="text-2xl font-bold xs:text-3xl md:text-4xl lg:text-5xl">
              Tools Built for{" "}
              <span className="text-gradient animate-gradient-text bg-[length:200%_auto]">Serious Research</span>
            </h2>
            <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-xl">
              From writing papers to analyzing data — everything in one platform.
            </p>
          </motion.div>

          <div className="hidden md:flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10" onClick={() => scroll("left")} aria-label="Scroll left">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10" onClick={() => scroll("right")} aria-label="Scroll right">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Featured tools carousel"
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="snap-start shrink-0 w-[280px] md:w-[300px]"
            >
              <Link to={tool.href} className="block h-full">
                <Card className={`h-full group hover:shadow-lg transition-all duration-300 hover:border-primary/30 border-border/50 border-t-2 border-t-transparent ${tool.borderColor}`}>
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} transition-transform duration-300 group-hover:scale-110`}>
                        <tool.icon className={`h-5 w-5 ${tool.iconColor}`} />
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{tool.badge}</Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{tool.name}</h3>
                      <p className="text-xs text-primary/70 font-medium mt-0.5">{tool.tagline}</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{tool.description}</p>
                    <div className="flex items-center gap-1 text-xs text-primary font-medium mt-auto pt-2 group-hover:gap-2 transition-all">
                      Explore
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
