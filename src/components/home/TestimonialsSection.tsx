import { motion, useTransform } from "framer-motion";
import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useParallax } from "@/hooks/useParallax";

const testimonials = [
  {
    quote: "The escrow system gave me confidence to hire a statistician I'd never met. Deliverables were exactly as promised.",
    name: "Dr. Amara Osei",
    role: "Postdoctoral Researcher",
    institution: "University of Cape Town",
    initials: "AO",
  },
  {
    quote: "I found a co-author for my thesis within a week. The trust scores helped me pick someone reliable.",
    name: "Lucas Chen",
    role: "PhD Student",
    institution: "ETH Zürich",
    initials: "LC",
  },
  {
    quote: "The AI literature review tool saved me dozens of hours. It surfaces connections I would have missed.",
    name: "Prof. María Gutierrez",
    role: "Full Professor",
    institution: "Universidad de Buenos Aires",
    initials: "MG",
  },
  {
    quote: "As an independent researcher, this platform levels the playing field. I can collaborate with anyone, anywhere.",
    name: "Kenji Nakamura",
    role: "Independent Researcher",
    institution: "Freelance",
    initials: "KN",
  },
  {
    quote: "We use it to connect our R&D team with academic experts. The accountability records are invaluable.",
    name: "Sarah Mitchell",
    role: "Industry Collaborator",
    institution: "BioTech Solutions Ltd",
    initials: "SM",
  },
  {
    quote: "I started using this as an undergrad research assistant. The guided workflows made my first collaboration seamless.",
    name: "Priya Sharma",
    role: "Undergraduate Student",
    institution: "IIT Delhi",
    initials: "PS",
  },
];

export function TestimonialsSection() {
  const { scrollY, isDisabled } = useParallax({ speed: 0.1 });
  const patternY = useTransform(scrollY, (v) => (isDisabled ? 0 : v * 0.03));

  return (
    <section className="py-16 md:py-24 bg-muted/30 border-y relative overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{ y: patternY }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--primary)/0.12)_1px,transparent_0)] bg-[length:28px_28px]" />
      </motion.div>

      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Trusted by Researchers Worldwide
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Hear from academics and collaborators using the platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card variant="premium" className="h-full">
                <CardContent className="p-6 flex flex-col gap-4">
                  <Quote className="h-5 w-5 text-primary/40" />
                  <p className="text-sm text-foreground/90 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/50">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {t.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{t.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {t.role} · {t.institution}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      Verified
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
