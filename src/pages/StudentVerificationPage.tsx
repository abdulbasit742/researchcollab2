import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Upload, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  FileText,
  User,
  Building
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const StudentVerificationPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  
  const [formData, setFormData] = useState({
    university: '',
    studentIdNumber: '',
    studentIdFront: null as File | null,
    studentIdBack: null as File | null,
    enrollmentLetter: null as File | null,
    semester: '',
    degreeProgram: '',
    researchLevel: '',
    cnicNumber: '',
    orcid: ''
  });

  const handleFileChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const handleSubmit = () => {
    toast.success("Verification submitted!", {
      description: "Your documents are under review. We'll notify you within 24-48 hours."
    });
    navigate('/verification');
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Step 1: Academic Proof</h3>
                <p className="text-sm text-muted-foreground">Verify your institution and student status</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="university">University / Institute Name *</Label>
                <Input
                  id="university"
                  placeholder="e.g., Massachusetts Institute of Technology"
                  value={formData.university}
                  onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID Number *</Label>
                <Input
                  id="studentId"
                  placeholder="e.g., MIT-2024-12345"
                  value={formData.studentIdNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentIdNumber: e.target.value }))}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Student ID Card (Front) *</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      id="studentIdFront"
                      onChange={handleFileChange('studentIdFront')}
                    />
                    <label htmlFor="studentIdFront" className="cursor-pointer">
                      {formData.studentIdFront ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-600">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="text-sm">{formData.studentIdFront.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Student ID Card (Back) *</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      id="studentIdBack"
                      onChange={handleFileChange('studentIdBack')}
                    />
                    <label htmlFor="studentIdBack" className="cursor-pointer">
                      {formData.studentIdBack ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-600">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="text-sm">{formData.studentIdBack.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Enrollment Letter (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    id="enrollmentLetter"
                    onChange={handleFileChange('enrollmentLetter')}
                  />
                  <label htmlFor="enrollmentLetter" className="cursor-pointer">
                    {formData.enrollmentLetter ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm">{formData.enrollmentLetter.name}</span>
                      </div>
                    ) : (
                      <>
                        <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Upload enrollment verification letter</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Step 2: Academic Level</h3>
                <p className="text-sm text-muted-foreground">Tell us about your academic progress</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Current Semester / Year *</Label>
                  <Select 
                    value={formData.semester} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, semester: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map(s => (
                        <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                      ))}
                      <SelectItem value="graduate">Graduate</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="degreeProgram">Degree Program *</Label>
                  <Input
                    id="degreeProgram"
                    placeholder="e.g., BS Computer Science"
                    value={formData.degreeProgram}
                    onChange={(e) => setFormData(prev => ({ ...prev, degreeProgram: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Research Experience Level *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'beginner', label: 'Beginner', desc: 'New to research' },
                    { value: 'intermediate', label: 'Intermediate', desc: 'Some projects' },
                    { value: 'advanced', label: 'Advanced', desc: 'Multiple projects' },
                    { value: 'publication-ready', label: 'Publication Ready', desc: 'Published work' }
                  ].map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, researchLevel: level.value }))}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.researchLevel === level.value 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="font-medium text-sm">{level.label}</p>
                      <p className="text-xs text-muted-foreground">{level.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Step 3: Identity Confirmation</h3>
                <p className="text-sm text-muted-foreground">Optional additional verification</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC / Passport Number (Optional)</Label>
                <Input
                  id="cnic"
                  placeholder="e.g., 12345-1234567-1"
                  value={formData.cnicNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, cnicNumber: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">This information is encrypted and only used for verification.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orcid">ORCID iD (Optional)</Label>
                <Input
                  id="orcid"
                  placeholder="e.g., 0000-0001-2345-6789"
                  value={formData.orcid}
                  onChange={(e) => setFormData(prev => ({ ...prev, orcid: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Link your ORCID for faster verification and research profile integration.
                </p>
              </div>

              <Card className="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
                <CardContent className="pt-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-emerald-700 dark:text-emerald-300">Ready to Submit</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        Your verification will be reviewed within 24-48 hours. You'll receive a notification once approved.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
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
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Student Verification</CardTitle>
                <CardDescription>Complete all steps to get verified</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Step {step} of {totalSteps}</span>
                <span className="text-muted-foreground">{Math.round((step / totalSteps) * 100)}% complete</span>
              </div>
              <Progress value={(step / totalSteps) * 100} className="h-2" />
            </div>

            {/* Step indicators */}
            <div className="flex justify-between">
              {['Academic Proof', 'Academic Level', 'Identity'].map((label, i) => (
                <div 
                  key={label}
                  className={`flex items-center gap-2 ${i + 1 <= step ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    i + 1 < step ? 'bg-primary text-primary-foreground' :
                    i + 1 === step ? 'bg-primary/20 text-primary border-2 border-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {i + 1 < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className="text-sm hidden md:inline">{label}</span>
                </div>
              ))}
            </div>

            {/* Step content */}
            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setStep(s => s - 1)}
                disabled={step === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              {step < totalSteps ? (
                <Button onClick={() => setStep(s => s + 1)} className="gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Submit for Review
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default StudentVerificationPage;
