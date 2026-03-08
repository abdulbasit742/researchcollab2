import { Link } from "react-router-dom";

const SEO_LINK_GROUPS = [
  {
    heading: "FYP & Project Execution",
    links: [
      { label: "Browse FYP Projects", href: "/fyp", desc: "Discover funded final year projects" },
      { label: "Submit a Research Problem", href: "/fyp/submit-problem", desc: "Post challenges for student teams" },
      { label: "Escrow-Backed Deals", href: "/deals", desc: "Milestone payments with atomic release" },
      { label: "Opportunities Marketplace", href: "/offers", desc: "Find research and collaboration offers" },
    ],
  },
  {
    heading: "AI-Powered Tools",
    links: [
      { label: "AI Research Tools", href: "/tools", desc: "Writing assistants, data analysis, citation managers" },
      { label: "AI Career Coach", href: "/career", desc: "AI-driven career trajectory modeling" },
      { label: "Research Papers Hub", href: "/research-papers", desc: "AI-assisted literature review and analysis" },
      { label: "Knowledge Graph", href: "/learning", desc: "Personalized learning paths and skill tracking" },
    ],
  },
  {
    heading: "Trust & Verification",
    links: [
      { label: "Trust Leaderboard", href: "/leaderboard", desc: "Non-gameable execution-based rankings" },
      { label: "Verification Center", href: "/verification", desc: "Identity and credential verification" },
      { label: "Execution Passport", href: "/passport", desc: "Portable proof of verified execution" },
      { label: "Impact Dashboard", href: "/impact", desc: "Measure your research and collaboration impact" },
    ],
  },
  {
    heading: "Platform",
    links: [
      { label: "How RCollab Works", href: "/about", desc: "Learn about trust-backed execution" },
      { label: "Pricing Plans", href: "/pricing", desc: "Free to start, scale as you grow" },
      { label: "Blog & Insights", href: "/blog", desc: "Research collaboration tips and updates" },
      { label: "Help Center", href: "/help", desc: "Guides, FAQs, and support" },
    ],
  },
];

interface SEOInternalLinksProps {
  exclude?: string[];
  className?: string;
}

export function SEOInternalLinks({ exclude = [], className = "" }: SEOInternalLinksProps) {
  return (
    <nav aria-label="Related pages" className={`py-12 border-t bg-muted/20 ${className}`}>
      <div className="container px-4">
        <h2 className="text-lg font-semibold mb-6 text-foreground">Explore RCollab</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {SEO_LINK_GROUPS.map((group) => (
            <div key={group.heading}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">{group.heading}</h3>
              <ul className="space-y-2">
                {group.links
                  .filter((l) => !exclude.includes(l.href))
                  .map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="group block"
                        title={link.desc}
                      >
                        <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                          {link.label}
                        </span>
                        <span className="block text-xs text-muted-foreground">{link.desc}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
