import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowRight, Sparkles, Globe, Users, Building } from "lucide-react";

const disciplines = [
  "Computer Science",
  "Biology",
  "Physics",
  "Chemistry",
  "Mathematics",
  "Engineering",
  "Medicine",
  "Psychology",
  "Economics",
  "Environmental Science",
];

const locations = [
  "United States",
  "United Kingdom",
  "Germany",
  "China",
  "India",
  "Australia",
  "Canada",
  "Japan",
  "France",
  "Netherlands",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-hero">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-20 -left-20 h-60 w-60 rounded-full bg-primary/5 blur-2xl" />
        <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-accent blur-2xl" />
      </div>

      <div className="container relative py-12 px-4 md:py-32 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 md:mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-primary">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
              Trusted by 1000+ researchers worldwide
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl font-extrabold tracking-tight xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight"
          >
            Looking for{" "}
            <span className="text-gradient">Research, Tools,</span>
            <br className="hidden xs:block" />
            <span className="xs:hidden"> </span>
            or{" "}
            <span className="text-gradient">Real Earning</span> Opportunities?
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4"
          >
            <Link to="/auth?tab=signup" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="w-full sm:w-auto h-12 md:h-14 text-sm md:text-base touch-manipulation">
                Get Started Free
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
            <Link to="/tools" className="w-full sm:w-auto">
              <Button variant="hero-outline" size="lg" className="w-full sm:w-auto h-12 md:h-14 text-sm md:text-base touch-manipulation">
                Explore AI Tools
              </Button>
            </Link>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 md:mt-16 mx-auto max-w-3xl px-2"
          >
            <div className="rounded-xl md:rounded-2xl bg-card p-3 md:p-4 shadow-xl border">
              <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                <Select>
                  <SelectTrigger className="w-full md:w-48 h-11 touch-manipulation">
                    <SelectValue placeholder="Discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplines.map((d) => (
                      <SelectItem key={d} value={d.toLowerCase()}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="w-full md:w-48 h-11 touch-manipulation">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((l) => (
                      <SelectItem key={l} value={l.toLowerCase()}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex-1 flex flex-col xs:flex-row gap-2">
                  <Input
                    placeholder="Keywords (e.g., machine learning)"
                    className="flex-1 h-11"
                  />
                  <Button size="default" className="h-11 px-6 w-full xs:w-auto touch-manipulation">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
