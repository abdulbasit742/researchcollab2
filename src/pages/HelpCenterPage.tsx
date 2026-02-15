import { useState } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  HelpCircle,
  BookOpen,
  MessageCircle,
  CreditCard,
  Settings,
  Users,
  Shield,
  Zap,
  Mail,
  Phone,
  Clock,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Zap,
    description: "New to the platform? Start here",
    articles: 12,
  },
  {
    id: "account",
    title: "Account & Profile",
    icon: Settings,
    description: "Manage your account settings",
    articles: 8,
  },
  {
    id: "billing",
    title: "Billing & Payments",
    icon: CreditCard,
    description: "Subscriptions, payments, refunds",
    articles: 15,
  },
  {
    id: "tools",
    title: "AI Tools",
    icon: BookOpen,
    description: "Using and managing AI tools",
    articles: 20,
  },
  {
    id: "collaboration",
    title: "Collaboration",
    icon: Users,
    description: "Working with others",
    articles: 10,
  },
  {
    id: "security",
    title: "Security & Privacy",
    icon: Shield,
    description: "Keeping your data safe",
    articles: 6,
  },
];

const faqs = [
  {
    question: "How do I subscribe to an AI tool?",
    answer: "To subscribe to an AI tool, navigate to the Tools page, select the tool you want, choose your preferred plan and duration, then click 'Subscribe via WhatsApp'. Our team will guide you through the payment and setup process within 24 hours.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept payments through JazzCash, EasyPaisa, bank transfer (HBL, Meezan, UBL), and international cards. All payments are processed securely via WhatsApp confirmation.",
  },
  {
    question: "How quickly will I receive my tool access?",
    answer: "Most tool subscriptions are delivered within 2-24 hours after payment confirmation. For BYO (Bring Your Own) accounts, it may take up to 48 hours to upgrade your existing account.",
  },
  {
    question: "Can I cancel my subscription?",
    answer: "Yes, you can cancel your subscription at any time. However, refunds are only available within the first 7 days of your subscription if you haven't used the service. Contact our support team via WhatsApp for cancellation requests.",
  },
  {
    question: "What is the difference between Semi-Private and Private plans?",
    answer: "Semi-Private plans share account access with 2-4 users, offering lower prices but with usage limits. Private plans give you dedicated, exclusive access to the tool with no sharing or limits.",
  },
  {
    question: "Do you offer student discounts?",
    answer: "Yes! Students with valid university email addresses get 10-20% off on most tools. Contact our support team with your student ID for verification.",
  },
  {
    question: "What happens when my subscription expires?",
    answer: "You'll receive a reminder 7 days and 1 day before expiration. After expiry, your access will be revoked. You can renew anytime by contacting us via WhatsApp.",
  },
  {
    question: "Can I upgrade my plan mid-subscription?",
    answer: "Yes, you can upgrade from Semi-Private to Private or extend your duration anytime. The price difference will be calculated based on your remaining days.",
  },
];

const popularArticles = [
  { title: "How to Get Started with ChatGPT 5.3", category: "AI Tools", views: 2340 },
  { title: "Understanding Subscription Plans", category: "Billing", views: 1890 },
  { title: "Setting Up Your Research Profile", category: "Account", views: 1560 },
  { title: "Collaborating on Research Projects", category: "Collaboration", views: 1230 },
  { title: "Troubleshooting Login Issues", category: "Account", views: 1100 },
  { title: "Payment Methods in Pakistan", category: "Billing", views: 980 },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="gradient-hero py-8 sm:py-16 md:py-24">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">
              <HelpCircle className="h-3 w-3 mr-1" />
              Help Center
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-bold md:text-5xl lg:text-6xl">
              How can we <span className="text-gradient">help you?</span>
            </h1>
            <p className="mt-4 text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions, explore our guides, or get in touch with our support team.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for articles, guides, or topics..."
                className="pl-12 h-14 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-6 sm:py-16">
        {/* Categories */}
        <section className="mb-8 sm:mb-16">
          <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="interactive" className="h-full cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <category.icon className="h-6 w-6 text-primary" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <CardTitle className="mt-4">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{category.articles} articles</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-8 sm:mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          </div>
          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* Popular Articles */}
        <section className="mb-8 sm:mb-16">
          <h2 className="text-2xl font-bold mb-8">Popular Articles</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {popularArticles.map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="interactive" className="cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{article.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {article.views.toLocaleString()} views
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="text-2xl font-bold mb-8">Still Need Help?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">WhatsApp Support</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get instant help from our team
                </p>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => window.open("https://wa.me/92318178154", "_blank")}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat on WhatsApp
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We'll respond within 24 hours
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/contact">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Us
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Support Hours</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Mon-Sat: 9AM - 10PM (PKT)
                </p>
                <p className="text-sm font-medium">
                  Average response time: 2 hours
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
