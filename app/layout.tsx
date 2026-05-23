import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/components/UserProvider";

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
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <div className="grain" />
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
