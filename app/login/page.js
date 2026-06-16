import Navbar from "@/components/common/Navbar";
import LoginCard from "@/components/auth/LoginCard";

export const metadata = {
  title: "Login | AccDoo",
};

export default function LoginPage() {
  return (
    <main>
      <Navbar />
      <LoginCard />
    </main>
  );
}
