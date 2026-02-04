import { MainLayout } from "@/components/layout/MainLayout";
import { AmbientDashboard } from "@/components/ambient";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

export default function AmbientPage() {
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
              <Lightbulb className="h-3 w-3 mr-1" />
              Ambient Intelligence
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold md:text-4xl">
              Your <span className="text-gradient">Proactive</span> Professional Companion
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Insights, opportunities, and relationship health surfaced automatically to keep you ahead.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-6 sm:py-8">
        <AmbientDashboard />
      </div>
    </MainLayout>
  );
}
