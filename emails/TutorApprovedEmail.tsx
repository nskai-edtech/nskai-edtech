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

interface TutorApprovedEmailProps {
  name: string;
}

export default function TutorApprovedEmail({ name }: TutorApprovedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your tutor application has been approved, {name}!</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.logo}>
              <span style={styles.logoNsk}>NSK</span>
              <span style={styles.logoAi}>AI</span>
            </Text>
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            <Heading style={styles.heading}>You&apos;re approved! 🎓</Heading>

            <Text style={styles.text}>
              Congratulations, {name}! Your tutor application has been reviewed
              and approved by the NSKAI team.
            </Text>

            <Text style={styles.text}>
              You can now create and publish courses on the platform. Your
              courses will be available to thousands of learners across the
              NSKAI ecosystem.
            </Text>

            {/* Highlight box */}
            <Section style={styles.highlight}>
              <Text style={styles.highlightTitle}>What&apos;s next?</Text>
              <Text style={styles.highlightText}>
                1. Head to your Tutor Dashboard{"\n"}
                2. Create your first course{"\n"}
                3. Add chapters and video lessons{"\n"}
                4. Submit for review and publish
              </Text>
            </Section>

            <Button
              style={styles.button}
              href="https://nskai.org/tutor/courses"
            >
              Start Creating Courses
            </Button>
          </Section>

          {/* Footer */}
          <Hr style={styles.hr} />
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              NSKAI EdTech — Learn. Build. Grow.
            </Text>
            <Text style={styles.footerSmall}>Contact@nskai.org</Text>
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
    margin: "0" as const,
  },
  logoNsk: {
    color: "#ffffff",
  },
  logoAi: {
    color: "#ff0004",
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
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    padding: "16px 20px",
    marginTop: "16px",
    marginBottom: "16px",
  },
  highlightTitle: {
    fontSize: "14px",
    fontWeight: "700" as const,
    color: "#166534",
    margin: "0 0 8px 0",
  },
  highlightText: {
    fontSize: "14px",
    lineHeight: "1.8",
    color: "#15803d",
    margin: "0" as const,
    whiteSpace: "pre-line" as const,
  },
  button: {
    display: "inline-block" as const,
    backgroundColor: "#16a34a",
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
