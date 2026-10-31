import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "VillageOS | MMORTS Decision Engine",
  description: "Automated optimization workspace for Travian Legends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${outfit.variable} font-sans antialiased industrial-grid min-h-screen flex flex-col text-[#F8FAFC]`}>
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
