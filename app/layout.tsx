import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Civic AI — See a Problem. Report It. Get It Fixed.",
  description:
    "AI-powered civic issue reporting and resolution platform. Report potholes, sanitation, electricity, and drainage problems, track progress in real time, and earn rewards.",
};

export const viewport: Viewport = {
  themeColor: "#1E3A8A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable} bg-asphalt`}
    >
      <body className="font-body min-h-screen bg-asphalt text-ink antialiased selection:bg-amber selection:text-black">
        {children}
      </body>
    </html>
  );
}
