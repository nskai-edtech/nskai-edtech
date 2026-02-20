"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface CertificateDownloadButtonProps {
  courseTitle: string;
  disabled?: boolean;
}

export function CertificateDownloadButton({
  courseTitle,
  disabled = false,
}: CertificateDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      const certificateElement = document.getElementById(
        "certificate-template",
      );

      if (!certificateElement) {
        toast.error("Certificate template not found");
        return;
      }

      // Convert HTML to canvas
      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Create PDF (A4 landscape)
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Calculate dimensions to fit A4
      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Generate filename
      const sanitizedTitle = courseTitle
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase();
      const filename = `Certificate-${sanitizedTitle}-${new Date().getFullYear()}.pdf`;

      // Download
      pdf.save(filename);

      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("[CERTIFICATE_DOWNLOAD]", error);
      toast.error("Failed to download certificate");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled || isGenerating}
      className="flex items-center gap-2 px-4 py-2 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Download PDF
        </>
      )}
    </button>
  );
}
