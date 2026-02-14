import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowRight, Sparkles, GraduationCap, BookOpen, FlaskConical } from "lucide-react";
import { FloatingOrbs } from "@/components/decorations/FloatingOrbs";
import { useParallax } from "@/hooks/useParallax";
import { AnimatedCounter } from "@/components/ui/animated-counter";

const disciplines = [
  "Computer Science", "Biology", "Physics", "Chemistry", "Mathematics",
  "Engineering", "Medicine", "Psychology", "Economics", "Environmental Science",
];

const locations = [
  "United States", "United Kingdom", "Germany", "China", "India",
  "Australia", "Canada", "Japan", "France", "Netherlands",
];

const floatingIcons = [
  { Icon: GraduationCap, x: "15%", y: "25%", delay: 0, speed: 0.15 },
  { Icon: BookOpen, x: "85%", y: "20%", delay: 1, speed: 0.25 },
  { Icon: FlaskConical, x: "10%", y: "70%", delay: 2, speed: 0.2 },
  { Icon: Sparkles, x: "90%", y: "65%", delay: 1.5, speed: 0.3 },
];

const cyclingPlaceholders = [
  "Try: machine learning",
  "Try: climate change",
  "Try: quantum computing",
  "Try: gene therapy",
  "Try: neural networks",
];

const heroStats = [
  { value: 12000, suffix: "+", label: "Papers" },
  { value: 5000, suffix: "+", label: "Researchers" },
  { value: 50, suffix: "+", label: "Fields" },
  { value: 98, suffix: "%", label: "Satisfaction" },
];

export function HeroSection() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [location, setLocation] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const { scrollY, isDisabled } = useParallax({ speed: 0.3 });
  const orbsY = useTransform(scrollY, (v) => (isDisabled ? 0 : v * 0.15));
  const gradientY = useTransform(scrollY, (v) => (isDisabled ? 0 : v * 0.08));
  const contentY = useTransform(scrollY, (v) => (isDisabled ? 0 : v * 0.1));
  const searchY = useTransform(scrollY, (v) => (isDisabled ? 0 : v * 0.12));

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % cyclingPlaceholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (discipline) params.set("discipline", discipline);
    if (location) params.set("location", location);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section data-tour="hero" className="relative overflow-hidden gradient-hero min-h-[600px] md:min-h-[700px]">
      <motion.div style={{ y: orbsY }} className="absolute inset-0">
        <FloatingOrbs variant="hero" />
      </motion.div>

      {floatingIcons.map(({ Icon, x, y, delay, speed }, index) => {
        const iconY = useTransform(scrollY, (v) => (isDisabled ? 0 : v * speed));
        return (
          <motion.div
            key={index}
            className="absolute hidden md:flex items-center justify-center w-12 h-12 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 shadow-lg will-change-transform"
            style={{ left: x, top: y, y: iconY }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.5, duration: 0.5 }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, delay, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon className="h-6 w-6 text-primary" />
            </motion.div>
          </motion.div>
        );
      })}

      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-background/5 to-background/20 pointer-events-none"
        style={{ y: gradientY }}
      />

      <div className="container relative py-12 px-4 md:py-32 md:px-6">
        <motion.div className="mx-auto max-w-4xl text-center" style={{ y: contentY }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-4 md:mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-primary border border-primary/20 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 animate-pulse" />
              Built for researchers, by researchers
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl font-extrabold tracking-tight xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight"
          >
            Looking for{" "}
            <span className="text-gradient animate-gradient-text bg-[length:200%_auto]">Research, Tools,</span>
            <br className="hidden xs:block" />
            <span className="xs:hidden"> </span>
            or{" "}
            <span className="text-gradient animate-gradient-text bg-[length:200%_auto]">Real Earning</span> Opportunities?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-4 md:mt-6 max-w-2xl text-sm md:text-lg lg:text-xl text-muted-foreground px-2"
          >
            Connect with researchers globally, access cutting-edge AI tools, and earn money 
            with your academic skills. Your all-in-one research collaboration platform.
          </motion.p>

          {/* Animated stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-6 md:mt-8 flex items-center justify-center gap-4 md:gap-8 flex-wrap"
          >
            {heroStats.map((stat, i) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-lg md:text-2xl font-bold text-primary">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2000} delay={i * 150} />
                </span>
                <span className="text-[10px] md:text-xs text-muted-foreground font-medium">{stat.label}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4"
          >
            <Link to="/auth?tab=signup" className="w-full sm:w-auto">
              <Button variant="premium" size="lg" className="w-full sm:w-auto h-12 md:h-14 text-sm md:text-base touch-manipulation active:scale-95 transition-transform">
                Get Started Free
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
            <Link to="/tools" className="w-full sm:w-auto">
              <Button variant="hero-outline" size="lg" className="w-full sm:w-auto h-12 md:h-14 text-sm md:text-base touch-manipulation active:scale-95 transition-transform">
                Explore AI Tools
              </Button>
            </Link>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ y: searchY }}
            className="mt-8 md:mt-16 mx-auto max-w-3xl px-2"
          >
            <form onSubmit={handleSearch} className="rounded-xl md:rounded-2xl bg-card/80 backdrop-blur-xl p-3 md:p-4 shadow-xl border border-border/50 glow-focus transition-all duration-300 hover:shadow-2xl hover:border-primary/20">
              <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                <div className="hidden md:block">
                  <Select value={discipline} onValueChange={setDiscipline}>
                    <SelectTrigger className="w-full md:w-48 h-11 touch-manipulation bg-background/50">
                      <SelectValue placeholder="Discipline" />
                    </SelectTrigger>
                    <SelectContent>
                      {disciplines.map((d) => (
                        <SelectItem key={d} value={d.toLowerCase()}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="hidden md:block">
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="w-full md:w-48 h-11 touch-manipulation bg-background/50">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((l) => (
                        <SelectItem key={l} value={l.toLowerCase()}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 flex flex-col xs:flex-row gap-2">
                  <Input
                    placeholder={cyclingPlaceholders[placeholderIndex]}
                    className="flex-1 h-11 bg-background/50 transition-all"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                  <Button type="submit" size="default" className="h-11 px-6 w-full xs:w-auto touch-manipulation active:scale-95 transition-transform">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
