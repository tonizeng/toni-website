import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "toni zeng's portfolio",
};

const sourceSerif = localFont({
  src: [
    {
      path: "./fonts/SourceSerif4-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/SourceSerif4-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-source-serif",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col overflow-hidden">{children}</body>
    </html>
  );
}
