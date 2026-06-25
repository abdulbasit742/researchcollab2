import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MARKETPLACE_SEARCH_FILTERS,
  MARKETPLACE_SERVICE_LISTINGS,
  getMarketplaceCategoryLabel,
  getMarketplaceCounts,
  getMarketplaceLevelClass,
  getMarketplaceStatusClass,
  getMarketplaceStatusLabel,
  type MarketplaceServiceListing,
} from "@/config/marketplaceBrowse";
import { CheckCircle2, Eye, Filter, Lock, Search, ShoppingBag, Star, Tags, type LucideIcon } from "lucide-react";

type MarketplaceBrowsePanelProps = {
  listings?: MarketplaceServiceListing[];
};

export function MarketplaceBrowsePanel({ listings = MARKETPLACE_SERVICE_LISTINGS }: MarketplaceBrowsePanelProps) {
  const counts = getMarketplaceCounts(listings);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Listings" value={counts.total.toString()} helper="Demo services" />
        <MetricCard label="Available" value={counts.available.toString()} helper="Open listings" />
        <MetricCard label="Premium" value={counts.premium.toString()} helper="Top tier" />
        <MetricCard label="In Review" value={counts.review.toString()} helper="Not public yet" danger={counts.review > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Marketplace Browse / Search
              </CardTitle>
              <CardDescription>
                Discover researcher services by category, delivery time, rating, package level, and best-fit use case.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Search className="mr-2 h-4 w-4" /> Search Services
              </Button>
              <Button disabled>
                <Filter className="mr-2 h-4 w-4" /> Apply Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <InfoCard label="Query" value={MARKETPLACE_SEARCH_FILTERS.query} />
            <InfoCard label="Category" value={MARKETPLACE_SEARCH_FILTERS.category} />
            <InfoCard label="Sort" value={MARKETPLACE_SEARCH_FILTERS.sortBy} />
            <InfoCard label="Price" value={MARKETPLACE_SEARCH_FILTERS.priceRange} />
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This is a read-only marketplace preview. Real browsing should connect to approved listings, live search indexes, order policy, moderation status, and secure checkout.
          </div>

          <div className="grid gap-4">
            {listings.map((listing) => (
              <MarketplaceListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MarketplaceListingCard({ listing }: { listing: MarketplaceServiceListing }) {
  return (
    <div className="space-y-4 rounded-xl border bg-background p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{getMarketplaceCategoryLabel(listing.category)}</Badge>
            <Badge className={getMarketplaceLevelClass(listing.level)}>{listing.level}</Badge>
            <Badge className={getMarketplaceStatusClass(listing.status)}>{getMarketplaceStatusLabel(listing.status)}</Badge>
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3" /> {listing.rating.toFixed(1)}
            </Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{listing.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{listing.researcherName} · {listing.completedOrders} demo orders · {listing.deliveryLabel}</p>
            <p className="mt-2 text-sm text-muted-foreground">{listing.bestFor}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm md:min-w-44">
          <p className="text-xs text-muted-foreground">Starting at</p>
          <p className="mt-1 font-semibold">{listing.priceLabel}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Checklist title="Highlights" icon={CheckCircle2} items={listing.highlights} />
        <TagList tags={listing.tags} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled>
          <Eye className="mr-2 h-4 w-4" /> View Details
        </Button>
        <Button disabled>
          <Lock className="mr-2 h-4 w-4" /> Start Order
        </Button>
      </div>
    </div>
  );
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Tags className="h-4 w-4 text-primary" /> Tags
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary">{tag}</Badge>
        ))}
      </div>
    </div>
  );
}

function Checklist({ title, icon: Icon, items }: { title: string; icon: LucideIcon; items: string[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </p>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <p key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return (
    <Card className={danger ? "border-amber-500/30" : undefined}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
