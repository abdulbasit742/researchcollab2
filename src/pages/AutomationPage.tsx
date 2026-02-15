import { MainLayout } from "@/components/layout/MainLayout";
import { AutomationDashboard } from "@/components/platform";

export default function AutomationPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <AutomationDashboard />
      </div>
    </MainLayout>
  );
}
