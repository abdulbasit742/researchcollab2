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

      <div className="container relative py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Trusted by 1000+ researchers worldwide
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Looking for{" "}
            <span className="text-gradient">Research, Tools,</span>
            <br />
            or{" "}
            <span className="text-gradient">Real Earning</span> Opportunities?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Connect with researchers globally, access cutting-edge AI tools, and earn money 
            with your academic skills. Your all-in-one research collaboration platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/auth?tab=signup">
              <Button variant="hero" size="xl">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/tools">
              <Button variant="hero-outline" size="xl">
                Explore AI Tools
              </Button>
            </Link>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 mx-auto max-w-3xl"
          >
            <div className="rounded-2xl bg-card p-4 shadow-xl border">
              <div className="flex flex-col md:flex-row gap-4">
                <Select>
                  <SelectTrigger className="md:w-48">
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
                  <SelectTrigger className="md:w-48">
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

                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Keywords (e.g., machine learning, climate)"
                    className="flex-1"
                  />
                  <Button size="default" className="px-6">
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
