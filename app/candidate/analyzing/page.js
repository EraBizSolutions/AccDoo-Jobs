import Navbar from "@/components/home/Navbar";
import AnalyzingCard from "@/components/candidate/AnalyzingCard";

export const metadata = {
  title: "Analyzing CV | AccDoo",
  description: "AccDoo AI is analyzing your CV.",
};

export default function AnalyzingPage() {
  return (
    <main>
      <Navbar />
      <AnalyzingCard />
    </main>
  );
}