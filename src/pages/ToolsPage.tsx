import { useState } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Sparkles, Star, Check, ArrowRight, Zap, Brain, Bot, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const tools = [
  {
    id: "chatgpt",
    name: "ChatGPT 5.3",
    description: "OpenAI's most advanced language model for research, writing, and analysis.",
    icon: MessageSquare,
    price: 29,
    originalPrice: 49,
    rating: 4.9,
    reviews: 2450,
    features: ["Advanced reasoning", "Code analysis", "Academic writing", "Data interpretation"],
    popular: true,
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "perplexity",
    name: "Perplexity Pro",
    description: "AI-powered search engine with real-time research capabilities and citations.",
    icon: Search,
    price: 24,
    originalPrice: 39,
    rating: 4.8,
    reviews: 1820,
    features: ["Real-time search", "Academic citations", "Source verification", "Deep research"],
    popular: false,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "gemini",
    name: "Gemini 4 Ultra",
    description: "Google's multimodal AI for text, images, and complex research tasks.",
    icon: Sparkles,
    price: 34,
    originalPrice: 54,
    rating: 4.7,
    reviews: 1340,
    features: ["Multimodal analysis", "Image understanding", "Long context", "Research synthesis"],
    popular: true,
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "grok",
    name: "Grok 3",
    description: "xAI's witty and capable AI assistant with real-time knowledge.",
    icon: Zap,
    price: 19,
    originalPrice: 29,
    rating: 4.6,
    reviews: 890,
    features: ["Real-time updates", "Humor & wit", "X integration", "Current events"],
    popular: false,
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "claude",
    name: "Claude 4 Opus",
    description: "Anthropic's thoughtful AI with exceptional analysis and writing abilities.",
    icon: Brain,
    price: 32,
    originalPrice: 49,
    rating: 4.9,
    reviews: 2100,
    features: ["Thoughtful analysis", "Long documents", "Safety-focused", "Academic excellence"],
    popular: true,
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "research-ai",
    name: "Research AI Pro",
    description: "Our custom AI specialized for academic research and paper writing.",
    icon: Bot,
    price: 15,
    originalPrice: 25,
    rating: 4.5,
    reviews: 560,
    features: ["Paper writing", "Literature review", "Citation generation", "Plagiarism check"],
    popular: false,
    color: "from-slate-500 to-gray-600",
  },
];

const categories = [
  { value: "all", label: "All Tools" },
  { value: "writing", label: "Writing" },
  { value: "research", label: "Research" },
  { value: "analysis", label: "Analysis" },
  { value: "coding", label: "Coding" },
];

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const { toast } = useToast();

  const handleSubscribe = (toolName: string) => {
    toast({
      title: "Subscription Started",
      description: `You've subscribed to ${toolName}. Redirecting to checkout...`,
    });
  };

  return (
    <MainLayout>
      <div className="gradient-hero py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Tools Marketplace
            </Badge>
            <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
              Powerful AI Tools for{" "}
              <span className="text-gradient">Research Excellence</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Access premium AI tools at discounted prices. Perfect for students, 
              researchers, and academics.
            </p>
          </motion.div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-col md:flex-row gap-4 max-w-2xl mx-auto"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search AI tools..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="container py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="interactive" className="h-full flex flex-col relative overflow-hidden">
                {tool.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="premium">Popular</Badge>
                  </div>
                )}

                <CardHeader>
                  <div
                    className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4`}
                  >
                    <tool.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{tool.name}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="ml-1 font-medium">{tool.rating}</span>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      ({tool.reviews.toLocaleString()} reviews)
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {tool.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="flex-col items-stretch gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">${tool.price}</span>
                    <span className="text-lg text-muted-foreground line-through">
                      ${tool.originalPrice}
                    </span>
                    <span className="text-sm text-primary font-medium">/month</span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleSubscribe(tool.name)}
                  >
                    Subscribe Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bundle Offer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card className="gradient-primary border-0 text-primary-foreground">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <Badge className="bg-primary-foreground/20 text-primary-foreground mb-4">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Bundle Deal
                  </Badge>
                  <h3 className="text-2xl md:text-3xl font-bold">
                    Get All 6 Tools for $79/month
                  </h3>
                  <p className="mt-2 text-primary-foreground/90">
                    Save over 50% with our complete research bundle
                  </p>
                </div>
                <Button
                  size="xl"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  Get Bundle
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
