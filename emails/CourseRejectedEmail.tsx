import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Heading,
  Hr,
  Preview,
} from "@react-email/components";
import { BASE_URL, PLATFORM_NAME, TAGLINE, CONTACT_EMAIL } from "./config";

interface CourseRejectedEmailProps {
  tutorName: string;
  courseTitle: string;
  reason?: string;
}

export default function CourseRejectedEmail({
  tutorName,
  courseTitle,
  reason,
}: CourseRejectedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Your course &ldquo;{courseTitle}&rdquo; was not approved
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.logo}>{PLATFORM_NAME}</Text>
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            <Heading style={styles.heading}>Course not approved</Heading>

            <Text style={styles.text}>
              Hi {tutorName}, unfortunately your course &ldquo;{courseTitle}
              &rdquo; was not approved after review by the {PLATFORM_NAME} team.
            </Text>

            {reason && (
              <Section style={styles.highlight}>
                <Text style={styles.highlightTitle}>Reason</Text>
                <Text style={styles.highlightText}>{reason}</Text>
              </Section>
            )}

            <Text style={styles.text}>
              Don&apos;t worry — you can update your course and resubmit it for
              review. Here are a few tips:
            </Text>

            <Section style={styles.tipBox}>
              <Text style={styles.tipTitle}>How to improve your course</Text>
              <Text style={styles.tipText}>
                1. Review the feedback above carefully{"\n"}
                2. Update your course content accordingly{"\n"}
                3. Resubmit for review from your dashboard
              </Text>
            </Section>

            <Button style={styles.button} href={`${BASE_URL}/tutor/courses`}>
              Edit Your Course
            </Button>
          </Section>

          {/* Footer */}
          <Hr style={styles.hr} />
          <Section style={styles.footer}>
            <Text style={styles.footerText}>{TAGLINE}</Text>
            <Text style={styles.footerSmall}>{CONTACT_EMAIL}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f4f4f5",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: "0" as const,
    padding: "0" as const,
  },
  container: {
    maxWidth: "560px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    overflow: "hidden" as const,
    marginTop: "40px",
    marginBottom: "40px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
  },
  header: {
    backgroundColor: "#0a0a0a",
    padding: "24px 32px",
    textAlign: "center" as const,
  },
  logo: {
    fontSize: "24px",
    fontWeight: "800" as const,
    color: "#ffffff",
    margin: "0" as const,
  },
  content: {
    padding: "32px",
  },
  heading: {
    fontSize: "22px",
    fontWeight: "700" as const,
    color: "#0a0a0a",
    margin: "0 0 16px 0",
    lineHeight: "1.4",
  },
  text: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#3f3f46",
    margin: "0 0 12px 0",
  },
  highlight: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "16px 20px",
    marginTop: "16px",
    marginBottom: "16px",
  },
  highlightTitle: {
    fontSize: "14px",
    fontWeight: "700" as const,
    color: "#991b1b",
    margin: "0 0 8px 0",
  },
  highlightText: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#b91c1c",
    margin: "0" as const,
  },
  tipBox: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "16px 20px",
    marginTop: "16px",
    marginBottom: "16px",
  },
  tipTitle: {
    fontSize: "14px",
    fontWeight: "700" as const,
    color: "#1e40af",
    margin: "0 0 8px 0",
  },
  tipText: {
    fontSize: "14px",
    lineHeight: "1.8",
    color: "#1d4ed8",
    margin: "0" as const,
    whiteSpace: "pre-line" as const,
  },
  button: {
    display: "inline-block" as const,
    backgroundColor: "#0a0a0a",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600" as const,
    padding: "12px 28px",
    borderRadius: "8px",
    textDecoration: "none" as const,
    marginTop: "8px",
  },
  hr: {
    borderColor: "#e4e4e7",
    margin: "0" as const,
  },
  footer: {
    padding: "20px 32px",
    textAlign: "center" as const,
  },
  footerText: {
    fontSize: "13px",
    color: "#71717a",
    margin: "0 0 4px 0",
    fontWeight: "600" as const,
  },
  footerSmall: {
    fontSize: "12px",
    color: "#a1a1aa",
    margin: "0" as const,
  },
};
