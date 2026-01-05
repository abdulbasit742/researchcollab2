import { Search, Sparkles, Zap, Brain, Bot, MessageSquare, BookOpen, Database } from "lucide-react";

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: any;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  features: string[];
  popular: boolean;
  color: string;
  forLevel?: string[];
  forSkills?: string[];
}

export const tools: Tool[] = [
  {
    id: "chatgpt",
    name: "ChatGPT 5.3",
    description: "OpenAI's most advanced language model for research, writing, and analysis.",
    icon: MessageSquare,
    price: 8000,
    originalPrice: 13500,
    rating: 4.9,
    reviews: 2450,
    features: ["Advanced reasoning", "Code analysis", "Academic writing", "Data interpretation"],
    popular: true,
    color: "from-emerald-500 to-teal-500",
    forLevel: ["beginner", "intermediate"],
    forSkills: ["writing", "research"],
  },
  {
    id: "chatgpt-starter",
    name: "ChatGPT 5.3 Starter",
    description: "Perfect for beginners starting their research journey.",
    icon: MessageSquare,
    price: 4200,
    originalPrice: 8000,
    rating: 4.7,
    reviews: 1200,
    features: ["Basic reasoning", "Writing assistance", "Learning mode", "Beginner tutorials"],
    popular: false,
    color: "from-emerald-400 to-green-500",
    forLevel: ["beginner"],
    forSkills: ["learning", "writing"],
  },
  {
    id: "perplexity",
    name: "Perplexity Pro",
    description: "AI-powered search engine with real-time research capabilities and citations.",
    icon: Search,
    price: 6700,
    originalPrice: 10800,
    rating: 4.8,
    reviews: 1820,
    features: ["Real-time search", "Academic citations", "Source verification", "Deep research"],
    popular: false,
    color: "from-blue-500 to-cyan-500",
    forLevel: ["advanced", "publication-ready"],
    forSkills: ["research", "citations"],
  },
  {
    id: "gemini",
    name: "Gemini 4 Ultra",
    description: "Google's multimodal AI for text, images, and complex research tasks.",
    icon: Sparkles,
    price: 9500,
    originalPrice: 15000,
    rating: 4.7,
    reviews: 1340,
    features: ["Multimodal analysis", "Image understanding", "Long context", "Research synthesis"],
    popular: true,
    color: "from-violet-500 to-purple-600",
    forLevel: ["intermediate", "advanced"],
    forSkills: ["analysis", "multimodal"],
  },
  {
    id: "gemini-learning",
    name: "Gemini 4 for Learning",
    description: "Ideal for students learning research fundamentals.",
    icon: Sparkles,
    price: 5300,
    originalPrice: 9500,
    rating: 4.6,
    reviews: 890,
    features: ["Interactive tutorials", "Step-by-step guidance", "Practice exercises", "Feedback"],
    popular: false,
    color: "from-violet-400 to-indigo-500",
    forLevel: ["beginner"],
    forSkills: ["learning"],
  },
  {
    id: "grok",
    name: "Grok 3",
    description: "xAI's witty and capable AI assistant with real-time knowledge.",
    icon: Zap,
    price: 5300,
    originalPrice: 8000,
    rating: 4.6,
    reviews: 890,
    features: ["Real-time updates", "Humor & wit", "X integration", "Current events"],
    popular: false,
    color: "from-orange-500 to-amber-500",
    forLevel: ["intermediate"],
    forSkills: ["coding", "current-events"],
  },
  {
    id: "claude",
    name: "Claude 4 Opus",
    description: "Anthropic's thoughtful AI with exceptional analysis and writing abilities.",
    icon: Brain,
    price: 8900,
    originalPrice: 13500,
    rating: 4.9,
    reviews: 2100,
    features: ["Thoughtful analysis", "Long documents", "Safety-focused", "Academic excellence"],
    popular: true,
    color: "from-pink-500 to-rose-500",
    forLevel: ["advanced", "publication-ready"],
    forSkills: ["writing", "analysis", "coding"],
  },
  {
    id: "research-ai",
    name: "Research AI Pro",
    description: "Our custom AI specialized for academic research and paper writing.",
    icon: Bot,
    price: 4200,
    originalPrice: 7000,
    rating: 4.5,
    reviews: 560,
    features: ["Paper writing", "Literature review", "Citation generation", "Plagiarism check"],
    popular: false,
    color: "from-slate-500 to-gray-600",
    forLevel: ["intermediate", "advanced"],
    forSkills: ["writing", "research"],
  },
  {
    id: "citation-tool",
    name: "Citation & Literature Tool",
    description: "Comprehensive tool for managing citations and literature reviews.",
    icon: BookOpen,
    price: 3300,
    originalPrice: 5500,
    rating: 4.4,
    reviews: 450,
    features: ["Citation formatting", "Bibliography management", "Reference search", "Multiple styles"],
    popular: false,
    color: "from-teal-500 to-cyan-600",
    forLevel: ["advanced", "publication-ready"],
    forSkills: ["citations", "research"],
  },
  {
    id: "data-analyst",
    name: "AI Data Analyst Pack",
    description: "Comprehensive toolkit for data analysis and visualization.",
    icon: Database,
    price: 7800,
    originalPrice: 12500,
    rating: 4.7,
    reviews: 780,
    features: ["Statistical analysis", "Data visualization", "Pattern recognition", "Report generation"],
    popular: true,
    color: "from-indigo-500 to-blue-600",
    forLevel: ["intermediate", "advanced"],
    forSkills: ["data-analysis", "statistics", "visualization"],
  },
];

export interface ToolBundle {
  id: string;
  name: string;
  description: string;
  tools: string[];
  price: number;
  originalPrice: number;
  discount: number;
}

export const toolBundles: ToolBundle[] = [
  {
    id: "research-starter",
    name: "Research Starter Bundle",
    description: "Perfect for beginners starting their research journey",
    tools: ["chatgpt-starter", "gemini-learning", "research-ai"],
    price: 10800,
    originalPrice: 16400,
    discount: 34,
  },
  {
    id: "publication-ready",
    name: "Publication Ready Bundle",
    description: "Everything you need for publishing research papers",
    tools: ["perplexity", "claude", "citation-tool"],
    price: 16400,
    originalPrice: 24700,
    discount: 34,
  },
  {
    id: "data-science",
    name: "Data Science Bundle",
    description: "Complete toolkit for data analysis projects",
    tools: ["data-analyst", "chatgpt", "grok"],
    price: 18000,
    originalPrice: 26700,
    discount: 32,
  },
  {
    id: "complete",
    name: "Complete Research Suite",
    description: "All tools for comprehensive research support",
    tools: ["chatgpt", "perplexity", "gemini", "claude", "research-ai", "data-analyst"],
    price: 27500,
    originalPrice: 45000,
    discount: 39,
  },
];

// Get recommended tools based on user profile
export function getRecommendedTools(
  researchLevel?: string,
  skills?: string[]
): Tool[] {
  const recommendations: Tool[] = [];
  const skillSet = new Set(skills?.map(s => s.toLowerCase()) || []);
  
  for (const tool of tools) {
    let score = 0;
    
    // Check research level match
    if (researchLevel && tool.forLevel?.includes(researchLevel.toLowerCase())) {
      score += 2;
    }
    
    // Check skills match
    if (tool.forSkills) {
      for (const skill of tool.forSkills) {
        if (skillSet.has(skill) || 
            Array.from(skillSet).some(s => s.includes(skill) || skill.includes(s))) {
          score += 1;
        }
      }
    }
    
    // Add to recommendations if score > 0
    if (score > 0) {
      recommendations.push(tool);
    }
  }
  
  // Sort by popularity and score
  recommendations.sort((a, b) => {
    if (a.popular !== b.popular) return a.popular ? -1 : 1;
    return b.rating - a.rating;
  });
  
  return recommendations.slice(0, 4);
}

// Get default recommendations
export function getDefaultRecommendations(): Tool[] {
  return tools.filter(t => t.popular).slice(0, 4);
}
