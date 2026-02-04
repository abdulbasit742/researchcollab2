import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { EventDiscovery, MyEventsCalendar } from "@/components/platform";

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Events & Networking</h1>
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
      </main>
      <MobileBottomNav />
    </div>
  );
}
