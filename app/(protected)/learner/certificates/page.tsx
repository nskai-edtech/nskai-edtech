"use client";

import { useEffect, useState } from "react";
import {
  CertificateDownloadButton,
  CertificateDownloadData,
} from "@/components/certificates/certificate-download-button";
import { Award, BookOpen, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { getUserCertificates } from "@/actions/certificates";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface CertificateListItem extends CertificateDownloadData {
  courseId: string;
  courseImage?: string;
}

const MOCK_CERT: CertificateListItem = {
  courseId: "demo-id",
  courseTitle: "Premium UX Design & Architecture Masterclass",
  learnerName: "Alex Rivera",
  tutorName: "Dr. Sarah Johnson",
  completionDate: new Date(),
};

export default function CertificatesGalleryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      }
    >
      <CertificatesGalleryContent />
    </Suspense>
  );
}

function CertificatesGalleryContent() {
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get("demo") === "true";

  const [certificates, setCertificates] = useState<CertificateListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getUserCertificates();
        let loadedCerts: CertificateListItem[] = [];

        if (Array.isArray(result)) {
          loadedCerts = result.map((c) => ({
            courseId: c.courseId,
            courseTitle: c.courseTitle,
            learnerName: c.learnerName,
            tutorName: c.tutorName,
            completionDate: new Date(c.completionDate),
            courseImage: c.courseImageUrl ?? undefined,
          }));
        }

        // Inject mock data if in demo mode
        if (isDemoMode) {
          loadedCerts = [MOCK_CERT, ...loadedCerts];
        }

        setCertificates(loadedCerts);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [isDemoMode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center px-4 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center border border-border">
          <Award className="w-8 h-8 text-secondary-text" />
        </div>
        <div>
          <p className="font-black text-primary-text text-lg">
            No certificates yet
          </p>
          <p className="text-secondary-text text-sm mt-1">
            Complete a course to earn your first certificate.
          </p>
        </div>
        <Link
          href="/learner/marketplace"
          className="px-6 py-3 bg-brand text-white font-black rounded-2xl hover:bg-brand/90 transition-all shadow-lg active:scale-95"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 py-6 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-primary-text tracking-tight">
          My Certificates
        </h1>
        <p className="text-secondary-text text-sm font-medium">
          {certificates.length} verified achievement
          {certificates.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <CertificateCard key={cert.courseId} cert={cert} />
        ))}
      </div>
    </div>
  );
}

function CertificateCard({ cert }: { cert: CertificateListItem }) {
  const formattedDate = cert.completionDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="group bg-surface border border-border rounded-[32px] overflow-hidden hover:border-brand/40 hover:shadow-2xl hover:shadow-brand/5 transition-all duration-500">
      {/* Mini cert preview strip */}
      <div className="relative h-32 bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden flex items-center justify-center border-b border-border">
        {/* Certificate hint elements */}
        <div className="absolute inset-4 border border-zinc-200 dark:border-zinc-800 opacity-50" />
        <div className="absolute top-4 left-4 w-3 h-3 border-l border-t border-brand/40" />
        <div className="absolute top-4 right-4 w-3 h-3 border-r border-t border-brand/40" />
        <div className="absolute bottom-4 left-4 w-3 h-3 border-l border-b border-brand/40" />
        <div className="absolute bottom-4 right-4 w-3 h-3 border-r border-b border-brand/40" />

        <div className="text-center px-8 z-10">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand/60 mb-2">
            Professional Certificate
          </p>
          <p className="text-sm font-black text-primary-text leading-tight line-clamp-2">
            {cert.courseTitle}
          </p>
        </div>

        {/* View full cert link overlay */}
        <Link
          href={`/learner/certificates/${cert.courseId}`}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/0 group-hover:bg-brand/5 transition-all duration-300"
        >
          <span className="opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 text-[10px] font-black uppercase tracking-widest text-white bg-zinc-900 px-4 py-2 rounded-xl shadow-xl">
            View Achievement
          </span>
        </Link>
      </div>

      {/* Card body */}
      <div className="p-6 space-y-5">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-muted border border-border flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-secondary-text" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-secondary-text uppercase tracking-wider">
                Instructor
              </p>
              <p className="text-sm font-black text-primary-text truncate">
                {cert.tutorName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-muted border border-border flex items-center justify-center">
              <Calendar className="w-4 h-4 text-secondary-text" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-secondary-text uppercase tracking-wider">
                Earned On
              </p>
              <p className="text-sm font-black text-primary-text">
                {formattedDate}
              </p>
            </div>
          </div>
        </div>

        <CertificateDownloadButton certificate={cert} variant="compact" />
      </div>
    </div>
  );
}
