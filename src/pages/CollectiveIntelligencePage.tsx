import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  Users, 
  Vote, 
  TrendingUp, 
  Search, 
  Plus,
  Brain
} from "lucide-react";
import { useSwarmDecisions, usePredictionMarkets, useDueDiligence } from "@/hooks/useCollectiveIntelligence";
import { SwarmDecisionCard } from "@/components/collective/SwarmDecisionCard";
import { PredictionMarketCard } from "@/components/collective/PredictionMarketCard";
import { DueDiligencePanel } from "@/components/collective/DueDiligencePanel";

export default function CollectiveIntelligencePage() {
  const { decisions, loading: decisionsLoading, fetchDecisions, castVote, getVotes } = useSwarmDecisions();
  const { markets, loading: marketsLoading, fetchMarkets, trade, fetchMyPositions, positions } = usePredictionMarkets();
  const { requests, loading: requestsLoading, fetchRequests, contribute, fetchContributions, contributions } = useDueDiligence();

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [votesMap, setVotesMap] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetchDecisions();
    fetchMarkets();
    fetchRequests();
    fetchMyPositions();
  }, [fetchDecisions, fetchMarkets, fetchRequests, fetchMyPositions]);

  // Load votes for all decisions
  useEffect(() => {
    decisions.forEach(async (decision) => {
      const votes = await getVotes(decision.id);
      setVotesMap(prev => ({ ...prev, [decision.id]: votes }));
    });
  }, [decisions, getVotes]);

  // Load contributions for selected request
  useEffect(() => {
    if (selectedRequestId) {
      fetchContributions(selectedRequestId);
    }
  }, [selectedRequestId, fetchContributions]);

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
              <Brain className="h-3 w-3 mr-1" />
              Collective Intelligence
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold md:text-4xl">
              <span className="text-gradient">Swarm</span> Decision Making
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Harness collective wisdom through prediction markets, distributed due diligence, and consensus voting.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-6 sm:py-8">
        {/* Stats overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Vote className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{decisions.length}</p>
                  <p className="text-xs text-muted-foreground">Active Decisions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{markets.length}</p>
                  <p className="text-xs text-muted-foreground">Prediction Markets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Search className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{requests.length}</p>
                  <p className="text-xs text-muted-foreground">Due Diligence</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Users className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{positions.length}</p>
                  <p className="text-xs text-muted-foreground">Your Positions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main tabs */}
        <Tabs defaultValue="swarm" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="swarm" className="flex items-center gap-2">
              <Vote className="h-4 w-4" />
              <span className="hidden sm:inline">Swarm Decisions</span>
              <span className="sm:hidden">Swarm</span>
            </TabsTrigger>
            <TabsTrigger value="markets" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Prediction Markets</span>
              <span className="sm:hidden">Markets</span>
            </TabsTrigger>
            <TabsTrigger value="diligence" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Due Diligence</span>
              <span className="sm:hidden">Diligence</span>
            </TabsTrigger>
          </TabsList>

          {/* Swarm Decisions */}
          <TabsContent value="swarm" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Swarm Decisions</h2>
                <p className="text-sm text-muted-foreground">
                  Collective voting with trust-weighted consensus
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Decision
              </Button>
            </div>

            {decisionsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : decisions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Vote className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-medium text-lg mb-1">No active decisions</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a new swarm decision to gather collective input
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {decisions.map((decision) => (
                  <SwarmDecisionCard
                    key={decision.id}
                    decision={decision}
                    votes={votesMap[decision.id] || []}
                    onVote={(optionId, confidence, reasoning) => 
                      castVote(decision.id, optionId, confidence, reasoning)
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Prediction Markets */}
          <TabsContent value="markets" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Prediction Markets</h2>
                <p className="text-sm text-muted-foreground">
                  Forecast project outcomes and earn based on accuracy
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Market
              </Button>
            </div>

            {marketsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : markets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-medium text-lg mb-1">No active markets</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a prediction market to forecast project outcomes
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {markets.map((market) => {
                  const userPosition = positions.find(p => p.market_id === market.id);
                  return (
                    <PredictionMarketCard
                      key={market.id}
                      market={market}
                      userPosition={userPosition}
                      onTrade={(outcomeId, tradeType, shares) => 
                        trade(market.id, outcomeId, tradeType, shares)
                      }
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Due Diligence */}
          <TabsContent value="diligence" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Distributed Due Diligence</h2>
                <p className="text-sm text-muted-foreground">
                  Collaborative verification and risk assessment
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Request Investigation
              </Button>
            </div>

            {requestsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : requests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-medium text-lg mb-1">No due diligence requests</h3>
                  <p className="text-sm text-muted-foreground">
                    Request a distributed investigation on users, projects, or organizations
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {requests.map((request) => (
                  <DueDiligencePanel
                    key={request.id}
                    request={request}
                    contributions={selectedRequestId === request.id ? contributions : []}
                    onContribute={(contribution) => contribute(request.id, contribution)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
