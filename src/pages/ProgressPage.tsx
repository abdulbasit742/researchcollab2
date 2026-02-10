import { MainLayout } from "@/components/layout/MainLayout";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";
import { TrustTrajectoryChart } from "@/components/progress/TrustTrajectoryChart";
import { FailureRecoveryPanel } from "@/components/progress/FailureRecoveryPanel";
import { OpportunityConversionPanel } from "@/components/progress/OpportunityConversionPanel";
import { CareerTimeline } from "@/components/progress/CareerTimeline";
import { NextBestActionPanel } from "@/components/progress/NextBestActionPanel";
import { TrustGovernancePanel } from "@/components/governance/TrustGovernancePanel";
import { EconomicVisibilityPanel } from "@/components/economic/EconomicVisibilityPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AISuggestionCard } from "@/components/ai/AISuggestionCard";
import {
  TrendingUp,
  Scale,
  DollarSign,
  Target,
  Activity,
  Clock,
} from "lucide-react";

export default function ProgressPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-muted/30 border-b">
        <div className="container px-4 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-3">
              <TrendingUp className="h-3 w-3 mr-1" />
              Career Operating System
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold md:text-4xl">
              Your <span className="text-gradient">Professional Progress</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Not vanity metrics. Real trajectory, outcomes, and what to do next.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Philosophy Banner */}
      <div className="bg-primary/5 border-b">
        <div className="container px-4 py-3">
          <p className="text-sm text-center text-muted-foreground">
            <span className="font-medium text-foreground">LinkedIn shows activity.</span>{" "}
            ResearchCollabPro shows <span className="font-medium text-foreground">progress</span>.
          </p>
        </div>
      </div>

      <div className="container px-4 py-6 sm:py-8">
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="progress" className="gap-1.5">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1.5">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="governance" className="gap-1.5">
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Trust Rules</span>
            </TabsTrigger>
            <TabsTrigger value="economics" className="gap-1.5">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Economics</span>
            </TabsTrigger>
          </TabsList>

          {/* Progress Tab - Main Career Dashboard */}
          <TabsContent value="progress">
            <AISuggestionCard
              title="AI Career Forecast"
              domain="career"
              action="forecast"
              context={{}}
              className="mb-6"
            />
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Left Column - Trust & Conversion */}
              <div className="lg:col-span-4 space-y-6">
                <TrustTrajectoryChart />
                <OpportunityConversionPanel />
              </div>

              {/* Center Column - Main Dashboard */}
              <div className="lg:col-span-5">
                <ProgressDashboard />
              </div>

              {/* Right Column - Actions & Recovery */}
              <div className="lg:col-span-3 space-y-6">
                <NextBestActionPanel />
                <FailureRecoveryPanel />
              </div>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <div className="max-w-3xl mx-auto">
              <Card className="mb-6 border-dashed">
                <CardContent className="py-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Your living career timeline.</span>{" "}
                    Every project, role, and outcome — automatically updated.
                  </p>
                </CardContent>
              </Card>
              <CareerTimeline />
            </div>
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance">
            <TrustGovernancePanel />
          </TabsContent>

          {/* Economics Tab */}
          <TabsContent value="economics">
            <EconomicVisibilityPanel />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
