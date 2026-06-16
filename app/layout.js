import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://www.accdoo.jobs"
  ),
  title: "AccDoo | AI Job Platform",
  description: "AI-powered job discovery and hiring platform.",
  icons: {
    icon: "/accdoo-favicon.png",
    shortcut: "/accdoo-favicon.png",
    apple: "/accdoo-favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
