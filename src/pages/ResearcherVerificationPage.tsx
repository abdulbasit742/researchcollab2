import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Microscope, 
  Upload, 
  CheckCircle2, 
  ArrowLeft, 
  Plus,
  X,
  Link as LinkIcon,
  Building,
  BookOpen
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ResearcherVerificationPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    institution: '',
    position: '',
    researchFields: [] as string[],
    orcid: '',
    publicationLinks: [''],
    institutionalEmail: '',
    googleScholarLink: '',
    appointmentLetter: null as File | null
  });

  const [newField, setNewField] = useState('');

  const addResearchField = () => {
    if (newField.trim() && formData.researchFields.length < 5) {
      setFormData(prev => ({
        ...prev,
        researchFields: [...prev.researchFields, newField.trim()]
      }));
      setNewField('');
    }
  };

  const removeResearchField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      researchFields: prev.researchFields.filter((_, i) => i !== index)
    }));
  };

  const addPublicationLink = () => {
    if (formData.publicationLinks.length < 10) {
      setFormData(prev => ({
        ...prev,
        publicationLinks: [...prev.publicationLinks, '']
      }));
    }
  };

  const updatePublicationLink = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      publicationLinks: prev.publicationLinks.map((link, i) => i === index ? value : link)
    }));
  };

  const removePublicationLink = (index: number) => {
    if (formData.publicationLinks.length > 1) {
      setFormData(prev => ({
        ...prev,
        publicationLinks: prev.publicationLinks.filter((_, i) => i !== index)
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, appointmentLetter: e.target.files![0] }));
    }
  };

  const handleSubmit = () => {
    if (!formData.institution || !formData.position) {
      toast.error("Please fill in required fields");
      return;
    }
    
    toast.success("Verification submitted!", {
      description: "Your credentials are under review. We'll notify you within 24-48 hours."
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
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Microscope className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle>Researcher Verification</CardTitle>
                <CardDescription>Verify your research credentials and academic position</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Institution Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building className="h-5 w-5 text-primary" />
                Institution Details
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution / Organization *</Label>
                  <Input
                    id="institution"
                    placeholder="e.g., Stanford University"
                    value={formData.institution}
                    onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position / Role *</Label>
                  <Input
                    id="position"
                    placeholder="e.g., Associate Professor"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institutionalEmail">Institutional Email (Optional)</Label>
                <Input
                  id="institutionalEmail"
                  type="email"
                  placeholder="you@university.edu"
                  value={formData.institutionalEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, institutionalEmail: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Appointment Letter or Profile Link</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    id="appointmentLetter"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="appointmentLetter" className="cursor-pointer">
                    {formData.appointmentLetter ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>{formData.appointmentLetter.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Upload appointment letter or faculty page screenshot
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Research Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <BookOpen className="h-5 w-5 text-primary" />
                Research Information
              </div>

              <div className="space-y-2">
                <Label>Research Fields *</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.researchFields.map((field, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 pr-1">
                      {field}
                      <button 
                        onClick={() => removeResearchField(i)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add research field"
                    value={newField}
                    onChange={(e) => setNewField(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResearchField())}
                  />
                  <Button type="button" variant="outline" onClick={addResearchField}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orcid">ORCID iD (Strongly Recommended)</Label>
                  <Input
                    id="orcid"
                    placeholder="0000-0001-2345-6789"
                    value={formData.orcid}
                    onChange={(e) => setFormData(prev => ({ ...prev, orcid: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="googleScholar">Google Scholar Profile</Label>
                  <Input
                    id="googleScholar"
                    placeholder="https://scholar.google.com/..."
                    value={formData.googleScholarLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, googleScholarLink: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Publications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <LinkIcon className="h-5 w-5 text-primary" />
                Publications (Links or DOI)
              </div>

              <div className="space-y-3">
                {formData.publicationLinks.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="https://doi.org/... or publication URL"
                      value={link}
                      onChange={(e) => updatePublicationLink(i, e.target.value)}
                    />
                    {formData.publicationLinks.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removePublicationLink(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {formData.publicationLinks.length < 10 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={addPublicationLink}
                  >
                    <Plus className="h-4 w-4" />
                    Add Another Publication
                  </Button>
                )}
              </div>
            </div>

            {/* Submit */}
            <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-700 dark:text-purple-300">Verification Benefits</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      Verified researchers get a badge, higher trust score, and featured placement in matching.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => navigate('/verification')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </Button>
              
              <Button onClick={handleSubmit} className="gap-2 bg-purple-600 hover:bg-purple-700">
                <CheckCircle2 className="h-4 w-4" />
                Submit for Review
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ResearcherVerificationPage;
