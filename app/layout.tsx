import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
