"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { createRoot } from "react-dom/client";
import {
  CertificateTemplate,
  CERT_WIDTH,
  CERT_HEIGHT,
} from "./certificate-template";

export interface CertificateDownloadData {
  courseTitle: string;
  learnerName: string;
  tutorName: string;
  completionDate: Date;
}

interface CertificateDownloadButtonProps {
  certificate: CertificateDownloadData;
  disabled?: boolean;
  /** Optional: compact variant for use in list cards */
  variant?: "default" | "compact";
}

export function CertificateDownloadButton({
  certificate,
  disabled = false,
  variant = "default",
}: CertificateDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await downloadCertificateAsPDF(certificate);
      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("[CERTIFICATE_DOWNLOAD]", error);
      toast.error("Failed to download certificate");
    } finally {
      setIsGenerating(false);
    }
  };

  const isCompact = variant === "compact";

  return (
    <button
      onClick={handleDownload}
      disabled={disabled || isGenerating}
      className={`
        relative group flex items-center justify-center gap-2
        bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl
        transition-all duration-300 shadow-xl overflow-hidden
        disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed
        ${isCompact ? "px-4 py-2 text-sm" : "px-8 py-4 text-lg w-full sm:w-auto"}
        ${!isGenerating ? "hover:bg-brand dark:hover:bg-brand hover:text-white dark:hover:text-white hover:-translate-y-1 active:scale-95" : ""}
      `}
    >
      <div className="absolute inset-0 bg-white/10 dark:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      {isGenerating ? (
        <div className="flex items-center gap-2 animate-pulse">
          <Loader2
            className={`animate-spin ${isCompact ? "w-4 h-4" : "w-5 h-5"}`}
          />
          <span className="tracking-tight">Preparing…</span>
        </div>
      ) : (
        <>
          <Download
            className={`transition-transform group-hover:scale-110 group-hover:rotate-6 ${isCompact ? "w-4 h-4" : "w-5 h-5"}`}
          />
          <span className="tracking-tight">
            {isCompact ? "Download" : "Download Certificate"}
          </span>
        </>
      )}
    </button>
  );
}

/**
 * Renders the certificate template into a hidden off-screen DOM node,
 * captures it with html2canvas, converts to PDF, and triggers download.
 *
 * This approach works for any number of certificates on the same page
 * because it never relies on a pre-existing DOM element — it creates,
 * uses, and destroys its own isolated render tree every time.
 */
async function downloadCertificateAsPDF(data: CertificateDownloadData) {
  return new Promise<void>((resolve, reject) => {
    // 1. Create a hidden container
    const container = document.createElement("div");
    container.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: ${CERT_WIDTH}px;
      height: ${CERT_HEIGHT}px;
      overflow: hidden;
      pointer-events: none;
      z-index: -1;
    `;
    document.body.appendChild(container);

    // 2. Render the certificate into the container via React
    const root = createRoot(container);
    root.render(
      <CertificateTemplate
        learnerName={data.learnerName}
        courseTitle={data.courseTitle}
        tutorName={data.tutorName}
        completionDate={data.completionDate}
      />,
    );

    // 3. Wait one frame for React to paint, then capture
    requestAnimationFrame(async () => {
      try {
        const canvas = await html2canvas(container, {
          scale: 3,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          allowTaint: true,
          width: CERT_WIDTH,
          height: CERT_HEIGHT,
          windowWidth: CERT_WIDTH,
          windowHeight: CERT_HEIGHT,
          scrollX: 0,
          scrollY: 0,
        });

        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "pt",
          format: "a4",
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0,
          0,
          pageWidth,
          pageHeight,
        );

        const sanitizedTitle = data.courseTitle
          .replace(/[^a-z0-9]/gi, "-")
          .toLowerCase();
        pdf.save(
          `Certificate-${sanitizedTitle}-${new Date().getFullYear()}.pdf`,
        );

        resolve();
      } catch (err) {
        reject(err);
      } finally {
        // 4. Always clean up — unmount React tree and remove DOM node
        root.unmount();
        document.body.removeChild(container);
      }
    });
  });
}
