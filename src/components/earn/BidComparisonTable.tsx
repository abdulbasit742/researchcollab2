import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, BarChart3 } from "lucide-react";
import { formatPKR } from "@/lib/currency";
import { formatDistanceToNow } from "date-fns";
import { EarningBid } from "@/hooks/useEarning";

type SortKey = "bidder" | "amount" | "delivery" | "status" | "date";
type SortDir = "asc" | "desc";

interface BidComparisonTableProps {
  bids: EarningBid[];
}

const statusOrder: Record<string, number> = {
  accepted: 0,
  shortlisted: 1,
  viewed: 2,
  pending: 3,
  rejected: 4,
};

export function BidComparisonTable({ bids }: BidComparisonTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("amount");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [visible, setVisible] = useState(false);

  if (bids.length === 0) return null;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = [...bids].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortKey) {
      case "bidder":
        return dir * (a.bidder_name || "").localeCompare(b.bidder_name || "");
      case "amount":
        return dir * (a.amount - b.amount);
      case "delivery":
        return dir * (a.delivery_days - b.delivery_days);
      case "status":
        return dir * ((statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5));
      case "date":
        return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      default:
        return 0;
    }
  });

  const SortHeader = ({ label, sortKeyVal }: { label: string; sortKeyVal: SortKey }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground -ml-2 px-2"
      onClick={() => toggleSort(sortKeyVal)}
    >
      {label}
      <ArrowUpDown className="h-3 w-3 ml-1" />
    </Button>
  );

  const statusVariant = (s: string) => {
    switch (s) {
      case "accepted": return "success" as const;
      case "shortlisted": return "default" as const;
      case "rejected": return "destructive" as const;
      case "viewed": return "secondary" as const;
      default: return "outline" as const;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Compare Bids
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setVisible(!visible)}>
            {visible ? "Hide Table" : "Show Table"}
          </Button>
        </div>
      </CardHeader>
      {visible && (
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><SortHeader label="Bidder" sortKeyVal="bidder" /></TableHead>
                <TableHead><SortHeader label="Amount" sortKeyVal="amount" /></TableHead>
                <TableHead><SortHeader label="Delivery" sortKeyVal="delivery" /></TableHead>
                <TableHead><SortHeader label="Status" sortKeyVal="status" /></TableHead>
                <TableHead><SortHeader label="Date" sortKeyVal="date" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell>
                    <Link to={`/u/${bid.bidder_id}`} className="font-medium hover:text-primary hover:underline transition-colors">
                      {bid.bidder_name || "Anonymous"}
                    </Link>
                  </TableCell>
                  <TableCell className="font-semibold text-primary">{formatPKR(bid.amount)}</TableCell>
                  <TableCell>{bid.delivery_days} days</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(bid.status)} className="capitalize text-xs">
                      {bid.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  );
}
