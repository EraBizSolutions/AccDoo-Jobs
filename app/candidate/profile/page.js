import Navbar from "@/components/common/Navbar";
import CandidateProfileCard from "@/components/candidate/CandidateProfileCard";

export const metadata = {
  title: "Candidate Profile | AccDoo",
  description: "Manage your AccDoo candidate profile and job matching details.",
};

export default function CandidateProfilePage() {
  return (
    <main className="min-h-screen bg-[#F9FBFB]">
      <Navbar />
      <CandidateProfileCard />
    </main>
  );
}
