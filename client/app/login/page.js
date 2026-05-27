import Navbar from "@/components/home/Navbar";
import LoginCard from "@/components/auth/LoginCard";

export const metadata = {
  title: "Login | JobsEra",
};

export default function LoginPage() {
  return (
    <main>
      <Navbar />
      <LoginCard />
    </main>
  );
}