import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Scale, Users, AlertTriangle, Shield, Briefcase } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <MainLayout>
      <div className="container max-w-4xl py-8 md:py-12 px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: February 3, 2026
          </p>
        </div>

        <div className="space-y-6">
          {/* Agreement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                By accessing or using ResearcherCollab Pro, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, you may not use our platform.
              </p>
              <p>
                ResearcherCollab Pro is an outcome-based professional platform for researchers, students, and institutions. 
                We prioritize trust, verified work, and professional accountability.
              </p>
            </CardContent>
          </Card>

          {/* Eligibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Eligibility & Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <h4>Eligibility</h4>
              <ul>
                <li>You must be at least 18 years old to use ResearcherCollab Pro</li>
                <li>You must provide accurate and complete registration information</li>
                <li>You are responsible for maintaining account security</li>
              </ul>

              <h4>Account Responsibilities</h4>
              <ul>
                <li>One account per person (no duplicate accounts)</li>
                <li>You may not share or transfer your account</li>
                <li>You must promptly update any changes to your information</li>
                <li>You are responsible for all activity under your account</li>
              </ul>
            </CardContent>
          </Card>

          {/* Platform Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Platform Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <h4>Trust-First Conduct</h4>
              <p>ResearcherCollab Pro is built on trust and accountability. You agree to:</p>
              <ul>
                <li>Provide truthful information about your credentials and experience</li>
                <li>Honor project commitments and deadlines</li>
                <li>Maintain professional conduct in all interactions</li>
                <li>Use escrow systems for paid work when required</li>
                <li>Accept that trust scores reflect verified outcomes, not popularity</li>
              </ul>

              <h4>Prohibited Activities</h4>
              <ul>
                <li>Misrepresenting credentials, affiliations, or capabilities</li>
                <li>Gaming trust scores or manipulating platform metrics</li>
                <li>Harassment, spam, or abusive behavior</li>
                <li>Circumventing escrow or payment systems</li>
                <li>Violating intellectual property rights</li>
                <li>Using the platform for illegal activities</li>
              </ul>
            </CardContent>
          </Card>

          {/* Projects & Escrow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Projects & Escrow
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <h4>Project Agreements</h4>
              <ul>
                <li>Projects create binding agreements between parties</li>
                <li>All deliverables and milestones should be clearly defined</li>
                <li>Escrow protects both parties in paid collaborations</li>
              </ul>

              <h4>Escrow Terms</h4>
              <ul>
                <li>Funds are held securely until milestones are completed</li>
                <li>Release requires verification of deliverable completion</li>
                <li>Disputes are resolved through our mediation process</li>
                <li>Platform fees apply to escrow transactions</li>
              </ul>

              <h4>Trust Score Impact</h4>
              <ul>
                <li>Successful completions increase trust scores</li>
                <li>Failures and disputes affect trust negatively</li>
                <li>Trust scores are permanent records of professional reliability</li>
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <h4>Your Content</h4>
              <ul>
                <li>You retain ownership of content you create</li>
                <li>You grant ResearcherCollab Pro a license to display and process your content</li>
                <li>Project deliverables are governed by individual project agreements</li>
              </ul>

              <h4>Platform Content</h4>
              <ul>
                <li>ResearcherCollab Pro owns all platform designs, features, and systems</li>
                <li>You may not copy, modify, or distribute platform elements</li>
              </ul>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Termination & Enforcement
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <h4>Account Termination</h4>
              <ul>
                <li>You may close your account at any time</li>
                <li>Active projects must be completed or properly cancelled</li>
                <li>Trust history remains for platform integrity</li>
              </ul>

              <h4>Enforcement</h4>
              <p>ResearcherCollab Pro may suspend or terminate accounts for:</p>
              <ul>
                <li>Violation of these terms</li>
                <li>Fraudulent or deceptive behavior</li>
                <li>Repeated project failures without valid cause</li>
                <li>Legal requirements</li>
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle>Disclaimers & Limitations</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <ul>
                <li>ResearcherCollab Pro is provided "as is" without warranties</li>
                <li>We do not guarantee specific outcomes from using the platform</li>
                <li>We are not responsible for disputes between users</li>
                <li>Our liability is limited to the extent permitted by law</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                For questions about these Terms:
              </p>
              <p>
                Reach us through the <a href="/help" className="text-primary hover:underline">Help Center</a> or 
                <a href="/contact" className="text-primary hover:underline"> Contact page</a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
