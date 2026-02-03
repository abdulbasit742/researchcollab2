import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Shield,
  Lock,
  CheckCircle,
  TrendingUp,
  Building2,
  ArrowRight,
} from "lucide-react";

export function PlatformTrustBanner() {
  return (
    <Card className="bg-muted/30 border-dashed">
      <CardContent className="py-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            <span>Trust-scored professionals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            <span>Escrow-protected deals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            <span>Institution verified</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PremiumTrialBanner() {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Try Premium Free for 1 Month</p>
              <p className="text-xs text-muted-foreground">
                No payment required • Cancel anytime
              </p>
            </div>
          </div>
          <Button size="sm" asChild className="gap-1">
            <Link to="/premium">
              Start Free Trial
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function VerificationPromptCard({ 
  isVerified = false,
  trustScore = 0,
}: { 
  isVerified?: boolean;
  trustScore?: number;
}) {
  if (isVerified) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm flex items-center gap-2">
                Verified Professional
                <Badge variant="outline" className="text-[10px]">
                  Trust: {trustScore}
                </Badge>
              </p>
              <p className="text-xs text-muted-foreground">
                Your credentials are verified. Access unlocked.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-sm">Get Verified</p>
              <p className="text-xs text-muted-foreground">
                Unlock higher-value opportunities and build trust faster
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" asChild className="gap-1">
            <Link to="/verification">
              Start Verification
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
