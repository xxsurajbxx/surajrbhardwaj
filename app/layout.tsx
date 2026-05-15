import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Suraj Rajesh Bhardwaj",
  description: "Personal portfolio styled as a macOS VS Code interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <style>{`
          * { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent; }
          *::-webkit-scrollbar { width: 4px; height: 4px; }
          *::-webkit-scrollbar-track { background: transparent; }
          *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
          *::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
          .tab-bar { scrollbar-width: none; }
          .tab-bar::-webkit-scrollbar { display: none; }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
