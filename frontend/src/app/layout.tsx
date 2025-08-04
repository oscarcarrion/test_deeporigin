import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Short.ly - URL Shortener",
  description:
    "A modern URL shortener with analytics, custom slugs, and user management. Transform long URLs into short, shareable links.",
  keywords: ["url shortener", "link shortener", "analytics", "custom slugs"],
  authors: [{ name: "URL Shortener" }],
  openGraph: {
    title: "Short.ly - URL Shortener",
    description:
      "Transform long URLs into short, shareable links with analytics and custom slugs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
