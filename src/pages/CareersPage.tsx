import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, MapPin, Clock, Users, Heart, Zap, Globe, GraduationCap, Coffee, Laptop } from "lucide-react";
import { toast } from "sonner";

const jobListings = [
  {
    id: 1,
    title: "Senior Full-Stack Developer",
    department: "Engineering",
    location: "Lahore, Pakistan (Hybrid)",
    type: "Full-time",
    experience: "5+ years",
    description: "We're looking for a senior full-stack developer to help build and scale our academic research platform.",
    requirements: [
      "5+ years experience with React, Node.js, and TypeScript",
      "Experience with cloud platforms (AWS, GCP, or Azure)",
      "Strong understanding of database design and optimization",
      "Experience with agile development methodologies",
      "Excellent problem-solving and communication skills"
    ],
    responsibilities: [
      "Design and implement new features for our platform",
      "Mentor junior developers and conduct code reviews",
      "Collaborate with product and design teams",
      "Optimize application performance and scalability",
      "Contribute to technical architecture decisions"
    ]
  },
  {
    id: 2,
    title: "UI/UX Designer",
    department: "Design",
    location: "Karachi, Pakistan (Remote)",
    type: "Full-time",
    experience: "3+ years",
    description: "Join our design team to create beautiful and intuitive experiences for researchers and students.",
    requirements: [
      "3+ years experience in UI/UX design",
      "Proficiency in Figma, Adobe XD, or similar tools",
      "Strong portfolio demonstrating user-centered design",
      "Experience with design systems and component libraries",
      "Understanding of accessibility standards"
    ],
    responsibilities: [
      "Design user interfaces for web and mobile applications",
      "Conduct user research and usability testing",
      "Create wireframes, prototypes, and high-fidelity mockups",
      "Maintain and evolve our design system",
      "Collaborate with developers to ensure design quality"
    ]
  },
  {
    id: 3,
    title: "Academic Partnership Manager",
    department: "Business Development",
    location: "Islamabad, Pakistan (On-site)",
    type: "Full-time",
    experience: "4+ years",
    description: "Build and manage relationships with universities and research institutions across Pakistan.",
    requirements: [
      "4+ years experience in partnership or business development",
      "Strong network in the academic sector",
      "Excellent negotiation and presentation skills",
      "Bachelor's degree in Business, Marketing, or related field",
      "Fluent in English and Urdu"
    ],
    responsibilities: [
      "Identify and pursue new partnership opportunities",
      "Negotiate and close partnership agreements",
      "Manage existing partner relationships",
      "Represent the company at academic conferences",
      "Develop partnership strategies and proposals"
    ]
  },
  {
    id: 4,
    title: "Content & Research Analyst",
    department: "Content",
    location: "Remote (Pakistan)",
    type: "Full-time",
    experience: "2+ years",
    description: "Help curate and analyze research content to improve our platform's offerings.",
    requirements: [
      "Master's degree in any research-oriented field",
      "2+ years experience in content analysis or research",
      "Strong analytical and writing skills",
      "Familiarity with academic publishing standards",
      "Attention to detail and quality"
    ],
    responsibilities: [
      "Review and curate research content",
      "Analyze trends in academic research",
      "Write summaries and descriptions for tools and resources",
      "Ensure content quality and accuracy",
      "Support content strategy initiatives"
    ]
  },
  {
    id: 5,
    title: "Customer Success Intern",
    department: "Customer Success",
    location: "Lahore, Pakistan (On-site)",
    type: "Internship",
    experience: "Fresh graduates welcome",
    description: "Start your career by helping students and researchers succeed with our platform.",
    requirements: [
      "Currently enrolled or recently graduated from university",
      "Strong communication and interpersonal skills",
      "Passion for education and technology",
      "Basic understanding of research processes",
      "Eagerness to learn and grow"
    ],
    responsibilities: [
      "Respond to customer inquiries via chat and email",
      "Help users navigate the platform",
      "Collect and document user feedback",
      "Assist with onboarding new users",
      "Support the customer success team"
    ]
  }
];

const benefits = [
  { icon: Heart, title: "Health Insurance", description: "Comprehensive health coverage for you and your family" },
  { icon: Zap, title: "Learning Budget", description: "PKR 100,000 annual budget for courses and certifications" },
  { icon: Globe, title: "Remote Flexibility", description: "Work from home options with flexible hours" },
  { icon: GraduationCap, title: "Education Support", description: "Support for higher education and research" },
  { icon: Coffee, title: "Free Meals", description: "Complimentary lunch and snacks at office" },
  { icon: Laptop, title: "Equipment", description: "Latest MacBook and accessories provided" }
];

const CareersPage = () => {
  const [selectedJob, setSelectedJob] = useState<typeof jobListings[0] | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    experience: "",
    coverLetter: "",
    resume: null as File | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, resume: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Application submitted successfully! We'll be in touch soon.");
    setIsApplying(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      linkedin: "",
      experience: "",
      coverLetter: "",
      resume: null
    });
  };

  return (
    <MainLayout>
      <div>
        {/* Hero Section */}
        <section className="relative py-10 sm:py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4" variant="secondary">We're Hiring!</Badge>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
              Join Our Mission to Transform
              <span className="text-primary block">Academic Research</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Be part of a team that's empowering students and researchers across Pakistan 
              with cutting-edge tools and resources.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>50+ Team Members</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>3 Offices in Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <span>{jobListings.length} Open Positions</span>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-8 sm:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Why Work With Us?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We offer competitive benefits and a supportive environment for growth
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Job Listings Section */}
        <section className="py-8 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Open Positions</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find your next opportunity and grow with us
              </p>
            </div>
            <div className="space-y-4 max-w-4xl mx-auto">
              {jobListings.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
                          <Badge variant="outline">{job.department}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{job.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{job.type}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            <span>{job.experience}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => setSelectedJob(job)}>
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-2xl">{job.title}</DialogTitle>
                              <DialogDescription className="flex flex-wrap gap-2 pt-2">
                                <Badge variant="secondary">{job.department}</Badge>
                                <Badge variant="outline">{job.type}</Badge>
                                <Badge variant="outline">{job.location}</Badge>
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                              <div>
                                <h4 className="font-semibold text-foreground mb-2">About the Role</h4>
                                <p className="text-muted-foreground">{job.description}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-2">Requirements</h4>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                  {job.requirements.map((req, i) => (
                                    <li key={i}>{req}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-2">Responsibilities</h4>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                  {job.responsibilities.map((resp, i) => (
                                    <li key={i}>{resp}</li>
                                  ))}
                                </ul>
                              </div>
                              <Button 
                                className="w-full" 
                                onClick={() => {
                                  setSelectedJob(job);
                                  setIsApplying(true);
                                }}
                              >
                                Apply for this Position
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button onClick={() => {
                          setSelectedJob(job);
                          setIsApplying(true);
                        }}>
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Application Dialog */}
        <Dialog open={isApplying} onOpenChange={setIsApplying}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
              <DialogDescription>
                Fill out the form below to submit your application
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+92 300 1234567"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    placeholder="linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Select 
                  value={formData.experience} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 years</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resume">Resume/CV</Label>
                <Input
                  id="resume"
                  name="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">PDF, DOC, or DOCX (max 5MB)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverLetter">Cover Letter</Label>
                <Textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  placeholder="Tell us why you're interested in this role and what makes you a great fit..."
                  rows={5}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsApplying(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Submit Application
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Don't See a Perfect Fit?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              We're always looking for talented individuals. Send us your resume and 
              we'll keep you in mind for future opportunities.
            </p>
            <Button 
              size="lg" 
              onClick={() => {
                setSelectedJob({ 
                  id: 0, 
                  title: "General Application", 
                  department: "Various", 
                  location: "Pakistan", 
                  type: "TBD", 
                  experience: "Various",
                  description: "",
                  requirements: [],
                  responsibilities: []
                });
                setIsApplying(true);
              }}
            >
              Submit General Application
            </Button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default CareersPage;
