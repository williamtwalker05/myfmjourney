import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyFMJourney",
  description: "Track your Football Manager careers",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-white">{children}</body>
    </html>
  );
}