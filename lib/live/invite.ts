import { randomBytes, randomInt } from "crypto";

const DEFAULT_GUEST_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function generateGuestInviteCode(): string {
    return randomBytes(32).toString("base64url");
}

export function generateAgoraGuestUid(): number {
    return randomInt(1, 2_147_483_647);
}

export function getGuestInviteExpiryDate(
    ttlMs: number = DEFAULT_GUEST_INVITE_TTL_MS,
): Date {
    return new Date(Date.now() + ttlMs);
}