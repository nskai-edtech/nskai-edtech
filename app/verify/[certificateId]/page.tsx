/* eslint-disable react-hooks/error-boundaries */
import { verifyCertificate } from "@/actions/certificates/queries";
import { notFound } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Award,
  Calendar,
  BookOpen,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Suspense } from "react";
import { Metadata } from "next";

import { type VerificationRecord } from "@/actions/certificates/queries";
type Certificate = VerificationRecord;

// --- Dynamic Metadata ---

export async function generateMetadata({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}): Promise<Metadata> {
  const { certificateId } = await params;

  try {
    const certificate = await verifyCertificate(certificateId);

    if (!certificate) {
      return {
        title: "Certificate Not Found - NSK AI",
        description: "The certificate you are looking for does not exist.",
      };
    }

    return {
      title: `Verified: ${certificate.courseTitle} - NSK AI`,
      description: `Official certificate of completion for ${certificate.learnerFirstName} ${certificate.learnerLastName}.`,
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    return {
      title: "Verification Error - NSK AI",
      description: "An error occurred while verifying the certificate.",
    };
  }
}

// --- Main Page Component ---
export default async function VerifyCertificatePage(props: {
  params: Promise<{ certificateId: string }>;
}) {
  const params = await props.params;
  const certificateId = params.certificateId;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center py-12 px-4 sm:px-6">
      <Logo />
      <Suspense fallback={<LoadingSkeleton />}>
        <CertificateVerification certificateId={certificateId} />
      </Suspense>
    </main>
  );
}

// --- Logo Component (reusable) ---
function Logo() {
  return (
    <Link
      href="/"
      className="mb-8 flex items-center gap-2 font-black text-2xl text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity"
      aria-label="ZERRA Home"
    >
      <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white text-xl">
        Z
      </div>
      ZERRA
    </Link>
  );
}

// --- Certificate Verification with Error Handling ---
async function CertificateVerification({
  certificateId,
}: {
  certificateId: string;
}) {
  try {
    const certificate = await verifyCertificate(certificateId);

    if (!certificate) {
      notFound(); // triggers 404 and shows closest not-found.tsx
    }

    return (
      <VerifiedState certificate={certificate} certificateId={certificateId} />
    );
  } catch (error) {
    console.error("Certificate verification error:", error);
    return (
      <ErrorState
        certificateId={certificateId}
        error="An unexpected error occurred. Please try again later."
      />
    );
  }
}

// --- Verified State ---
function VerifiedState({
  certificate,
  certificateId,
}: {
  certificate: Certificate;
  certificateId: string;
}) {
  return (
    <article className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Status Banner */}
      <div className="bg-green-500/10 dark:bg-green-500/20 px-6 py-4 flex items-center justify-center gap-3 border-b border-green-500/20">
        <CheckCircle
          className="w-6 h-6 text-green-600 dark:text-green-500"
          aria-hidden="true"
        />
        <h2 className="text-lg font-bold text-green-700 dark:text-green-400">
          Official Certificate Verified
        </h2>
      </div>

      <div className="p-8 sm:p-10 space-y-8">
        <div className="text-center space-y-3">
          <Award className="w-16 h-16 text-brand mx-auto" aria-hidden="true" />
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
            Certificate of Completion
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            This document certifies that the individual below has successfully
            completed all requirements for this program.
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          <DetailCard
            icon={User}
            label="Learner"
            value={`${certificate.learnerFirstName} ${certificate.learnerLastName}`}
          />
          <DetailCard
            icon={Calendar}
            label="Issued On"
            value={format(new Date(certificate.createdAt), "MMMM d, yyyy")}
          />
        </div>

        {/* Course Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-800 relative">
            {certificate.courseImageUrl ? (
              <Image
                src={certificate.courseImageUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen
                  className="w-12 h-12 text-zinc-300 dark:text-zinc-600"
                  aria-hidden="true"
                />
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {certificate.courseTitle}
              </h3>
              <p className="text-zinc-300 text-sm flex items-center gap-2">
                <span>Instructor:</span>
                <span className="font-semibold text-white">
                  {certificate.tutorFirstName} {certificate.tutorLastName}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-semibold mb-1">
            Verification ID
          </p>
          <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 py-2 px-4 rounded-lg inline-block break-all">
            {certificateId}
          </p>
        </div>
      </div>
    </article>
  );
}

// --- Error State ---
function ErrorState({
  certificateId,
  error,
}: {
  certificateId: string;
  error?: string;
}) {
  return (
    <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <XCircle className="w-10 h-10 text-red-500" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-4">
        {error ? "Verification Failed" : "Certificate Not Found"}
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
        {error ||
          "We couldn't find a certificate matching the ID provided. This certificate may not exist, or the link might be incorrect."}
      </p>

      <div className="text-left bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 mb-8 break-all">
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
          Searched ID
        </p>
        <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
          {certificateId}
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center justify-center px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl hover:opacity-90 transition-opacity w-full sm:w-auto"
      >
        Return to Homepage
      </Link>
    </div>
  );
}

// --- Detail Card Component ---
function DetailCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <div className="bg-white dark:bg-zinc-800 p-2.5 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
        <Icon className="w-5 h-5 text-brand" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
          {value}
        </p>
      </div>
    </div>
  );
}

// --- Simple Loading Skeleton ---
function LoadingSkeleton() {
  return (
    <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8 animate-pulse">
      <div className="h-10 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mx-auto mb-6"></div>
      <div className="space-y-4">
        <div className="h-24 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
        <div className="h-24 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
      </div>
    </div>
  );
}
