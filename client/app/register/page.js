import Navbar from "@/components/home/Navbar";
import AuthCard from "@/components/auth/AuthCard";

export const metadata = {
  title: "Register | JobsEra",
};

export default function RegisterPage() {
  return (
    <main>
      <Navbar />
      <AuthCard />
    </main>
  );
}