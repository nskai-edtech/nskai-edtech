export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: "ORG_ADMIN" | "TUTOR" | "LEARNER" | "SCHOOL_ADMIN" | "TEACHER" | "STUDENT" | "ADMIN";
      status?: "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED" | "BANNED";
    };
  }
}
