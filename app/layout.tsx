import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { UserProvider } from "@/components/UserProvider";
import { MotionProvider } from "@/components/MotionProvider";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Synapse — Idea-to-Content Engine",
  description: "Преврати одну сырую идею в полноценную контент-машину.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen antialiased">
        <div className="grain" />
        <UserProvider>
          <MotionProvider>{children}</MotionProvider>
        </UserProvider>
        <Analytics />
      </body>
    </html>
  );
}
