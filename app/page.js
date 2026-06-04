import Navbar from "@/components/home/Navbar";
import JobSearchHero from "@/components/home/JobSearchHero";
import JobsList from "@/components/home/JobsList";
import Footer from "@/components/home/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <JobSearchHero />
      <JobsList />
      <Footer />
    </main>
  );
}