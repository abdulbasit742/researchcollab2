import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContractTemplates, ContractTemplate } from "@/hooks/useContractTemplates";
import { FileText, Star, Users, Clock, Shield, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function ContractTemplateLibrary() {
  const { 
    templates, 
    templatesByCategory, 
    selectedTemplate, 
    setSelectedTemplate,
    loading 
  } = useContractTemplates();

  const [activeCategory, setActiveCategory] = useState<string>("all");

  const displayedTemplates = activeCategory === "all" 
    ? templates 
    : templatesByCategory[activeCategory] || [];

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      research: "Research",
      consulting: "Consulting",
      mentorship: "Mentorship",
      grant: "Grant Work",
      development: "Development",
      training: "Training",
    };
    return labels[category] || category;
  };

  const getRiskBadgeColor = (risk: ContractTemplate["riskLevel"]) => {
    switch (risk) {
      case "low": return "bg-green-500/10 text-green-600 border-green-500/30";
      case "medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "high": return "bg-orange-500/10 text-orange-600 border-orange-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Smart Contract Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Pre-built templates for common collaboration types. Customizable milestones, 
            payment schedules, and risk-appropriate escrow percentages.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span>{templates.length} Verified Templates</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Avg 4.6 Rating</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          {Object.keys(templatesByCategory).map(category => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {getCategoryLabel(category)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Templates Grid */}
      <div className="grid gap-4">
        {displayedTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                selectedTemplate?.id === template.id ? "border-primary ring-1 ring-primary/20" : ""
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{template.name}</h3>
                      {template.isVerified && (
                        <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {template.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-medium">{template.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {template.usageCount} uses
                    </p>
                  </div>
                </div>

                {/* Template Details */}
                <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-lg font-bold">{template.milestones.length}</p>
                    <p className="text-xs text-muted-foreground">Milestones</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{template.escrowPercentage}%</p>
                    <p className="text-xs text-muted-foreground">Escrow</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{template.successRate}%</p>
                    <p className="text-xs text-muted-foreground">Success</p>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className={`text-xs ${getRiskBadgeColor(template.riskLevel)}`}>
                      {template.riskLevel} risk
                    </Badge>
                  </div>
                </div>

                {/* Expanded View */}
                {selectedTemplate?.id === template.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-4 pt-4 border-t space-y-4"
                  >
                    <div>
                      <p className="text-sm font-medium mb-2">Milestone Structure</p>
                      <div className="space-y-2">
                        {template.milestones.map((milestone, idx) => (
                          <div key={milestone.id} className="flex items-center gap-3 p-2 rounded bg-muted/50">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{milestone.title}</p>
                              <p className="text-xs text-muted-foreground">{milestone.suggestedDuration}</p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {milestone.percentageOfTotal}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Duration: {template.suggestedDuration}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1">
                        Use This Template
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      <Button variant="outline">
                        Customize
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Create Custom */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="font-medium">Create Custom Template</p>
          <p className="text-sm text-muted-foreground mb-4">
            Build your own template from scratch or modify an existing one
          </p>
          <Button variant="outline">Start from Scratch</Button>
        </CardContent>
      </Card>
    </div>
  );
}
