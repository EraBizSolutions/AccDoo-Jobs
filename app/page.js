import Navbar from "@/components/common/Navbar";
import JobSearchHero from "@/components/home/JobSearchHero";
import JobsList from "@/components/home/JobsList";
import Footer from "@/components/common/Footer";

export const metadata = {
  title: "Source, Hire, Onboard & Manage People | Jobs in Sri Lanka",
  description:
    "AccDoo Jobs helps businesses source, hire, onboard, and manage people, while helping job seekers find trusted jobs in Sri Lanka",
  alternates: {
    canonical: "https://www.accdoo.jobs",
  },
  openGraph: {
    type: "website",
    url: "https://www.accdoo.jobs",
    title: "Source, Hire, Onboard & Manage People | Jobs in Sri Lanka",
    description:
      "AccDoo Jobs helps businesses source, hire, onboard, and manage people, while helping job seekers find trusted jobs in Sri Lanka",
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
    title: "Source, Hire, Onboard & Manage People | Jobs in Sri Lanka",
    description:
      "AccDoo Jobs helps businesses source, hire, onboard, and manage people, while helping job seekers find trusted jobs in Sri Lanka",
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
