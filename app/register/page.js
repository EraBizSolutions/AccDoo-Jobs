import Navbar from "@/components/common/Navbar";
import AuthCard from "@/components/auth/AuthCard";

export const metadata = {
  title: "Register | AccDoo",
};

export default function RegisterPage() {
  return (
    <main>
      <Navbar />
      <AuthCard />
    </main>
  );
}
