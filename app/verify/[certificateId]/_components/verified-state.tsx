import { format } from "date-fns";
import {
    Award,
    BookOpen,
    Calendar,
    CheckCircle,
    User,
} from "lucide-react";
import Image from "next/image";

import type { Certificate } from "../_lib/get-certificate";
import { DetailCard } from "./detail-card";

type VerifiedStateProps = {
    certificate: Certificate;
    certificateId: string;
};

export function VerifiedState({
                                  certificate,
                                  certificateId,
                              }: VerifiedStateProps) {
    return (
        <article className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-green-500/10 dark:bg-green-500/20 px-6 py-4 flex items-center justify-center gap-3 border-b border-green-500/20">
                <CheckCircle
                    className="w-6 h-6 text-green-600 dark:text-green-500"
                    aria-hidden="true"
                />
                <h2 className="text-lg font-bold text-green-700 dark:text-green-400">
                    Official Certificate Verified
                </h2>
            </div>

            <div className="p-8 sm:p-10 space-y-8">
                <div className="text-center space-y-3">
                    <Award className="w-16 h-16 text-brand mx-auto" aria-hidden="true" />
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
                        Certificate of Completion
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                        This document certifies that the individual below has successfully
                        completed all requirements for this program.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <DetailCard
                        icon={User}
                        label="Learner"
                        value={`${certificate.learnerFirstName} ${certificate.learnerLastName}`}
                    />
                    <DetailCard
                        icon={Calendar}
                        label="Issued On"
                        value={format(new Date(certificate.createdAt), "MMMM d, yyyy")}
                    />
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                    <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-800 relative">
                        {certificate.courseImageUrl ? (
                            <Image
                                src={certificate.courseImageUrl}
                                alt=""
                                fill
                                sizes="(max-width: 768px) 100vw, 800px"
                                className="object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <BookOpen
                                    className="w-12 h-12 text-zinc-300 dark:text-zinc-600"
                                    aria-hidden="true"
                                />
                            </div>
                        )}

                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                {certificate.courseTitle}
                            </h3>
                            <p className="text-zinc-300 text-sm flex items-center gap-2">
                                <span>Instructor:</span>
                                <span className="font-semibold text-white">
                  {certificate.tutorFirstName} {certificate.tutorLastName}
                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-semibold mb-1">
                        Verification ID
                    </p>
                    <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 py-2 px-4 rounded-lg inline-block break-all">
                        {certificateId}
                    </p>
                </div>
            </div>
        </article>
    );
}