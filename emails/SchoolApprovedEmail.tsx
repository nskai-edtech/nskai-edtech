import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface SchoolApprovedEmailProps {
  schoolName: string;
  ownerName: string;
  loginUrl?: string;
}

export default function SchoolApprovedEmail({
  schoolName = "Your School",
  ownerName = "Proprietor",
  loginUrl = "https://zerra.build/sign-in",
}: SchoolApprovedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your school registration on Zerra has been approved!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>ZERRA</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={heading}>Welcome to Zerra, {ownerName}!</Heading>
            <Text style={paragraph}>
              Great news! Your registration for <strong>{schoolName}</strong> has been officially approved.
            </Text>
            <Text style={paragraph}>
              You now have full access to your School Admin Dashboard. You can start inviting teachers, creating classes, and managing your students right away.
            </Text>

            {/* Action Button */}
            <Section style={buttonContainer}>
              <Link href={loginUrl} style={button}>
                Access Your Dashboard
              </Link>
            </Section>

            <Text style={paragraph}>
              If you have any questions or need help onboarding your staff, our support team is always here for you.
            </Text>
            <Text style={paragraph}>
              Best regards,
              <br />
              The Zerra Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Zerra. All rights reserved.
              <br />
              You are receiving this because you registered a school on our platform.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styling (consistent with existing templates)
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  maxWidth: "580px",
};

const header = {
  padding: "32px 48px",
  borderBottom: "1px solid #e5e7eb",
};

const logoText = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#f97316", // Brand color
  margin: "0",
  letterSpacing: "-0.5px",
};

const content = {
  padding: "32px 48px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "600",
  color: "#111827",
  marginTop: "0",
};

const paragraph = {
  margin: "0 0 16px",
  fontSize: "16px",
  lineHeight: "24px",
  color: "#4b5563",
};

const buttonContainer = {
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#f97316",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const footer = {
  padding: "0 48px",
  borderTop: "1px solid #e5e7eb",
};

const footerText = {
  fontSize: "13px",
  lineHeight: "24px",
  color: "#9ca3af",
  marginTop: "24px",
};
