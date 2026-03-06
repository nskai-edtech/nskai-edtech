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

interface TutorRejectedEmailProps {
  name: string;
  expertise?: string;
}

export default function TutorRejectedEmail({ name, expertise = "subject" }: TutorRejectedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Update on your tutor application, {name}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.logo}>{PLATFORM_NAME}</Text>
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            <Heading style={styles.heading}>Application Update</Heading>

            <Text style={styles.text}>
              Hi {name}, thank you for your interest in becoming a {expertise} tutor on {PLATFORM_NAME}.
            </Text>

            <Text style={styles.text}>
              After careful review, we regret to inform you that your application as a {expertise} tutor has not been approved at this time. We often look for specific details regarding your background and expertise to ensure the best experience for our learners.
            </Text>

            {/* Highlight box */}
            <Section style={styles.highlight}>
              <Text style={styles.highlightTitle}>What can you do next?</Text>
              <Text style={styles.highlightText}>
                We encourage you to try again! When reapplying, please provide more comprehensive details about your background, expertise, and teaching experience.
              </Text>
            </Section>

            <Button style={styles.button} href={`${BASE_URL}/`}>
              Return to {PLATFORM_NAME}
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
    lineHeight: "1.8",
    color: "#b91c1c",
    margin: "0" as const,
    whiteSpace: "pre-line" as const,
  },
  button: {
    display: "inline-block" as const,
    backgroundColor: "#ef4444",
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
