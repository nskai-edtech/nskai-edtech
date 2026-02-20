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

interface PurchaseConfirmationEmailProps {
  name: string;
  courseTitle: string;
  amount: number; // in kobo
  courseId: string;
}

export default function PurchaseConfirmationEmail({
  name,
  courseTitle,
  amount,
  courseId,
}: PurchaseConfirmationEmailProps) {
  const isFree = amount === 0;
  const formattedAmount = isFree
    ? "Free"
    : `₦${(amount / 100).toLocaleString()}`;

  return (
    <Html>
      <Head />
      <Preview>
        {isFree
          ? `You're enrolled in ${courseTitle}!`
          : `Payment confirmed for ${courseTitle}`}
      </Preview>
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
            <Heading style={styles.heading}>
              {isFree ? "You're enrolled! 🚀" : "Payment confirmed ✅"}
            </Heading>

            <Text style={styles.text}>
              {isFree
                ? `Hey ${name}, you've successfully enrolled in a free course!`
                : `Hey ${name}, your payment has been processed and verified.`}
            </Text>

            {/* Order summary */}
            <Section style={styles.orderBox}>
              <Text style={styles.orderLabel}>Course</Text>
              <Text style={styles.orderValue}>{courseTitle}</Text>

              <Hr style={styles.orderDivider} />

              <Text style={styles.orderLabel}>Amount</Text>
              <Text style={styles.orderValue}>{formattedAmount}</Text>
            </Section>

            <Text style={styles.text}>
              You now have full lifetime access to all lessons, quizzes, and
              course materials. Jump in and start learning!
            </Text>

            <Button
              style={styles.button}
              href={`https://nskai.org/watch/${courseId}`}
            >
              Start Learning Now
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
  orderBox: {
    backgroundColor: "#fafafa",
    border: "1px solid #e4e4e7",
    borderRadius: "8px",
    padding: "16px 20px",
    marginTop: "16px",
    marginBottom: "16px",
  },
  orderLabel: {
    fontSize: "11px",
    fontWeight: "700" as const,
    color: "#71717a",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    margin: "0 0 2px 0",
  },
  orderValue: {
    fontSize: "16px",
    fontWeight: "600" as const,
    color: "#0a0a0a",
    margin: "0 0 4px 0",
  },
  orderDivider: {
    borderColor: "#e4e4e7",
    margin: "12px 0",
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
