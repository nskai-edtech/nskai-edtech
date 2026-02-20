"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getCertificateData } from "@/actions/certificates";
import { CertificateTemplate } from "@/components/certificates/certificate-template";
import { CertificateDownloadButton } from "@/components/certificates/certificate-download-button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface CertificateData {
  courseTitle: string;
  learnerName: string;
  tutorName: string;
  completionDate: Date;
}

export default function CertificateViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const shouldAutoDownload = searchParams.get("download") === "true";

  const [certificateData, setCertificateData] =
    useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCertificate() {
      try {
        const result = await getCertificateData(courseId);

        if ("error" in result) {
          setError(result.error);
        } else {
          setCertificateData({
            ...result,
            completionDate: new Date(result.completionDate),
          });

          // Auto-download if requested
          if (shouldAutoDownload) {
            setTimeout(() => {
              const downloadButton = document.querySelector(
                "[data-download-button]",
              ) as HTMLButtonElement;
              downloadButton?.click();
            }, 1000);
          }
        }
      } catch (err) {
        console.error("[ERROR LOADING CERTIFICATE]", err);

        setError("Failed to load certificate");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCertificate();
  }, [courseId, shouldAutoDownload]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !certificateData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <p className="text-red-500">{error || "Certificate not found"}</p>
        <Link
          href="/learner/certificates"
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Certificates
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/learner/certificates"
          className="flex items-center gap-2 text-secondary-text hover:text-primary-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Certificates
        </Link>
        <div data-download-button>
          <CertificateDownloadButton
            courseTitle={certificateData.courseTitle}
          />
        </div>
      </div>

      {/* Certificate Preview */}
      <div className="flex justify-center bg-surface-muted p-8 rounded-3xl border border-border">
        <div className="transform scale-75 origin-top">
          <CertificateTemplate
            learnerName={certificateData.learnerName}
            courseTitle={certificateData.courseTitle}
            tutorName={certificateData.tutorName}
            completionDate={certificateData.completionDate}
          />
        </div>
      </div>

      {/* Info */}
      <div className="text-center text-sm text-secondary-text">
        <p>
          This certificate can be downloaded as a PDF and shared on professional
          networks.
        </p>
      </div>
    </div>
  );
}
