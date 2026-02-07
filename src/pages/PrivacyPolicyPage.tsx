import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, Globe, Mail } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <MainLayout>
      <div className="container max-w-4xl py-8 md:py-12 px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: February 3, 2026
          </p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                RCollab ("we," "us," or "our") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
                you use our platform.
              </p>
              <p>
                By accessing or using RCollab, you agree to this Privacy Policy. If you do not agree with the 
                terms of this policy, please do not access the platform.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <h4>Personal Information</h4>
              <ul>
                <li>Name, email address, and contact information</li>
                <li>Academic credentials and institutional affiliations</li>
                <li>Professional background and research interests</li>
                <li>Payment information (processed securely through third-party providers)</li>
              </ul>

              <h4>Usage Information</h4>
              <ul>
                <li>Log data (IP address, browser type, pages visited)</li>
                <li>Device information and identifiers</li>
                <li>Interaction data with platform features</li>
                <li>Project and collaboration history</li>
              </ul>

              <h4>Trust & Verification Data</h4>
              <ul>
                <li>Identity verification documents</li>
                <li>Institutional verification records</li>
                <li>Project completion and outcome data</li>
                <li>Escrow and payment transaction records</li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>We use collected information to:</p>
              <ul>
                <li>Provide, maintain, and improve our platform services</li>
                <li>Calculate and maintain trust scores based on verified outcomes</li>
                <li>Match users with relevant opportunities and collaborators</li>
                <li>Process transactions and manage escrow services</li>
                <li>Verify academic credentials and institutional affiliations</li>
                <li>Communicate important updates and notifications</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>We may share your information with:</p>
              <ul>
                <li><strong>Other Users:</strong> Profile information visible based on your privacy settings</li>
                <li><strong>Institutions:</strong> Verification status for institutional partnerships</li>
                <li><strong>Service Providers:</strong> Third-party vendors who assist our operations</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect rights</li>
              </ul>
              <p>
                <strong>We never sell your personal information to third parties.</strong>
              </p>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                We implement industry-standard security measures including:
              </p>
              <ul>
                <li>End-to-end encryption for sensitive communications</li>
                <li>Secure escrow systems for financial transactions</li>
                <li>Regular security audits and penetration testing</li>
                <li>Strict access controls and authentication protocols</li>
                <li>Secure data centers with redundant backups</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data (subject to legal obligations)</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of non-essential communications</li>
                <li>Withdraw consent where applicable</li>
              </ul>
              <p>
                Note: Trust scores and verified outcome records may be retained for platform integrity purposes.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                For privacy-related inquiries, contact our Data Protection Officer:
              </p>
              <p>
                Reach us through the <a href="/help" className="text-primary hover:underline">Help Center</a> or 
                <a href="/contact" className="text-primary hover:underline"> Contact page</a>.
              </p>
              <p>
                We will respond to all legitimate requests within 30 days.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
