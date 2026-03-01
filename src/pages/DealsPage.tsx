import { MainLayout } from "@/components/layout/MainLayout";
import { DealRoomList } from "@/components/deals/DealRoomList";
import { PageHeader } from "@/components/ui/page-header";
import { PageTransition } from "@/components/layout/PageTransition";

export default function DealsPage() {
  return (
    <MainLayout>
      <PageTransition>
        <PageHeader
          title="Deal Rooms"
          description="Track negotiations, manage escrow, and complete transactions."
          breadcrumbs={[
            { label: "Dashboard", href: "/home" },
            { label: "Deals" },
          ]}
        />

        <div className="container px-4 py-6 max-w-6xl space-y-6">
          <DealRoomList />
        </div>
      </PageTransition>
    </MainLayout>
  );
}
