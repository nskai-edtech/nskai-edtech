import {
  Html,
  Body,
  Container,
  Text,
  Button,
  Heading,
} from "@react-email/components";

export default function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9f9f9" }}>
        <Container style={{ padding: "20px", backgroundColor: "#ffffff" }}>
          <Heading>Welcome to NSKAI Ed-tech, {name}!</Heading>
          <Text>
            We are excited to have you on board. Your application is currently
            under review.
          </Text>
          <Button
            href="https://nskai.com/tutor"
            style={{
              backgroundColor: "#000",
              color: "#fff",
              padding: "12px 20px",
            }}
          >
            Go to Dashboard
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
