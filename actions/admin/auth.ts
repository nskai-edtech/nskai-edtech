/* eslint-disable @typescript-eslint/ban-ts-comment */
import { auth } from "@clerk/nextjs/server";

export async function checkAdmin() {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }

  return true;
}
