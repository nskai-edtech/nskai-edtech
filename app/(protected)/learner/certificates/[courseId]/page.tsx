"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getCertificateData } from "@/actions/certificates";
import {
  CertificateTemplate,
  CERT_WIDTH,
  CERT_HEIGHT,
  CertificateTemplateProps,
} from "@/components/certificates/certificate-template";
import { CertificateDownloadButton } from "@/components/certificates/certificate-download-button";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

interface CertificateData {
  courseTitle: string;
  learnerName: string;
  tutorName: string;
  completionDate: Date;
}

const MOCK_CERTIFICATE: CertificateData = {
  courseTitle: "Mastering Modern UX Architecture",
  learnerName: "Alex Rivera",
  tutorName: "Dr. Sarah Johnson",
  completionDate: new Date(),
};

// ─── Scaler ──────────────────────────────────────────────────────────────────
// Separate component so its ref is attached to a real DOM node before
// useEffect fires. offsetWidth is always valid at that point.
// Uses padding-top % trick so height auto-follows width — no JS needed for height.

type CertScalerProps = Omit<CertificateTemplateProps, "instanceId">;

function CertScaler(props: CertScalerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const update = () => {
      const w = el.offsetWidth;
      if (w > 0) setScale(w / CERT_WIDTH);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    // Aspect-ratio box: width=100%, height auto-maintained by padding-top %
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        paddingTop: `${(CERT_HEIGHT / CERT_WIDTH) * 100}%`,
        overflow: "hidden",
        borderRadius: 12,
        boxShadow: "0 20px 40px -12px rgba(0,0,0,0.3)",
      }}
    >
      {/* Absolute fill layer so the cert renders inside the aspect box */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {/* Scale the cert from top-left to fit the container width */}
        <div
          style={{
            width: CERT_WIDTH,
            height: CERT_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <CertificateTemplate {...props} />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CertificateViewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[600px]">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      }
    >
      <CertificateViewContent />
    </Suspense>
  );
}

function CertificateViewContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const isDemo = courseId === "demo";
  const shouldAutoDownload = searchParams.get("download") === "true";

  const [certificateData, setCertificateData] =
    useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(!isDemo);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) {
      setCertificateData(MOCK_CERTIFICATE);
      return;
    }
    async function fetchCertificate() {
      try {
        const result = await getCertificateData(courseId);
        if (result && "error" in result) {
          setError(result.error);
        } else if (result) {
          setCertificateData({
            courseTitle: result.courseTitle,
            learnerName: result.learnerName,
            tutorName: result.tutorName,
            completionDate: new Date(result.completionDate),
          });
          if (shouldAutoDownload) {
            setTimeout(() => {
              const btn = document.querySelector(
                "[data-download-button] button",
              ) as HTMLButtonElement;
              btn?.click();
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
  }, [courseId, shouldAutoDownload, isDemo]);

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
        <p className="text-red-500 font-bold">
          {error || "Certificate not found"}
        </p>
        <Link
          href="/learner/certificates"
          className="flex items-center gap-2 px-6 py-3 bg-brand text-white font-black rounded-2xl hover:bg-brand/90 transition-all shadow-lg active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Certificates
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
        <div className="space-y-1">
          <Link
            href="/learner/certificates"
            className="flex items-center gap-2 text-sm font-bold text-secondary-text hover:text-primary-text transition-colors group"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-surface border border-transparent group-hover:border-border transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Go back
          </Link>
          <h1 className="text-2xl font-black text-primary-text hidden sm:block">
            Course Certificate
          </h1>
        </div>
        <div data-download-button className="w-full sm:w-auto">
          <CertificateDownloadButton certificate={certificateData} />
        </div>
      </div>

      {isDemo && (
        <div className="mx-4 p-4 bg-brand/5 border border-brand/20 rounded-2xl flex items-start gap-3">
          <Info className="w-5 h-5 text-brand shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-brand">Demo Mode Active</p>
            <p className="text-secondary-text">
              You are previewing a sample certificate. This is useful for
              testing layouts and responsiveness.
            </p>
          </div>
        </div>
      )}

      {/* Certificate preview */}
      <div className="px-4">
        <div className="w-full bg-surface-muted rounded-[40px] border border-border shadow-inner p-4">
          <CertScaler
            learnerName={certificateData.learnerName}
            courseTitle={certificateData.courseTitle}
            tutorName={certificateData.tutorName}
            completionDate={certificateData.completionDate}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-2xl mx-auto text-center px-4">
        <p className="text-sm font-medium text-secondary-text leading-relaxed">
          This certificate proves your successful completion of all curriculum
          requirements for
          <span className="text-primary-text font-bold">
            {" "}
            {certificateData.courseTitle}
          </span>
          . You can share this as a public link or download the high-resolution
          PDF for printing.
        </p>
      </div>
    </div>
  );
}
