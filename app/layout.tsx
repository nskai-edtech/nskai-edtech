import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ApproveModal } from "@/components/modals/approve-modal";
import { ManagerModal } from "@/components/modals/manager-modal";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: {
    template: "%s | Zerra",
    default: "Zerra - The AI-Powered Learning Platform",
  },
  description:
    "Zerra (formerly NSK.AI) is the next generation of online learning. Experience AI-powered tutoring, interactive courses, and real-time progress tracking on the Zerra platform.",
  keywords: [
    "Zerra",
    "NSK AI",
    "NSK AI learning platform",
    "LMS",
    "EdTech",
    "AI Education",
    "Online Courses",
    "Next.js",
    "Learning Management System",
  ],
  authors: [{ name: "Zerra Team" }],
  creator: "Zerra",
  publisher: "Zerra",
  openGraph: {
    title: "Zerra - The AI-Powered Learning Platform",
    description:
      "Zerra is the next generation of learning. Interactive courses, AI tutoring, and real-time progress tracking.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Zerra",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Zerra Learning Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zerra - The AI-Powered Learning Platform",
    description:
      "Zerra is the next generation of learning. Interactive courses, AI tutoring, and real-time progress tracking.",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: "/icon", // Points to the dynamic icon.tsx
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitScript = `
    (function() {
      try {
        const theme = localStorage.getItem('theme');
        const supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (theme === 'dark' || (!theme && supportDarkMode)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {}
    })()
  `;
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </head>
        <body
          suppressHydrationWarning
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-surface text-primary-text`}
        >
          <Toaster position="top-right" />
          <ApproveModal />
          <ManagerModal />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
