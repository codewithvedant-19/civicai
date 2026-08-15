import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CivicRoad AI — Report. Verify. Fix.",
  description: "AI-powered road damage reporting that connects citizens, communities, and authorities in real time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen">{children}</body>
    </html>
  );
}
