import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Sparkles, Search } from "lucide-react";

export function EmptyFeed() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Your feed is empty</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          Start connecting with researchers and follow topics to see updates here.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/matches">
              <Users className="h-4 w-4 mr-2" />
              Find Connections
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/offers">
              <Search className="h-4 w-4 mr-2" />
              Browse Projects
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
