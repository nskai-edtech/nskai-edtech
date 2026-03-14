import {
    Button,
    Container,
    Head,
    Hr,
    Html,
    Preview,
    Row,
    Section,
    Text,
} from "@react-email/components";

interface LiveSessionScheduledEmailProps {
    learnerName: string;
    sessionTitle: string;
    sessionDescription: string;
    startTime: string;
    joinUrl: string;
}

export default function LiveSessionScheduledEmail({
    learnerName,
    sessionTitle,
    sessionDescription,
    startTime,
    joinUrl,
}: LiveSessionScheduledEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>A new live session is scheduled: {sessionTitle}</Preview>
            <Container style={container}>
                <Section style={box}>
                    <Row>
                        <Text style={heading}>📺 New Live Session Scheduled</Text>
                    </Row>

                    <Hr style={hr} />

                    <Text style={paragraph}>
                        Hi {learnerName},
                    </Text>

                    <Text style={paragraph}>
                        A new live classroom session has been scheduled! Here are the details:
                    </Text>

                    <Section style={sessionBox}>
                        <Text style={sessionTitleStyle}>
                            {sessionTitle}
                        </Text>
                        <Text style={sessionDetail}>
                            <strong>Start Time:</strong> {startTime}
                        </Text>
                        {sessionDescription && (
                            <Text style={sessionDetail}>
                                <strong>Description:</strong> {sessionDescription}
                            </Text>
                        )}
                    </Section>

                    <Section style={ctaBox}>
                        <Button style={button} href={joinUrl}>
                            View Live Sessions
                        </Button>
                    </Section>

                    <Text style={paragraph}>
                        You can join the session when it starts, or check back here to see if a replay is available after it ends.
                    </Text>

                    <Hr style={hr} />

                    <Text style={footer}>
                        © 2026 NSKAI. All rights reserved.
                    </Text>
                </Section>
            </Container>
        </Html>
    );
}

const container = {
    backgroundColor: "#f9fafb",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    margin: "0 auto",
    padding: "40px 20px",
} as const;

const box = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    margin: "0 auto",
    maxWidth: "600px",
    padding: "40px",
} as const;

const heading = {
    color: "#18181b",
    fontSize: "28px",
    fontWeight: "700",
    margin: "0 0 20px 0",
} as const;

const paragraph = {
    color: "#52525b",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "0 0 16px 0",
} as const;

const sessionBox = {
    backgroundColor: "#f3f4f6",
    borderLeft: "4px solid #3b82f6",
    borderRadius: "6px",
    margin: "24px 0",
    padding: "16px",
} as const;

const sessionTitleStyle = {
    color: "#1f2937",
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 12px 0",
} as const;

const sessionDetail = {
    color: "#4b5563",
    fontSize: "14px",
    lineHeight: "20px",
    margin: "0 0 8px 0",
} as const;

const ctaBox = {
    margin: "24px 0",
    textAlign: "center",
} as const;

const button = {
    backgroundColor: "#3b82f6",
    borderRadius: "6px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "16px",
    fontWeight: "600",
    padding: "12px 32px",
    textDecoration: "none",
} as const;

const hr = {
    borderColor: "#e5e7eb",
    borderTop: "1px solid #e5e7eb",
    margin: "24px 0",
} as const;

const footer = {
    color: "#9ca3af",
    fontSize: "12px",
    margin: "0",
    textAlign: "center",
} as const;
