import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  DollarSign, 
  Clock, 
  ArrowRight, 
  Briefcase,
  Users,
  Filter
} from "lucide-react";
import { dummyOffers, dummyBids } from "@/data/offers";
import { BidModal } from "@/components/offers/BidModal";
import { ToolRecommendations } from "@/components/offers/ToolRecommendations";

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedOffer, setSelectedOffer] = useState<typeof dummyOffers[0] | null>(null);

  // Only show public offers that are still open
  const publicOffers = dummyOffers.filter(o => 
    o.visibility === "public" && o.status === "sent"
  );

  const filteredOffers = publicOffers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || offer.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getBidCount = (offerId: string) => {
    return dummyBids.filter(b => b.offerId === offerId).length;
  };

  const categories = [
    "FYP / Thesis",
    "Research Paper Support",
    "Data Analysis",
    "Coding / App Dev",
    "UI/Design",
    "Presentation/Poster",
    "Other",
  ];

  return (
    <MainLayout>
      <div className="gradient-hero py-8 sm:py-16 md:py-24">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">
              <Briefcase className="h-3 w-3 mr-1" />
              Public Jobs Board
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-bold md:text-5xl lg:text-6xl">
              Find Projects &{" "}
              <span className="text-gradient">Start Earning</span>
            </h1>
            <p className="mt-4 text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse open project opportunities from researchers worldwide. 
              Bid on projects that match your skills and start earning today.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto"
          >
            <Card variant="glass">
              <CardContent className="p-3 sm:p-4 text-center">
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-primary mb-1" />
                <div className="text-lg sm:text-xl font-bold">{publicOffers.length}</div>
                <div className="text-xs text-muted-foreground">Open Jobs</div>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-3 sm:p-4 text-center">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-primary mb-1" />
                <div className="text-lg sm:text-xl font-bold">$50K+</div>
                <div className="text-xs text-muted-foreground">Available</div>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-3 sm:p-4 text-center">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-primary mb-1" />
                <div className="text-lg sm:text-xl font-bold">200+</div>
                <div className="text-xs text-muted-foreground">Bidders</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-6 sm:py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by title, description, or skills..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Jobs List */}
            <div className="space-y-4">
              {filteredOffers.length === 0 ? (
                <Card>
                  <CardContent className="p-6 sm:p-12 text-center">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredOffers.map((offer, index) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card variant="interactive">
                      <CardHeader>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={offer.senderAvatar} />
                              <AvatarFallback>{offer.senderName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{offer.title}</CardTitle>
                              <CardDescription>
                                {offer.senderName} • Posted {new Date(offer.createdAt).toLocaleDateString()}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="success">Open</Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {offer.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{offer.category}</Badge>
                          {offer.requiredSkills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline">{skill}</Badge>
                          ))}
                          {offer.requiredSkills.length > 3 && (
                            <Badge variant="outline">+{offer.requiredSkills.length - 3}</Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span className="font-semibold">
                              ${offer.budget}{offer.budgetType === "hourly" ? "/hr" : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Due: {new Date(offer.deadline).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{getBidCount(offer.id)} bids</span>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="gap-3">
                        <Button onClick={() => setSelectedOffer(offer)}>
                          Place Bid
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                        <Link to={`/offers/${offer.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar - Tool Recommendations */}
          <div className="lg:w-80">
            <ToolRecommendations 
              researchLevel="intermediate"
              skills={["coding", "data-analysis"]}
            />
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      {selectedOffer && (
        <BidModal
          open={!!selectedOffer}
          onOpenChange={(open) => !open && setSelectedOffer(null)}
          offerTitle={selectedOffer.title}
          offerId={selectedOffer.id}
          suggestedBudget={selectedOffer.budget}
          budgetType={selectedOffer.budgetType}
        />
      )}
    </MainLayout>
  );
}
