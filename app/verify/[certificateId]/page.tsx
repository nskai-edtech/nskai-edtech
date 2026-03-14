import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getCertificate, buildCertificateMetadata } from "./_lib/get-certificate";
import { Logo } from "./_components/logo";
import { VerifiedState } from "./_components/verified-state";

export async function generateMetadata({
                                         params,
                                       }: {
  params: Promise<{ certificateId: string }>;
}): Promise<Metadata> {
  const { certificateId } = await params;
  const certificate = await getCertificate(certificateId);

  return buildCertificateMetadata(certificate);
}

export default async function VerifyCertificatePage({
                                                      params,
                                                    }: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;
  const certificate = await getCertificate(certificateId);

  if (!certificate) {
    notFound();
  }

  return (
      <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center py-12 px-4 sm:px-6">
        <Logo />
        <VerifiedState certificate={certificate} certificateId={certificateId} />
      </main>
  );
}