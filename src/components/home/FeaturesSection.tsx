import { Link } from "react-router-dom";
import { motion, useTransform } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Wrench, Users, DollarSign, FileText, Sparkles, Shield } from "lucide-react";
import { useParallax } from "@/hooks/useParallax";

const features = [
  {
    icon: Wrench,
    title: "AI Research Tools",
    description: "Access ChatGPT, Gemini, Claude, and more powerful AI tools designed for academic research.",
    badge: "Premium",
    badgeVariant: "premium" as const,
    href: "/tools",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Users,
    title: "Find Collaborators",
    description: "Connect with researchers, students, and experts from 80+ countries based on your interests.",
    badge: "Smart Match",
    badgeVariant: "info" as const,
    href: "/collaborations",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: DollarSign,
    title: "Earn Money",
    description: "Monetize your skills by bidding on projects, offering services, and helping with academic work.",
    badge: "Top Feature",
    badgeVariant: "success" as const,
    href: "/earn",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: FileText,
    title: "FYP & Academic Services",
    description: "Find or offer help with final year projects, thesis writing, data analysis, and more.",
    badge: "Popular",
    badgeVariant: "warning" as const,
    href: "/fyp-services",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: Sparkles,
    title: "Research Grants",
    description: "Discover funding opportunities, grant calls, and fellowship programs worldwide.",
    badge: "New",
    badgeVariant: "new" as const,
    href: "/grants",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Enterprise-grade security with encrypted communications and verified user profiles.",
    badge: "Trusted",
    badgeVariant: "secondary" as const,
    href: "/about",
    color: "from-slate-500 to-gray-600",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function FeaturesSection() {
  const { scrollY, isDisabled } = useParallax({ speed: 0.1 });
  
  // Background gradient parallax
  const bgY = useTransform(scrollY, (v) => (isDisabled ? 0 : v * 0.03));

  return (
    <section className="py-12 md:py-20 lg:py-28 relative overflow-hidden">
      {/* Subtle background gradient with parallax */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none"
        style={{ y: bgY }}
      />

      <div className="container px-4 md:px-6 relative">
        <div className="text-center mb-8 md:mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">
              ✨ All-in-One Platform
            </Badge>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-2xl font-bold xs:text-3xl md:text-4xl lg:text-5xl"
          >
            Everything You Need for{" "}
            <span className="text-gradient animate-gradient-text bg-[length:200%_auto]">Research Success</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-3 md:mt-4 text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2"
          >
            One platform for collaboration, AI tools, and earning opportunities
          </motion.p>
        </div>

        <motion.div 
          className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => {
            // Staggered row parallax - cards in different rows move at slightly different speeds
            const row = Math.floor(index / 3);
            const cardY = useTransform(scrollY, (v) => (isDisabled ? 0 : v * (0.02 + row * 0.01)));
            
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                style={{ y: cardY }}
                className="will-change-transform"
              >
                <Card variant="premium" className="h-full flex flex-col group">
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex items-start justify-between gap-2">
                      <motion.div
                        className={`flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg md:rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <feature.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </motion.div>
                      <motion.div
                        whileHover={{ y: -2 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Badge variant={feature.badgeVariant} className="text-xs shrink-0">
                          {feature.badge}
                        </Badge>
                      </motion.div>
                    </div>
                    <CardTitle className="mt-3 md:mt-4 text-base md:text-lg group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-4 pt-0 md:p-6 md:pt-0">
                    <p className="text-muted-foreground text-sm line-clamp-3">{feature.description}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 md:p-6 md:pt-0">
                    <Link to={feature.href} className="w-full">
                      <Button variant="ghost" className="w-full justify-between group/btn h-10 touch-manipulation text-sm hover:bg-primary/5">
                        Learn More
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
