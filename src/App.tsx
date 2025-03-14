import DonationSection from "./DonationSection";
import History from "./History";
import Navigation from "./Navigation";

export function App() {
  return (
    <div className="flex flex-col items-center h-screen gap-3">
      <Navigation />
      <DonationSection />
      <History />
    </div>
  );
}
