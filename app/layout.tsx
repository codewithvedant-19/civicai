import "./globals.css";
import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Civic AI — See a Problem. Report It. Get It Fixed.",
  description: "AI-powered civic issue reporting and resolution platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} font-body min-h-screen bg-[#E7ECF0] text-slate-900 antialiased selection:bg-amber-400 selection:text-black`}>
        {children}
      </body>
    </html>
  );
}
