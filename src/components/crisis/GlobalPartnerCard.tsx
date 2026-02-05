import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Shield, CheckCircle, AlertTriangle, Building } from "lucide-react";
import { CoordinationPartner, CrossBorderMission } from "@/types/crisis-coordination";

interface GlobalPartnerCardProps {
  partner?: CoordinationPartner;
  mission?: CrossBorderMission;
  onActivate?: () => void;
  onSuspend?: () => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  country: <Globe className="h-4 w-4" />,
  ngo: <Building className="h-4 w-4" />,
  academic: <Building className="h-4 w-4" />,
  government: <Building className="h-4 w-4" />,
  industry: <Building className="h-4 w-4" />,
};

const statusColors = {
  active: "bg-green-500",
  pending: "bg-yellow-500",
  suspended: "bg-red-500",
  proposed: "bg-blue-500",
  negotiating: "bg-amber-500",
  completed: "bg-green-500",
  terminated: "bg-red-500",
};

export function GlobalPartnerCard({ partner, mission, onActivate, onSuspend }: GlobalPartnerCardProps) {
  if (partner) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {typeIcons[partner.type]}
              <CardTitle className="text-lg">{partner.name}</CardTitle>
            </div>
            <Badge variant="outline" className={`${statusColors[partner.status]} text-white`}>
              {partner.status}
            </Badge>
          </div>
          <CardDescription>
            {partner.type.charAt(0).toUpperCase() + partner.type.slice(1)} · {partner.region}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trust Level */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Trust Level</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${partner.trustLevel}%` }}
                />
              </div>
              <span className="text-sm font-medium">{partner.trustLevel}%</span>
            </div>
          </div>

          {/* Capabilities */}
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Capabilities</h4>
            <div className="flex flex-wrap gap-1">
              {partner.capabilities.slice(0, 5).map((cap) => (
                <Badge key={cap} variant="secondary" className="text-xs">
                  {cap}
                </Badge>
              ))}
              {partner.capabilities.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{partner.capabilities.length - 5}
                </Badge>
              )}
            </div>
          </div>

          {/* Data Policy Summary */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Data Policy
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <PolicyItem 
                label="Data Export"
                allowed={partner.dataPolicy.allowsDataExport}
              />
              <PolicyItem 
                label="Data Import"
                allowed={partner.dataPolicy.allowsDataImport}
              />
              <PolicyItem 
                label="Anonymization Required"
                allowed={partner.dataPolicy.requiresAnonymization}
                inverted
              />
            </div>
          </div>

          {/* Actions */}
          {partner.status === "pending" && onActivate && (
            <button 
              onClick={onActivate}
              className="w-full py-2 px-4 rounded text-sm font-medium bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
            >
              <CheckCircle className="inline h-4 w-4 mr-1" />
              Activate Partner
            </button>
          )}
          {partner.status === "active" && onSuspend && (
            <button 
              onClick={onSuspend}
              className="w-full py-2 px-4 rounded text-sm font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
            >
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              Suspend Partner
            </button>
          )}

          {/* Meta */}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Joined {new Date(partner.joinedAt).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mission) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{mission.name}</CardTitle>
            </div>
            <Badge variant="outline" className={`${statusColors[mission.status]} text-white`}>
              {mission.status}
            </Badge>
          </div>
          <CardDescription>{mission.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Partners */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Partners ({mission.partners.length})</h4>
            <div className="flex flex-wrap gap-2">
              {mission.partners.map((p) => (
                <Badge key={p.id} variant="secondary" className="text-xs">
                  {typeIcons[p.type]}
                  <span className="ml-1">{p.name}</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Objectives */}
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Objectives</h4>
            <ul className="space-y-1">
              {mission.objectives.map((obj, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 mt-1 text-primary" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>

          {/* Data Agreements */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Data Agreements</span>
            <Badge variant="outline">
              {mission.dataAgreements.length} active
            </Badge>
          </div>

          {/* Meta */}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Created {new Date(mission.createdAt).toLocaleDateString()}
            {mission.completedAt && ` · Completed ${new Date(mission.completedAt).toLocaleDateString()}`}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

function PolicyItem({ label, allowed, inverted = false }: { label: string; allowed: boolean; inverted?: boolean }) {
  const isPositive = inverted ? !allowed : allowed;
  
  return (
    <div className="flex items-center gap-1">
      {isPositive ? (
        <CheckCircle className="h-3 w-3 text-green-500" />
      ) : (
        <AlertTriangle className="h-3 w-3 text-amber-500" />
      )}
      <span>{label}</span>
    </div>
  );
}
