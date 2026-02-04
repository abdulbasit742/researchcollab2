import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CourseCatalog, MyLearningDashboard } from "@/components/platform";

export default function LearningPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Learning & Development</h1>
          <p className="text-muted-foreground mt-2">
            Enhance your skills with courses, certifications, and learning paths
          </p>
        </div>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">My Learning Dashboard</h2>
            <MyLearningDashboard />
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Course Catalog</h2>
            <CourseCatalog />
          </section>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
