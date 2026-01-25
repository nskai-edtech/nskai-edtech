export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: "ORG_ADMIN" | "TUTOR" | "LEARNER";
      status?: "PENDING" | "ACTIVE" | "REJECTED";
    };
  }
}
