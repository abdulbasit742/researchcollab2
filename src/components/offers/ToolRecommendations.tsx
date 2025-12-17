import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, ArrowRight } from "lucide-react";
import { Tool, getRecommendedTools, getDefaultRecommendations } from "@/data/tools";
import { useToast } from "@/hooks/use-toast";

interface ToolRecommendationsProps {
  researchLevel?: string;
  skills?: string[];
  variant?: "sidebar" | "inline";
}

export function ToolRecommendations({ 
  researchLevel, 
  skills,
  variant = "sidebar" 
}: ToolRecommendationsProps) {
  const { toast } = useToast();
  
  const recommendedTools = researchLevel || skills?.length
    ? getRecommendedTools(researchLevel, skills)
    : getDefaultRecommendations();

  const trackToolEvent = (toolId: string, toolName: string, eventType: "viewed" | "clicked_buy") => {
    // In real app, this would call API to store event
    console.log("Tool event:", { toolId, toolName, eventType, timestamp: new Date().toISOString() });
    
    if (eventType === "clicked_buy") {
      toast({
        title: "Redirecting to Purchase",
        description: `Taking you to ${toolName}...`,
      });
    }
  };

  if (recommendedTools.length === 0) {
    return null;
  }

  if (variant === "inline") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Recommended Tools for You</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {recommendedTools.slice(0, 4).map((tool) => (
            <Card 
              key={tool.id} 
              variant="interactive" 
              className="cursor-pointer"
              onClick={() => trackToolEvent(tool.id, tool.name, "viewed")}
            >
              <CardContent className="p-4">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3`}>
                  <tool.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h4 className="font-medium text-sm">{tool.name}</h4>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs">{tool.rating}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold">${tool.price}</span>
                  <span className="text-xs text-muted-foreground line-through">${tool.originalPrice}</span>
                </div>
                <Button 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    trackToolEvent(tool.id, tool.name, "clicked_buy");
                  }}
                >
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Link to="/tools">
          <Button variant="outline" className="w-full">
            View All Tools
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommended Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendedTools.slice(0, 4).map((tool) => (
          <div 
            key={tool.id}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => trackToolEvent(tool.id, tool.name, "viewed")}
          >
            <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}>
              <tool.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-sm">{tool.name}</h4>
                {tool.popular && (
                  <Badge variant="premium" className="text-[10px] px-1.5 py-0">
                    Popular
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {tool.features[0]}
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm">${tool.price}</span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                </div>
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    trackToolEvent(tool.id, tool.name, "clicked_buy");
                  }}
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        <Link to="/tools">
          <Button variant="ghost" className="w-full text-sm">
            View All Tools
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
