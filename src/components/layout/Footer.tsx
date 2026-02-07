import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Lock,
  Mail,
  Building2,
  GraduationCap,
} from "lucide-react";

const footerLinks = {
  platform: [
    { label: "How It Works", href: "/about" },
    { label: "Trust System", href: "/about#trust" },
    { label: "Pricing", href: "/pricing" },
    { label: "For Institutions", href: "/org" },
  ],
  resources: [
    { label: "Help Center", href: "/help" },
    { label: "Verification", href: "/verification" },
    { label: "API Documentation", href: "/docs" },
    { label: "Blog", href: "/blog" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12 md:py-16 px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/home" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">ResearcherCollab Pro</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional infrastructure where trust, work, and opportunity compound over time.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                <span>Trust-Based</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                <span>Escrow Protected</span>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Platform</h4>
            <ul className="space-y-2.5">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Resources</h4>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <Link
              to="/contact"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </Link>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} ResearcherCollab Pro. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Verified Institutions Supported
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
