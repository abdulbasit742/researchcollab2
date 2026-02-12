import { MainLayout } from "@/components/layout/MainLayout";
import { useStrategicFeed, FeedMode } from "@/hooks/useStrategicFeed";
import { ProfessionalSignalCard } from "@/components/signals/ProfessionalSignalCard";
import { OpportunityMatchCard } from "@/components/opportunity/OpportunityMatchCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function StrategicFeedPage() {
  const { mode, setMode, signals, opportunities, isLoading } = useStrategicFeed();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Strategic Feed</h1>
          <Tabs value={mode} onValueChange={(v) => setMode(v as FeedMode)}>
            <TabsList>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="opportunity">Opportunity</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {signals.map((signal, i) => (
              <div key={signal.id}>
                <ProfessionalSignalCard signal={signal} />
                {mode === "opportunity" && i < opportunities.length && i % 3 === 2 && (
                  <div className="mt-4">
                    <OpportunityMatchCard opportunity={opportunities[Math.floor(i / 3)]} />
                  </div>
                )}
              </div>
            ))}

            {signals.length === 0 && (
              <p className="text-center text-muted-foreground py-16">
                No signals yet. Follow professionals and complete projects to build your feed.
              </p>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
