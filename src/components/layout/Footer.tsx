import { Link } from "react-router-dom";
import {
  GraduationCap,
  Twitter,
  Linkedin,
  Github,
  Mail,
} from "lucide-react";

const footerLinks = {
  platform: [
    { label: "AI Tools", href: "/tools" },
    { label: "Collaborations", href: "/collaborations" },
    { label: "Earn Money", href: "/earn" },
    { label: "FYP Services", href: "/fyp-services" },
  ],
  resources: [
    { label: "Blog", href: "/blog" },
    { label: "Research Grants", href: "/grants" },
    { label: "Pricing", href: "/pricing" },
    { label: "Help Center", href: "/help" },
    { label: "API Docs", href: "/docs" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Press Kit", href: "/press" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8 md:py-12 lg:py-16 px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 mb-4 md:mb-0">
            <Link to="/" className="flex items-center gap-2 mb-3 md:mb-4">
              <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg gradient-primary">
                <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
              </div>
              <span className="text-base md:text-lg font-bold">
                Researcher<span className="text-primary">Collab</span>
              </span>
            </Link>
            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
              Connecting researchers, students, and AI tools for academic excellence.
            </p>
            <div className="flex gap-2 md:gap-3">
              <a
                href="#"
                className="p-1.5 md:p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors touch-manipulation"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-1.5 md:p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors touch-manipulation"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-1.5 md:p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors touch-manipulation"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-1.5 md:p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors touch-manipulation"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Platform</h4>
            <ul className="space-y-1.5 md:space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors touch-manipulation"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Resources</h4>
            <ul className="space-y-1.5 md:space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors touch-manipulation"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Company</h4>
            <ul className="space-y-1.5 md:space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors touch-manipulation"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Legal</h4>
            <ul className="space-y-1.5 md:space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors touch-manipulation"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} ResearcherCollab Pro. All rights reserved.
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">
            Made with ❤️ for researchers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
