import { Link } from "react-router-dom";
import { GraduationCap, FlaskConical, UserCheck, Building2, Banknote, Briefcase, ArrowUpRight } from "lucide-react";

const roles = [
  { icon: GraduationCap, title: "For Students", desc: "Build FYPs, get AI roadmaps, find supervisors.", href: "/auth/register?role=student", accent: "from-[hsl(210_100%_60%)] to-[hsl(230_85%_60%)]" },
  { icon: FlaskConical, title: "For Researchers", desc: "Sell research skills, manage orders, build portfolio.", href: "/auth/register?role=researcher", accent: "from-[hsl(265_80%_60%)] to-[hsl(290_75%_60%)]" },
  { icon: UserCheck, title: "For Supervisors", desc: "Review students, comment on reports, evaluate projects.", href: "/auth/register?role=supervisor", accent: "from-[hsl(195_85%_55%)] to-[hsl(210_85%_55%)]" },
  { icon: Building2, title: "For Departments", desc: "Manage FYP groups, assign supervisors, schedule defense.", href: "/contact?type=department", accent: "from-[hsl(220_70%_55%)] to-[hsl(245_70%_60%)]" },
  { icon: Banknote, title: "For Funders", desc: "Discover projects, track impact, fund milestones.", href: "/auth/register?role=funder", accent: "from-[hsl(152_60%_45%)] to-[hsl(175_60%_45%)]" },
  { icon: Briefcase, title: "For Industry Partners", desc: "Post real problems, select teams, track delivery.", href: "/auth/register?role=industry", accent: "from-[hsl(25_90%_55%)] to-[hsl(40_90%_55%)]" },
];

export function RoleCTAGrid() {
  return (
    <section className="border-b border-border/60 bg-background py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Built for everyone in research</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            A premium workspace for every role.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Choose your path. ResearchCollab adapts to how you create, supervise, fund, or partner on research.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map(({ icon: Icon, title, desc, href, accent }) => (
            <Link
              key={title}
              to={href}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/30"
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-md`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground flex items-center gap-1">
                {title}
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
