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

interface PaymentFailedEmailProps {
  name: string;
  itemName: string;
  amount: number; // in kobo
  reference: string;
  isAbandoned?: boolean;
}

export default function PaymentFailedEmail({
  name,
  itemName,
  amount,
  reference,
  isAbandoned = false,
}: PaymentFailedEmailProps) {
  const formattedAmount =
    amount === 0 ? "—" : `₦${(amount / 100).toLocaleString()}`;

  return (
    <Html>
      <Head />
      <Preview>
        {isAbandoned
          ? `You didn't finish checking out for ${itemName}`
          : `There was a problem with your payment for ${itemName}`}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.logo}>{PLATFORM_NAME}</Text>
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            <Heading style={styles.heading}>
              {isAbandoned
                ? "You left something behind"
                : "Payment unsuccessful"}
            </Heading>

            <Text style={styles.text}>
              {isAbandoned
                ? `Hey ${name}, it looks like you started a payment for "${itemName}" but didn't complete it. No worries — you can pick up right where you left off.`
                : `Hey ${name}, we weren't able to process your payment for "${itemName}". This can happen for a number of reasons, including insufficient funds, card restrictions, or a temporary network issue.`}
            </Text>

            {/* Details */}
            <Section style={styles.orderBox}>
              <Text style={styles.orderLabel}>Item</Text>
              <Text style={styles.orderValue}>{itemName}</Text>

              <Hr style={styles.orderDivider} />

              <Text style={styles.orderLabel}>Amount</Text>
              <Text style={styles.orderValue}>{formattedAmount}</Text>

              <Hr style={styles.orderDivider} />

              <Text style={styles.orderLabel}>Reference</Text>
              <Text style={styles.refValue}>{reference}</Text>
            </Section>

            <Text style={styles.text}>
              {isAbandoned
                ? "Head back to the course page to complete your enrollment."
                : "Please try again. If the issue persists, contact your bank or reach out to our support team."}
            </Text>

            <Button
              style={styles.button}
              href={`${BASE_URL}/learner/marketplace`}
            >
              Browse Courses
            </Button>

            <Text style={styles.helpText}>
              Need help? Reach us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={styles.link}>
                {CONTACT_EMAIL}
              </a>
            </Text>
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
    backgroundColor: "#7f1d1d",
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
  helpText: {
    fontSize: "13px",
    lineHeight: "1.6",
    color: "#71717a",
    margin: "16px 0 0 0",
  },
  link: {
    color: "#2563eb",
    textDecoration: "underline" as const,
  },
  orderBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
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
  refValue: {
    fontSize: "13px",
    fontWeight: "500" as const,
    color: "#52525b",
    margin: "0 0 4px 0",
    fontFamily: "monospace",
  },
  orderDivider: {
    borderColor: "#fecaca",
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
