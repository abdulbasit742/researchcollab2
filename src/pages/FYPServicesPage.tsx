import { useState } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  GraduationCap,
  FileText,
  BarChart3,
  Code,
  PenTool,
  Search,
  ArrowRight,
  Plus,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const services = [
  {
    id: "fyp",
    icon: GraduationCap,
    title: "Final Year Projects",
    description: "Complete FYP assistance from topic selection to implementation and documentation.",
    price: "From PKR 140,000",
    features: ["Topic selection", "Research design", "Implementation", "Documentation"],
    popular: true,
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "thesis",
    icon: FileText,
    title: "Thesis Writing",
    description: "Professional thesis and dissertation writing support for all academic levels.",
    price: "From PKR 85,000",
    features: ["Literature review", "Methodology", "Results analysis", "Formatting"],
    popular: true,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "analysis",
    icon: BarChart3,
    title: "Data Analysis",
    description: "Statistical analysis and data visualization for research projects.",
    price: "From PKR 42,000",
    features: ["SPSS/R/Python", "Statistical tests", "Visualization", "Interpretation"],
    popular: false,
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "coding",
    icon: Code,
    title: "Programming Projects",
    description: "Custom software development for academic and research applications.",
    price: "From PKR 55,000",
    features: ["Web apps", "ML models", "Data pipelines", "Documentation"],
    popular: false,
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "writing",
    icon: PenTool,
    title: "Academic Writing",
    description: "Research papers, essays, and academic content writing services.",
    price: "From PKR 28,000",
    features: ["Research papers", "Essays", "Reports", "Editing"],
    popular: false,
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "research",
    icon: Search,
    title: "Research Assistance",
    description: "Complete research support from design to publication.",
    price: "From PKR 70,000",
    features: ["Research design", "Data collection", "Analysis", "Publication"],
    popular: true,
    color: "from-slate-500 to-gray-600",
  },
];

const recentRequests = [
  {
    id: 1,
    title: "Machine Learning FYP - Image Classification",
    type: "Final Year Project",
    budget: "PKR 220,000",
    deadline: "Jan 15, 2026",
    status: "Open",
  },
  {
    id: 2,
    title: "MBA Thesis - Marketing Strategy Analysis",
    type: "Thesis Writing",
    budget: "PKR 165,000",
    deadline: "Feb 1, 2026",
    status: "Open",
  },
  {
    id: 3,
    title: "Survey Data Analysis - SPSS",
    type: "Data Analysis",
    budget: "PKR 55,000",
    deadline: "Dec 28, 2025",
    status: "Urgent",
  },
];

export default function FYPServicesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmitRequest = () => {
    setIsDialogOpen(false);
    toast({
      title: "Request Submitted!",
      description: "We'll match you with experts shortly.",
    });
  };

  return (
    <MainLayout>
      <div className="gradient-hero py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">
              <GraduationCap className="h-3 w-3 mr-1" />
              FYP & Academic Services
            </Badge>
            <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
              Expert Help for Your{" "}
              <span className="text-gradient">Academic Success</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Get professional assistance with final year projects, thesis writing, 
              data analysis, and more from verified experts.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero" size="xl">
                    <Plus className="h-5 w-5" />
                    Post a Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Post a Service Request</DialogTitle>
                    <DialogDescription>
                      Describe your project and we'll match you with the right experts.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="service-type">Service Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Project Title</Label>
                      <Input id="title" placeholder="Brief title of your project" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your requirements in detail..."
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="budget">Budget</Label>
                        <Input id="budget" placeholder="$500" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deadline">Deadline</Label>
                        <Input id="deadline" type="date" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitRequest}>Submit Request</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="hero-outline" size="xl">
                Browse Experts
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Our Services</h2>
          <p className="mt-2 text-muted-foreground">
            Choose from a wide range of academic support services
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card variant="interactive" className="h-full flex flex-col relative">
                {service.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="premium">Popular</Badge>
                  </div>
                )}

                <CardHeader>
                  <div
                    className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}
                  >
                    <service.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="flex-col items-stretch gap-4">
                  <div className="text-2xl font-bold">{service.price}</div>
                  <Button className="w-full">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Recent Requests</h2>
            <p className="mt-2 text-muted-foreground">
              Active projects looking for experts
            </p>
          </div>

          <div className="grid gap-4">
            {recentRequests.map((request) => (
              <Card key={request.id} variant="elevated">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{request.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">{request.type}</Badge>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {request.budget}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {request.deadline}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={request.status === "Urgent" ? "destructive" : "success"}>
                        {request.status}
                      </Badge>
                      <Button>Apply</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
