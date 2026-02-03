import { MainLayout } from "@/components/layout/MainLayout";
import { DealRoomList } from "@/components/deals/DealRoomList";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

export default function DealsPage() {
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
              <Briefcase className="h-3 w-3 mr-1" />
              Deal Rooms
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold md:text-4xl">
              Your <span className="text-gradient">Active Deals</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Track negotiations, manage escrow, and complete transactions in one place.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-6 sm:py-8">
        <DealRoomList />
      </div>
    </MainLayout>
  );
}
