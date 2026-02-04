import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Lightbulb, 
  Target, 
  Users, 
  AlertTriangle,
  CheckCircle,
  X
} from "lucide-react";
import { NudgeCard, type Nudge } from "./NudgeCard";

interface NudgeTrayProps {
  nudges: Nudge[];
  onDismiss?: (id: string) => void;
  onAction?: (nudge: Nudge) => void;
  onDismissAll?: () => void;
  trigger?: React.ReactNode;
  className?: string;
}

export function NudgeTray({ 
  nudges, 
  onDismiss, 
  onAction, 
  onDismissAll,
  trigger,
  className 
}: NudgeTrayProps) {
  const [open, setOpen] = useState(false);

  const highPriority = nudges.filter(n => n.priority === "high");
  const byType = {
    insight: nudges.filter(n => n.type === "insight"),
    alert: nudges.filter(n => n.type === "alert"),
    entropy: nudges.filter(n => n.type === "entropy"),
    deal_risk: nudges.filter(n => n.type === "deal_risk"),
  };

  const defaultTrigger = (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      {nudges.length > 0 && (
        <Badge 
          className={cn(
            "absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs",
            highPriority.length > 0 ? "bg-destructive" : "bg-primary"
          )}
        >
          {nudges.length > 9 ? "9+" : nudges.length}
        </Badge>
      )}
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent className={cn("w-full sm:max-w-md p-0", className)}>
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Ambient Intelligence
            </SheetTitle>
            {nudges.length > 0 && onDismissAll && (
              <Button variant="ghost" size="sm" onClick={onDismissAll}>
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>

        {nudges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-lg mb-1">All caught up!</h3>
            <p className="text-sm text-muted-foreground">
              No new insights or alerts at the moment
            </p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="flex flex-col h-[calc(100vh-80px)]">
            <TabsList className="mx-4 mt-4 grid grid-cols-5">
              <TabsTrigger value="all" className="text-xs">
                All
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0">
                  {nudges.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="insight" className="text-xs">
                <Lightbulb className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="alert" className="text-xs">
                <Target className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="entropy" className="text-xs">
                <Users className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="deal_risk" className="text-xs">
                <AlertTriangle className="h-3 w-3" />
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 px-4 py-4">
              <TabsContent value="all" className="m-0 space-y-3">
                <AnimatePresence mode="popLayout">
                  {nudges.map((nudge) => (
                    <NudgeCard
                      key={nudge.id}
                      nudge={nudge}
                      onDismiss={onDismiss}
                      onAction={onAction}
                    />
                  ))}
                </AnimatePresence>
              </TabsContent>

              {(["insight", "alert", "entropy", "deal_risk"] as const).map((type) => (
                <TabsContent key={type} value={type} className="m-0 space-y-3">
                  <AnimatePresence mode="popLayout">
                    {byType[type].length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8 text-muted-foreground text-sm"
                      >
                        No {type.replace("_", " ")} nudges
                      </motion.div>
                    ) : (
                      byType[type].map((nudge) => (
                        <NudgeCard
                          key={nudge.id}
                          nudge={nudge}
                          onDismiss={onDismiss}
                          onAction={onAction}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Floating nudge indicator for embedding in layouts
interface FloatingNudgeIndicatorProps {
  count: number;
  highPriorityCount: number;
  onClick?: () => void;
  className?: string;
}

export function FloatingNudgeIndicator({ 
  count, 
  highPriorityCount, 
  onClick,
  className 
}: FloatingNudgeIndicatorProps) {
  if (count === 0) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg",
        highPriorityCount > 0 
          ? "bg-destructive text-destructive-foreground" 
          : "bg-primary text-primary-foreground",
        className
      )}
    >
      <Lightbulb className="h-4 w-4" />
      <span className="text-sm font-medium">
        {count} {count === 1 ? "nudge" : "nudges"}
      </span>
      {highPriorityCount > 0 && (
        <Badge variant="secondary" className="bg-white/20 text-current">
          {highPriorityCount} urgent
        </Badge>
      )}
    </motion.button>
  );
}
