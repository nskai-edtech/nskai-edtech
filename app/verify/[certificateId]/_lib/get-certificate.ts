import type { Metadata } from "next";

import { verifyCertificate } from "@/actions/certificates/queries";

export type Certificate = NonNullable<
    Awaited<ReturnType<typeof verifyCertificate>>
>;

const APP_NAME = "ZERRA";

export async function getCertificate(
    certificateId: string,
): Promise<Certificate | null> {
    try {
        return await verifyCertificate(certificateId);
    } catch (error) {
        console.error("[CERTIFICATE_LOOKUP_FAILED]", error, { certificateId });
        return null;
    }
}

export function buildCertificateMetadata(
    certificate: Certificate | null,
): Metadata {
    if (!certificate) {
        return {
            title: `Certificate Not Found - ${APP_NAME}`,
            description: "The certificate you are looking for does not exist.",
        };
    }

    return {
        title: `Verified: ${certificate.courseTitle} - ${APP_NAME}`,
        description: `Official certificate of completion for ${certificate.learnerFirstName} ${certificate.learnerLastName}.`,
    };
}