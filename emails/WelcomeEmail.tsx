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

interface WelcomeEmailProps {
  name: string;
  role?: "TUTOR" | "LEARNER" | "SCHOOL_ADMIN" | "TEACHER" | "STUDENT" | "ADMIN";
}

export default function WelcomeEmail({
  name,
  role = "LEARNER",
}: WelcomeEmailProps) {
  const isTutor = role === "TUTOR";
  const previewText = isTutor
    ? `Welcome to ${PLATFORM_NAME}, ${name}! Your tutor application is under review.`
    : `Welcome to ${PLATFORM_NAME}, ${name}! Start exploring courses now.`;

  const dashboardUrl = isTutor
    ? `${BASE_URL}/tutor`
    : `${BASE_URL}/learner/marketplace`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.logo}>{PLATFORM_NAME}</Text>
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            <Heading style={styles.heading}>Welcome aboard, {name}! 🎉</Heading>

            {isTutor ? (
              <>
                <Text style={styles.text}>
                  Thanks for applying to become a tutor on {PLATFORM_NAME}. Your
                  application is currently under review by our team.
                </Text>
                <Text style={styles.text}>
                  We&apos;ll notify you as soon as your account is approved. In
                  the meantime, you can start preparing your course content.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.text}>
                  You&apos;re all set! Browse our growing catalog of courses
                  taught by expert instructors and start learning today.
                </Text>
                <Text style={styles.text}>
                  Track your progress, earn certificates, and build skills that
                  matter.
                </Text>
              </>
            )}

            <Button style={styles.button} href={dashboardUrl}>
              {isTutor ? "Go to Tutor Dashboard" : "Browse Courses"}
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
  button: {
    display: "inline-block" as const,
    backgroundColor: "#0a0a0a",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600" as const,
    padding: "12px 28px",
    borderRadius: "8px",
    textDecoration: "none" as const,
    marginTop: "16px",
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
