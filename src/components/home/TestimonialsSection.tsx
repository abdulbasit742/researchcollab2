import { useState } from "react";
import { motion, useTransform } from "framer-motion";
import { Quote, Star, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useParallax } from "@/hooks/useParallax";

const testimonials = [
  {
    quote: "The escrow system gave me confidence to hire a statistician I'd never met. Deliverables were exactly as promised.",
    name: "Dr. Amara Osei",
    role: "Postdoctoral Researcher",
    institution: "University of Cape Town",
    initials: "AO",
    rating: 5,
  },
  {
    quote: "I found a co-author for my thesis within a week. The trust scores helped me pick someone reliable.",
    name: "Lucas Chen",
    role: "PhD Student",
    institution: "ETH Zürich",
    initials: "LC",
    rating: 5,
  },
  {
    quote: "The AI literature review tool saved me dozens of hours. It surfaces connections I would have missed.",
    name: "Prof. María Gutierrez",
    role: "Full Professor",
    institution: "Universidad de Buenos Aires",
    initials: "MG",
    rating: 5,
  },
  {
    quote: "As an independent researcher, this platform levels the playing field. I can collaborate with anyone, anywhere.",
    name: "Kenji Nakamura",
    role: "Independent Researcher",
    institution: "Freelance",
    initials: "KN",
    rating: 4,
  },
  {
    quote: "We use it to connect our R&D team with academic experts. The accountability records are invaluable.",
    name: "Sarah Mitchell",
    role: "Industry Collaborator",
    institution: "BioTech Solutions Ltd",
    initials: "SM",
    rating: 5,
  },
  {
    quote: "I started using this as an undergrad research assistant. The guided workflows made my first collaboration seamless.",
    name: "Priya Sharma",
    role: "Undergraduate Student",
    institution: "IIT Delhi",
    initials: "PS",
    rating: 5,
  },
];

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <Card variant="premium" className="h-full hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between">
          <Quote className="h-4 w-4 sm:h-5 sm:w-5 text-primary/40" />
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${i < t.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
          "{t.quote}"
        </p>
        <div className="flex items-center gap-2.5 sm:gap-3 mt-auto pt-3 sm:pt-4 border-t border-border/50">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] sm:text-xs font-semibold">
              {t.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold truncate flex items-center gap-1">
              {t.name}
              <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary shrink-0" />
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {t.role} · {t.institution}
            </p>
          </div>
          <Badge variant="outline" className="text-[9px] sm:text-[10px] shrink-0 hidden xs:inline-flex">
            Verified
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function TestimonialsSection() {
  const { scrollY, isDisabled } = useParallax({ speed: 0.1 });
  const patternY = useTransform(scrollY, (v) => (isDisabled ? 0 : v * 0.03));
  const [showAll, setShowAll] = useState(false);

  const mobileTestimonials = showAll ? testimonials : testimonials.slice(0, 3);

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-muted/30 border-y relative overflow-hidden">
      <motion.div className="absolute inset-0 opacity-20" style={{ y: patternY }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--primary)/0.12)_1px,transparent_0)] bg-[length:28px_28px]" />
      </motion.div>

      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
            Trusted by Researchers Worldwide
          </h2>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
            Hear from academics and collaborators using the platform.
          </p>
        </motion.div>

        {/* Mobile: show 3 initially + show more */}
        <div className="md:hidden space-y-3">
          {mobileTestimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
            >
              <TestimonialCard t={t} />
            </motion.div>
          ))}
          {!showAll && (
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(true)}
                className="text-xs text-muted-foreground touch-manipulation"
              >
                Show {testimonials.length - 3} more reviews
              </Button>
            </div>
          )}
        </div>

        {/* Desktop: full grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <TestimonialCard t={t} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
