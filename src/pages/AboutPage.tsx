import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Users, Lightbulb, Award, Rocket, Globe, Heart, Shield } from "lucide-react";

const teamMembers = [
  {
    name: "Sarah Ahmed",
    role: "CEO & Founder",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face",
    bio: "Visionary leader with 10+ years in EdTech. Passionate about democratizing research collaboration.",
    linkedin: "#"
  },
  {
    name: "Usman Khan",
    role: "CTO",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    bio: "Full-stack architect building scalable platforms. Former engineer at top tech companies.",
    linkedin: "#"
  },
  {
    name: "Fatima Malik",
    role: "Head of Research",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
    bio: "PhD in Computer Science. Bridges academia and industry with innovative research methodologies.",
    linkedin: "#"
  },
  {
    name: "Ali Raza",
    role: "Head of Partnerships",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    bio: "Building strategic alliances with universities and research institutions across Pakistan.",
    linkedin: "#"
  },
  {
    name: "Ayesha Tariq",
    role: "Product Manager",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face",
    bio: "User-centric product leader. Transforms complex research needs into intuitive solutions.",
    linkedin: "#"
  },
  {
    name: "Hassan Nawaz",
    role: "Lead Designer",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
    bio: "Creative visionary crafting beautiful, accessible interfaces for researchers worldwide.",
    linkedin: "#"
  }
];

const milestones = [
  {
    year: "2024",
    title: "The Beginning",
    description: "Founded with a mission to connect students with researchers across Pakistan.",
    icon: Rocket
  },
  {
    year: "2025",
    title: "Platform Launch",
    description: "Launched trust-based collaboration with AI tools, escrow payments, and verified outcomes.",
    icon: Lightbulb
  },
  {
    year: "2025",
    title: "Institutional Partnerships",
    description: "Opened the platform to universities and research institutions.",
    icon: Award
  },
  {
    year: "Next",
    title: "Growing Together",
    description: "Building the most trusted research collaboration platform — one verified outcome at a time.",
    icon: Target
  }
];

const values = [
  {
    icon: Heart,
    title: "Community First",
    description: "We prioritize the needs of researchers and students in everything we build."
  },
  {
    icon: Shield,
    title: "Trust & Security",
    description: "Your research and data are protected with enterprise-grade security."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We continuously push boundaries to create better research tools."
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "We believe the best research happens when minds come together."
  }
];

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Badge variant="secondary" className="mb-4">About Us</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Empowering Research <span className="text-primary">Collaboration</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                We're on a mission to democratize research by connecting students, researchers, 
                and institutions across Pakistan and beyond. Our platform bridges the gap between 
                academic potential and real-world research opportunities.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  To create a thriving ecosystem where knowledge flows freely between 
                  students seeking to learn and researchers pushing the boundaries of 
                  human understanding.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  We believe that every student deserves access to meaningful research 
                  opportunities, and every researcher deserves talented collaborators 
                  to bring their ideas to life.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  By leveraging technology and building a supportive community, we're 
                  making research collaboration accessible, efficient, and rewarding 
                  for everyone involved.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-2 gap-4"
              >
                {values.map((value, index) => (
                  <Card key={index} className="bg-background/80 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <value.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <Badge variant="outline" className="mb-4">Our Team</Badge>
              <h2 className="text-3xl font-bold mb-4">Meet the People Behind the Platform</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A diverse team of researchers, engineers, and designers passionate about 
                transforming how research collaboration works.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="relative w-24 h-24 mx-auto mb-4">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"
                        />
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                      <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
                      <p className="text-muted-foreground text-sm">{member.bio}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Milestones Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <Badge variant="outline" className="mb-4">Our Journey</Badge>
              <h2 className="text-3xl font-bold mb-4">Milestones That Define Us</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From a small idea to a thriving platform, here's how we've grown over the years.
              </p>
            </motion.div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-border hidden md:block" />

              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex flex-col md:flex-row items-center gap-4 ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                      <Card className="inline-block bg-background/80 backdrop-blur-sm border-border/50">
                        <CardContent className="p-6">
                          <Badge variant="secondary" className="mb-2">{milestone.year}</Badge>
                          <h3 className="font-semibold text-lg mb-2">{milestone.title}</h3>
                          <p className="text-muted-foreground text-sm">{milestone.description}</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                        <milestone.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                    </div>

                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Shield, label: "Atomic Escrow", description: "Every payment is locked, verified, and released through database-level transactions." },
                { icon: Target, label: "Trust Engine", description: "Reputation computed from real outcomes — not followers, likes, or self-reported claims." },
                { icon: Users, label: "Verified Matching", description: "AI-powered matching based on skills, trust scores, and verified academic records." },
                { icon: Lightbulb, label: "AI Research Tools", description: "Built-in AI assistance for project scoping, literature review, and methodology." },
              ].map((cap, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <cap.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="font-semibold mb-1">{cap.label}</div>
                  <div className="text-sm text-muted-foreground">{cap.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
