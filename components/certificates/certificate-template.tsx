"use client";

import { Award } from "lucide-react";

export interface CertificateTemplateProps {
  learnerName: string;
  courseTitle: string;
  tutorName: string;
  completionDate: Date;
  /** Used to give each instance a unique DOM id when multiple certs are on one page */
  instanceId?: string;
}

export const CERT_WIDTH = 1122;
export const CERT_HEIGHT = 794;

export function CertificateTemplate({
  learnerName,
  courseTitle,
  tutorName,
  completionDate,
  instanceId,
}: CertificateTemplateProps) {
  const formattedDate = completionDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      id={
        instanceId
          ? `certificate-template-${instanceId}`
          : "certificate-template"
      }
      style={{
        width: CERT_WIDTH,
        height: CERT_HEIGHT,
        backgroundColor: "#ffffff",
        fontFamily: "Georgia, serif",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 32,
          border: "4px double #1f2937",
        }}
      />
      <div
        style={{ position: "absolute", inset: 48, border: "1px solid #9ca3af" }}
      />

      <div
        style={{
          position: "absolute",
          top: 64,
          left: 64,
          width: 48,
          height: 48,
          borderTop: "4px solid #ff0004",
          borderLeft: "4px solid #ff0004",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 64,
          right: 64,
          width: 48,
          height: 48,
          borderTop: "4px solid #ff0004",
          borderRight: "4px solid #ff0004",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 64,
          left: 64,
          width: 48,
          height: 48,
          borderBottom: "4px solid #ff0004",
          borderLeft: "4px solid #ff0004",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 64,
          right: 64,
          width: 48,
          height: 48,
          borderBottom: "4px solid #ff0004",
          borderRight: "4px solid #ff0004",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
          textAlign: "center",
          padding: "48px 80px 32px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <span
            style={{
              fontSize: 38,
              fontWeight: 900,
              color: "#111827",
              letterSpacing: "-0.5px",
            }}
          >
            NSK AI
          </span>
          <p
            style={{
              fontSize: 11,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#4b5563",
              margin: "4px 0 0",
            }}
          >
            EdTech Platform
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <Award
            style={{
              width: 40,
              height: 40,
              color: "#ff0004",
              display: "block",
              margin: "0 auto 8px",
            }}
          />
          <h1
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 10px",
              lineHeight: 1.1,
            }}
          >
            Certificate of Completion
          </h1>
          <div
            style={{
              width: 160,
              height: 4,
              backgroundColor: "#ff0004",
              margin: "0 auto",
            }}
          />
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: 760,
            width: "100%",
          }}
        >
          <p
            style={{
              fontSize: 18,
              color: "#374151",
              fontStyle: "italic",
              margin: "0 0 16px",
            }}
          >
            This is to certify that
          </p>

          <div style={{ width: "100%", marginBottom: 16 }}>
            <h2
              style={{
                fontSize: 56,
                fontWeight: 900,
                color: "#111827",
                letterSpacing: 1,
                textTransform: "uppercase",
                margin: "0 0 10px",
              }}
            >
              {learnerName}
            </h2>
            <div
              style={{
                height: 3,
                background:
                  "linear-gradient(to right, transparent, #d1d5db, #d1d5db, transparent)",
              }}
            />
          </div>

          <p style={{ fontSize: 18, color: "#374151", margin: "0 0 16px" }}>
            has successfully completed the professional curriculum for
          </p>

          <h3
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#ff0004",
              letterSpacing: 1,
              textTransform: "uppercase",
              margin: "0 0 16px",
            }}
          >
            {courseTitle}
          </h3>

          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
              maxWidth: 520,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            In recognition of fulfilling all academic requirements,
            demonstrating dedication, and mastering the requisite skills in the
            field of study.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: 760,
            paddingTop: 12,
          }}
        >
          <div style={{ textAlign: "left", width: 220 }}>
            <p
              style={{
                fontSize: 9,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "#9ca3af",
                margin: "0 0 4px",
              }}
            >
              Dated
            </p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#111827",
                margin: "0 0 6px",
              }}
            >
              {formattedDate}
            </p>
            <div style={{ height: 1, backgroundColor: "#e5e7eb" }} />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: "2px solid rgba(255,0,4,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Award
                style={{ width: 30, height: 30, color: "rgba(255,0,4,0.3)" }}
              />
            </div>
          </div>

          <div style={{ textAlign: "right", width: 220 }}>
            <p
              style={{
                fontSize: 9,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "#9ca3af",
                margin: "0 0 4px",
              }}
            >
              Verified By
            </p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#111827",
                margin: "0 0 6px",
              }}
            >
              {tutorName}
            </p>
            <div style={{ height: 1, backgroundColor: "#e5e7eb" }} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <p
            style={{
              fontSize: 9,
              color: "#9ca3af",
              textTransform: "uppercase",
              fontWeight: 700,
              letterSpacing: 1,
              margin: 0,
            }}
          >
            Certificate ID: NSK-
            {completionDate.getTime().toString(36).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}
