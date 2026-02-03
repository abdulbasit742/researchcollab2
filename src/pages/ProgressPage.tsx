import { MainLayout } from "@/components/layout/MainLayout";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";
import { TrustGovernancePanel } from "@/components/governance/TrustGovernancePanel";
import { EconomicVisibilityPanel } from "@/components/economic/EconomicVisibilityPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Scale,
  DollarSign,
} from "lucide-react";

export default function ProgressPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="gradient-hero py-8 sm:py-12">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-3">
              <TrendingUp className="h-3 w-3 mr-1" />
              Professional Progress
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold md:text-4xl">
              Your <span className="text-gradient">Career Dashboard</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Track your professional momentum, understand your trust economics, and get AI-powered career guidance.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-6 sm:py-8">
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="progress" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
            <TabsTrigger value="governance" className="gap-2">
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Trust Rules</span>
            </TabsTrigger>
            <TabsTrigger value="economics" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Economics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <ProgressDashboard />
          </TabsContent>

          <TabsContent value="governance">
            <TrustGovernancePanel />
          </TabsContent>

          <TabsContent value="economics">
            <EconomicVisibilityPanel />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
