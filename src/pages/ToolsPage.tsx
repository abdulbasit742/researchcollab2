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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Sparkles, Star, Check, Zap, Brain, Bot, MessageSquare, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTools, Tool } from "@/hooks/useTools";
import { ToolCardSkeleton } from "@/components/skeletons";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  Search,
  Sparkles,
  Zap,
  Brain,
  Bot,
};

const colorMap: Record<string, string> = {
  writing: "from-emerald-500 to-teal-500",
  research: "from-blue-500 to-cyan-500",
  analysis: "from-violet-500 to-purple-600",
};

const categories = [
  { value: "all", label: "All Tools" },
  { value: "writing", label: "Writing" },
  { value: "research", label: "Research" },
  { value: "analysis", label: "Analysis" },
];

const durations = [
  { value: "1", label: "1 Month" },
  { value: "3", label: "3 Months" },
  { value: "6", label: "6 Months" },
];

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { tools, loading, error } = useTools();

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tool.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = category === "all" || tool.category === category;
    return matchesSearch && matchesCategory;
  });

  const openWhatsAppModal = (tool: Tool) => {
    const plans = tool.pricing?.plans || ["Standard"];
    setSelectedTool(tool);
    setSelectedPlan(plans[0]);
    setSelectedDuration("1");
    setIsModalOpen(true);
  };

  const generateWhatsAppLink = () => {
    if (!selectedTool) return "";

    const fullName = profile?.full_name || "User";
    const educationLevel = profile?.education_level || "Not specified";
    const department = profile?.department || "Not specified";
    const email = user?.email || "Not provided";
    const price = selectedTool.pricing?.price || 0;

    const message = `Assalam o Alaikum,

I want to subscribe to *${selectedTool.name}*

📋 *Subscription Details:*
- Plan: ${selectedPlan}
- Duration: ${selectedDuration} Month(s)
- Price: PKR ${price.toLocaleString()}/month

👤 *My Profile:*
- Name: ${fullName}
- Education: ${educationLevel}
- Department: ${department}
- Email: ${email}

Please guide me through the subscription process. JazakAllah!`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/92318178154?text=${encodedMessage}`;
  };

  const handleWhatsAppSubscribe = () => {
    const link = generateWhatsAppLink();
    window.open(link, "_blank");
    setIsModalOpen(false);
    toast({
      title: "WhatsApp Opened",
      description: "Complete your subscription request on WhatsApp. We'll confirm shortly!",
    });
  };

  const getToolIcon = (iconName: string | null) => {
    if (!iconName) return MessageSquare;
    return iconMap[iconName] || MessageSquare;
  };

  const getToolColor = (category: string) => {
    return colorMap[category] || "from-slate-500 to-gray-600";
  };

  return (
    <MainLayout>
      <div className="gradient-hero py-10 md:py-16 lg:py-24">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-3 md:mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Tools Marketplace
            </Badge>
            <h1 className="text-2xl font-bold xs:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
              Powerful AI Tools for{" "}
              <span className="text-gradient">Research Excellence</span>
            </h1>
            <p className="mt-3 md:mt-4 text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Access premium AI tools at discounted prices. Perfect for students, 
              researchers, and academics.
            </p>
          </motion.div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 md:mt-10 flex flex-col gap-3 md:flex-row md:gap-4 max-w-2xl mx-auto"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search AI tools..."
                className="pl-10 h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-48 h-11 touch-manipulation">
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
      <div className="container py-8 md:py-16 px-4 md:px-6">
        {loading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <ToolCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-destructive">Error loading tools: {error}</p>
            </CardContent>
          </Card>
        ) : filteredTools.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Tools Found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredTools.map((tool, index) => {
              const ToolIcon = getToolIcon(tool.icon);
              const price = tool.pricing?.price || 0;
              const originalPrice = tool.pricing?.original_price || 0;
              const plans = tool.pricing?.plans || ["Standard"];
              
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card variant="interactive" className="h-full flex flex-col relative overflow-hidden">
                    {tool.is_featured && (
                      <div className="absolute top-3 right-3 md:top-4 md:right-4">
                        <Badge variant="premium" className="text-xs">Popular</Badge>
                      </div>
                    )}

                    <CardHeader className="p-4 md:p-6">
                      <div
                        className={`h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${getToolColor(tool.category)} flex items-center justify-center mb-3 md:mb-4`}
                      >
                        <ToolIcon className="h-6 w-6 md:h-7 md:w-7 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-lg md:text-xl">{tool.name}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {tool.short_description || tool.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 p-4 pt-0 md:p-6 md:pt-0">
                        <div className="flex items-center gap-2 mb-3 md:mb-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="ml-1 font-medium text-sm">4.8</span>
                        </div>
                        <span className="text-muted-foreground text-xs md:text-sm">
                          Available now
                        </span>
                      </div>

                      <ul className="space-y-1.5 md:space-y-2">
                        {tool.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs md:text-sm">
                            <Check className="h-3 w-3 md:h-4 md:w-4 text-primary shrink-0" />
                            <span className="truncate">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="flex-col items-stretch gap-3 md:gap-4 p-4 pt-0 md:p-6 md:pt-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xl md:text-2xl font-bold">PKR {price.toLocaleString()}</span>
                        {originalPrice > 0 && (
                          <span className="text-xs md:text-sm text-muted-foreground line-through">
                            PKR {originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="text-xs md:text-sm text-primary font-medium">/month</span>
                      </div>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 h-11 touch-manipulation"
                        onClick={() => openWhatsAppModal(tool)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Subscribe via WhatsApp
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Bundle Offer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-8 md:mt-16"
        >
          <Card className="gradient-primary border-0 text-primary-foreground">
            <CardContent className="p-6 md:p-8 lg:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                <div className="text-center md:text-left">
                  <Badge className="bg-primary-foreground/20 text-primary-foreground mb-3 md:mb-4">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Bundle Deal
                  </Badge>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold">
                    Get All {tools.length} Tools for PKR 22,000/month
                  </h3>
                  <p className="mt-2 text-sm md:text-base text-primary-foreground/90">
                    Save over 50% with our complete research bundle
                  </p>
                </div>
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white h-12 md:h-14 w-full md:w-auto touch-manipulation"
                  onClick={() => {
                    const bundleMessage = encodeURIComponent(`Assalam o Alaikum,

I want to subscribe to the *Complete Research Bundle* (All ${tools.length} Tools) for PKR 22,000/month.

👤 *My Profile:*
- Name: ${profile?.full_name || "User"}
- Education: ${profile?.education_level || "Not specified"}
- Department: ${profile?.department || "Not specified"}
- Email: ${user?.email || "Not provided"}

Please guide me through the subscription process. JazakAllah!`);
                    window.open(`https://wa.me/92318178154?text=${bundleMessage}`, "_blank");
                  }}
                >
                  <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
                  Get Bundle via WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* WhatsApp Subscription Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Subscribe via WhatsApp
            </DialogTitle>
            <DialogDescription>
              Configure your subscription for {selectedTool?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Plan Selection */}
            <div className="space-y-2">
              <Label>Select Plan</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  {(selectedTool?.pricing?.plans || ["Standard"]).map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration Selection */}
            <div className="space-y-2">
              <Label>Subscription Duration</Label>
              <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose duration" />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((duration) => (
                    <SelectItem key={duration.value} value={duration.value}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Summary */}
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex justify-between text-sm">
                <span>Price per month:</span>
                <span className="font-medium">PKR {(selectedTool?.pricing?.price || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>Duration:</span>
                <span className="font-medium">{selectedDuration} month(s)</span>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Total:</span>
                <span>PKR {((selectedTool?.pricing?.price || 0) * parseInt(selectedDuration)).toLocaleString()}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Click below to open WhatsApp with a pre-filled message. Our team will confirm your subscription.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleWhatsAppSubscribe}
            >
              <MessageCircle className="h-4 w-4" />
              Open WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
