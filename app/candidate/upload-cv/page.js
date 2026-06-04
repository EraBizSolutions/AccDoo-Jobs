import Navbar from "@/components/home/Navbar";
import CVUploadCard from "@/components/candidate/CVUploadCard";

export const metadata = {
  title: "Upload CV | AccDoo",
  description: "Upload your CV to build your AI-powered AccDoo profile.",
};

export default function UploadCVPage() {
  return (
    <main>
      <Navbar />
      <CVUploadCard />
    </main>
  );
}