import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Award,
  Calendar,
  DollarSign,
  MapPin,
  ExternalLink,
  ArrowRight,
  Filter,
  Bell,
} from "lucide-react";

const grants = [
  {
    id: 1,
    title: "NSF Graduate Research Fellowship",
    organization: "National Science Foundation",
    amount: "PKR 5,500,000/year",
    deadline: "Oct 21, 2025",
    location: "United States",
    type: "Fellowship",
    fields: ["STEM", "Social Sciences", "Education"],
    description: "Supports outstanding graduate students pursuing research-based degrees in NSF-supported fields.",
  },
  {
    id: 2,
    title: "Marie Skłodowska-Curie Actions",
    organization: "European Commission",
    amount: "€200,000+",
    deadline: "Sep 12, 2025",
    location: "Europe / Global",
    type: "Research Grant",
    fields: ["All Fields", "International Mobility"],
    description: "Funds excellent researchers at all stages of their careers, regardless of nationality.",
  },
  {
    id: 3,
    title: "Fulbright Scholar Program",
    organization: "U.S. Department of State",
    amount: "Varies by country",
    deadline: "Sep 15, 2025",
    location: "Global",
    type: "Fellowship",
    fields: ["All Fields", "Cultural Exchange"],
    description: "International educational exchange program for scholars, educators, and professionals.",
  },
  {
    id: 4,
    title: "Wellcome Trust Research Fellowship",
    organization: "Wellcome Trust",
    amount: "£250,000+",
    deadline: "Mar 1, 2026",
    location: "United Kingdom",
    type: "Research Grant",
    fields: ["Health", "Biomedical", "Life Sciences"],
    description: "Supports researchers to develop their career and take on new research challenges.",
  },
  {
    id: 5,
    title: "Google Research Scholar Program",
    organization: "Google",
    amount: "PKR 9,000,000",
    deadline: "Rolling",
    location: "Global",
    type: "Research Grant",
    fields: ["Computer Science", "AI", "Machine Learning"],
    description: "Supports world-class research in computer science and related fields.",
  },
  {
    id: 6,
    title: "DAAD Research Grants",
    organization: "DAAD",
    amount: "€1,200/month",
    deadline: "Various",
    location: "Germany",
    type: "Fellowship",
    fields: ["All Fields", "International Students"],
    description: "Funding for doctoral research at German universities and research institutes.",
  },
];

const grantTypes = ["All Types", "Fellowship", "Research Grant", "Scholarship", "Prize"];
const fields = ["All Fields", "STEM", "Humanities", "Social Sciences", "Health", "Arts"];

export default function GrantsPage() {
  return (
    <MainLayout>
      <div className="gradient-hero py-8 sm:py-16 md:py-24">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">
              <Award className="h-3 w-3 mr-1" />
              Grants & Funding
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-bold md:text-5xl lg:text-6xl">
              Discover{" "}
              <span className="text-gradient">Funding Opportunities</span>
            </h1>
            <p className="mt-4 text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Find research grants, fellowships, and scholarships from leading 
              organizations worldwide.
            </p>
          </motion.div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-col md:flex-row gap-3 sm:gap-4 max-w-4xl mx-auto"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search grants, fellowships..."
                className="pl-10"
              />
            </div>
            <Select defaultValue="All Types">
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {grantTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="All Fields">
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Field" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>
              <Bell className="h-4 w-4 mr-2" />
              Set Alert
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Grants List */}
      <div className="container px-4 py-6 sm:py-16">
        <div className="grid gap-6">
          {grants.map((grant, index) => (
            <motion.div
              key={grant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="interactive">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{grant.title}</CardTitle>
                      <CardDescription className="mt-1 font-medium">
                        {grant.organization}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{grant.type}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{grant.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {grant.fields.map((field) => (
                      <Badge key={field} variant="outline">
                        {field}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{grant.amount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Deadline: {grant.deadline}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{grant.location}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="gap-3">
                  <Button>
                    Learn More
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="outline">Save for Later</Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-10 text-center">
          <Button variant="outline" size="lg">
            Load More Grants
          </Button>
        </div>

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <Card className="gradient-primary border-0 text-primary-foreground">
            <CardContent className="p-5 sm:p-8 md:p-12 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">
                Never Miss a Funding Opportunity
              </h3>
              <p className="mt-2 text-primary-foreground/90 max-w-xl mx-auto">
                Get personalized grant alerts based on your research interests 
                and eligibility.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  placeholder="Enter your email"
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
                <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  Subscribe
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
