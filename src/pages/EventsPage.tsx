import { MainLayout } from "@/components/layout/MainLayout";
import { EventDiscovery, MyEventsCalendar } from "@/components/platform";

export default function EventsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Events & Networking</h1>
          <p className="text-muted-foreground mt-2">
            Discover events, conferences, and networking opportunities
          </p>
        </div>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
            <EventDiscovery />
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">My Calendar</h2>
            <MyEventsCalendar />
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
