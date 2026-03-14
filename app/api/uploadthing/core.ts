import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

const handleAuth = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return { userId };
};

export const ourFileRouter = {
  courseImage: f({ image: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),

  schoolLogo: f({ image: { maxFileSize: "32MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),

  courseAttachment: f({
    pdf: { maxFileSize: "32MB", maxFileCount: 4 },
    image: { maxFileSize: "8MB", maxFileCount: 4 },
    video: { maxFileSize: "256MB", maxFileCount: 1 },
    audio: { maxFileSize: "32MB", maxFileCount: 1 },
    text: { maxFileSize: "8MB", maxFileCount: 4 },
    blob: { maxFileSize: "32MB", maxFileCount: 4 }, // Catches .docx, .zip, .csv, etc.
  })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),

  chapterVideo: f({ video: { maxFileSize: "512GB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
