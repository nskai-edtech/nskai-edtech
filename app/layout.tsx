import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ApproveModal } from "@/components/modals/approve-modal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
        url: "/og-image.png", // check for this later
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
    images: ["/og-image.png"], // check for this later
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitScript = `
    (function() {
      const theme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      if (theme === 'dark') document.documentElement.classList.add('dark');
    })()
  `;
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-surface text-primary-text`}
        >
          <ApproveModal />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
