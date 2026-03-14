import { randomBytes } from "crypto";

export function generateGuestInviteCode(): string {
    return randomBytes(32).toString("base64url");
}