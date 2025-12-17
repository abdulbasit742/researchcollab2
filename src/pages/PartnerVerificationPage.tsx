import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  CheckCircle2, 
  ArrowLeft, 
  Plus,
  X,
  Youtube,
  Twitter,
  Linkedin,
  Instagram,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PartnerVerificationPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    brandName: '',
    promotionMethods: [] as string[],
    audienceSize: '',
    socialLinks: [{ platform: '', url: '' }]
  });

  const promotionOptions = [
    { id: 'content', label: 'Content Creation', desc: 'Blog posts, articles, tutorials' },
    { id: 'youtube', label: 'YouTube', desc: 'Video reviews and tutorials' },
    { id: 'social', label: 'Social Media', desc: 'Twitter, LinkedIn, Instagram' },
    { id: 'email', label: 'Email Marketing', desc: 'Newsletter and email lists' },
    { id: 'community', label: 'Community', desc: 'Discord, Slack, forums' },
    { id: 'podcast', label: 'Podcast', desc: 'Audio content and interviews' }
  ];

  const audienceSizes = [
    { value: '1000-5000', label: '1K - 5K' },
    { value: '5000-10000', label: '5K - 10K' },
    { value: '10000-50000', label: '10K - 50K' },
    { value: '50000+', label: '50K+' }
  ];

  const platformIcons: Record<string, any> = {
    youtube: Youtube,
    twitter: Twitter,
    linkedin: Linkedin,
    instagram: Instagram,
    website: Globe
  };

  const togglePromoMethod = (id: string) => {
    setFormData(prev => ({
      ...prev,
      promotionMethods: prev.promotionMethods.includes(id)
        ? prev.promotionMethods.filter(m => m !== id)
        : [...prev.promotionMethods, id]
    }));
  };

  const addSocialLink = () => {
    if (formData.socialLinks.length < 5) {
      setFormData(prev => ({
        ...prev,
        socialLinks: [...prev.socialLinks, { platform: '', url: '' }]
      }));
    }
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeSocialLink = (index: number) => {
    if (formData.socialLinks.length > 1) {
      setFormData(prev => ({
        ...prev,
        socialLinks: prev.socialLinks.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = () => {
    if (!formData.brandName || formData.promotionMethods.length === 0) {
      toast.error("Please fill in required fields");
      return;
    }
    
    toast.success("Partner application submitted!", {
      description: "Our team will review your application within 3-5 business days."
    });
    navigate('/verification');
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button 
          variant="ghost" 
          className="mb-6 gap-2"
          onClick={() => navigate('/verification')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Verification Center
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                <Users className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <CardTitle>Partner Verification</CardTitle>
                <CardDescription>Join as an affiliate partner and earn by promoting our platform</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Brand Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand / Channel Name *</Label>
                <Input
                  id="brandName"
                  placeholder="e.g., TechReview Pro, The Research Hub"
                  value={formData.brandName}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                />
              </div>
            </div>

            {/* Promotion Methods */}
            <div className="space-y-4">
              <Label>How will you promote? *</Label>
              <div className="grid md:grid-cols-2 gap-3">
                {promotionOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => togglePromoMethod(option.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.promotionMethods.includes(option.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={formData.promotionMethods.includes(option.id)}
                        className="pointer-events-none"
                      />
                      <p className="font-medium">{option.label}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-6">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Audience Size */}
            <div className="space-y-4">
              <Label>Audience Size (Optional)</Label>
              <div className="flex flex-wrap gap-2">
                {audienceSizes.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, audienceSize: size.value }))}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      formData.audienceSize === size.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <Label>Social Media & Website Links</Label>
              <div className="space-y-3">
                {formData.socialLinks.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <select
                      value={link.platform}
                      onChange={(e) => updateSocialLink(i, 'platform', e.target.value)}
                      className="w-32 px-3 py-2 rounded-md border bg-background"
                    >
                      <option value="">Platform</option>
                      <option value="youtube">YouTube</option>
                      <option value="twitter">Twitter/X</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="instagram">Instagram</option>
                      <option value="website">Website</option>
                    </select>
                    <Input
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => updateSocialLink(i, 'url', e.target.value)}
                      className="flex-1"
                    />
                    {formData.socialLinks.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeSocialLink(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {formData.socialLinks.length < 5 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={addSocialLink}
                  >
                    <Plus className="h-4 w-4" />
                    Add Another Link
                  </Button>
                )}
              </div>
            </div>

            {/* Benefits Card */}
            <Card className="bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-teal-700 dark:text-teal-300">Partner Benefits</p>
                    <ul className="text-sm text-teal-600 dark:text-teal-400 mt-2 space-y-1">
                      <li>• Higher commission rates (up to 25%)</li>
                      <li>• Access to promotional assets and banners</li>
                      <li>• Dedicated partner support</li>
                      <li>• Early access to new features and tools</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <Checkbox id="terms" />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the Partner Terms and Conditions and confirm that my promotional activities will comply with platform guidelines.
              </label>
            </div>

            {/* Submit */}
            <div className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => navigate('/verification')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </Button>
              
              <Button onClick={handleSubmit} className="gap-2 bg-teal-600 hover:bg-teal-700">
                <CheckCircle2 className="h-4 w-4" />
                Submit Application
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PartnerVerificationPage;
