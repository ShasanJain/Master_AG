import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import "./globals.css";
import LayoutClientWrapper from "./LayoutClientWrapper";

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
});

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fira-sans",
});

export const metadata: Metadata = {
  title: "Jack Industrial | Command Center",
  description: "Sovereign Engine Dashboard v5.0.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('jack-theme');
                  if (theme === 'light') {
                    document.documentElement.classList.add('light-mode');
                    document.documentElement.classList.remove('dark', 'light-mode-clinical');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light-mode', 'light-mode-clinical');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${firaSans.variable} ${firaCode.variable} font-sans antialiased industrial-grid min-h-screen flex text-[var(--foreground)]`}>
        <input type="checkbox" id="sidebar-toggle" className="hidden" />
        <LayoutClientWrapper>{children}</LayoutClientWrapper>
      </body>
    </html>
  );
}
