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
    template: "%s | NSK.AI",
    default: "NSK.AI - AI-Powered Learning Management System",
  },
  description:
    "The next generation of learning. Interactive courses, AI tutoring, and real-time progress tracking.",
  keywords: [
    "LMS",
    "EdTech",
    "AI",
    "Education",
    "Next.js",
    "Clerk",
    "Neon",
    "Drizzle",
  ],
  authors: [{ name: "NSK.AI Team" }],
  creator: "NSK.AI",
  publisher: "NSK.AI",
  openGraph: {
    title: "NSK.AI - AI-Powered Learning Management System",
    description:
      "The next generation of learning. Interactive courses, AI tutoring, and real-time progress tracking.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "NSK.AI",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "NSK.AI Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NSK.AI - AI-Powered Learning Management System",
    description:
      "The next generation of learning. Interactive courses, AI tutoring, and real-time progress tracking.",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: "/logo.svg",
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
