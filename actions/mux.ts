"use server";

import Mux from "@mux/mux-node";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { lessons, muxData } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const getMuxClient = () => {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;

  if (!tokenId || !tokenSecret) return null;

  return new Mux({
    tokenId,
    tokenSecret,
  });
};

// DIRECT UPLOAD CONFIGURATION
export async function getDirectUploadUrl(lessonId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { error: "Unauthorized" };

    const mux = getMuxClient();
    if (!mux) {
      console.error("[MUX_ACTION_ERROR] Configuration missing.");
      return { error: "Video service not configured." };
    }

    // AUTHENTICATION AND OWNERSHIP CHECK
    const lessonData = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      with: {
        chapter: {
          with: {
            course: {
              with: {
                tutor: true,
              },
            },
          },
        },
      },
    });

    if (!lessonData || !lessonData.chapter?.course?.tutor) {
      return { error: "Lesson not found." };
    }

    const tutor = lessonData.chapter.course.tutor;

    if (tutor.clerkId !== clerkId) {
      return { error: "Permission denied. You do not own this course." };
    }

    // MUX UPLOAD CREATION
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ["public"],
        passthrough: lessonId,
      },
      cors_origin: "*",
    });

    // ASSET ID SYNCHRONIZATION
    if (upload.asset_id) {
      await db
        .insert(muxData)
        .values({
          lessonId,
          assetId: upload.asset_id,
        })
        .onConflictDoUpdate({
          target: muxData.lessonId,
          set: {
            assetId: upload.asset_id,
            playbackId: null,
          },
        });
    }

    return {
      success: true,
      url: upload.url,
      id: upload.id,
    };
  } catch (error) {
    console.error("[MUX_UPLOAD_ERROR]", error);
    return { error: "Internal Error" };
  }
}

// VIDEO STATUS POLLING AND SYNC
export async function checkLessonVideoStatus(
  lessonId: string,
  uploadId?: string,
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { error: "Unauthorized" };

    // DATABASE LOOKUP
    const data = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      with: { muxData: true },
    });

    if (data?.muxData?.playbackId) {
      return {
        muxData: data.muxData,
        isReady: true,
      };
    }

    // EXTERNAL STATUS CHECK
    const idToPoll = data?.muxData?.assetId || uploadId;
    if (idToPoll) {
      const mux = getMuxClient();
      if (mux) {
        let assetId = data?.muxData?.assetId;

        if (!assetId && uploadId) {
          const upload = await mux.video.uploads.retrieve(uploadId);
          assetId = upload.asset_id || undefined;
        }

        if (assetId) {
          const asset = await mux.video.assets.retrieve(assetId);

          if (asset.status === "ready" && asset.playback_ids?.[0]) {
            const playbackId = asset.playback_ids[0].id;

            const updatedMuxData = await db
              .insert(muxData)
              .values({
                lessonId,
                assetId: asset.id,
                playbackId: playbackId,
              })
              .onConflictDoUpdate({
                target: muxData.lessonId,
                set: {
                  assetId: asset.id,
                  playbackId: playbackId,
                },
              })
              .returning();

            // REVALIDATION
            revalidatePath(`/watch/${data?.chapterId}`);

            return {
              muxData: updatedMuxData[0],
              isReady: true,
            };
          }
        }
      }
    }

    return {
      muxData: data?.muxData || null,
      isReady: false,
    };
  } catch (error) {
    console.error("[MUX_STATUS_ERROR]", error);
    return { error: "Internal Error" };
  }
}

export async function deleteMuxAsset(assetId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { error: "Unauthorized" };

    const mux = getMuxClient();
    if (!mux) return { error: "Service not configured" };

    await mux.video.assets.delete(assetId);

    await db.delete(muxData).where(eq(muxData.assetId, assetId));

    revalidatePath("/tutor/courses");
    return { success: true };
  } catch (error) {
    console.error("[MUX_DELETE_ERROR]", error);
    return { error: "Failed to delete video" };
  }
}
