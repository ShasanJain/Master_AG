// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "HackKit";
const APP_TAGLINE = process.env.NEXT_PUBLIC_APP_TAGLINE || "Your app tagline";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_TAGLINE,
  robots: "index, follow",
  openGraph: {
    type: "website",
    title: APP_NAME,
    description: APP_TAGLINE,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
