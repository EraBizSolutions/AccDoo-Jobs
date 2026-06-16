import Navbar from "@/components/common/Navbar";
import JobSearchHero from "@/components/home/JobSearchHero";
import JobsList from "@/components/home/JobsList";
import Footer from "@/components/common/Footer";

export const metadata = {
  title: "Jobs in Sri Lanka | Find Work & Hire Talent | accdoo.jobs",
  description:
    "Find trusted jobs in Sri Lanka with AccDoo Jobs. Discover better roles, apply online, and help employers hire the right talent faster.",
  alternates: {
    canonical: "https://www.accdoo.jobs",
  },
  openGraph: {
    type: "website",
    url: "https://www.accdoo.jobs",
    title: "Jobs in Sri Lanka | Find Work & Hire Talent | accdoo.jobs",
    description:
      "Find trusted jobs in Sri Lanka with AccDoo Jobs. Discover better roles, apply online, and help employers hire the right talent faster.",
    siteName: "AccDoo Jobs",
    images: [
      {
        url: "https://www.accdoo.jobs/accdoo-logo.svg",
        width: 1200,
        height: 630,
        alt: "AccDoo Jobs - Jobs in Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jobs in Sri Lanka | Find Work & Hire Talent | accdoo.jobs",
    description:
      "Find trusted jobs in Sri Lanka with AccDoo Jobs. Discover better roles, apply online, and help employers hire the right talent faster.",
    images: ["https://www.accdoo.jobs/accdoo-logo.svg"],
  },
};

export default function HomePage() {
  return (
    <main className="accdoo-page-bg min-h-screen">
      <Navbar />
      <JobSearchHero />
      <JobsList />
      <Footer />
    </main>
  );
}
