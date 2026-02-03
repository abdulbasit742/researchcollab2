import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Users, Target, FileText, AlertTriangle } from "lucide-react";
import { useSubmitAffiliateApplication, useEligibilityRules } from "@/hooks/useAffiliateApplication";

const applicationSchema = z.object({
  motivation: z
    .string()
    .min(50, "Please provide at least 50 characters explaining your motivation")
    .max(1000, "Maximum 1000 characters"),
  target_audience: z
    .string()
    .min(30, "Please provide at least 30 characters describing your audience")
    .max(500, "Maximum 500 characters"),
  value_proposition: z
    .string()
    .min(30, "Please provide at least 30 characters explaining your value")
    .max(500, "Maximum 500 characters"),
  acknowledged_rules: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge the anti-spam rules",
  }),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface AffiliateApplicationFormProps {
  onSuccess?: () => void;
}

export function AffiliateApplicationForm({ onSuccess }: AffiliateApplicationFormProps) {
  const { mutate: submitApplication, isPending } = useSubmitAffiliateApplication();
  const { data: rules } = useEligibilityRules();
  const [showRules, setShowRules] = useState(false);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      motivation: "",
      target_audience: "",
      value_proposition: "",
      acknowledged_rules: false,
    },
  });

  const onSubmit = (data: ApplicationFormData) => {
    submitApplication(
      {
        motivation: data.motivation,
        target_audience: data.target_audience,
        value_proposition: data.value_proposition,
      },
      {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Anti-Spam Notice */}
      <Alert className="border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-sm">
          <strong>This is not a marketing program.</strong> Affiliates are trusted partners who extend 
          our platform's credibility. Spam, cold outreach, or deceptive practices result in immediate 
          revocation and trust score penalties.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Motivation */}
          <FormField
            control={form.control}
            name="motivation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Why do you want to become an affiliate?
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Explain your motivation for joining the affiliate program. What drives you to recommend our platform to others?"
                    className="min-h-[120px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Be specific about your connection to research, academia, or professional services.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Target Audience */}
          <FormField
            control={form.control}
            name="target_audience"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Who will you refer to the platform?
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your network: students, researchers, labs, institutions, etc."
                    className="min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  We prioritize affiliates with genuine connections to their referral audience.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Value Proposition */}
          <FormField
            control={form.control}
            name="value_proposition"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  What value will you add?
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="How will you help referred users succeed on the platform? What support or guidance can you provide?"
                    className="min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Affiliates who support their referrals earn higher commissions.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Anti-Spam Rules */}
          <Card className="border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Anti-Spam Commitment
              </CardTitle>
              <CardDescription>
                Review and acknowledge our strict anti-spam policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRules(!showRules)}
              >
                {showRules ? "Hide Rules" : "View Rules"}
              </Button>

              {showRules && (
                <div className="space-y-3 text-sm border rounded-lg p-4 bg-muted/30">
                  <div className="space-y-2">
                    <p className="font-medium text-destructive">Prohibited Actions:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Cold DMs or unsolicited messages to strangers</li>
                      <li>Mass posting referral links on social media</li>
                      <li>Using fake urgency or misleading claims</li>
                      <li>Promising unrealistic earnings or outcomes</li>
                      <li>Creating fake accounts to boost referrals</li>
                      <li>Off-platform deceptive practices</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-green-600">Encouraged Actions:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Personal recommendations to people you know</li>
                      <li>Sharing within relevant professional communities</li>
                      <li>Providing genuine guidance to referred users</li>
                      <li>Creating educational content about the platform</li>
                    </ul>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground">
                      <strong>Consequences:</strong> Violations result in trust score penalties, 
                      commission rate reduction, account pause, or permanent revocation.
                    </p>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="acknowledged_rules"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        I acknowledge and agree to follow the anti-spam rules
                      </FormLabel>
                      <FormDescription>
                        I understand that violations will affect my trust score and affiliate status.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isPending || !form.formState.isValid}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Applications are typically reviewed within 24-48 hours. You'll be notified of the outcome.
          </p>
        </form>
      </Form>
    </div>
  );
}
