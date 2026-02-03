import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, Settings, Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookiePolicyPage() {
  return (
    <MainLayout>
      <div className="container max-w-4xl py-8 md:py-12 px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Cookie className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Cookie Policy</h1>
          <p className="text-muted-foreground">
            Last updated: February 3, 2026
          </p>
        </div>

        <div className="space-y-6">
          {/* What Are Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                What Are Cookies?
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                Cookies are small text files stored on your device when you visit a website. 
                They help websites remember your preferences, keep you logged in, and understand 
                how you use the site.
              </p>
              <p>
                ResearcherCollab Pro ("RCollab") uses cookies and similar technologies to provide, 
                protect, and improve our platform.
              </p>
            </CardContent>
          </Card>

          {/* Types of Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Essential */}
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Essential Cookies (Required)
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  These cookies are necessary for the platform to function properly.
                </p>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Authentication and login sessions</li>
                  <li>Security tokens and CSRF protection</li>
                  <li>User preferences and settings</li>
                  <li>Shopping cart and transaction data</li>
                </ul>
              </div>

              {/* Functional */}
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4 text-primary" />
                  Functional Cookies
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  These cookies enable enhanced functionality and personalization.
                </p>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Language and region preferences</li>
                  <li>Theme preferences (light/dark mode)</li>
                  <li>Recently viewed items</li>
                  <li>Saved searches and filters</li>
                </ul>
              </div>

              {/* Analytics */}
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  📊 Analytics Cookies
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  These cookies help us understand how users interact with our platform.
                </p>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Page visits and navigation patterns</li>
                  <li>Feature usage statistics</li>
                  <li>Error tracking and debugging</li>
                  <li>Performance monitoring</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Details */}
          <Card>
            <CardHeader>
              <CardTitle>Specific Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Cookie Name</th>
                      <th className="text-left py-2 font-medium">Purpose</th>
                      <th className="text-left py-2 font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-2 font-mono text-xs">sb-access-token</td>
                      <td className="py-2">Authentication session</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-mono text-xs">sb-refresh-token</td>
                      <td className="py-2">Session renewal</td>
                      <td className="py-2">7 days</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-mono text-xs">theme</td>
                      <td className="py-2">Display preferences</td>
                      <td className="py-2">1 year</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-mono text-xs">cookie_consent</td>
                      <td className="py-2">Cookie preference</td>
                      <td className="py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Cookies</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                We may use services from third parties that set their own cookies:
              </p>
              <ul>
                <li><strong>Payment Processors:</strong> Secure transaction handling</li>
                <li><strong>Analytics Services:</strong> Platform usage insights</li>
                <li><strong>Error Tracking:</strong> Bug identification and fixes</li>
              </ul>
              <p>
                We do not allow advertising or tracking cookies from third parties.
              </p>
            </CardContent>
          </Card>

          {/* Managing Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Managing Your Cookie Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>You can control cookies through:</p>
              
              <h4>Browser Settings</h4>
              <p>
                Most browsers allow you to block or delete cookies through their settings. 
                Note that blocking essential cookies may prevent the platform from functioning properly.
              </p>

              <h4>Platform Settings</h4>
              <p>
                You can manage optional cookies through your account settings.
              </p>

              <div className="not-prose mt-4">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Cookie Preferences
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Updates</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                We may update this Cookie Policy from time to time. Changes will be posted 
                on this page with an updated revision date. Continued use of the platform 
                after changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Questions?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                If you have questions about our use of cookies, contact us:
              </p>
              <ul>
                <li>Email: privacy@researchercollab.com</li>
                <li>Help Center: /help</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
