import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/layout/MainLayout";
import { Mail, Phone, MapPin, Clock, Building2, Users, Handshake, MessageSquare, Send } from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    inquiryType: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim() || !formData.inquiryType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .insert({
          name: formData.name,
          email: formData.email,
          organization: formData.organization || null,
          inquiry_type: formData.inquiryType,
          subject: formData.subject || null,
          message: formData.message,
        });

      if (error) throw error;

      // Send email notification (fire-and-forget, don't block user)
      supabase.functions.invoke("notify-contact", {
        body: {
          name: formData.name,
          email: formData.email,
          organization: formData.organization || undefined,
          inquiryType: formData.inquiryType,
          subject: formData.subject || undefined,
          message: formData.message,
        },
      }).catch((err) => console.error("Email notification failed:", err));

      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24-48 hours. Check your email for confirmation.",
      });
      
      setFormData({
        name: "",
        email: "",
        organization: "",
        inquiryType: "",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      console.error("Contact form error:", err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
    
    // Remove fake contact data that doesn't exist
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: MapPin,
      label: "Location",
      value: "Pakistan",
      description: "Remote-first platform",
    },
    {
      icon: Clock,
      label: "Response Time",
      value: "24-48 hours",
      description: "For all inquiries",
    },
  ];

  const inquiryTypes = [
    { value: "general", label: "General Inquiry", icon: MessageSquare },
    { value: "partnership", label: "Partnership Request", icon: Handshake },
    { value: "enterprise", label: "Enterprise Sales", icon: Building2 },
    { value: "support", label: "Technical Support", icon: Users },
  ];

  return (
    <MainLayout>
      <SEOHead
        title="Contact Us"
        description="Get in touch with ResearchCollabPro. We're here to help with partnerships, support, and inquiries."
        canonicalPath="/contact"
        keywords="contact, support, partnerships, research platform help"
      />
      {/* Hero Section */}
      <section className="gradient-hero py-8 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-0">
            <MessageSquare className="h-3 w-3 mr-1" />
            Get In Touch
          </Badge>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
            Have questions, want to partner with us, or need enterprise solutions? We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        maxLength={255}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization (Optional)</Label>
                      <Input
                        id="organization"
                        placeholder="Your university or company"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        maxLength={200}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inquiryType">Inquiry Type *</Label>
                      <Select
                        value={formData.inquiryType}
                        onValueChange={(value) => setFormData({ ...formData, inquiryType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {inquiryTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="h-4 w-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief summary of your inquiry"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      maxLength={200}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      maxLength={2000}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {formData.message.length}/2000 characters
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href="/help" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  Help Center
                </a>
                <a href="/docs" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Building2 className="h-4 w-4" />
                  API Documentation
                </a>
                <a href="/pricing" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Users className="h-4 w-4" />
                  Pricing Plans
                </a>
              </CardContent>
            </Card>

            {/* Partnership CTA */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <Handshake className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Become a Partner</CardTitle>
                <CardDescription>
                  Join our network of universities, research institutions, and AI tool providers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    setFormData({ ...formData, inquiryType: "partnership" });
                    document.getElementById("inquiryType")?.scrollIntoView({ behavior: "smooth" });
                  }}>
                    Partner With Us
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContactPage;
