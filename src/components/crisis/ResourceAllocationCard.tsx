import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Package, Clock, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import { AllocationRequest } from "@/types/crisis-coordination";

interface ResourceAllocationCardProps {
  request: AllocationRequest;
  onApprove?: () => void;
  onDeny?: () => void;
  onAllocate?: () => void;
}

const resourceIcons: Record<string, React.ReactNode> = {
  expertise: <Zap className="h-4 w-4" />,
  funding: <Package className="h-4 w-4" />,
  knowledge: <Package className="h-4 w-4" />,
  equipment: <Package className="h-4 w-4" />,
  infrastructure: <Package className="h-4 w-4" />,
};

const urgencyColors = {
  standard: "bg-muted text-muted-foreground",
  urgent: "bg-amber-500/10 text-amber-600",
  critical: "bg-orange-500/10 text-orange-600",
  emergency: "bg-red-500/10 text-red-600",
};

const statusColors = {
  pending: "bg-yellow-500",
  approved: "bg-blue-500",
  partial: "bg-amber-500",
  denied: "bg-red-500",
  fulfilled: "bg-green-500",
};

export function ResourceAllocationCard({ request, onApprove, onDeny, onAllocate }: ResourceAllocationCardProps) {
  const utilizationRate = request.allocations.length > 0
    ? request.allocations.reduce((sum, a) => sum + (a.utilizationRate || 0), 0) / request.allocations.length
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {resourceIcons[request.resourceType]}
            <CardTitle className="text-lg capitalize">{request.resourceType}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={urgencyColors[request.urgency]}>
              {request.urgency}
            </Badge>
            <Badge variant="outline" className={`${statusColors[request.status]} text-white`}>
              {request.status}
            </Badge>
          </div>
        </div>
        <CardDescription>{request.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Justification */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Justification</h4>
          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
            {request.justification}
          </p>
        </div>

        {/* Capabilities Needed */}
        {request.capabilitiesNeeded && request.capabilitiesNeeded.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Required Capabilities</h4>
            <div className="flex flex-wrap gap-1">
              {request.capabilitiesNeeded.map((cap) => (
                <Badge key={cap} variant="secondary" className="text-xs">
                  {cap}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Allocations */}
        {request.allocations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Allocated Resources</h4>
            {request.allocations.map((allocation) => (
              <div 
                key={allocation.id}
                className="flex items-center justify-between p-2 rounded bg-muted/50"
              >
                <div className="space-y-1">
                  <span className="text-sm font-medium">{allocation.resourceName}</span>
                  <div className="text-xs text-muted-foreground">
                    {new Date(allocation.startDate).toLocaleDateString()} 
                    {allocation.endDate && ` - ${new Date(allocation.endDate).toLocaleDateString()}`}
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={allocation.status === "in_use" ? "text-green-600" : ""}
                >
                  {allocation.status}
                </Badge>
              </div>
            ))}

            {utilizationRate > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Utilization</span>
                  <span>{Math.round(utilizationRate)}%</span>
                </div>
                <Progress value={utilizationRate} className="h-1" />
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {request.status === "pending" && (onApprove || onDeny) && (
          <div className="flex gap-2 pt-2">
            {onApprove && (
              <button 
                onClick={onApprove}
                className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded text-sm font-medium bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </button>
            )}
            {onDeny && (
              <button 
                onClick={onDeny}
                className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded text-sm font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                Deny
              </button>
            )}
          </div>
        )}

        {/* Timing */}
        <div className="flex items-center text-xs text-muted-foreground pt-2 border-t">
          <Clock className="h-3 w-3 mr-1" />
          Requested {new Date(request.requestedAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
